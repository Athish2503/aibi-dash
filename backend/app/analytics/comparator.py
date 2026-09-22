from typing import Optional
import pandas as pd
import numpy as np
from pydantic import BaseModel, Field


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
            diff = round(val_b - val_a, 4)
            pct = round(((val_b - val_a) / val_a * 100), 2) if val_a != 0 else None
            if abs(diff) < 0.0001:
                sent = "neutral"
            elif (diff > 0 and higher_is_better) or (diff < 0 and not higher_is_better):
                sent = "positive"
            else:
                sent = "negative"
            return MetricDelta(
                baseline_value=round(val_a, 4),
                comparison_value=round(val_b, 4),
                absolute_delta=diff,
                percentage_change=pct,
                sentiment=sent,
            )

        # Metrics
        roi_a = float(df_a["ROI"].mean()) if "ROI" in df_a.columns and not df_a.empty else 0.0
        roi_b = float(df_b["ROI"].mean()) if "ROI" in df_b.columns and not df_b.empty else 0.0
        roi_delta = make_delta(roi_a, roi_b, higher_is_better=True)

        cac_a = float(df_a["Acquisition_Cost"].mean()) if "Acquisition_Cost" in df_a.columns and not df_a.empty else 0.0
        cac_b = float(df_b["Acquisition_Cost"].mean()) if "Acquisition_Cost" in df_b.columns and not df_b.empty else 0.0
        cac_delta = make_delta(cac_a, cac_b, higher_is_better=False)

        conv_a = float(df_a["Conversion_Rate"].mean()) if "Conversion_Rate" in df_a.columns and not df_a.empty else 0.0
        conv_b = float(df_b["Conversion_Rate"].mean()) if "Conversion_Rate" in df_b.columns and not df_b.empty else 0.0
        conv_delta = make_delta(conv_a, conv_b, higher_is_better=True)

        spend_a = float(df_a["Acquisition_Cost"].sum()) if "Acquisition_Cost" in df_a.columns and not df_a.empty else 0.0
        spend_b = float(df_b["Acquisition_Cost"].sum()) if "Acquisition_Cost" in df_b.columns and not df_b.empty else 0.0
        spend_delta = make_delta(spend_a, spend_b, higher_is_better=False)

        # Channel comparison
        channel_col = "Channel_Used" if "Channel_Used" in df_a.columns else None
        channels_res: list[ChannelComparisonItem] = []
        top_roi_winner = None
        top_cac_reducer = None
        biggest_laggard = None

        if channel_col and channel_col in df_b.columns:
            all_channels = sorted(list(set(df_a[channel_col].dropna().unique()) | set(df_b[channel_col].dropna().unique())))
            
            best_roi_gain = -9999.0
            best_cac_drop = 9999.0
            worst_roi_drop = 9999.0

            for ch in all_channels:
                sub_a = df_a[df_a[channel_col] == ch]
                sub_b = df_b[df_b[channel_col] == ch]

                ch_roi_a = float(sub_a["ROI"].mean()) if not sub_a.empty and "ROI" in sub_a.columns else 0.0
                ch_roi_b = float(sub_b["ROI"].mean()) if not sub_b.empty and "ROI" in sub_b.columns else 0.0
                d_roi = round(ch_roi_b - ch_roi_a, 4)
                pct_roi = round((d_roi / ch_roi_a * 100), 2) if ch_roi_a > 0 else 0.0

                ch_cac_a = float(sub_a["Acquisition_Cost"].mean()) if not sub_a.empty and "Acquisition_Cost" in sub_a.columns else 0.0
                ch_cac_b = float(sub_b["Acquisition_Cost"].mean()) if not sub_b.empty and "Acquisition_Cost" in sub_b.columns else 0.0
                d_cac = round(ch_cac_b - ch_cac_a, 2)
                pct_cac = round((d_cac / ch_cac_a * 100), 2) if ch_cac_a > 0 else 0.0

                ch_conv_a = float(sub_a["Conversion_Rate"].mean()) if not sub_a.empty and "Conversion_Rate" in sub_a.columns else 0.0
                ch_conv_b = float(sub_b["Conversion_Rate"].mean()) if not sub_b.empty and "Conversion_Rate" in sub_b.columns else 0.0
                d_conv_pts = round((ch_conv_b - ch_conv_a) * 100, 2)

                share_a = round(len(sub_a) / n_a * 100, 2) if n_a > 0 else 0.0
                share_b = round(len(sub_b) / n_b * 100, 2) if n_b > 0 else 0.0

                if d_roi > 0.15 and d_cac <= 0:
                    verdict = "Outperformer"
                elif d_roi < -0.15 or d_cac > 10.0:
                    verdict = "Laggard"
                else:
                    verdict = "Stable"

                if d_roi > best_roi_gain:
                    best_roi_gain = d_roi
                    top_roi_winner = ch

                if d_cac < best_cac_drop:
                    best_cac_drop = d_cac
                    top_cac_reducer = ch

                if d_roi < worst_roi_drop:
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
                a_roi = float(sub_a["ROI"].mean()) if not sub_a.empty and "ROI" in sub_a.columns else 0.0
                b_roi = float(sub_b["ROI"].mean()) if not sub_b.empty and "ROI" in sub_b.columns else 0.0
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
        roi_sign = "+" if roi_delta.absolute_delta >= 0 else ""
        summary.append(
            f"Average ROI shifted by {roi_sign}{roi_delta.absolute_delta:.2f}x ({roi_delta.percentage_change:+.1f}%) "
            f"from {roi_delta.baseline_value:.2f}x in {label_a} to {roi_delta.comparison_value:.2f}x in {label_b}."
        )

        cac_sign = "+" if cac_delta.absolute_delta >= 0 else ""
        cac_qual = "increased cost" if cac_delta.absolute_delta > 0 else "cost reduction efficiency"
        summary.append(
            f"Customer Acquisition Cost (CAC) moved {cac_sign}${abs(cac_delta.absolute_delta):.2f} "
            f"({cac_delta.percentage_change:+.1f}%), reflecting {cac_qual}."
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
