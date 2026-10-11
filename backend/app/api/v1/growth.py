from fastapi import APIRouter, HTTPException, status
from typing import Dict, Any

try:
    from backend.app.schemas.competitor_audit import (
        CompetitorAuditRequest,
        CompetitorAuditResponse,
    )
    from backend.app.executive.competitive_audit_engine import competitive_audit_engine
    from backend.app.services.scraper_service import SiteScraperService
except ImportError:
    from app.schemas.competitor_audit import (
        CompetitorAuditRequest,
        CompetitorAuditResponse,
    )
    from app.executive.competitive_audit_engine import competitive_audit_engine
    from app.services.scraper_service import SiteScraperService

router = APIRouter(prefix="/growth", tags=["Executive Growth Studio & Competitive Audit"])


@router.post("/audit", response_model=CompetitorAuditResponse)
@router.post("/competitive-audit", response_model=CompetitorAuditResponse)
async def run_competitive_growth_audit(request: CompetitorAuditRequest) -> CompetitorAuditResponse:
    """
    Executes real-world Competitive Growth & Revenue Audit:
    1. Concurrently scrapes target company & competitor domains.
    2. Runs VP of Growth reasoning layer to extract gap matrix, revenue leaks, prioritized growth bets, and sprint plan.
    3. Strictly validates outputs against Pydantic schema contracts.
    """
    try:
        return await competitive_audit_engine.run_audit(request)
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Competitive growth audit execution failed: {str(exc)}",
        )


@router.post("/scrape-preview")
async def preview_site_intel(payload: Dict[str, str]) -> Dict[str, Any]:
    """
    Previews extracted structural signals, meta descriptions, headlines, and conversion signals for a domain.
    """
    url = payload.get("url")
    if not url:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Missing required 'url' parameter in request body.",
        )
    return await SiteScraperService.extract_site_intel(url)
