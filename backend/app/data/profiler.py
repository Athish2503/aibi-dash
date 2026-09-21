from typing import Union
import numpy as np
import pandas as pd
from backend.app.data.schemas import (
    CATEGORICAL_COLUMNS,
    CategoricalColumnStats,
    CategoryValueCount,
    DatasetProfileResult,
    NumericColumnStats,
)


def profile_dataset(
    df: pd.DataFrame, top_k_categories: int = 10
) -> DatasetProfileResult:
    """
    Computes statistical profiles for numeric and categorical columns.
    """
    total_records = int(len(df))

    # Identify numeric columns present in the DataFrame
    numeric_profiles: dict[str, NumericColumnStats] = {}
    for col in df.columns:
        # Check if column is numeric or can be analyzed as numeric
        if pd.api.types.is_numeric_dtype(df[col]):
            series = df[col].dropna()
            count = int(len(series))
            null_count = int(df[col].isna().sum())

            if count > 0:
                mean_val = float(series.mean())
                std_val = float(series.std()) if count > 1 else 0.0
                min_val = float(series.min())
                p25_val = float(series.quantile(0.25))
                median_val = float(series.median())
                p75_val = float(series.quantile(0.75))
                max_val = float(series.max())
                skew_val = float(series.skew()) if count > 2 and std_val > 0 else None
            else:
                mean_val = std_val = min_val = p25_val = median_val = p75_val = max_val = 0.0
                skew_val = None

            numeric_profiles[col] = NumericColumnStats(
                count=count,
                mean=round(mean_val, 4),
                std=round(std_val, 4),
                min=round(min_val, 4),
                p25=round(p25_val, 4),
                median=round(median_val, 4),
                p75=round(p75_val, 4),
                max=round(max_val, 4),
                skewness=round(skew_val, 4) if skew_val is not None else None,
                null_count=null_count,
            )

    # Profiling categorical columns
    categorical_profiles: dict[str, CategoricalColumnStats] = {}
    for col in df.columns:
        if col in CATEGORICAL_COLUMNS or not pd.api.types.is_numeric_dtype(df[col]):
            # Avoid re-profiling if it was already profiled as numeric
            if col in numeric_profiles:
                continue

            series = df[col].astype(str)
            null_count = int(df[col].isna().sum())
            valid_series = df[col].dropna().astype(str).str.strip()
            distinct_count = int(valid_series.nunique())

            top_counts = valid_series.value_counts().head(top_k_categories)
            top_values = [
                CategoryValueCount(
                    value=str(val),
                    count=int(cnt),
                    percentage=round(
                        (cnt / total_records * 100.0) if total_records > 0 else 0.0, 2
                    ),
                )
                for val, cnt in top_counts.items()
            ]

            categorical_profiles[col] = CategoricalColumnStats(
                distinct_count=distinct_count,
                null_count=null_count,
                top_values=top_values,
            )

    # Special duration summary if available
    duration_summary = None
    if "Duration" in df.columns or "Duration_Days" in df.columns:
        dur_col = "Duration_Days" if "Duration_Days" in df.columns else "Duration"
        if dur_col in numeric_profiles:
            p = numeric_profiles[dur_col]
            duration_summary = {
                "column": dur_col,
                "min_days": p.min,
                "max_days": p.max,
                "median_days": p.median,
                "mean_days": p.mean,
            }

    return DatasetProfileResult(
        total_records=total_records,
        numeric_profiles=numeric_profiles,
        categorical_profiles=categorical_profiles,
        duration_summary=duration_summary,
    )
