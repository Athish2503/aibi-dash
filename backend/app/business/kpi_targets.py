from typing import Any
import pandas as pd
from pydantic import BaseModel, Field
from backend.app.business.context import KPITarget, TargetStatus
from backend.app.analytics.kpis import calculate_kpis


class TargetEvaluationResult(BaseModel):
    metric_name: str
    target_value: float
    actual_value: float
    unit: str
    comparison_operator: str
    status: TargetStatus
    gap_absolute: float
    gap_percent: float
    is_failing: bool
    summary: str


class BusinessTargetEvaluator:
    """
    Deterministically compares computed actual KPIs against defined business targets.
    """

    METRIC_KEY_MAP = {
        "roi": "average_roi",
        "average_roi": "average_roi",
        "conversion_rate": "average_conversion_rate",
        "cvr": "average_conversion_rate",
        "average_conversion_rate": "average_conversion_rate",
        "acquisition_cost": "average_acquisition_cost",
        "cac": "average_acquisition_cost",
        "average_acquisition_cost": "average_acquisition_cost",
        "total_campaigns": "total_campaigns",
        "total_acquisition_cost": "total_acquisition_cost",
        "spend": "total_acquisition_cost",
    }

    @classmethod
    def evaluate_targets(
        cls, df: pd.DataFrame, targets: list[KPITarget]
    ) -> list[TargetEvaluationResult]:
        if not targets or df is None or df.empty:
            return []

        kpis = calculate_kpis(df)
        results: list[TargetEvaluationResult] = []

        for target in targets:
            norm_key = cls.METRIC_KEY_MAP.get(target.metric_name.lower().replace(" ", "_"), target.metric_name.lower())
            actual = float(kpis.get(norm_key, 0.0))
            expected = float(target.target_value)
            op = target.comparison_operator
            tol = target.tolerance_pct / 100.0

            gap_abs = round(actual - expected, 4)
            gap_pct = round(((actual - expected) / expected) * 100, 2) if expected != 0 else 0.0

            # Determine target fulfillment
            if op in (">=", ">"):
                # Higher is better (e.g. ROI, CVR)
                if actual >= expected:
                    status = TargetStatus.EXCEEDED if actual > expected * 1.05 else TargetStatus.ON_TRACK
                    is_failing = False
                elif actual >= expected * (1.0 - tol):
                    status = TargetStatus.AT_RISK
                    is_failing = False
                else:
                    status = TargetStatus.OFF_TRACK
                    is_failing = True
            elif op in ("<=", "<"):
                # Lower is better (e.g. CAC)
                if actual <= expected:
                    status = TargetStatus.EXCEEDED if actual < expected * 0.95 else TargetStatus.ON_TRACK
                    is_failing = False
                elif actual <= expected * (1.0 + tol):
                    status = TargetStatus.AT_RISK
                    is_failing = False
                else:
                    status = TargetStatus.OFF_TRACK
                    is_failing = True
            else:
                diff_pct = abs(gap_pct)
                if diff_pct <= 2.0:
                    status = TargetStatus.ON_TRACK
                    is_failing = False
                elif diff_pct <= target.tolerance_pct:
                    status = TargetStatus.AT_RISK
                    is_failing = False
                else:
                    status = TargetStatus.OFF_TRACK
                    is_failing = True

            summary = (
                f"{target.metric_name}: Actual {actual}{target.unit} vs Target {op} {expected}{target.unit} "
                f"({status.value.replace('_', ' ').upper()}, gap {gap_abs:+}{target.unit} / {gap_pct:+}%)"
            )

            results.append(
                TargetEvaluationResult(
                    metric_name=target.metric_name,
                    target_value=expected,
                    actual_value=actual,
                    unit=target.unit,
                    comparison_operator=op,
                    status=status,
                    gap_absolute=gap_abs,
                    gap_percent=gap_pct,
                    is_failing=is_failing,
                    summary=summary,
                )
            )

        return results
