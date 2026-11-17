from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.models.models import User, UserPreferences
from app.schemas.schemas import UserSignup, UserLogin, UserResponse, TokenResponse
from app.middleware.auth import (
    get_password_hash,
    verify_password,
    create_access_token,
    get_current_user,
    get_or_create_demo_user
)
from app.services.email_service import email_service, SENT_EMAIL_LOGS

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=TokenResponse)
def register(user_data: UserSignup, request: Request, db: Session = Depends(get_db)):
    # Check if user already exists
    existing = db.query(User).filter(User.email == user_data.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email address is already registered."
        )

    # Create new user
    new_user = User(
        name=user_data.name,
        email=user_data.email,
        hashed_password=get_password_hash(user_data.password),
        profile_image="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80"
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Create default preferences
    prefs = UserPreferences(
        user_id=new_user.id,
        theme="midnight",
        selected_model="minion-core-v2.5",
        voice_enabled=True,
        memory_enabled=True
    )
    db.add(prefs)
    db.commit()

    token = create_access_token(data={"sub": new_user.id, "email": new_user.email})

    # Dispatch welcome & login security email
    client_ip = request.client.host if request.client else "127.0.0.1"
    email_res = email_service.send_login_notification(new_user.email, new_user.name, client_ip)

    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserResponse.model_validate(new_user),
        email_notification=email_res
    )

@router.post("/login", response_model=TokenResponse)
def login(login_data: UserLogin, request: Request, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == login_data.email).first()
    if not user or not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials. Please verify your email and password."
        )

    token = create_access_token(data={"sub": user.id, "email": user.email})

    # Dispatch security alert email to user's registered email
    client_ip = request.client.host if request.client else "127.0.0.1"
    email_res = email_service.send_login_notification(user.email, user.name, client_ip)

    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserResponse.model_validate(user),
        email_notification=email_res
    )

@router.get("/demo", response_model=TokenResponse)
def get_demo_account(request: Request, db: Session = Depends(get_db)):
    """Instant login as Rolex with demo data and email notification."""
    demo_user = get_or_create_demo_user(db)
    token = create_access_token(data={"sub": demo_user.id, "email": demo_user.email})

    client_ip = request.client.host if request.client else "127.0.0.1"
    email_res = email_service.send_login_notification(demo_user.email, demo_user.name, client_ip)

    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserResponse.model_validate(demo_user),
        email_notification=email_res
    )

@router.get("/me", response_model=UserResponse)
def get_current_user_profile(current_user: User = Depends(get_current_user)):
    return UserResponse.model_validate(current_user)

@router.get("/emails")
def get_sent_emails():
    """Returns the security and welcome notification emails dispatched to users."""
    return {"emails": SENT_EMAIL_LOGS}
