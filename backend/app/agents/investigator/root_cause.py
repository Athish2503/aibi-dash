from typing import Any
import pandas as pd
from pydantic import BaseModel, Field
from backend.app.agents.investigator.contribution_analysis import ContributionAnalyzer, DimensionContribution
from backend.app.agents.investigator.hypothesis_engine import DiagnosticHypothesis


class RootCauseResult(BaseModel):
    target_metric: str
    primary_contributor: str
    primary_dimension: str
    root_cause_explanation: str
    confidence: str = Field(description="'High', 'Medium', 'Low'")
    confidence_score: float = Field(ge=0.0, le=1.0)
    supporting_evidence: list[dict[str, Any]] = Field(default_factory=list)
    tested_hypotheses: list[DiagnosticHypothesis] = Field(default_factory=list)
    recommended_remedy: str = ""


class RootCauseEngine:
    """
    Evaluates multi-variable evidence to pinpoint the deterministic root cause of performance shifts.
    """

    @classmethod
    def investigate_metric(
        cls,
        df: pd.DataFrame,
        metric: str = "ROI",
        focus_dimension: str = "Channel_Used",
    ) -> RootCauseResult:
        if df is None or df.empty:
            return RootCauseResult(
                target_metric=metric,
                primary_contributor="None",
                primary_dimension=focus_dimension,
                root_cause_explanation="Dataset is empty; root cause cannot be evaluated.",
                confidence="Low",
                confidence_score=0.0,
            )

        # 1. Run contribution analysis across dimensions
        contributions = ContributionAnalyzer.analyze_contributions(df, metric_col=metric)
        drags = [c for c in contributions if c.impact_direction == "drag"]
        primary_drag: DimensionContribution = drags[0] if drags else (contributions[0] if contributions else None)

        if not primary_drag:
            return RootCauseResult(
                target_metric=metric,
                primary_contributor="Overall Cohort",
                primary_dimension=focus_dimension,
                root_cause_explanation="No significant negative variance detected across dimensions.",
                confidence="Medium",
                confidence_score=0.7,
            )

        # 2. Slice dataset for primary drag entity
        entity_df = df[df[primary_drag.dimension].astype(str) == str(primary_drag.segment_value)]
        other_df = df[df[primary_drag.dimension].astype(str) != str(primary_drag.segment_value)]

        # Compare CAC, CVR, and Duration
        avg_cac_entity = float(pd.to_numeric(entity_df["Acquisition_Cost"], errors="coerce").dropna().mean()) if "Acquisition_Cost" in entity_df.columns else 0.0
        avg_cac_other = float(pd.to_numeric(other_df["Acquisition_Cost"], errors="coerce").dropna().mean()) if "Acquisition_Cost" in other_df.columns else 0.0

        avg_cvr_entity = float(pd.to_numeric(entity_df["Conversion_Rate"], errors="coerce").dropna().mean()) if "Conversion_Rate" in entity_df.columns else 0.0
        avg_cvr_other = float(pd.to_numeric(other_df["Conversion_Rate"], errors="coerce").dropna().mean()) if "Conversion_Rate" in other_df.columns else 0.0

        cac_diff_pct = round(((avg_cac_entity - avg_cac_other) / avg_cac_other) * 100, 2) if avg_cac_other != 0 else 0.0
        cvr_diff_pct = round(((avg_cvr_entity - avg_cvr_other) / avg_cvr_other) * 100, 2) if avg_cvr_other != 0 else 0.0

        supporting_evidence = [
            {
                "metric": "Acquisition Cost (CAC)",
                "entity_value": round(avg_cac_entity, 2),
                "benchmark_value": round(avg_cac_other, 2),
                "delta_pct": cac_diff_pct,
                "driver_flag": cac_diff_pct > 10.0,
            },
            {
                "metric": "Conversion Rate (CVR)",
                "entity_value": round(avg_cvr_entity, 4),
                "benchmark_value": round(avg_cvr_other, 4),
                "delta_pct": cvr_diff_pct,
                "driver_flag": cvr_diff_pct < -5.0,
            },
            {
                "metric": f"{metric} Drag Weight",
                "entity_value": primary_drag.variance_pct,
                "benchmark_value": 0.0,
                "delta_pct": primary_drag.variance_pct,
                "driver_flag": True,
            },
        ]

        # Determine primary root cause mechanism
        if cac_diff_pct > 15.0 and cvr_diff_pct < -5.0:
            cause = (
                f"Dual efficiency decay in {primary_drag.segment_value}: CAC inflated by {cac_diff_pct:+}% "
                f"while Conversion Rate dropped by {cvr_diff_pct:+}% relative to benchmark."
            )
            remedy = f"Cap bids and review creative fatigue on {primary_drag.segment_value}."
            conf_score = 0.95
            conf = "High"
        elif cac_diff_pct > 10.0:
            cause = (
                f"CAC inflation in {primary_drag.segment_value}: Average acquisition cost is ${round(avg_cac_entity, 2)} "
                f"({cac_diff_pct:+}% higher than the benchmark average of ${round(avg_cac_other, 2)})."
            )
            remedy = f"Audit auction competitiveness and tighten audience targeting on {primary_drag.segment_value}."
            conf_score = 0.90
            conf = "High"
        elif cvr_diff_pct < -5.0:
            cause = (
                f"Funnel conversion drop in {primary_drag.segment_value}: Conversion rate is "
                f"{round(avg_cvr_entity * 100, 2)}% ({cvr_diff_pct:+}% below peer channels)."
            )
            remedy = f"Optimize landing page alignment and audience messaging for {primary_drag.segment_value}."
            conf_score = 0.88
            conf = "High"
        else:
            cause = (
                f"Lower overall yield in {primary_drag.segment_value} with {primary_drag.variance_pct}% "
                f"{metric} deviation from population mean."
            )
            remedy = f"Rebalance flight budgets toward higher-yielding alternatives."
            conf_score = 0.78
            conf = "Medium"

        return RootCauseResult(
            target_metric=metric,
            primary_contributor=str(primary_drag.segment_value),
            primary_dimension=primary_drag.dimension,
            root_cause_explanation=cause,
            confidence=conf,
            confidence_score=conf_score,
            supporting_evidence=supporting_evidence,
            recommended_remedy=remedy,
        )
