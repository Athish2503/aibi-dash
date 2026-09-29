import pytest
import pandas as pd
import numpy as np
from fastapi.testclient import TestClient

from backend.app.main import app
from backend.app.data.quality_engine import DataQualityEngine
from backend.app.business.context import CompanyContext, KPITarget, BusinessGoal, BusinessRule, TargetStatus
from backend.app.business.kpi_targets import BusinessTargetEvaluator
from backend.app.business.business_rules import BusinessRuleEngine
from backend.app.business.context_store import context_store
from backend.app.semantic.metric_registry import metric_registry
from backend.app.semantic.dimension_registry import dimension_registry
from backend.app.semantic.metric_resolver import MetricResolver
from backend.app.agents.supervisor.supervisor import AgentSupervisor
from backend.app.agents.supervisor.planner import SupervisorPlanner
from backend.app.agents.data_analyst.agent import DataAnalystAgent
from backend.app.agents.investigator.agent import InvestigationAgent
from backend.app.agents.investigator.contribution_analysis import ContributionAnalyzer
from backend.app.agents.investigator.root_cause import RootCauseEngine
from backend.app.agents.anomaly.agent import AnomalyAgent
from backend.app.agents.anomaly.severity import AnomalySeverityClassifier, AnomalySeverity
from backend.app.agents.powerbi.dax_agent import DAXIntelligenceAgent
from backend.app.agents.powerbi.visual_agent import VisualIntelligenceAgent
from backend.app.scenarios.simulation_engine import ScenarioSimulationEngine
from backend.app.scenarios.scenario_agent import ScenarioAgent
from backend.app.agents.recommendation.agent import RecommendationAgent
from backend.app.executive.briefing_agent import ExecutiveBriefingAgent
from backend.app.executive.insight_ranker import InsightRanker
from backend.app.memory.memory_manager import memory_manager
from backend.app.governance.provenance import ProvenanceEngine
from backend.app.governance.policy_engine import GovernancePolicyEngine
from backend.app.governance.observability import observability_tracer
from backend.app.evaluation.benchmark import BenchmarkSuite
from backend.app.evaluation.evaluator import AgentEvaluator
from backend.app.data.storage import save_dataset

client = TestClient(app)


@pytest.fixture
def sample_marketing_df():
    data = {
        "Campaign_ID": [f"CMP_{i:04d}" for i in range(1, 101)],
        "Company": ["Acme Corp"] * 50 + ["Beta Brand"] * 50,
        "Campaign_Type": ["Search"] * 30 + ["Social"] * 30 + ["Display"] * 20 + ["Influencer"] * 20,
        "Target_Audience": ["Men 18-24"] * 25 + ["Women 25-34"] * 25 + ["All"] * 50,
        "Duration_Days": [7, 14, 21, 30] * 25,
        "Channel_Used": ["Google Ads"] * 30 + ["Meta"] * 30 + ["YouTube"] * 20 + ["LinkedIn"] * 20,
        "Conversion_Rate": [0.08] * 30 + [0.03] * 30 + [0.09] * 20 + [0.06] * 20,
        "Acquisition_Cost": [35.0] * 30 + [75.0] * 30 + [40.0] * 20 + [50.0] * 20,
        "ROI": [3.2] * 30 + [1.4] * 30 + [3.5] * 20 + [2.2] * 20,
        "Location": ["North America"] * 50 + ["Europe"] * 50,
    }
    return pd.DataFrame(data)


# 1. Module 01: Data Quality Engine
def test_data_quality_engine_healthy(sample_marketing_df):
    report = DataQualityEngine.evaluate(sample_marketing_df)
    assert report.overall_score >= 80.0
    assert report.grade in ("A+", "A", "B")
    assert report.passed_audit is True
    assert report.completeness.score >= 90.0
    assert report.validity.score >= 90.0


def test_data_quality_engine_corrupt_data():
    corrupt_df = pd.DataFrame({
        "Campaign_ID": ["1", "1", "2"],
        "Conversion_Rate": [-0.5, 999.0, None],
        "Acquisition_Cost": [-50.0, None, 10.0],
        "ROI": ["bad", "values", None],
    })
    report = DataQualityEngine.evaluate(corrupt_df)
    assert report.overall_score < 70.0
    assert report.passed_audit is False
    assert len(report.recommendations) > 0


# 2. Module 02: Business Context Engine
def test_business_target_evaluator(sample_marketing_df):
    targets = [
        KPITarget(metric_name="ROI", target_value=2.0, comparison_operator=">=", unit="x"),
        KPITarget(metric_name="Acquisition_Cost", target_value=40.0, comparison_operator="<=", unit="$"),
    ]
    results = BusinessTargetEvaluator.evaluate_targets(sample_marketing_df, targets)
    assert len(results) == 2
    roi_res = next(r for r in results if r.metric_name == "ROI")
    assert roi_res.actual_value > 2.0
    assert roi_res.status in (TargetStatus.EXCEEDED, TargetStatus.ON_TRACK)


def test_business_rules_engine(sample_marketing_df):
    rules = [
        BusinessRule(
            id="r_cac",
            name="Max CAC",
            metric_name="Acquisition_Cost",
            condition="<= 40.0",
            action_message="CAC is above limit",
        )
    ]
    violations = BusinessRuleEngine.evaluate_rules(sample_marketing_df, rules)
    assert len(violations) == 1
    assert violations[0].metric_name == "Acquisition_Cost"


def test_context_store():
    ctx = context_store.get_context("test_dataset_123")
    assert ctx.company_name != ""
    assert len(ctx.targets) > 0


# 3. Module 03: Semantic Intelligence Layer
def test_semantic_metric_registry():
    roi = metric_registry.get_metric("metric_roi")
    assert roi is not None
    assert "return on investment" in roi.synonyms
    assert "AVERAGE" in roi.dax_expression


def test_metric_resolver():
    res = MetricResolver.resolve_query("What is our acquisition efficiency and spend across marketing channels?")
    metric_ids = [m.id for m in res.resolved_metrics]
    assert any("cac" in mid or "spend" in mid or "efficiency" in mid or "roi" in mid for mid in metric_ids)
    dim_cols = [d.column_name for d in res.resolved_dimensions]
    assert "Channel_Used" in dim_cols


# 4. Module 04: Supervisor Agent
def test_supervisor_planner():
    investigate_plan = SupervisorPlanner.plan_execution("Why did ROI drop in our campaigns?")
    assert len(investigate_plan.nodes) >= 3
    node_actions = [n.action for n in investigate_plan.nodes]
    assert "investigate_root_cause" in node_actions

    anomaly_plan = SupervisorPlanner.plan_execution("Show me anomalies and outliers")
    assert any("detect_anomalies" in n.action for n in anomaly_plan.nodes)


def test_supervisor_execution(sample_marketing_df):
    sup = AgentSupervisor()
    state = sup.run(query="Why did ROI drop?", df=sample_marketing_df)
    assert state.final_answer != ""
    assert len(state.execution_trace) >= 3
    assert len(state.evidence) > 0


# 5. Module 05: Data Analyst Agent
def test_data_analyst_agent(sample_marketing_df):
    agent = DataAnalystAgent()
    resp = agent.analyze(sample_marketing_df, query="Show average ROI and channels")
    assert "active campaigns" in resp.summary
    assert len(resp.detailed_findings) >= 2
    assert len(resp.evidence) > 0
    assert resp.visual_spec is not None


# 6. Module 06: Investigation & Root Cause Agent
def test_contribution_analysis(sample_marketing_df):
    contributions = ContributionAnalyzer.analyze_contributions(sample_marketing_df, metric_col="ROI")
    assert len(contributions) > 0
    drags = [c for c in contributions if c.impact_direction == "drag"]
    assert len(drags) > 0
    # In fixture, Meta has ROI 1.4, CAC 75, so Meta should be a drag
    meta_drag = next((c for c in drags if c.segment_value == "Meta"), None)
    assert meta_drag is not None


def test_root_cause_engine(sample_marketing_df):
    rc = RootCauseEngine.investigate_metric(sample_marketing_df, metric="ROI")
    assert rc.primary_contributor == "Meta"
    assert "inflation" in rc.root_cause_explanation.lower() or "cac" in rc.root_cause_explanation.lower()
    assert rc.confidence in ("High", "Medium")


# 7. Module 07: Anomaly Intelligence Agent
def test_anomaly_agent(sample_marketing_df):
    agent = AnomalyAgent()
    report = agent.audit(sample_marketing_df)
    assert report.total_anomalies_detected >= 0
    assert report.executive_summary != ""


# 8. Module 08 & 09 & 10: DAX & Visual Intelligence
def test_dax_intelligence_agent():
    dax_agent = DAXIntelligenceAgent()
    res = dax_agent.generate_and_verify_measure(
        prompt="Average ROI",
        table_name="Campaigns",
        available_columns=["ROI", "Acquisition_Cost"],
    )
    assert res.is_valid is True
    assert "ROI" in res.dax_expression


def test_visual_intelligence_agent():
    plan = VisualIntelligenceAgent.recommend_composition(intent="why did ROI drop?", metric="ROI")
    assert len(plan.visuals) == 3
    assert plan.visuals[0].metric == "ROI"


# 9. Module 11: Scenario / What-If Agent
def test_scenario_simulation(sample_marketing_df):
    sim = ScenarioSimulationEngine.simulate_spend_shift(sample_marketing_df, channel="Meta", spend_change_pct=20.0)
    assert sim.projected_spend > sim.baseline_spend
    assert len(sim.assumptions_stated) >= 2
    assert sim.spend_variance_pct > 0


# 10. Module 12: Recommendation Agent
def test_recommendation_agent(sample_marketing_df):
    agent = RecommendationAgent()
    report = agent.generate_recommendations(sample_marketing_df)
    assert report.total_recommendations >= 2
    assert report.recommendations[0].priority in ("Immediate", "Medium-Term", "Strategic")
    assert report.recommendations[0].potential_impact != ""


# 11. Module 13: Executive Intelligence
def test_executive_briefing(sample_marketing_df):
    agent = ExecutiveBriefingAgent()
    brief = agent.generate_briefing(sample_marketing_df, company_name="Acme Marketing")
    assert "Acme Marketing" in brief.briefing_title
    assert "🟢" in brief.overall_health or "🟡" in brief.overall_health
    assert brief.health_score > 0
    assert len(brief.top_material_insights) >= 2


# 12. Module 14, 15, 16: Memory & Governance
def test_memory_manager():
    memory_manager.add_turn("sess_1", "user", "What is ROI?", ["ROI"])
    turns = memory_manager.get_conversation_history("sess_1")
    assert len(turns) >= 1
    assert turns[-1].text == "What is ROI?"


def test_provenance_engine(sample_marketing_df):
    cert = ProvenanceEngine.issue_certificate(
        dataset_id="ds_123",
        df=sample_marketing_df,
        query="Test query",
        answer="Test answer",
        evidence=[{"metric": "ROI", "value": 2.5}],
        tools_invoked=["calculate_kpis"],
    )
    assert cert.certificate_id.startswith("cert_")
    assert cert.deterministic_invariants_passed is True


def test_governance_policy():
    res_safe = GovernancePolicyEngine.validate_request("Show average ROI by channel")
    assert res_safe.is_compliant is True

    res_unsafe = GovernancePolicyEngine.validate_request("import os; os.system('calc')")
    assert res_unsafe.is_compliant is False


# 13. Module 17: Agent Evaluation Benchmark
def test_agent_evaluator(sample_marketing_df):
    evaluator = AgentEvaluator()
    scorecard = evaluator.run_benchmark(sample_marketing_df)
    assert scorecard.total_evaluated == 7
    assert scorecard.metric_accuracy_pct >= 90.0
    assert scorecard.hallucination_rate_pct == 0.0
    assert scorecard.scorecard_grade in ("A+", "A")


# 14. FastAPI Endpoints Integration Tests
def test_api_agentic_bi_endpoints(sample_marketing_df):
    # Save dataset to session store
    dataset_id = save_dataset(sample_marketing_df, filename="marketing_sample.csv")

    # 1. Quality endpoint
    res_q = client.post(f"/api/v1/dataset/quality?dataset_id={dataset_id}")
    assert res_q.status_code == 200
    q_json = res_q.json()
    assert q_json["overall_score"] >= 80.0

    # 2. Supervisor Query endpoint
    res_sup = client.post(
        "/api/v1/supervisor/query",
        json={"dataset_id": dataset_id, "query": "Why did ROI drop?"},
    )
    assert res_sup.status_code == 200
    sup_json = res_sup.json()
    assert sup_json["final_answer"] != ""
    assert len(sup_json["execution_trace"]) >= 2

    # 3. Investigate endpoint
    res_inv = client.post(
        "/api/v1/investigate",
        json={"dataset_id": dataset_id, "query": "Investigate Meta CAC"},
    )
    assert res_inv.status_code == 200
    assert res_inv.json()["root_cause"]["primary_contributor"] != ""

    # 4. Scenario Simulation endpoint
    res_scen = client.post(
        "/api/v1/scenarios/simulate",
        json={"dataset_id": dataset_id, "query": "What if Meta spend increases by 25%?"},
    )
    assert res_scen.status_code == 200
    assert res_scen.json()["spend_variance_pct"] > 0

    # 5. Prioritized Recommendations endpoint
    res_rec = client.post(
        "/api/v1/recommendations/prioritized",
        json={"dataset_id": dataset_id},
    )
    assert res_rec.status_code == 200
    assert res_rec.json()["total_recommendations"] >= 1

    # 6. Executive Brief endpoint
    res_exec = client.post(
        "/api/v1/executive/brief",
        json={"dataset_id": dataset_id, "dataset_name": "Test Company"},
    )
    assert res_exec.status_code == 200
    assert res_exec.json()["health_score"] > 0

    # 7. Semantic Metrics endpoint
    res_sem = client.get("/api/v1/semantic/metrics")
    assert res_sem.status_code == 200
    assert len(res_sem.json()) >= 4
