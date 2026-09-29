from typing import Any, Optional
import pandas as pd
import numpy as np


def analyze_trends_by_duration(
    df: pd.DataFrame,
    metric_col: str = "ROI",
    bucket_size: int = 7,
) -> list[dict[str, Any]]:
    """
    Computes deterministic metric trends across campaign duration flights.
    Groups campaigns into flight duration cohorts (e.g. 1-7 days, 8-14 days, 15-21 days, etc.)
    and calculates cohort KPI means and variance.
    """
    if df is None or df.empty:
        return []

    work_df = df.copy()
    dur_col = "Duration_Days" if "Duration_Days" in work_df.columns else "Duration"
    if dur_col not in work_df.columns or metric_col not in work_df.columns:
        return []

    # Coerce numeric
    work_df["_dur"] = pd.to_numeric(work_df[dur_col], errors="coerce")
    work_df["_metric"] = pd.to_numeric(work_df[metric_col], errors="coerce")
    work_df = work_df.dropna(subset=["_dur", "_metric"])
    if work_df.empty:
        return []

    max_dur = int(work_df["_dur"].max())
    bins = list(range(0, max(max_dur + bucket_size, bucket_size * 2), bucket_size))
    if len(bins) < 2:
        bins = [0, max(30, max_dur)]

    labels = [f"{bins[i]+1}-{bins[i+1]}d" for i in range(len(bins)-1)]
    work_df["_cohort"] = pd.cut(work_df["_dur"], bins=bins, labels=labels, right=True)

    grouped = work_df.groupby("_cohort", observed=True)
    results = []
    prev_mean = None

    for cohort_name, grp in grouped:
        if grp.empty:
            continue
        c_mean = round(float(grp["_metric"].mean()), 4)
        c_count = int(len(grp))
        delta_pct = round(((c_mean - prev_mean) / prev_mean) * 100, 2) if prev_mean and prev_mean != 0 else 0.0

        results.append({
            "duration_cohort": str(cohort_name),
            "campaign_count": c_count,
            "average_metric": c_mean,
            "metric_name": metric_col,
            "period_over_period_pct": delta_pct,
        })
        prev_mean = c_mean

    return results
