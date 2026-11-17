from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.models.models import User, UserPreferences
from app.schemas.schemas import UserPreferencesUpdate, UserPreferencesResponse
from app.middleware.auth import get_current_user
from app.config import settings

router = APIRouter(prefix="/settings", tags=["User Preferences & Settings"])

@router.get("", response_model=UserPreferencesResponse)
def get_preferences(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    prefs = db.query(UserPreferences).filter(UserPreferences.user_id == current_user.id).first()
    if not prefs:
        prefs = UserPreferences(
            user_id=current_user.id,
            theme="midnight",
            selected_model="minion-core-v2.5",
            voice_enabled=True,
            memory_enabled=True
        )
        db.add(prefs)
        db.commit()
        db.refresh(prefs)
    return UserPreferencesResponse.model_validate(prefs)

@router.put("", response_model=UserPreferencesResponse)
def update_preferences(
    payload: UserPreferencesUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    prefs = db.query(UserPreferences).filter(UserPreferences.user_id == current_user.id).first()
    if not prefs:
        prefs = UserPreferences(user_id=current_user.id)
        db.add(prefs)

    if payload.theme is not None:
        prefs.theme = payload.theme
    if payload.selected_model is not None:
        prefs.selected_model = payload.selected_model
    if payload.voice_enabled is not None:
        prefs.voice_enabled = payload.voice_enabled
    if payload.memory_enabled is not None:
        prefs.memory_enabled = payload.memory_enabled
    if payload.system_prompt is not None:
        prefs.system_prompt = payload.system_prompt

    db.commit()
    db.refresh(prefs)
    return UserPreferencesResponse.model_validate(prefs)
