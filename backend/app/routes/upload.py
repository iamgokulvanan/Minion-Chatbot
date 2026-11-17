import os
import uuid
import shutil
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.orm import Session
from typing import Optional

from app.config import settings
from app.database.database import get_db
from app.models.models import User, UploadedFile
from app.schemas.schemas import FileUploadResponse, DocumentAnalysisRequest, DocumentAnalysisResponse
from app.middleware.auth import get_current_user
from app.services.document_service import document_service
from app.services.vision_service import vision_service

router = APIRouter(prefix="/upload", tags=["Uploads & Intelligence"])

@router.post("", response_model=FileUploadResponse)
async def upload_file(
    file: UploadFile = File(...),
    conversation_id: Optional[str] = Form(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Uploads document or image, extracts content/features, and creates persistent reference."""
    # Ensure upload directory
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

    # Generate unique filename to prevent collision
    file_ext = os.path.splitext(file.filename)[1].lower()
    unique_filename = f"{uuid.uuid4()}_{file.filename}"
    file_path = os.path.join(settings.UPLOAD_DIR, unique_filename)

    # Save to disk
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    file_size = os.path.getsize(file_path)
    file_type = file.content_type or "application/octet-stream"

    extracted_text = ""
    # Process according to file type
    if file_ext in [".pdf", ".txt", ".md", ".json", ".csv", ".py", ".js", ".ts", ".html"]:
        extracted_text = document_service.extract_text(file_path, file_type)
    elif file_ext in [".png", ".jpg", ".jpeg", ".webp"]:
        vision_result = vision_service.analyze_image(file_path, file.filename)
        extracted_text = vision_result.get("description", "")

    # Save to database
    db_file = UploadedFile(
        user_id=current_user.id,
        conversation_id=conversation_id,
        filename=file.filename,
        file_type=file_type,
        file_size=file_size,
        storage_path=file_path,
        extracted_text=extracted_text
    )
    db.add(db_file)
    db.commit()
    db.refresh(db_file)

    preview = (extracted_text[:300] + "...") if len(extracted_text) > 300 else extracted_text

    return FileUploadResponse(
        id=db_file.id,
        filename=db_file.filename,
        file_type=db_file.file_type,
        file_size=db_file.file_size,
        extracted_text_preview=preview,
        created_at=db_file.created_at
    )

@router.post("/analyze", response_model=DocumentAnalysisResponse)
def analyze_uploaded_document(
    payload: DocumentAnalysisRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Performs deep document synthesis, summaries, and key point extraction."""
    db_file = db.query(UploadedFile).filter(
        UploadedFile.id == payload.file_id,
        UploadedFile.user_id == current_user.id
    ).first()

    if not db_file:
        raise HTTPException(status_code=404, detail="File not found or unauthorized.")

    analysis = document_service.generate_document_summary(
        db_file.extracted_text or "",
        db_file.filename
    )

    return DocumentAnalysisResponse(
        file_id=db_file.id,
        filename=db_file.filename,
        summary=analysis["summary"],
        key_points=analysis["key_points"],
        word_count=analysis["word_count"]
    )
