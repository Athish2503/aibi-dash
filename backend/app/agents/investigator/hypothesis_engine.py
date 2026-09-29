from typing import Any, Optional
from pydantic import BaseModel, Field


class DiagnosticHypothesis(BaseModel):
    id: str
    hypothesis_text: str
    target_metric: str
    driver_metric: str
    dimension: str
    segment_value: str
    test_type: str = Field(description="'metric_correlation', 'cac_inflation', 'cvr_drop', 'volume_skew'")
    evidence_status: str = "untested"
    test_details: str = ""


class HypothesisEngine:
    """
    Generates structured, testable diagnostic hypotheses for performance shifts.
    """

    @classmethod
    def generate_hypotheses(
        cls,
        metric: str = "ROI",
        primary_dimension: str = "Channel_Used",
        underperforming_segment: str = "Meta",
    ) -> list[DiagnosticHypothesis]:
        hypotheses = []

        if metric.upper() in ("ROI", "AVERAGE_ROI"):
            hypotheses.append(
                DiagnosticHypothesis(
                    id=f"hyp_{underperforming_segment}_cac",
                    hypothesis_text=f"Underperformance in {underperforming_segment} is driven by Acquisition Cost (CAC) inflation.",
                    target_metric="ROI",
                    driver_metric="Acquisition_Cost",
                    dimension=primary_dimension,
                    segment_value=underperforming_segment,
                    test_type="cac_inflation",
                )
            )
            hypotheses.append(
                DiagnosticHypothesis(
                    id=f"hyp_{underperforming_segment}_cvr",
                    hypothesis_text=f"Underperformance in {underperforming_segment} is driven by a drop in Conversion Rate (CVR).",
                    target_metric="ROI",
                    driver_metric="Conversion_Rate",
                    dimension=primary_dimension,
                    segment_value=underperforming_segment,
                    test_type="cvr_drop",
                )
            )
            hypotheses.append(
                DiagnosticHypothesis(
                    id=f"hyp_{underperforming_segment}_duration",
                    hypothesis_text=f"{underperforming_segment} campaigns suffer from audience fatigue over longer duration flights.",
                    target_metric="ROI",
                    driver_metric="Duration_Days",
                    dimension=primary_dimension,
                    segment_value=underperforming_segment,
                    test_type="volume_skew",
                )
            )
        else:
            hypotheses.append(
                DiagnosticHypothesis(
                    id=f"hyp_{underperforming_segment}_general",
                    hypothesis_text=f"Underperformance in {underperforming_segment} is localized to specific geographic regions.",
                    target_metric=metric,
                    driver_metric=metric,
                    dimension="Location",
                    segment_value=underperforming_segment,
                    test_type="volume_skew",
                )
            )

        return hypotheses
