from typing import Any
import pandas as pd
from pydantic import BaseModel, Field


class DimensionContribution(BaseModel):
    dimension: str
    segment_value: str
    metric: str
    segment_mean: float
    overall_mean: float
    segment_count: int
    variance_from_mean: float
    variance_pct: float
    contribution_weight_pct: float
    impact_direction: str = Field(description="'drag' (pulling performance down) or 'lift' (pulling performance up)")


class ContributionAnalyzer:
    """
    Deterministically computes how individual segments (channels, locations, audiences)
    contribute to overall metric variance.
    """

    @classmethod
    def analyze_contributions(
        cls,
        df: pd.DataFrame,
        metric_col: str = "ROI",
        dimension_cols: list[str] = None,
    ) -> list[DimensionContribution]:
        if df is None or df.empty or metric_col not in df.columns:
            return []

        dims = dimension_cols or ["Channel_Used", "Campaign_Type", "Target_Audience", "Location"]
        valid_dims = [d for d in dims if d in df.columns]

        series = pd.to_numeric(df[metric_col], errors="coerce").dropna()
        if series.empty:
            return []

        overall_mean = float(series.mean())
        total_rows = len(df)
        contributions: list[DimensionContribution] = []

        for dim in valid_dims:
            grouped = df.groupby(dim)
            for seg_val, group in grouped:
                grp_series = pd.to_numeric(group[metric_col], errors="coerce").dropna()
                if grp_series.empty:
                    continue

                grp_mean = float(grp_series.mean())
                grp_count = len(group)
                var_abs = round(grp_mean - overall_mean, 4)
                var_pct = round((var_abs / overall_mean) * 100, 2) if overall_mean != 0 else 0.0

                # Weight = (count / total_rows) * |var_pct|
                weight = round((grp_count / total_rows) * abs(var_pct), 2)
                direction = "lift" if var_abs > 0 else "drag"

                contributions.append(
                    DimensionContribution(
                        dimension=dim,
                        segment_value=str(seg_val),
                        metric=metric_col,
                        segment_mean=round(grp_mean, 4),
                        overall_mean=round(overall_mean, 4),
                        segment_count=grp_count,
                        variance_from_mean=var_abs,
                        variance_pct=var_pct,
                        contribution_weight_pct=weight,
                        impact_direction=direction,
                    )
                )

        # Sort by contribution weight descending
        contributions.sort(key=lambda x: x.contribution_weight_pct, reverse=True)
        return contributions
