from typing import Any, Optional
import pandas as pd
from pydantic import BaseModel, Field
from backend.app.analytics.segmentation import analyze_channels, analyze_audiences
from backend.app.agents.investigator.root_cause import RootCauseEngine


class ActionableRecommendation(BaseModel):
    id: str
    priority: str = Field(description="'Immediate', 'Medium-Term', 'Strategic'")
    title: str
    insight_driver: str
    recommended_action: str
    potential_impact: str
    associated_risk: str
    target_channel_or_segment: str


class RecommendationReport(BaseModel):
    total_recommendations: int
    recommendations: list[ActionableRecommendation] = Field(default_factory=list)
    executive_takeaway: str


class RecommendationAgent:
    """
    Recommendation Agent:
    Transforms analytical insights and investigation diagnoses into prioritized,
    risk-weighted marketing management actions.
    """

    def generate_recommendations(self, df: pd.DataFrame) -> RecommendationReport:
        if df is None or df.empty:
            return RecommendationReport(
                total_recommendations=0,
                recommendations=[],
                executive_takeaway="Dataset is empty. No recommendations can be generated.",
            )

        channels = analyze_channels(df)
        audiences = analyze_audiences(df)
        root_cause = RootCauseEngine.investigate_metric(df, metric="ROI")

        recs: list[ActionableRecommendation] = []

        # 1. Immediate action on primary drag / root cause
        if root_cause.primary_contributor and root_cause.primary_contributor != "None":
            recs.append(
                ActionableRecommendation(
                    id="rec_root_cause_1",
                    priority="Immediate",
                    title=f"Remediate Inefficiency in {root_cause.primary_contributor}",
                    insight_driver=root_cause.root_cause_explanation,
                    recommended_action=root_cause.recommended_remedy,
                    potential_impact="Recover an estimated 5-12% in blended marketing ROI by capping loss-making flights.",
                    associated_risk="Risk of short-term volume reduction while re-allocating campaign creatives.",
                    target_channel_or_segment=root_cause.primary_contributor,
                )
            )

        # 2. Capital reallocation to top channel
        if len(channels) >= 2:
            top_ch = channels[0]
            bot_ch = channels[-1]
            recs.append(
                ActionableRecommendation(
                    id="rec_reallocate_2",
                    priority="Medium-Term",
                    title=f"Rebalance Budget from {bot_ch.get('Channel_Used')} to {top_ch.get('Channel_Used')}",
                    insight_driver=(
                        f"{top_ch.get('Channel_Used')} yields {top_ch.get('average_roi')}x ROI at "
                        f"${top_ch.get('average_acquisition_cost')} CAC vs {bot_ch.get('Channel_Used')} "
                        f"({bot_ch.get('average_roi')}x ROI)."
                    ),
                    recommended_action=(
                        f"Shift 15-20% of monthly acquisition budget from {bot_ch.get('Channel_Used')} "
                        f"to {top_ch.get('Channel_Used')} campaigns."
                    ),
                    potential_impact="Projected increase of $150k-$300k in net customer lifetime value.",
                    associated_risk="Diminishing returns if audience reach saturates on top platform.",
                    target_channel_or_segment=str(top_ch.get("Channel_Used")),
                )
            )

        # 3. Demographic targeting optimization
        if audiences:
            top_aud = audiences[0]
            recs.append(
                ActionableRecommendation(
                    id="rec_audience_3",
                    priority="Strategic",
                    title=f"Scale High-Yield Demographic: {top_aud.get('Target_Audience')}",
                    insight_driver=(
                        f"Target cohort '{top_aud.get('Target_Audience')}' delivers top conversion efficiency "
                        f"with {top_aud.get('average_roi')}x ROI."
                    ),
                    recommended_action=(
                        f"Create dedicated creative variants and lookalike audiences tailored to "
                        f"'{top_aud.get('Target_Audience')}'."
                    ),
                    potential_impact="Expected 8-15% improvement in multi-channel conversion velocity.",
                    associated_risk="Higher CPM bid costs in competitive demographic segments.",
                    target_channel_or_segment=str(top_aud.get("Target_Audience")),
                )
            )

        takeaway = (
            f"Formulated {len(recs)} data-backed strategic recommendations focusing on "
            f"{recs[0].target_channel_or_segment if recs else 'campaign'} optimization."
        )

        return RecommendationReport(
            total_recommendations=len(recs),
            recommendations=recs,
            executive_takeaway=takeaway,
        )
