import time
from typing import Any, Optional
import pandas as pd
from backend.app.agents.supervisor.task_graph import TaskGraph, TaskNode, TaskStatus, AgentType
from backend.app.agents.supervisor.agent_state import AgentState, ExecutionStep
from backend.app.agents.data_analyst.agent import DataAnalystAgent
from backend.app.agents.investigator.agent import InvestigationAgent
from backend.app.agents.investigator.root_cause import RootCauseEngine
from backend.app.agents.investigator.contribution_analysis import ContributionAnalyzer
from backend.app.agents.anomaly.agent import AnomalyAgent
from backend.app.scenarios.scenario_agent import ScenarioAgent
from backend.app.agents.recommendation.agent import RecommendationAgent
from backend.app.analytics.kpis import calculate_kpis
from backend.app.analytics.segmentation import analyze_channels


class ExecutionEngine:
    """
    Executes a TaskGraph sequentially respecting dependencies, passing state,
    and capturing auditable telemetry for every step.
    """

    def __init__(self):
        self.data_analyst = DataAnalystAgent()
        self.investigator = InvestigationAgent()
        self.anomaly_agent = AnomalyAgent()
        self.scenario_agent = ScenarioAgent()
        self.recommendation_agent = RecommendationAgent()

    def execute_graph(self, graph: TaskGraph, df: pd.DataFrame, state: AgentState) -> AgentState:
        while not graph.is_finished():
            ready_nodes = graph.get_ready_nodes()
            if not ready_nodes:
                # Deadlock or cyclic dependency fallback
                break

            for node in ready_nodes:
                node.status = TaskStatus.RUNNING
                start_t = time.perf_counter()
                try:
                    result = self._dispatch_node(node, df, state)
                    node.result = result
                    node.status = TaskStatus.COMPLETED
                    dur_ms = round((time.perf_counter() - start_t) * 1000, 2)

                    # Append to trace
                    state.execution_trace.append(
                        ExecutionStep(
                            step_id=node.id,
                            agent_type=node.agent_type.value,
                            action=node.action,
                            status="completed",
                            duration_ms=dur_ms,
                            input_summary=node.title,
                            output_summary=str(result)[:200] if result else "OK",
                        )
                    )
                    state.task_results[node.id] = result
                except Exception as e:
                    node.status = TaskStatus.FAILED
                    node.error = str(e)
                    state.errors.append(f"Task {node.id} failed: {str(e)}")
                    state.execution_trace.append(
                        ExecutionStep(
                            step_id=node.id,
                            agent_type=node.agent_type.value,
                            action=node.action,
                            status="failed",
                            duration_ms=round((time.perf_counter() - start_t) * 1000, 2),
                            input_summary=node.title,
                            output_summary=f"ERROR: {str(e)}",
                        )
                    )

        return state

    def _dispatch_node(self, node: TaskNode, df: pd.DataFrame, state: AgentState) -> Any:
        if node.agent_type == AgentType.DATA_ANALYST:
            if node.action == "calculate_kpis":
                return calculate_kpis(df)
            elif node.action == "analyze_channels":
                return analyze_channels(df)
            else:
                return self.data_analyst.analyze(df, query=state.user_query, semantic=state.semantic_resolution)

        elif node.agent_type == AgentType.INVESTIGATOR:
            if node.action == "analyze_contributions":
                return ContributionAnalyzer.analyze_contributions(df, metric_col="ROI")
            elif node.action == "investigate_root_cause":
                return RootCauseEngine.investigate_metric(df, metric="ROI")
            else:
                return self.investigator.investigate(df, query=state.user_query)

        elif node.agent_type == AgentType.ANOMALY_AGENT:
            return self.anomaly_agent.audit(df)

        elif node.agent_type == AgentType.SCENARIO_AGENT:
            return self.scenario_agent.parse_and_simulate(df, query=state.user_query)

        elif node.agent_type == AgentType.RECOMMENDATION_AGENT:
            return self.recommendation_agent.generate_recommendations(df)

        return {"status": "unhandled_agent_action"}
