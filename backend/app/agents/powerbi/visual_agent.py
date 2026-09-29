from typing import Any, Optional
from pydantic import BaseModel, Field
from backend.app.agent.plan_schemas import VisualType, VisualSpec


class VisualRecommendation(BaseModel):
    visual_type: VisualType
    title: str
    rationale: str
    x_axis: Optional[str] = None
    y_axis: Optional[str] = None
    metric: str
    color_role: str = "primary"


class VisualCompositionPlan(BaseModel):
    composition_title: str
    visuals: list[VisualRecommendation]
    executive_takeaway: str


class VisualIntelligenceAgent:
    """
    Visual Intelligence Agent:
    Selects structured combinations of visuals (e.g. Trend Line + Contribution Bar + Scatter + KPI Card)
    based on cognitive load principles and analytical intent.
    """

    @classmethod
    def recommend_composition(
        cls,
        intent: str = "performance_overview",
        metric: str = "ROI",
    ) -> VisualCompositionPlan:
        q_lower = intent.lower()

        # Composition 1: Investigation / Root Cause Combo
        if any(w in q_lower for w in ("why", "investigate", "cause", "drop", "spike")):
            visuals = [
                VisualRecommendation(
                    visual_type=VisualType.KPI_CARD,
                    title=f"Current {metric} Benchmark",
                    rationale="Immediate situational awareness of primary metric",
                    metric=metric,
                ),
                VisualRecommendation(
                    visual_type=VisualType.BAR_CHART,
                    title=f"{metric} Contribution Variance by Channel",
                    rationale="Isolates which marketing channels are dragging or lifting performance",
                    x_axis="variance_pct",
                    y_axis="Channel_Used",
                    metric=metric,
                    color_role="diverging",
                ),
                VisualRecommendation(
                    visual_type=VisualType.SCATTER_PLOT,
                    title="Acquisition Cost vs Conversion Rate",
                    rationale="Identifies cost inefficiency clusters and conversion anomalies",
                    x_axis="Acquisition_Cost",
                    y_axis="Conversion_Rate",
                    metric="Efficiency",
                ),
            ]
            return VisualCompositionPlan(
                composition_title=f"Root Cause Diagnostic Composition ({metric})",
                visuals=visuals,
                executive_takeaway="Combines top-level KPI impact with channel drag attribution and cost-efficiency clustering.",
            )

        # Composition 2: Cross-Channel Allocation Combo
        elif any(w in q_lower for w in ("channel", "media", "allocation", "spend")):
            visuals = [
                VisualRecommendation(
                    visual_type=VisualType.COLUMN_CHART,
                    title="Average ROI by Marketing Channel",
                    rationale="Ranks channel profitability",
                    x_axis="Channel_Used",
                    y_axis="Average_ROI",
                    metric="ROI",
                ),
                VisualRecommendation(
                    visual_type=VisualType.DONUT_CHART,
                    title="Acquisition Cost Distribution by Channel",
                    rationale="Visualizes budget allocation concentration",
                    x_axis="Channel_Used",
                    y_axis="Acquisition_Cost",
                    metric="Acquisition_Cost",
                ),
                VisualRecommendation(
                    visual_type=VisualType.TABLE,
                    title="Channel Scorecard & Volume",
                    rationale="Tabular audit of conversion rates and total campaigns",
                    x_axis="Channel_Used",
                    metric="All",
                ),
            ]
            return VisualCompositionPlan(
                composition_title="Cross-Channel Attribution Composition",
                visuals=visuals,
                executive_takeaway="Balances profitability rankings with capital allocation distribution.",
            )

        # Composition 3: Default Executive Overview
        else:
            visuals = [
                VisualRecommendation(
                    visual_type=VisualType.KPI_CARD,
                    title="Average ROI",
                    rationale="High-level performance benchmark",
                    metric="ROI",
                ),
                VisualRecommendation(
                    visual_type=VisualType.KPI_CARD,
                    title="Average CAC",
                    rationale="Cost per customer acquisition",
                    metric="Acquisition_Cost",
                ),
                VisualRecommendation(
                    visual_type=VisualType.BAR_CHART,
                    title="Channel ROI Performance",
                    rationale="Cross-channel performance comparison",
                    x_axis="Channel_Used",
                    y_axis="ROI",
                    metric="ROI",
                ),
                VisualRecommendation(
                    visual_type=VisualType.LINE_CHART,
                    title="Campaign Duration vs ROI Trend",
                    rationale="Analyzes performance decay over flight length",
                    x_axis="Duration_Days",
                    y_axis="ROI",
                    metric="ROI",
                ),
            ]
            return VisualCompositionPlan(
                composition_title="Executive Performance Composition",
                visuals=visuals,
                executive_takeaway="Holistic overview of profitability, cost, and duration dynamics.",
            )
