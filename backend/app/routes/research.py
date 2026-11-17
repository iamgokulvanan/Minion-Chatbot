from fastapi import APIRouter, Depends
from app.schemas.schemas import ResearchRequest, ResearchResponse
from app.services.search_service import search_service

router = APIRouter(prefix="/research", tags=["Web Research"])

@router.post("", response_model=ResearchResponse)
async def perform_research(payload: ResearchRequest):
    """Executes live web search with citations, key takeaways, and structured summary."""
    return await search_service.search_web(query=payload.query, max_results=payload.max_results)
