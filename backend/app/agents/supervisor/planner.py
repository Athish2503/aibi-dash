import uuid
from typing import Any
from backend.app.agents.supervisor.task_graph import TaskGraph, TaskNode, AgentType, TaskStatus


class SupervisorPlanner:
    """
    Deconstructs user requests into structured, dependent analytical task graphs.
    """

    @classmethod
    def plan_execution(cls, query: str) -> TaskGraph:
        q_lower = query.lower()
        graph_id = f"plan_{uuid.uuid4().hex[:8]}"

        # Scenario 1: Investigation / Root Cause ("Why did ROI drop?", "Explain CAC spike")
        if any(term in q_lower for term in ("why", "cause", "drop", "decrease", "fall", "spike", "driver", "reason")):
            nodes = [
                TaskNode(
                    id="t1_baseline_kpis",
                    title="Calculate Baseline Performance KPIs",
                    agent_type=AgentType.DATA_ANALYST,
                    action="calculate_kpis",
                    dependencies=[],
                ),
                TaskNode(
                    id="t2_channel_breakdown",
                    title="Segment Performance by Marketing Channels",
                    agent_type=AgentType.DATA_ANALYST,
                    action="analyze_channels",
                    dependencies=["t1_baseline_kpis"],
                ),
                TaskNode(
                    id="t3_contribution_analysis",
                    title="Analyze Dimension Variance Drag and Lift",
                    agent_type=AgentType.INVESTIGATOR,
                    action="analyze_contributions",
                    dependencies=["t2_channel_breakdown"],
                ),
                TaskNode(
                    id="t4_root_cause",
                    title="Isolate Primary Root Cause and Drivers",
                    agent_type=AgentType.INVESTIGATOR,
                    action="investigate_root_cause",
                    dependencies=["t3_contribution_analysis"],
                ),
            ]
            return TaskGraph(graph_id=graph_id, goal=f"Root cause investigation for: {query}", nodes=nodes)

        # Scenario 2: Anomaly / Outliers / Alerts
        elif any(term in q_lower for term in ("anomaly", "anomalies", "outlier", "outliers", "unusual", "alert")):
            nodes = [
                TaskNode(
                    id="t1_anomaly_detection",
                    title="Detect Statistical Outliers across Metrics",
                    agent_type=AgentType.ANOMALY_AGENT,
                    action="detect_anomalies",
                    dependencies=[],
                ),
                TaskNode(
                    id="t2_severity_classification",
                    title="Classify Operational Severity and Financial Risk",
                    agent_type=AgentType.ANOMALY_AGENT,
                    action="classify_severity",
                    dependencies=["t1_anomaly_detection"],
                ),
            ]
            return TaskGraph(graph_id=graph_id, goal=f"Anomaly audit for: {query}", nodes=nodes)

        # Scenario 3: Scenario / Simulation ("What if we increase spend?")
        elif any(term in q_lower for term in ("what if", "scenario", "simulate", "simulation", "project")):
            nodes = [
                TaskNode(
                    id="t1_current_state",
                    title="Profile Current Baseline KPIs",
                    agent_type=AgentType.DATA_ANALYST,
                    action="calculate_kpis",
                    dependencies=[],
                ),
                TaskNode(
                    id="t2_run_scenario",
                    title="Simulate Parameter Shifts & Projected Yield",
                    agent_type=AgentType.SCENARIO_AGENT,
                    action="simulate_scenario",
                    dependencies=["t1_current_state"],
                ),
            ]
            return TaskGraph(graph_id=graph_id, goal=f"Scenario projection for: {query}", nodes=nodes)

        # Scenario 4: Standard Analytical Inquiry / Ranking / Aggregation
        else:
            nodes = [
                TaskNode(
                    id="t1_semantic_analysis",
                    title="Deterministic KPI and Segment Analysis",
                    agent_type=AgentType.DATA_ANALYST,
                    action="analyze_query",
                    dependencies=[],
                )
            ]
            return TaskGraph(graph_id=graph_id, goal=f"Data analysis for: {query}", nodes=nodes)
