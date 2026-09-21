from typing import Any, Optional
import pandas as pd
import numpy as np


def apply_filters(df: pd.DataFrame, filters: Optional[dict[str, Any]] = None) -> pd.DataFrame:
    """
    Applies exact or normalized dimension filters to the DataFrame deterministically.
    Supports keys like 'Channel_Used', 'Duration', 'Duration_Days', 'Location', 'Company', etc.
    """
    if df is None or df.empty or not filters:
        return df

    filtered_df = df.copy()

    for raw_key, raw_val in filters.items():
        if raw_val is None or raw_val == "":
            continue

        # Find matching column (case-insensitive), prioritizing Duration_Days for duration filters
        matched_col = None
        if raw_key.lower() in ("duration", "duration_days", "days"):
            if "Duration_Days" in filtered_df.columns:
                matched_col = "Duration_Days"
            elif "Duration" in filtered_df.columns:
                matched_col = "Duration"
        else:
            for col in filtered_df.columns:
                if col.lower() == raw_key.lower():
                    matched_col = col
                    break

        if not matched_col:
            continue

        # Handle numeric duration / numeric column filtering
        if matched_col in ("Duration_Days", "Duration", "Acquisition_Cost", "ROI", "Conversion_Rate"):
            try:
                import re
                if isinstance(raw_val, str):
                    num_match = re.search(r"(\d+(?:\.\d+)?)", raw_val)
                    val_num = float(num_match.group(1)) if num_match else float(raw_val)
                else:
                    val_num = float(raw_val)
                
                if matched_col == "Duration" and "Duration_Days" not in filtered_df.columns:
                    extracted = filtered_df["Duration"].astype(str).str.extract(r"(\d+(?:\.\d+)?)", expand=False)
                    col_numeric = pd.to_numeric(extracted, errors="coerce")
                else:
                    col_numeric = pd.to_numeric(filtered_df[matched_col], errors="coerce")

                filtered_df = filtered_df[col_numeric == val_num]
                continue
            except (ValueError, TypeError):
                pass

        # Categorical filtering (case-insensitive strip matching)
        if isinstance(raw_val, str):
            val_clean = raw_val.strip().lower()
            series_clean = filtered_df[matched_col].astype(str).str.strip().str.lower()
            filtered_df = filtered_df[series_clean == val_clean]
        elif isinstance(raw_val, (list, set, tuple)):
            vals_clean = [str(v).strip().lower() for v in raw_val]
            series_clean = filtered_df[matched_col].astype(str).str.strip().str.lower()
            filtered_df = filtered_df[series_clean.isin(vals_clean)]
        else:
            filtered_df = filtered_df[filtered_df[matched_col] == raw_val]

    return filtered_df


def _aggregate_dimension(
    df: pd.DataFrame,
    dimension_col: str,
    filters: Optional[dict[str, Any]] = None,
) -> list[dict[str, Any]]:
    """
    Helper function to aggregate KPIs grouped by a specific dimension.
    Calculates count, average ROI, average Conversion Rate, average Acquisition Cost.
    """
    if df is None or df.empty:
        return []

    work_df = apply_filters(df, filters)
    if work_df.empty or dimension_col not in work_df.columns:
        return []

    # Coerce numeric columns
    work_df = work_df.copy()
    if "ROI" in work_df.columns:
        work_df["_roi"] = pd.to_numeric(work_df["ROI"], errors="coerce")
    else:
        work_df["_roi"] = np.nan

    if "Conversion_Rate" in work_df.columns:
        work_df["_cr"] = pd.to_numeric(work_df["Conversion_Rate"], errors="coerce")
    else:
        work_df["_cr"] = np.nan

    if "Acquisition_Cost" in work_df.columns:
        work_df["_ac"] = pd.to_numeric(work_df["Acquisition_Cost"], errors="coerce")
    else:
        work_df["_ac"] = np.nan

    grouped = work_df.groupby(dimension_col, dropna=False)

    results = []
    for val, group in grouped:
        str_val = "Unknown" if pd.isna(val) or str(val).strip() == "" else str(val).strip()
        count = int(len(group))
        avg_roi = round(float(group["_roi"].dropna().mean()), 4) if not group["_roi"].dropna().empty else 0.0
        avg_cr = round(float(group["_cr"].dropna().mean()), 4) if not group["_cr"].dropna().empty else 0.0
        avg_ac = round(float(group["_ac"].dropna().mean()), 2) if not group["_ac"].dropna().empty else 0.0

        results.append({
            dimension_col: str_val,
            "campaign_count": count,
            "average_roi": avg_roi,
            "average_conversion_rate": avg_cr,
            "average_acquisition_cost": avg_ac,
        })

    # Sort primarily by average_roi descending
    results.sort(key=lambda x: x["average_roi"], reverse=True)
    return results


def analyze_channels(df: pd.DataFrame, filters: Optional[dict[str, Any]] = None) -> list[dict[str, Any]]:
    """Analyzes campaign performance segmented by Channel_Used."""
    col = "Channel_Used" if "Channel_Used" in df.columns else None
    if not col:
        return []
    return _aggregate_dimension(df, col, filters)


def analyze_audiences(df: pd.DataFrame, filters: Optional[dict[str, Any]] = None) -> list[dict[str, Any]]:
    """Analyzes campaign performance segmented by Target_Audience."""
    col = "Target_Audience" if "Target_Audience" in df.columns else None
    if not col:
        return []
    return _aggregate_dimension(df, col, filters)


def analyze_campaign_types(df: pd.DataFrame, filters: Optional[dict[str, Any]] = None) -> list[dict[str, Any]]:
    """Analyzes campaign performance segmented by Campaign_Type."""
    col = "Campaign_Type" if "Campaign_Type" in df.columns else None
    if not col:
        return []
    return _aggregate_dimension(df, col, filters)


def analyze_duration(df: pd.DataFrame, filters: Optional[dict[str, Any]] = None) -> list[dict[str, Any]]:
    """Analyzes campaign performance segmented by Duration or Duration_Days."""
    col = "Duration_Days" if "Duration_Days" in df.columns else ("Duration" if "Duration" in df.columns else None)
    if not col:
        return []
    return _aggregate_dimension(df, col, filters)


def analyze_geography(df: pd.DataFrame, filters: Optional[dict[str, Any]] = None) -> list[dict[str, Any]]:
    """Analyzes campaign performance segmented by Location."""
    col = "Location" if "Location" in df.columns else None
    if not col:
        return []
    return _aggregate_dimension(df, col, filters)


def analyze_companies(df: pd.DataFrame, filters: Optional[dict[str, Any]] = None) -> list[dict[str, Any]]:
    """Analyzes campaign performance segmented by Company."""
    col = "Company" if "Company" in df.columns else None
    if not col:
        return []
    return _aggregate_dimension(df, col, filters)


def rank_campaigns(
    df: pd.DataFrame,
    metric: str = "ROI",
    top_n: int = 5,
    ascending: bool = False,
    filters: Optional[dict[str, Any]] = None,
) -> list[dict[str, Any]]:
    """
    Ranks individual campaigns by a specified metric (ROI, Conversion_Rate, Acquisition_Cost).
    Returns top_n records deterministically.
    """
    if df is None or df.empty:
        return []

    work_df = apply_filters(df, filters).copy()
    if work_df.empty:
        return []

    # Map requested metric name to actual column
    metric_col = None
    for col in work_df.columns:
        if col.lower() == metric.lower():
            metric_col = col
            break
        if metric.lower() in ("cost", "ac", "acquisition_cost") and col == "Acquisition_Cost":
            metric_col = col
            break
        if metric.lower() in ("conversion", "cr", "conversion_rate") and col == "Conversion_Rate":
            metric_col = col
            break
        if metric.lower() == "roi" and col == "ROI":
            metric_col = col
            break

    if not metric_col or metric_col not in work_df.columns:
        metric_col = "ROI" if "ROI" in work_df.columns else work_df.columns[0]

    work_df["_sort_metric"] = pd.to_numeric(work_df[metric_col], errors="coerce")
    sorted_df = work_df.sort_values(by="_sort_metric", ascending=ascending, na_position="last")
    top_records = sorted_df.head(top_n)

    output = []
    for _, row in top_records.iterrows():
        rec = {}
        for c in df.columns:
            val = row[c]
            if pd.isna(val):
                rec[c] = None
            elif isinstance(val, (int, np.integer)):
                rec[c] = int(val)
            elif isinstance(val, (float, np.floating)):
                rec[c] = round(float(val), 4)
            else:
                rec[c] = str(val)
        output.append(rec)

    return output
