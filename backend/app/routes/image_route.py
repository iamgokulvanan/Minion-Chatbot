from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from app.services.image_service import image_service
from app.middleware.auth import get_current_user
from app.models.models import User

router = APIRouter(prefix="/image", tags=["Image Generation"])

class ImageGenerateRequest(BaseModel):
    prompt: str

@router.post("/generate")
async def generate_ai_image(payload: ImageGenerateRequest, current_user: User = Depends(get_current_user)):
    """Generates a high-quality AI image from text description."""
    if not payload.prompt.strip():
        raise HTTPException(status_code=400, detail="Prompt cannot be empty")
    
    result = await image_service.generate_image(payload.prompt)
    return result
