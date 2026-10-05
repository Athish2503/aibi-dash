import math
from typing import Optional
import pandas as pd
import numpy as np
from pydantic import BaseModel, Field


def safe_mean(df: pd.DataFrame, col: str) -> float:
    """Safely extracts the mean of a column, handling strings, currencies, and NaNs without failing."""
    if col not in df.columns or df.empty:
        return 0.0
    series = df[col]
    if series.dtype == object or pd.api.types.is_string_dtype(series):
        series = (
            series.astype(str)
            .str.replace(r"[\$,€£]", "", regex=True)
            .str.replace(",", "", regex=False)
            .str.replace("%", "", regex=False)
            .str.strip()
        )
    coerced = pd.to_numeric(series, errors="coerce").dropna()
    if coerced.empty:
        return 0.0
    val = float(coerced.mean())
    return 0.0 if math.isnan(val) else val


def safe_sum(df: pd.DataFrame, col: str) -> float:
    """Safely extracts the sum of a column, handling strings, currencies, and NaNs without failing."""
    if col not in df.columns or df.empty:
        return 0.0
    series = df[col]
    if series.dtype == object or pd.api.types.is_string_dtype(series):
        series = (
            series.astype(str)
            .str.replace(r"[\$,€£]", "", regex=True)
            .str.replace(",", "", regex=False)
            .str.replace("%", "", regex=False)
            .str.strip()
        )
    coerced = pd.to_numeric(series, errors="coerce").dropna()
    if coerced.empty:
        return 0.0
    val = float(coerced.sum())
    return 0.0 if math.isnan(val) else val


class MetricDelta(BaseModel):
    baseline_value: float = Field(description="Value in baseline dataset A")
    comparison_value: float = Field(description="Value in comparison dataset B")
    absolute_delta: float = Field(description="comparison - baseline")
    percentage_change: Optional[float] = Field(default=None, description="Percentage change ((B - A) / A) * 100")
    sentiment: str = Field(default="neutral", description="positive, negative, or neutral")


class ChannelComparisonItem(BaseModel):
    channel: str
    roi_baseline: float
    roi_comparison: float
    roi_delta: float
    roi_pct_change: float
    cac_baseline: float
    cac_comparison: float
    cac_delta: float
    cac_pct_change: float
    conversion_rate_baseline: float
    conversion_rate_comparison: float
    conversion_rate_delta_pts: float
    share_baseline_pct: float
    share_comparison_pct: float
    performance_verdict: str  # "Outperformer", "Laggard", "Stable"


class AudienceComparisonItem(BaseModel):
    audience: str
    roi_baseline: float
    roi_comparison: float
    roi_delta: float
    share_baseline_pct: float
    share_comparison_pct: float


class DatasetComparisonResult(BaseModel):
    baseline_label: str = Field(default="Baseline (Period A)")
    comparison_label: str = Field(default="Comparison (Period B)")
    total_records_baseline: int
    total_records_comparison: int
    records_delta: int
    
    # Executive KPIs
    roi: MetricDelta
    cac: MetricDelta
    conversion_rate: MetricDelta
    total_spend: MetricDelta

    # Dimensional breakdowns
    channels: list[ChannelComparisonItem]
    audiences: list[AudienceComparisonItem]
    
    # Key Highlights
    top_roi_winner: Optional[str] = None
    top_cac_reducer: Optional[str] = None
    biggest_laggard: Optional[str] = None
    executive_summary: list[str] = Field(default_factory=list)


class DatasetComparator:
    """
    Deterministic cross-dataset comparator.
    Evaluates variances, attribution shifts, and performance deltas
    between two marketing campaign datasets without fabricating numbers.
    """

    @classmethod
    def compare(
        cls,
        df_a: pd.DataFrame,
        df_b: pd.DataFrame,
        label_a: str = "Baseline",
        label_b: str = "Comparison",
    ) -> DatasetComparisonResult:
        n_a = len(df_a)
        n_b = len(df_b)

        # Helper to compute metric delta
        def make_delta(val_a: float, val_b: float, higher_is_better: bool = True) -> MetricDelta:
            va = 0.0 if (val_a is None or math.isnan(val_a)) else float(val_a)
            vb = 0.0 if (val_b is None or math.isnan(val_b)) else float(val_b)
            diff = round(vb - va, 4)
            pct = round(((vb - va) / va * 100), 2) if va != 0 else 0.0
            if abs(diff) < 0.0001:
                sent = "neutral"
            elif (diff > 0 and higher_is_better) or (diff < 0 and not higher_is_better):
                sent = "positive"
            else:
                sent = "negative"
            return MetricDelta(
                baseline_value=round(va, 4),
                comparison_value=round(vb, 4),
                absolute_delta=diff,
                percentage_change=pct,
                sentiment=sent,
            )

        # Metrics
        roi_a = safe_mean(df_a, "ROI")
        roi_b = safe_mean(df_b, "ROI")
        roi_delta = make_delta(roi_a, roi_b, higher_is_better=True)

        cac_a = safe_mean(df_a, "Acquisition_Cost")
        cac_b = safe_mean(df_b, "Acquisition_Cost")
        cac_delta = make_delta(cac_a, cac_b, higher_is_better=False)

        conv_a = safe_mean(df_a, "Conversion_Rate")
        conv_b = safe_mean(df_b, "Conversion_Rate")
        conv_delta = make_delta(conv_a, conv_b, higher_is_better=True)

        spend_a = safe_sum(df_a, "Acquisition_Cost")
        spend_b = safe_sum(df_b, "Acquisition_Cost")
        spend_delta = make_delta(spend_a, spend_b, higher_is_better=False)

        # Channel comparison
        channel_col = "Channel_Used" if "Channel_Used" in df_a.columns else None
        channels_res: list[ChannelComparisonItem] = []
        top_roi_winner = None
        top_cac_reducer = None
        biggest_laggard = None

        if channel_col and channel_col in df_b.columns:
            all_channels = sorted(list(set(df_a[channel_col].dropna().unique()) | set(df_b[channel_col].dropna().unique())))
            
            best_roi_gain = 0.0
            best_cac_drop = 0.0
            worst_roi_drop = 0.0

            for ch in all_channels:
                sub_a = df_a[df_a[channel_col] == ch]
                sub_b = df_b[df_b[channel_col] == ch]

                ch_roi_a = safe_mean(sub_a, "ROI")
                ch_roi_b = safe_mean(sub_b, "ROI")
                d_roi = round(ch_roi_b - ch_roi_a, 4)
                pct_roi = round((d_roi / ch_roi_a * 100), 2) if ch_roi_a > 0 else 0.0

                ch_cac_a = safe_mean(sub_a, "Acquisition_Cost")
                ch_cac_b = safe_mean(sub_b, "Acquisition_Cost")
                d_cac = round(ch_cac_b - ch_cac_a, 2)
                pct_cac = round((d_cac / ch_cac_a * 100), 2) if ch_cac_a > 0 else 0.0

                ch_conv_a = safe_mean(sub_a, "Conversion_Rate")
                ch_conv_b = safe_mean(sub_b, "Conversion_Rate")
                d_conv_pts = round((ch_conv_b - ch_conv_a) * 100, 2)

                share_a = round(len(sub_a) / n_a * 100, 2) if n_a > 0 else 0.0
                share_b = round(len(sub_b) / n_b * 100, 2) if n_b > 0 else 0.0

                if abs(d_roi) < 0.0001 and abs(d_cac) < 0.0001:
                    verdict = "Stable"
                elif d_roi > 0.15 and d_cac <= 0:
                    verdict = "Outperformer"
                elif d_roi < -0.15 or d_cac > 10.0:
                    verdict = "Laggard"
                else:
                    verdict = "Stable"

                if d_roi > 0.001 and d_roi > best_roi_gain:
                    best_roi_gain = d_roi
                    top_roi_winner = ch

                if d_cac < -0.001 and d_cac < best_cac_drop:
                    best_cac_drop = d_cac
                    top_cac_reducer = ch

                if d_roi < -0.001 and d_roi < worst_roi_drop:
                    worst_roi_drop = d_roi
                    biggest_laggard = ch

                channels_res.append(
                    ChannelComparisonItem(
                        channel=ch,
                        roi_baseline=round(ch_roi_a, 2),
                        roi_comparison=round(ch_roi_b, 2),
                        roi_delta=d_roi,
                        roi_pct_change=pct_roi,
                        cac_baseline=round(ch_cac_a, 2),
                        cac_comparison=round(ch_cac_b, 2),
                        cac_delta=d_cac,
                        cac_pct_change=pct_cac,
                        conversion_rate_baseline=round(ch_conv_a, 4),
                        conversion_rate_comparison=round(ch_conv_b, 4),
                        conversion_rate_delta_pts=d_conv_pts,
                        share_baseline_pct=share_a,
                        share_comparison_pct=share_b,
                        performance_verdict=verdict,
                    )
                )

        # Audience comparison
        aud_col = "Target_Audience" if "Target_Audience" in df_a.columns else None
        audiences_res: list[AudienceComparisonItem] = []
        if aud_col and aud_col in df_b.columns:
            all_auds = sorted(list(set(df_a[aud_col].dropna().unique()) | set(df_b[aud_col].dropna().unique())))
            for aud in all_auds:
                sub_a = df_a[df_a[aud_col] == aud]
                sub_b = df_b[df_b[aud_col] == aud]
                a_roi = safe_mean(sub_a, "ROI")
                b_roi = safe_mean(sub_b, "ROI")
                sh_a = round(len(sub_a) / n_a * 100, 2) if n_a > 0 else 0.0
                sh_b = round(len(sub_b) / n_b * 100, 2) if n_b > 0 else 0.0
                audiences_res.append(
                    AudienceComparisonItem(
                        audience=aud,
                        roi_baseline=round(a_roi, 2),
                        roi_comparison=round(b_roi, 2),
                        roi_delta=round(b_roi - a_roi, 4),
                        share_baseline_pct=sh_a,
                        share_comparison_pct=sh_b,
                    )
                )

        # Build executive summary bullets
        summary: list[str] = []
        is_identical = (
            abs(roi_delta.absolute_delta) < 0.0001
            and abs(cac_delta.absolute_delta) < 0.0001
            and abs(conv_delta.absolute_delta) < 0.0001
        )
        if is_identical:
            summary.append(
                f"Baseline ({label_a}) and Comparison ({label_b}) exhibit identical performance across all core metrics (ROI: {roi_delta.baseline_value:.2f}x, CAC: ${cac_delta.baseline_value:.2f}, Conv Rate: {conv_delta.baseline_value * 100:.2f}%), indicating zero operational variance."
            )
        else:
            roi_sign = "+" if roi_delta.absolute_delta >= 0 else ""
            roi_pct = f" ({roi_delta.percentage_change:+.1f}%)" if roi_delta.percentage_change is not None else ""
            summary.append(
                f"Average ROI shifted by {roi_sign}{roi_delta.absolute_delta:.2f}x{roi_pct} "
                f"from {roi_delta.baseline_value:.2f}x in {label_a} to {roi_delta.comparison_value:.2f}x in {label_b}."
            )

            cac_sign = "+" if cac_delta.absolute_delta >= 0 else ""
            cac_qual = "increased cost" if cac_delta.absolute_delta > 0 else "cost reduction efficiency"
            cac_pct = f" ({cac_delta.percentage_change:+.1f}%)" if cac_delta.percentage_change is not None else ""
            summary.append(
                f"Customer Acquisition Cost (CAC) moved {cac_sign}${abs(cac_delta.absolute_delta):.2f}"
                f"{cac_pct}, reflecting {cac_qual}."
            )

        if top_roi_winner:
            summary.append(
                f"Top outperforming channel was '{top_roi_winner}' with the largest positive ROI expansion."
            )
        if biggest_laggard and biggest_laggard != top_roi_winner:
            summary.append(
                f"Channel '{biggest_laggard}' showed the steepest relative contraction in efficiency."
            )

        return DatasetComparisonResult(
            baseline_label=label_a,
            comparison_label=label_b,
            total_records_baseline=n_a,
            total_records_comparison=n_b,
            records_delta=n_b - n_a,
            roi=roi_delta,
            cac=cac_delta,
            conversion_rate=conv_delta,
            total_spend=spend_delta,
            channels=channels_res,
            audiences=audiences_res,
            top_roi_winner=top_roi_winner,
            top_cac_reducer=top_cac_reducer,
            biggest_laggard=biggest_laggard,
            executive_summary=summary,
        )
