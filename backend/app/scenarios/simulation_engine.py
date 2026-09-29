from typing import Any, Optional
import pandas as pd
import numpy as np
from pydantic import BaseModel, Field


class ShiftAssumption(BaseModel):
    channel: str
    spend_multiplier: float = Field(default=1.0, description="1.20 = +20% spend, 0.80 = -20% spend")
    expected_cvr_elasticity: float = Field(default=-0.05, description="Diminishing returns elasticity on CVR (e.g. -5% per 20% spend increase)")


class ScenarioSimulationResult(BaseModel):
    scenario_name: str
    baseline_spend: float
    projected_spend: float
    spend_variance_pct: float
    baseline_roi: float
    projected_roi: float
    roi_variance_pct: float
    baseline_cvr: float
    projected_cvr: float
    cvr_variance_pct: float
    assumptions_stated: list[str]
    channel_breakdown: list[dict[str, Any]]
    recommendation: str


class ScenarioSimulationEngine:
    """
    Deterministic What-If simulation engine for marketing spend reallocation and elasticity modeling.
    """

    @classmethod
    def simulate_spend_shift(
        cls,
        df: pd.DataFrame,
        channel: str,
        spend_change_pct: float = 20.0,
    ) -> ScenarioSimulationResult:
        if df is None or df.empty:
            return ScenarioSimulationResult(
                scenario_name=f"{spend_change_pct:+}% Spend Shift on {channel}",
                baseline_spend=0.0,
                projected_spend=0.0,
                spend_variance_pct=0.0,
                baseline_roi=0.0,
                projected_roi=0.0,
                roi_variance_pct=0.0,
                baseline_cvr=0.0,
                projected_cvr=0.0,
                cvr_variance_pct=0.0,
                assumptions_stated=["Dataset is empty."],
                channel_breakdown=[],
                recommendation="Upload data before simulating scenarios.",
            )

        multiplier = 1.0 + (spend_change_pct / 100.0)

        # Baseline calculations
        work_df = df.copy()
        work_df["_ac"] = pd.to_numeric(work_df["Acquisition_Cost"], errors="coerce").fillna(0)
        work_df["_roi"] = pd.to_numeric(work_df["ROI"], errors="coerce").fillna(0)
        work_df["_cvr"] = pd.to_numeric(work_df["Conversion_Rate"], errors="coerce").fillna(0)

        baseline_spend = float(work_df["_ac"].sum())
        baseline_roi = float(work_df["_roi"].mean())
        baseline_cvr = float(work_df["_cvr"].mean())

        # Simulate shift on channel
        channel_mask = work_df["Channel_Used"].astype(str).str.lower() == channel.lower()
        if not channel_mask.any():
            # If specific channel not found, apply to whole dataset
            channel_mask = pd.Series(True, index=work_df.index)
            channel = "All Channels"

        projected_df = work_df.copy()
        projected_df.loc[channel_mask, "_ac"] = projected_df.loc[channel_mask, "_ac"] * multiplier

        # Diminishing returns factor on ROI & CVR: If spend increases, marginal ROI softens slightly (-4% per +20% spend)
        elasticity_factor = 1.0 - (0.04 * (spend_change_pct / 20.0)) if spend_change_pct > 0 else 1.0 + (0.02 * (abs(spend_change_pct) / 20.0))
        projected_df.loc[channel_mask, "_roi"] = projected_df.loc[channel_mask, "_roi"] * elasticity_factor
        projected_df.loc[channel_mask, "_cvr"] = projected_df.loc[channel_mask, "_cvr"] * (1.0 - (0.01 * (spend_change_pct / 20.0)))

        projected_spend = float(projected_df["_ac"].sum())
        projected_roi = float(projected_df["_roi"].mean())
        projected_cvr = float(projected_df["_cvr"].mean())

        spend_var = round(((projected_spend - baseline_spend) / baseline_spend) * 100, 2) if baseline_spend else 0.0
        roi_var = round(((projected_roi - baseline_roi) / baseline_roi) * 100, 2) if baseline_roi else 0.0
        cvr_var = round(((projected_cvr - baseline_cvr) / baseline_cvr) * 100, 2) if baseline_cvr else 0.0

        assumptions = [
            f"Spend multiplier on {channel}: {multiplier:.2f}x ({spend_change_pct:+}%)",
            f"Diminishing returns elasticity coefficient applied: {elasticity_factor:.3f}x on marginal ROI",
            "Fixed audience universe and constant competitor bidding environment assumed",
        ]

        # Channel comparison summary
        channel_breakdown = []
        for ch_val, grp in projected_df.groupby("Channel_Used"):
            channel_breakdown.append({
                "channel": str(ch_val),
                "simulated_spend": round(float(grp["_ac"].sum()), 2),
                "simulated_roi": round(float(grp["_roi"].mean()), 3),
                "simulated_cvr": round(float(grp["_cvr"].mean()), 4),
            })

        rec = (
            f"Scaling {channel} by {spend_change_pct:+}% shifts total spend to ${projected_spend:,.2f} "
            f"({spend_var:+}%). Projected blended ROI adjusts to {projected_roi:.2f}x ({roi_var:+}%). "
        )
        if roi_var >= 0:
            rec += "Viable expansion opportunity; marginal efficiency remains healthy."
        else:
            rec += "Monitor CAC closely to mitigate diminishing returns beyond this threshold."

        return ScenarioSimulationResult(
            scenario_name=f"Scenario: {spend_change_pct:+}% Spend Shift on {channel}",
            baseline_spend=round(baseline_spend, 2),
            projected_spend=round(projected_spend, 2),
            spend_variance_pct=spend_var,
            baseline_roi=round(baseline_roi, 3),
            projected_roi=round(projected_roi, 3),
            roi_variance_pct=roi_var,
            baseline_cvr=round(baseline_cvr, 4),
            projected_cvr=round(projected_cvr, 4),
            cvr_variance_pct=cvr_var,
            assumptions_stated=assumptions,
            channel_breakdown=channel_breakdown,
            recommendation=rec,
        )
