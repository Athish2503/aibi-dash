from typing import Any, Optional
import pandas as pd
import numpy as np


def calculate_kpis(df: pd.DataFrame) -> dict[str, Any]:
    """
    Computes core deterministic marketing KPIs for a campaigns DataFrame.
    Follows strict business rules defined in DATA_MODEL.md:
    - Total Campaigns = distinct Campaign_ID (or row count if Campaign_ID absent)
    - Average ROI = arithmetic mean of ROI
    - Average Conversion Rate = arithmetic mean of Conversion_Rate
    - Average Acquisition Cost = arithmetic mean of Acquisition_Cost
    """
    if df is None or df.empty:
        return {
            "total_campaigns": 0,
            "average_roi": 0.0,
            "average_conversion_rate": 0.0,
            "average_acquisition_cost": 0.0,
            "min_roi": 0.0,
            "max_roi": 0.0,
            "min_conversion_rate": 0.0,
            "max_conversion_rate": 0.0,
            "min_acquisition_cost": 0.0,
            "max_acquisition_cost": 0.0,
            "total_acquisition_cost": 0.0,
        }

    # Total Campaigns
    if "Campaign_ID" in df.columns:
        total_campaigns = int(df["Campaign_ID"].dropna().nunique())
    else:
        total_campaigns = int(len(df))

    # Metric calculations with safe coercion
    roi_series = pd.to_numeric(df["ROI"], errors="coerce").dropna() if "ROI" in df.columns else pd.Series(dtype=float)
    cr_series = pd.to_numeric(df["Conversion_Rate"], errors="coerce").dropna() if "Conversion_Rate" in df.columns else pd.Series(dtype=float)
    ac_series = pd.to_numeric(df["Acquisition_Cost"], errors="coerce").dropna() if "Acquisition_Cost" in df.columns else pd.Series(dtype=float)

    avg_roi = round(float(roi_series.mean()), 4) if not roi_series.empty else 0.0
    avg_cr = round(float(cr_series.mean()), 4) if not cr_series.empty else 0.0
    avg_ac = round(float(ac_series.mean()), 2) if not ac_series.empty else 0.0

    min_roi = round(float(roi_series.min()), 4) if not roi_series.empty else 0.0
    max_roi = round(float(roi_series.max()), 4) if not roi_series.empty else 0.0

    min_cr = round(float(cr_series.min()), 4) if not cr_series.empty else 0.0
    max_cr = round(float(cr_series.max()), 4) if not cr_series.empty else 0.0

    min_ac = round(float(ac_series.min()), 2) if not ac_series.empty else 0.0
    max_ac = round(float(ac_series.max()), 2) if not ac_series.empty else 0.0

    total_ac = round(float(ac_series.sum()), 2) if not ac_series.empty else 0.0

    return {
        "total_campaigns": total_campaigns,
        "average_roi": avg_roi,
        "average_conversion_rate": avg_cr,
        "average_acquisition_cost": avg_ac,
        "min_roi": min_roi,
        "max_roi": max_roi,
        "min_conversion_rate": min_cr,
        "max_conversion_rate": max_cr,
        "min_acquisition_cost": min_ac,
        "max_acquisition_cost": max_ac,
        "total_acquisition_cost": total_ac,
    }
