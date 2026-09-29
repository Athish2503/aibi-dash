from typing import Any, Optional
from datetime import datetime, timezone
from pydantic import BaseModel, Field
from backend.app.business.context import CompanyContext
from backend.app.semantic.metric_resolver import SemanticResolutionResult


class ExecutionStep(BaseModel):
    step_id: str
    agent_type: str
    action: str
    status: str = "completed"
    duration_ms: float = 0.0
    input_summary: str = ""
    output_summary: str = ""
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class AgentState(BaseModel):
    session_id: str
    dataset_id: str
    user_query: str
    company_context: Optional[CompanyContext] = None
    semantic_resolution: Optional[SemanticResolutionResult] = None
    tasks_planned: list[str] = Field(default_factory=list)
    task_results: dict[str, Any] = Field(default_factory=dict)
    evidence: list[dict[str, Any]] = Field(default_factory=list)
    execution_trace: list[ExecutionStep] = Field(default_factory=list)
    final_answer: str = ""
    visual_spec: Optional[dict[str, Any]] = None
    confidence_score: float = 1.0
    errors: list[str] = Field(default_factory=list)
