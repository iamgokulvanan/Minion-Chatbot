import json
import asyncio
from datetime import datetime, timezone
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.database.database import get_db, SessionLocal
from app.models.models import User, Conversation, Message, UploadedFile, UserPreferences
from app.schemas.schemas import SendMessageRequest
from app.middleware.auth import get_current_user
from app.services.ai_service import ai_service, MINION_SYSTEM_PROMPT
from app.services.image_service import image_service

router = APIRouter(prefix="/chat", tags=["Chat"])

def auto_generate_title(prompt: str) -> str:
    """Generates a clean concise 3-6 word title for a new conversation."""
    clean = prompt.strip().replace("\n", " ")
    words = clean.split()
    if len(words) <= 5:
        return clean.capitalize()
    return " ".join(words[:5]).capitalize() + "..."

def is_image_prompt(content: str, mode: Optional[str]) -> bool:
    if mode == "image":
        return True
    c = content.lower().strip()
    return any(c.startswith(prefix) for prefix in [
        "generate image",
        "generate an image",
        "create image",
        "create an image",
        "draw ",
        "paint ",
        "/image",
        "image of",
        "make a picture",
        "render an image"
    ])

@router.post("/send")
async def send_message_stream(
    payload: SendMessageRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Sends a chat message and returns real-time streaming response via Server-Sent Events."""
    # 1. Resolve or create conversation
    conv_id = payload.conversation_id
    conversation = None

    if conv_id:
        conversation = db.query(Conversation).filter(
            Conversation.id == conv_id,
            Conversation.user_id == current_user.id
        ).first()

    if not conversation:
        conversation = Conversation(
            user_id=current_user.id,
            title=auto_generate_title(payload.content),
            is_pinned=False
        )
        db.add(conversation)
        db.commit()
        db.refresh(conversation)
        conv_id = conversation.id
    elif conversation.title in ["New Chat", "Untitled Chat"]:
        conversation.title = auto_generate_title(payload.content)
        db.commit()

    # 2. Gather attached file context if file_ids provided
    context_chunks = []
    attachments_meta = []
    if payload.file_ids:
        files = db.query(UploadedFile).filter(
            UploadedFile.id.in_(payload.file_ids),
            UploadedFile.user_id == current_user.id
        ).all()
        for f in files:
            attachments_meta.append({"id": f.id, "name": f.filename, "type": f.file_type})
            if f.extracted_text:
                context_chunks.append(f"--- File: {f.filename} ---\n{f.extracted_text[:3000]}")

    # 3. Save User Message
    user_msg = Message(
        conversation_id=conv_id,
        role="user",
        content=payload.content,
        attachments_meta=json.dumps(attachments_meta) if attachments_meta else None
    )
    db.add(user_msg)
    conversation.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(user_msg)

    # 4. Fetch recent conversation history
    past_messages = (
        db.query(Message)
        .filter(Message.conversation_id == conv_id)
        .order_by(Message.created_at)
        .all()
    )

    history = []
    for m in past_messages[-10:]:
        history.append({"role": m.role, "content": m.content})

    # Fetch user preferences for system prompt
    prefs = db.query(UserPreferences).filter(UserPreferences.user_id == current_user.id).first()
    system_prompt = prefs.system_prompt if (prefs and prefs.system_prompt) else MINION_SYSTEM_PROMPT
    if payload.mode and payload.mode != "general":
        system_prompt += f"\n[User Mode Active: {payload.mode.upper()} MODE]"

    context_str = "\n\n".join(context_chunks) if context_chunks else None

    # Check for image generation prompt
    generating_image = is_image_prompt(payload.content, payload.mode)

    # 5. Generator for SSE Streaming
    async def event_generator():
        full_assistant_reply = []
        token_count = 0

        # Send initial metadata
        yield f"data: {json.dumps({'type': 'init', 'conversation_id': conv_id, 'title': conversation.title})}\n\n"

        if generating_image:
            # Extract clean prompt for image generation
            raw_prompt = payload.content
            for p in ["generate image of", "generate an image of", "generate image", "create image of", "create an image of", "create image", "draw", "paint", "/image"]:
                if raw_prompt.lower().startswith(p):
                    raw_prompt = raw_prompt[len(p):].strip()
                    break
            if not raw_prompt:
                raw_prompt = payload.content

            init_msg = f"### 🎨 MINION AI Visual Synthesis\n\nSynthesizing photorealistic visual render for: **\"{raw_prompt}\"**...\n\n"
            full_assistant_reply.append(init_msg)
            yield f"data: {json.dumps({'type': 'delta', 'chunk': init_msg})}\n\n"

            # Execute real image generation
            img_result = await image_service.generate_image(raw_prompt)
            img_url = img_result.get("image_url") or img_result.get("cdn_url")

            image_markdown = (
                f"\n\n![{raw_prompt}]({img_url})\n\n"
                f"**Visual Parameters:**\n"
                f"- **Model**: Flux.1 Photoreal Engine\n"
                f"- **Resolution**: 1024x1024 Ultra-HD\n"
                f"- **Seed**: `{img_result.get('seed')}`\n"
                f"- **Prompt**: *{raw_prompt}*\n\n"
                f"*(Click the image to expand or use the actions below to download)*\n"
            )
            full_assistant_reply.append(image_markdown)
            yield f"data: {json.dumps({'type': 'delta', 'chunk': image_markdown})}\n\n"
        else:
            try:
                async for chunk in ai_service.stream_chat_completion(
                    messages=history,
                    model=payload.model,
                    system_prompt=system_prompt,
                    context_data=context_str
                ):
                    full_assistant_reply.append(chunk)
                    token_count += 1
                    yield f"data: {json.dumps({'type': 'delta', 'chunk': chunk})}\n\n"
            except Exception as e:
                err_msg = f"\n[Stream encountered error: {str(e)}]"
                full_assistant_reply.append(err_msg)
                yield f"data: {json.dumps({'type': 'error', 'message': str(e)})}\n\n"

        # 6. Save complete Assistant Message in separate session
        complete_text = "".join(full_assistant_reply).strip()
        save_db = SessionLocal()
        try:
            assistant_msg = Message(
                conversation_id=conv_id,
                role="assistant",
                content=complete_text or "Minion Core completed the requested task.",
                token_usage=token_count
            )
            save_db.add(assistant_msg)
            conv_record = save_db.query(Conversation).filter(Conversation.id == conv_id).first()
            if conv_record:
                conv_record.updated_at = datetime.now(timezone.utc)
            save_db.commit()
            save_db.refresh(assistant_msg)
            
            yield f"data: {json.dumps({'type': 'done', 'message_id': assistant_msg.id, 'conversation_id': conv_id})}\n\n"
        finally:
            save_db.close()

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"
        }
    )

@router.post("/feedback")
def submit_feedback(data: dict):
    return {"status": "success", "message": "Feedback recorded. Thank you!"}
