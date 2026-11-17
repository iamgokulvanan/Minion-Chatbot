from typing import List
from fastapi import APIRouter
from app.config import settings
from app.schemas.schemas import ModelInfo

router = APIRouter(prefix="/models", tags=["AI Models"])

@router.get("", response_model=List[ModelInfo])
def get_available_models():
    """Lists available models with metadata and operational capability status."""
    has_api_key = bool(settings.OPENAI_API_KEY and len(settings.OPENAI_API_KEY.strip()) > 5)
    
    return [
        ModelInfo(
            id="minion-core-v2.5",
            name="Minion Core v2.5",
            provider="Minion Autonomous Engine",
            description="High-speed flagship assistant optimized for full-stack code, analysis, and reasoning.",
            context_window="128K tokens",
            capabilities=["Code Generation", "Document Analysis", "Vision Inspection", "Streaming SSE", "Autonomous Reasoning"],
            is_available=True
        ),
        ModelInfo(
            id="gpt-4o",
            name="OpenAI GPT-4o",
            provider="OpenAI",
            description="Omni-multimodal model for complex problem solving and vision tasks.",
            context_window="128K tokens",
            capabilities=["Multimodal", "Vision", "Complex Logic"],
            is_available=has_api_key
        ),
        ModelInfo(
            id="claude-3-5-sonnet",
            name="Claude 3.5 Sonnet",
            provider="Anthropic",
            description="Premier coding and nuanced technical analysis engine.",
            context_window="200K tokens",
            capabilities=["Nuanced Writing", "Deep Code Refactoring"],
            is_available=has_api_key
        ),
        ModelInfo(
            id="deepseek-r1",
            name="DeepSeek R1",
            provider="DeepSeek",
            description="Open-weights high-reasoning model optimized for math and algorithms.",
            context_window="64K tokens",
            capabilities=["Mathematical Reasoning", "Code Synthesis"],
            is_available=has_api_key
        )
    ]
