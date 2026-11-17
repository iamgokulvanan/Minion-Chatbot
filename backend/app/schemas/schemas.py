from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field

# Auth schemas
class UserSignup(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=6)

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    profile_image: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
    email_notification: Optional[Dict[str, Any]] = None

# Message schemas
class MessageResponse(BaseModel):
    id: str
    conversation_id: str
    role: str
    content: str
    attachments_meta: Optional[str] = None
    token_usage: int = 0
    created_at: datetime

    class Config:
        from_attributes = True

class SendMessageRequest(BaseModel):
    conversation_id: Optional[str] = None
    content: str
    model: Optional[str] = "minion-core-v2.5"
    file_ids: Optional[List[str]] = []
    stream: bool = True
    mode: Optional[str] = "general"  # general, code, research, document, creative

# Conversation schemas
class ConversationCreate(BaseModel):
    title: Optional[str] = "New Chat"

class ConversationUpdate(BaseModel):
    title: Optional[str] = None
    is_pinned: Optional[bool] = None

class ConversationResponse(BaseModel):
    id: str
    title: str
    is_pinned: bool
    created_at: datetime
    updated_at: datetime
    message_count: Optional[int] = 0
    last_message: Optional[str] = None

    class Config:
        from_attributes = True

class ConversationDetailResponse(BaseModel):
    id: str
    title: str
    is_pinned: bool
    created_at: datetime
    updated_at: datetime
    messages: List[MessageResponse] = []

    class Config:
        from_attributes = True

# Uploaded File schemas
class FileUploadResponse(BaseModel):
    id: str
    filename: str
    file_type: str
    file_size: int
    extracted_text_preview: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class DocumentAnalysisRequest(BaseModel):
    file_id: str
    query: Optional[str] = "Summarize key points and findings."

class DocumentAnalysisResponse(BaseModel):
    file_id: str
    filename: str
    summary: str
    key_points: List[str]
    word_count: int

# Web Research schemas
class ResearchSource(BaseModel):
    title: str
    url: str
    snippet: str
    domain: str

class ResearchRequest(BaseModel):
    query: str
    max_results: int = 5

class ResearchResponse(BaseModel):
    query: str
    summary: str
    sources: List[ResearchSource]
    key_takeaways: List[str]

# Preferences schemas
class UserPreferencesUpdate(BaseModel):
    theme: Optional[str] = None
    selected_model: Optional[str] = None
    voice_enabled: Optional[bool] = None
    memory_enabled: Optional[bool] = None
    system_prompt: Optional[str] = None

class UserPreferencesResponse(BaseModel):
    theme: str
    selected_model: str
    voice_enabled: bool
    memory_enabled: bool
    system_prompt: Optional[str] = None

    class Config:
        from_attributes = True

# Models schema
class ModelInfo(BaseModel):
    id: str
    name: str
    provider: str
    description: str
    context_window: str
    capabilities: List[str]
    is_available: bool = True
