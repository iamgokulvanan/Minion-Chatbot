from datetime import datetime, timedelta, timezone
from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from app.config import settings
from app.database.database import get_db
from app.models.models import User, UserPreferences

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/login", auto_error=False)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def get_or_create_demo_user(db: Session) -> User:
    """Provides a default user 'Rolex' for instant preview and guest interaction."""
    demo_user = db.query(User).filter(User.email == "rolex@minion.ai").first()
    if not demo_user:
        demo_user = User(
            name="Rolex",
            email="rolex@minion.ai",
            hashed_password=get_password_hash("minion2026"),
            profile_image="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
        )
        db.add(demo_user)
        db.commit()
        db.refresh(demo_user)

        # Create preferences
        prefs = UserPreferences(
            user_id=demo_user.id,
            theme="midnight",
            selected_model="minion-core-v2.5",
            voice_enabled=True,
            memory_enabled=True
        )
        db.add(prefs)
        db.commit()

    return demo_user

def get_current_user(token: Optional[str] = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    """Validates JWT token and returns authenticated User, or falls back to demo user if unauthenticated."""
    if not token or token == "demo-token" or token == "null":
        return get_or_create_demo_user(db)
    
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            return get_or_create_demo_user(db)
    except JWTError:
        return get_or_create_demo_user(db)
        
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        return get_or_create_demo_user(db)
    return user
