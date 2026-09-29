from typing import Any, Optional
import pandas as pd
from pydantic import BaseModel, Field
from backend.app.analytics.kpis import calculate_kpis
from backend.app.analytics.segmentation import analyze_channels
from backend.app.agents.investigator.root_cause import RootCauseEngine
from backend.app.agents.anomaly.agent import AnomalyAgent
from backend.app.executive.insight_ranker import InsightRanker, RankedInsight
from backend.app.agents.recommendation.agent import RecommendationAgent, ActionableRecommendation


class ExecutiveBriefing(BaseModel):
    briefing_title: str
    overall_health: str = Field(description="'🟢 Stable / Outperforming', '🟡 Moderate Attention Needed', '🔴 Critical Action Required'")
    health_score: float = Field(ge=0.0, le=100.0)
    core_kpis: dict[str, Any]
    primary_root_cause: str
    top_material_insights: list[RankedInsight] = Field(default_factory=list)
    immediate_action_plan: list[ActionableRecommendation] = Field(default_factory=list)
    executive_narrative: str


class ExecutiveBriefingAgent:
    """
    Executive Intelligence Agent:
    Synthesizes C-Level briefs answering: What happened? Why? What matters? What should we do?
    """

    def __init__(self):
        self.anomaly_agent = AnomalyAgent()
        self.rec_agent = RecommendationAgent()

    def generate_briefing(
        self,
        df: pd.DataFrame,
        company_name: str = "Enterprise Organization",
    ) -> ExecutiveBriefing:
        if df is None or df.empty:
            return ExecutiveBriefing(
                briefing_title=f"{company_name} Executive Performance Brief",
                overall_health="🟡 No Data Available",
                health_score=0.0,
                core_kpis={},
                primary_root_cause="Dataset is empty.",
                executive_narrative="No data has been loaded for executive briefing synthesis.",
            )

        kpis = calculate_kpis(df)
        channels = analyze_channels(df)
        root_cause = RootCauseEngine.investigate_metric(df, metric="ROI")
        anomaly_report = self.anomaly_agent.audit(df)
        recs_report = self.rec_agent.generate_recommendations(df)

        ranked_insights = InsightRanker.rank_insights(
            kpis=kpis,
            channels=channels,
            anomalies_count=anomaly_report.total_anomalies_detected,
            primary_drag=root_cause.primary_contributor,
        )

        # Health score computation
        avg_roi = float(kpis.get("average_roi", 0.0))
        avg_cac = float(kpis.get("average_acquisition_cost", 0.0))

        health_score = 75.0
        if avg_roi >= 2.5:
            health_score += 15.0
        elif avg_roi < 1.8:
            health_score -= 15.0

        if anomaly_report.critical_count > 0:
            health_score -= 10.0

        health_score = max(10.0, min(98.0, round(health_score, 1)))

        if health_score >= 80:
            health_badge = "🟢 Stable / Outperforming"
        elif health_score >= 60:
            health_badge = "🟡 Moderate Attention Needed"
        else:
            health_badge = "🔴 Critical Action Required"

        narrative = (
            f"EXECUTIVE BRIEFING FOR {company_name.upper()}:\n"
            f"Overall Portfolio Health: {health_badge} (Health Score: {health_score}/100).\n"
            f"The marketing portfolio generated an Average ROI of {avg_roi}x across {kpis.get('total_campaigns', 0):,} campaigns "
            f"with a mean Acquisition Cost of ${avg_cac}.\n"
            f"Primary Operational Focus: {root_cause.root_cause_explanation}.\n"
            f"Recommended Immediate Action: {root_cause.recommended_remedy}"
        )

        return ExecutiveBriefing(
            briefing_title=f"{company_name} Executive Performance Briefing",
            overall_health=health_badge,
            health_score=health_score,
            core_kpis=kpis,
            primary_root_cause=root_cause.root_cause_explanation,
            top_material_insights=ranked_insights,
            immediate_action_plan=recs_report.recommendations[:2],
            executive_narrative=narrative,
        )
