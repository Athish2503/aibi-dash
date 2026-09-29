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
    from backend.app.agent.llm_adapter import (
        get_available_models,
        set_runtime_model,
        get_runtime_model,
    )
except ImportError:
    from app.agent.orchestrator import (
        AgentOrchestrator,
        GroundedAnswer,
        Insight,
        Recommendation,
        ExecutiveReport,
    )
    from app.data.storage import get_dataset, get_dataset_metadata
    from app.agent.llm_adapter import (
        get_available_models,
        set_runtime_model,
        get_runtime_model,
    )

router = APIRouter()
orchestrator = AgentOrchestrator()


# --- Request / Response Contracts ---

class ModelSwitchRequest(BaseModel):
    provider: str = Field(description="LLM provider: 'ollama', 'gemini', or 'mock'")
    model: Optional[str] = Field(default=None, description="Specific model identifier, e.g. 'llama3.2:1b'")


class ChatRequest(BaseModel):
    dataset_id: str = Field(description="Identifier of the dataset previously uploaded")
    question: str = Field(description="Natural language question to ask about the dataset")
    conversation_history: list[dict[str, Any]] = Field(default_factory=list, description="Prior conversation messages for multi-turn context")
    provider: Optional[str] = Field(default=None, description="Optional override LLM provider")
    model: Optional[str] = Field(default=None, description="Optional override model name")


class ChatResponse(BaseModel):
    answer: str
    evidence: list[Any]
    tools_used: list[str]
    filters_applied: dict[str, Any] = Field(default_factory=dict)
    visual_spec: Optional[dict[str, Any]] = Field(default=None, description="Structured Recharts visualization spec")
    steps: list[dict[str, str]] = Field(default_factory=list, description="ReAct execution transparency trace")
    follow_ups: list[str] = Field(default_factory=list, description="Contextual dynamic follow-up prompts")


class DatasetIdRequest(BaseModel):
    dataset_id: str = Field(description="Identifier of the dataset")


class ExecutiveReportRequest(BaseModel):
    dataset_id: str
    dataset_name: Optional[str] = "Campaign Performance"


# --- Endpoints ---

@router.get("/models")
async def list_available_models():
    """
    Returns available local models (Ollama, including Llama family),
    cloud models (Gemini), and the active runtime model configuration.
    """
    try:
        return get_available_models()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to inspect available AI models: {str(e)}",
        )


@router.post("/models/switch")
async def switch_model(request: ModelSwitchRequest):
    """
    Dynamically switches the active AI model across chat, planning, DAX, and insights.
    """
    try:
        updated = set_runtime_model(request.provider, request.model)
        return {
            "status": "success",
            "message": f"Active AI model switched to {request.provider} / {request.model}",
            "config": updated,
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to switch AI model: {str(e)}",
        )


@router.post("/chat", response_model=ChatResponse)
async def chat_with_dataset(request: ChatRequest):
    """
    Answers natural language queries strictly grounded in deterministic tool results.
    Conforms to docs/API_SPEC.md.
    """
    if request.provider or request.model:
        set_runtime_model(
            request.provider or get_runtime_model()["provider"],
            request.model or get_runtime_model()["model"],
        )

    df = get_dataset(request.dataset_id)
    if df is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Dataset with ID '{request.dataset_id}' not found.",
        )

    try:
        result = orchestrator.answer_natural_language_query(
            request.question,
            df,
            conversation_history=request.conversation_history,
        )
        return ChatResponse(
            answer=result.answer,
            evidence=result.evidence,
            tools_used=result.tools_used,
            filters_applied=result.filters_applied,
            visual_spec=result.visual_spec,
            steps=result.steps,
            follow_ups=result.follow_ups,
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


# --- Modular Agentic BI Endpoints ---

from backend.app.agents.supervisor import AgentSupervisor, AgentState
from backend.app.agents.investigator import InvestigationAgent, InvestigationReport
from backend.app.agents.anomaly import AnomalyAgent, AnomalyReport
from backend.app.scenarios import ScenarioAgent, ScenarioSimulationResult
from backend.app.agents.recommendation import RecommendationAgent, RecommendationReport
from backend.app.executive import ExecutiveBriefingAgent, ExecutiveBriefing
from backend.app.evaluation import AgentEvaluator, EvaluationScorecard
from backend.app.governance import observability_tracer, AgentTraceSpan
from backend.app.business import context_store, CompanyContext
from backend.app.semantic import metric_registry

supervisor_agent = AgentSupervisor()
investigation_agent = InvestigationAgent()
anomaly_intelligence_agent = AnomalyAgent()
scenario_intelligence_agent = ScenarioAgent()
recommendation_intelligence_agent = RecommendationAgent()
executive_briefing_agent = ExecutiveBriefingAgent()
agent_evaluator = AgentEvaluator()


class QueryRequest(BaseModel):
    dataset_id: str
    query: str
    session_id: Optional[str] = None


class ScenarioQueryRequest(BaseModel):
    dataset_id: str
    query: str


class AnomalyAuditRequest(BaseModel):
    dataset_id: str
    method: Optional[str] = "iqr"
    threshold: Optional[float] = 1.5


@router.post("/supervisor/query", response_model=AgentState)
async def supervisor_query(request: QueryRequest):
    """
    Invokes the Supervisor Agent to plan a task graph, delegate to sub-agents,
    and synthesize verified results with an execution trace.
    """
    df = get_dataset(request.dataset_id)
    if df is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Dataset '{request.dataset_id}' not found.",
        )
    return supervisor_agent.run(
        query=request.query,
        df=df,
        dataset_id=request.dataset_id,
        session_id=request.session_id,
    )


@router.post("/investigate", response_model=InvestigationReport)
async def investigate_metric(request: QueryRequest):
    """
    Invokes the Investigation Agent to diagnose root causes and dimension contributions.
    """
    df = get_dataset(request.dataset_id)
    if df is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Dataset '{request.dataset_id}' not found.",
        )
    return investigation_agent.investigate(df=df, query=request.query)


@router.post("/anomalies/audit", response_model=AnomalyReport)
async def audit_anomalies(request: AnomalyAuditRequest):
    """
    Runs the Anomaly Intelligence Agent to detect and classify operational anomalies with financial impact.
    """
    df = get_dataset(request.dataset_id)
    if df is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Dataset '{request.dataset_id}' not found.",
        )
    return anomaly_intelligence_agent.audit(
        df=df, method=request.method or "iqr", threshold=request.threshold or 1.5
    )


@router.post("/scenarios/simulate", response_model=ScenarioSimulationResult)
async def simulate_scenario(request: ScenarioQueryRequest):
    """
    Simulates marketing spend shifts and diminishing returns elasticity.
    """
    df = get_dataset(request.dataset_id)
    if df is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Dataset '{request.dataset_id}' not found.",
        )
    return scenario_intelligence_agent.parse_and_simulate(df=df, query=request.query)


@router.post("/recommendations/prioritized", response_model=RecommendationReport)
async def generate_prioritized_recommendations(request: DatasetIdRequest):
    """
    Generates actionable, risk-weighted recommendations from historical performance data.
    """
    df = get_dataset(request.dataset_id)
    if df is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Dataset '{request.dataset_id}' not found.",
        )
    return recommendation_intelligence_agent.generate_recommendations(df)


@router.post("/executive/brief", response_model=ExecutiveBriefing)
async def generate_executive_briefing(request: ExecutiveReportRequest):
    """
    Generates C-Level Executive Briefing with Health Status, Core KPIs, Top Wins, Top Risks, and Actions.
    """
    df = get_dataset(request.dataset_id)
    if df is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Dataset '{request.dataset_id}' not found.",
        )
    meta = get_dataset_metadata(request.dataset_id) or {}
    company = meta.get("company", request.dataset_name or "Enterprise Organization")
    return executive_briefing_agent.generate_briefing(df=df, company_name=company)


@router.post("/evaluation/benchmark", response_model=EvaluationScorecard)
async def run_evaluation_benchmark(request: DatasetIdRequest):
    """
    Runs the standardized agent benchmark suite against the active dataset,
    returning metric accuracy, grounding, DAX validity, and hallucination rates.
    """
    df = get_dataset(request.dataset_id)
    if df is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Dataset '{request.dataset_id}' not found.",
        )
    return agent_evaluator.run_benchmark(df)


@router.get("/observability/traces", response_model=list[AgentTraceSpan])
async def get_observability_traces(limit: int = 50):
    """
    Fetches recent agent execution spans, durations, and tool arguments for auditability.
    """
    return observability_tracer.get_recent_spans(limit=limit)


@router.get("/business/context/{dataset_id}", response_model=CompanyContext)
async def get_business_context(dataset_id: str):
    """
    Retrieves the business goals, KPI targets, and domain rules associated with a dataset.
    """
    return context_store.get_context(dataset_id)


@router.post("/business/context/{dataset_id}", response_model=CompanyContext)
async def update_business_context(dataset_id: str, context: CompanyContext):
    """
    Updates the business goals, KPI targets, and domain rules for a dataset.
    """
    context_store.set_context(dataset_id, context)
    return context


@router.get("/semantic/metrics")
async def list_semantic_metrics():
    """
    Lists the registered Business Semantic metrics, synonyms, DAX expressions, and formulas.
    """
    return metric_registry.list_metrics()
