import uuid
from typing import Any, Optional
import pandas as pd
from backend.app.agents.supervisor.agent_state import AgentState
from backend.app.agents.supervisor.task_graph import TaskGraph
from backend.app.agents.supervisor.planner import SupervisorPlanner
from backend.app.agents.supervisor.execution_engine import ExecutionEngine
from backend.app.semantic.metric_resolver import MetricResolver
from backend.app.business.context_store import context_store
from backend.app.agents.data_analyst.agent import AnalystResponse
from backend.app.agents.investigator.agent import InvestigationReport
from backend.app.agents.anomaly.agent import AnomalyReport
from backend.app.scenarios.simulation_engine import ScenarioSimulationResult
from backend.app.agents.recommendation.agent import RecommendationReport


class AgentSupervisor:
    """
    Supervisor Agent (The Brain of the Platform):
    1. Understands business context & resolves semantic metrics.
    2. Builds a structured execution TaskGraph.
    3. Delegates sub-tasks to specialized domain agents (Data Analyst, Investigator, Anomaly).
    4. Enforces data grounding and synthesizes final answer with transparent execution trace.
    """

    def __init__(self):
        self.engine = ExecutionEngine()

    def run(
        self,
        query: str,
        df: pd.DataFrame,
        dataset_id: str = "default_dataset",
        session_id: Optional[str] = None,
    ) -> AgentState:
        sess_id = session_id or f"sess_{uuid.uuid4().hex[:8]}"

        # 1. Establish state and resolve business context
        b_context = context_store.get_context(dataset_id)
        semantic = MetricResolver.resolve_query(query)

        state = AgentState(
            session_id=sess_id,
            dataset_id=dataset_id,
            user_query=query,
            company_context=b_context,
            semantic_resolution=semantic,
        )

        # 2. Formulate task execution plan
        graph = SupervisorPlanner.plan_execution(query)
        state.tasks_planned = [n.title for n in graph.nodes]

        # 3. Execute tasks via specialized agents
        state = self.engine.execute_graph(graph, df, state)

        # 4. Synthesize final answer & evidence
        self._synthesize_response(state)

        return state

    def _synthesize_response(self, state: AgentState) -> None:
        # Check task outputs
        for task_id, res in state.task_results.items():
            if isinstance(res, AnalystResponse):
                state.final_answer = res.summary
                state.evidence.extend([e.model_dump() for e in res.evidence])
                state.visual_spec = res.visual_spec
            elif isinstance(res, InvestigationReport):
                state.final_answer = res.narrative_summary
                state.visual_spec = res.visual_spec
                state.evidence.extend(res.root_cause.supporting_evidence)
            elif isinstance(res, AnomalyReport):
                state.final_answer = res.executive_summary
                state.visual_spec = res.visual_spec
                state.evidence.extend([a.model_dump() for a in res.top_alerts])
            elif isinstance(res, ScenarioSimulationResult):
                state.final_answer = res.recommendation
                state.evidence.extend([
                    {"metric": "Projected Spend", "value": res.projected_spend, "variance": f"{res.spend_variance_pct:+}%"},
                    {"metric": "Projected ROI", "value": res.projected_roi, "variance": f"{res.roi_variance_pct:+}%"},
                ])
            elif isinstance(res, RecommendationReport):
                state.final_answer = res.executive_takeaway
                state.evidence.extend([r.model_dump() for r in res.recommendations])

        # If investigation had multi-step outputs (t1..t4)
        if not state.final_answer and "t4_root_cause" in state.task_results:
            rc = state.task_results["t4_root_cause"]
            state.final_answer = (
                f"Root Cause Identified: {rc.root_cause_explanation} "
                f"Confidence: {rc.confidence} ({int(rc.confidence_score * 100)}%). "
                f"Recommended action: {rc.recommended_remedy}"
            )
            state.evidence.extend(rc.supporting_evidence)

        if not state.final_answer:
            state.final_answer = f"Completed analysis for '{state.user_query}'."


supervisor = AgentSupervisor()
