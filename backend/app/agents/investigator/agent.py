from typing import Any, Optional
import pandas as pd
from pydantic import BaseModel, Field
from backend.app.agents.investigator.root_cause import RootCauseEngine, RootCauseResult
from backend.app.agents.investigator.contribution_analysis import ContributionAnalyzer, DimensionContribution


class InvestigationReport(BaseModel):
    query: str
    target_metric: str
    root_cause: RootCauseResult
    top_contributions: list[DimensionContribution] = Field(default_factory=list)
    narrative_summary: str
    visual_spec: Optional[dict[str, Any]] = None


class InvestigationAgent:
    """
    Investigation Agent:
    Finds out WHY metrics changed or underperformed, performing diagnostic drill-downs
    and contribution analysis.
    """

    def investigate(
        self,
        df: pd.DataFrame,
        query: str,
        metric: str = "ROI",
    ) -> InvestigationReport:
        if df is None or df.empty:
            empty_res = RootCauseResult(
                target_metric=metric,
                primary_contributor="None",
                primary_dimension="None",
                root_cause_explanation="Dataset is empty.",
                confidence="Low",
                confidence_score=0.0,
            )
            return InvestigationReport(
                query=query,
                target_metric=metric,
                root_cause=empty_res,
                narrative_summary="Dataset is empty. Cannot perform diagnostic investigation.",
            )

        # Detect target metric from query
        q_lower = query.lower()
        if "cac" in q_lower or "acquisition" in q_lower or "cost" in q_lower:
            metric = "Acquisition_Cost"
        elif "cvr" in q_lower or "conversion" in q_lower:
            metric = "Conversion_Rate"
        else:
            metric = "ROI"

        root_cause_res = RootCauseEngine.investigate_metric(df, metric=metric)
        all_contributions = ContributionAnalyzer.analyze_contributions(df, metric_col=metric)

        narrative = (
            f"ROOT CAUSE INVESTIGATION ({metric}):\n"
            f"Primary Contributor: {root_cause_res.primary_contributor} ({root_cause_res.primary_dimension})\n"
            f"Explanation: {root_cause_res.root_cause_explanation}\n"
            f"Confidence: {root_cause_res.confidence} ({int(root_cause_res.confidence_score * 100)}%)\n"
            f"Recommended Remedy: {root_cause_res.recommended_remedy}"
        )

        # Build visual spec for contributions
        contrib_data = [
            {
                "segment": f"{c.segment_value} ({c.dimension})",
                "variance_pct": c.variance_pct,
                "weight_pct": c.contribution_weight_pct,
                "impact": c.impact_direction,
            }
            for c in all_contributions[:6]
        ]
        visual_spec = {
            "type": "bar",
            "title": f"Contribution Variance to {metric}",
            "xAxis": "segment",
            "yAxis": "variance_pct",
            "data": contrib_data,
        }

        return InvestigationReport(
            query=query,
            target_metric=metric,
            root_cause=root_cause_res,
            top_contributions=all_contributions[:6],
            narrative_summary=narrative,
            visual_spec=visual_spec,
        )
