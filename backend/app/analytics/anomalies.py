from typing import Any, Optional
import pandas as pd
import numpy as np


def detect_anomalies(
    df: pd.DataFrame,
    method: str = "iqr",
    columns: Optional[list[str]] = None,
    threshold: float = 1.5,
) -> list[dict[str, Any]]:
    """
    Deterministically detects statistical anomalies in marketing campaigns data.
    Methods supported:
    - 'iqr': Interquartile Range outlier detection (Q1 - threshold*IQR, Q3 + threshold*IQR).
    - 'zscore': Z-score outlier detection (|z| > 3.0 or custom threshold).

    Records transparent evidence: method used, exact numerical bounds, campaign details, and anomaly reason.
    """
    if df is None or df.empty:
        return []

    target_columns = columns or ["ROI", "Acquisition_Cost", "Conversion_Rate"]
    valid_cols = [c for c in target_columns if c in df.columns]

    anomalies: list[dict[str, Any]] = []

    for col in valid_cols:
        series = pd.to_numeric(df[col], errors="coerce").dropna()
        if len(series) < 4:  # Insufficient points for meaningful statistical outlier detection
            continue

        if method.lower() == "zscore":
            mean = float(series.mean())
            std = float(series.std(ddof=1))
            if std == 0:
                continue
            z_thresh = threshold if threshold > 2.0 else 3.0
            lower_bound = round(mean - z_thresh * std, 4)
            upper_bound = round(mean + z_thresh * std, 4)

            for idx, val in series.items():
                z = (val - mean) / std
                if abs(z) > z_thresh:
                    row = df.loc[idx]
                    campaign_id = str(row.get("Campaign_ID", f"Row_{idx}"))
                    company = str(row.get("Company", "Unknown"))
                    channel = str(row.get("Channel_Used", "Unknown"))
                    direction = "high" if z > 0 else "low"
                    anomalies.append({
                        "campaign_id": campaign_id,
                        "company": company,
                        "channel": channel,
                        "column": col,
                        "metric": col,
                        "actual_value": round(float(val), 4),
                        "method": "zscore",
                        "z_score": round(float(z), 2),
                        "mean": round(mean, 4),
                        "std": round(std, 4),
                        "lower_bound": lower_bound,
                        "upper_bound": upper_bound,
                        "direction": direction,
                        "evidence": f"{col} of {val} is {round(abs(z), 2)} std devs from mean ({round(mean, 2)} ± {round(std, 2)})",
                        "reason": f"Value {val} outside z-score bounds [{lower_bound}, {upper_bound}] ({direction})",
                    })

        else:  # Default to 'iqr'
            q1 = float(series.quantile(0.25))
            q3 = float(series.quantile(0.75))
            iqr = q3 - q1
            lower_bound = round(q1 - threshold * iqr, 4)
            upper_bound = round(q3 + threshold * iqr, 4)

            for idx, val in series.items():
                if val < lower_bound or val > upper_bound:
                    row = df.loc[idx]
                    campaign_id = str(row.get("Campaign_ID", f"Row_{idx}"))
                    company = str(row.get("Company", "Unknown"))
                    channel = str(row.get("Channel_Used", "Unknown"))
                    direction = "high" if val > upper_bound else "low"
                    bound_exceeded = upper_bound if direction == "high" else lower_bound
                    anomalies.append({
                        "campaign_id": campaign_id,
                        "company": company,
                        "channel": channel,
                        "column": col,
                        "metric": col,
                        "actual_value": round(float(val), 4),
                        "method": "iqr",
                        "q1": round(q1, 4),
                        "q3": round(q3, 4),
                        "iqr": round(iqr, 4),
                        "lower_bound": lower_bound,
                        "upper_bound": upper_bound,
                        "direction": direction,
                        "evidence": f"{col} of {val} exceeds {direction} IQR fence {bound_exceeded} (Q1={q1}, Q3={q3}, IQR={iqr})",
                        "reason": f"Value {val} outside IQR bounds [{lower_bound}, {upper_bound}] ({direction})",
                    })

    # Sort anomalies by magnitude of deviation
    return anomalies
