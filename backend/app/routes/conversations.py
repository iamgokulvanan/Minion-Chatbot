from typing import List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.database.database import get_db
from app.models.models import User, Conversation, Message
from app.schemas.schemas import (
    ConversationResponse,
    ConversationDetailResponse,
    ConversationCreate,
    ConversationUpdate,
    MessageResponse
)
from app.middleware.auth import get_current_user

router = APIRouter(prefix="/conversations", tags=["Conversations"])

@router.get("", response_model=List[ConversationResponse])
def list_conversations(
    search: Optional[str] = Query(None, description="Search term for conversation titles"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieves all conversations belonging to the authenticated user."""
    query = db.query(Conversation).filter(Conversation.user_id == current_user.id)
    if search:
        query = query.filter(Conversation.title.ilike(f"%{search}%"))
    
    # Sort pinned first, then by updated_at descending
    convs = query.order_by(desc(Conversation.is_pinned), desc(Conversation.updated_at)).all()

    result = []
    for c in convs:
        last_msg = db.query(Message).filter(Message.conversation_id == c.id).order_by(desc(Message.created_at)).first()
        msg_count = db.query(Message).filter(Message.conversation_id == c.id).count()
        result.append(ConversationResponse(
            id=c.id,
            title=c.title,
            is_pinned=c.is_pinned,
            created_at=c.created_at,
            updated_at=c.updated_at,
            message_count=msg_count,
            last_message=last_msg.content[:80] + "..." if last_msg and len(last_msg.content) > 80 else (last_msg.content if last_msg else None)
        ))
    return result

@router.post("", response_model=ConversationResponse)
def create_conversation(
    payload: ConversationCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    new_conv = Conversation(
        user_id=current_user.id,
        title=payload.title or "New Chat",
        is_pinned=False
    )
    db.add(new_conv)
    db.commit()
    db.refresh(new_conv)
    return ConversationResponse.model_validate(new_conv)

@router.get("/{conversation_id}", response_model=ConversationDetailResponse)
def get_conversation_details(
    conversation_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    conv = db.query(Conversation).filter(
        Conversation.id == conversation_id,
        Conversation.user_id == current_user.id
    ).first()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found or unauthorized.")

    messages = db.query(Message).filter(Message.conversation_id == conv.id).order_by(Message.created_at).all()
    
    return ConversationDetailResponse(
        id=conv.id,
        title=conv.title,
        is_pinned=conv.is_pinned,
        created_at=conv.created_at,
        updated_at=conv.updated_at,
        messages=[MessageResponse.model_validate(m) for m in messages]
    )

@router.patch("/{conversation_id}", response_model=ConversationResponse)
def update_conversation(
    conversation_id: str,
    payload: ConversationUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    conv = db.query(Conversation).filter(
        Conversation.id == conversation_id,
        Conversation.user_id == current_user.id
    ).first()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found.")

    if payload.title is not None:
        conv.title = payload.title
    if payload.is_pinned is not None:
        conv.is_pinned = payload.is_pinned
    
    conv.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(conv)
    return ConversationResponse.model_validate(conv)

@router.delete("/{conversation_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_conversation(
    conversation_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    conv = db.query(Conversation).filter(
        Conversation.id == conversation_id,
        Conversation.user_id == current_user.id
    ).first()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found.")

    db.delete(conv)
    db.commit()
    return None
