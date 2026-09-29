from typing import Any, Optional
import pandas as pd
import numpy as np


def compute_correlations(
    df: pd.DataFrame,
    columns: Optional[list[str]] = None,
) -> dict[str, Any]:
    """
    Computes deterministic Pearson correlation matrix across numerical metrics.
    Highlights strong positive/negative relationships (e.g. Duration vs ROI, CAC vs Conversion).
    """
    if df is None or df.empty:
        return {"matrix": {}, "key_correlations": []}

    target_cols = columns or ["ROI", "Acquisition_Cost", "Conversion_Rate", "Duration_Days"]
    available_cols = [c for c in target_cols if c in df.columns]

    numeric_df = pd.DataFrame()
    for col in available_cols:
        numeric_df[col] = pd.to_numeric(df[col], errors="coerce")

    numeric_df = numeric_df.dropna()
    if len(numeric_df) < 5 or numeric_df.shape[1] < 2:
        return {"matrix": {}, "key_correlations": []}

    corr_matrix = numeric_df.corr(method="pearson").round(4)
    matrix_dict = corr_matrix.to_dict()

    key_correlations = []
    cols = list(corr_matrix.columns)
    for i in range(len(cols)):
        for j in range(i + 1, len(cols)):
            col1 = cols[i]
            col2 = cols[j]
            val = float(corr_matrix.loc[col1, col2])
            if not np.isnan(val):
                strength = "strong" if abs(val) >= 0.6 else "moderate" if abs(val) >= 0.3 else "weak"
                direction = "positive" if val > 0 else "negative"
                desc = f"{strength.capitalize()} {direction} relationship ({val:+.2f}) between {col1} and {col2}"
                key_correlations.append({
                    "metric_1": col1,
                    "metric_2": col2,
                    "correlation": val,
                    "strength": strength,
                    "direction": direction,
                    "description": desc,
                })

    # Sort key correlations by absolute strength descending
    key_correlations.sort(key=lambda x: abs(x["correlation"]), reverse=True)

    return {
        "matrix": matrix_dict,
        "key_correlations": key_correlations,
    }
