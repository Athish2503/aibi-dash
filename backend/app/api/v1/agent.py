from typing import Any, Optional
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field

try:
    from backend.app.agent.orchestrator import (
        AgentOrchestrator,
        GroundedAnswer,
        Insight,
        Recommendation,
        ExecutiveReport,
    )
    from backend.app.data.storage import get_dataset, get_dataset_metadata
except ImportError:
    from app.agent.orchestrator import (
        AgentOrchestrator,
        GroundedAnswer,
        Insight,
        Recommendation,
        ExecutiveReport,
    )
    from app.data.storage import get_dataset, get_dataset_metadata

router = APIRouter()
orchestrator = AgentOrchestrator()


# --- Request / Response Contracts ---

class ChatRequest(BaseModel):
    dataset_id: str = Field(description="Identifier of the dataset previously uploaded")
    question: str = Field(description="Natural language question to ask about the dataset")


class ChatResponse(BaseModel):
    answer: str
    evidence: list[Any]
    tools_used: list[str]
    filters_applied: dict[str, Any] = Field(default_factory=dict)


class DatasetIdRequest(BaseModel):
    dataset_id: str = Field(description="Identifier of the dataset")


class ExecutiveReportRequest(BaseModel):
    dataset_id: str
    dataset_name: Optional[str] = "Campaign Performance"


# --- Endpoints ---

@router.post("/chat", response_model=ChatResponse)
async def chat_with_dataset(request: ChatRequest):
    """
    Answers natural language queries strictly grounded in deterministic tool results.
    Conforms to docs/API_SPEC.md.
    """
    df = get_dataset(request.dataset_id)
    if df is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Dataset with ID '{request.dataset_id}' not found.",
        )

    try:
        result = orchestrator.answer_natural_language_query(request.question, df)
        return ChatResponse(
            answer=result.answer,
            evidence=result.evidence,
            tools_used=result.tools_used,
            filters_applied=result.filters_applied,
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process natural language query: {str(e)}",
        )


@router.post("/insights", response_model=list[Insight])
async def get_dataset_insights(request: DatasetIdRequest):
    """
    Generates structured insights (observation, metric, segment, comparison, evidence, caveat)
    grounded in deterministic dataset analytics.
    """
    df = get_dataset(request.dataset_id)
    if df is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Dataset with ID '{request.dataset_id}' not found.",
        )

    try:
        return orchestrator.generate_insights(df)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate dataset insights: {str(e)}",
        )


@router.post("/recommendations", response_model=list[Recommendation])
async def get_dataset_recommendations(request: DatasetIdRequest):
    """
    Generates actionable recommendations backed by historical performance data and explicit caveats.
    """
    df = get_dataset(request.dataset_id)
    if df is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Dataset with ID '{request.dataset_id}' not found.",
        )

    try:
        return orchestrator.generate_recommendations(df)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate recommendations: {str(e)}",
        )


@router.post("/executive-report", response_model=ExecutiveReport)
async def get_executive_report(request: ExecutiveReportRequest):
    """
    Generates an executive-ready briefing combining KPIs, top insights, anomalies, and recommendations.
    """
    df = get_dataset(request.dataset_id)
    if df is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Dataset with ID '{request.dataset_id}' not found.",
        )

    meta = get_dataset_metadata(request.dataset_id)
    dataset_name = request.dataset_name or (meta.get("filename") if meta else "Campaign Performance")

    try:
        return orchestrator.generate_executive_report(df, dataset_name=dataset_name)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate executive report: {str(e)}",
        )
