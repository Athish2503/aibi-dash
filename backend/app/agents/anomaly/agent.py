from typing import Any, Optional
import pandas as pd
from pydantic import BaseModel, Field
from backend.app.analytics.anomalies import detect_anomalies
from backend.app.agents.anomaly.severity import (
    AnomalySeverityClassifier,
    ClassifiedAnomaly,
    AnomalySeverity,
)


class AnomalyReport(BaseModel):
    total_anomalies_detected: int
    critical_count: int
    high_count: int
    medium_count: int
    low_count: int
    primary_affected_channel: str
    top_alerts: list[ClassifiedAnomaly] = Field(default_factory=list)
    executive_summary: str
    visual_spec: Optional[dict[str, Any]] = None


class AnomalyAgent:
    """
    Anomaly Intelligence Agent:
    Monitors data distributions, classifies anomaly severity, and provides remediation alerts.
    """

    def audit(
        self,
        df: pd.DataFrame,
        method: str = "iqr",
        threshold: float = 1.5,
    ) -> AnomalyReport:
        if df is None or df.empty:
            return AnomalyReport(
                total_anomalies_detected=0,
                critical_count=0,
                high_count=0,
                medium_count=0,
                low_count=0,
                primary_affected_channel="None",
                executive_summary="Dataset is empty; no anomalies detected.",
            )

        raw_anomalies = detect_anomalies(df, method=method, threshold=threshold)
        classified = AnomalySeverityClassifier.classify(raw_anomalies)

        crit = sum(1 for a in classified if a.severity == AnomalySeverity.CRITICAL)
        high = sum(1 for a in classified if a.severity == AnomalySeverity.HIGH)
        med = sum(1 for a in classified if a.severity == AnomalySeverity.MEDIUM)
        low = sum(1 for a in classified if a.severity == AnomalySeverity.LOW)

        # Identify primary affected channel
        channel_counts: dict[str, int] = {}
        for a in classified:
            channel_counts[a.channel] = channel_counts.get(a.channel, 0) + 1
        primary_channel = max(channel_counts, key=channel_counts.get) if channel_counts else "None"

        summary = (
            f"Detected {len(classified)} anomalies ({crit} Critical, {high} High, {med} Medium). "
            f"Primary concentration in {primary_channel} ({channel_counts.get(primary_channel, 0)} events)."
        )

        visual_spec = None
        if classified:
            scatter_data = [
                {
                    "campaign": a.campaign_id,
                    "channel": a.channel,
                    "metric": a.metric,
                    "value": a.actual_value,
                    "deviation": a.deviation_score,
                    "severity": a.severity.value.upper(),
                }
                for a in classified[:20]
            ]
            visual_spec = {
                "type": "scatter",
                "title": "Anomaly Outlier Distribution",
                "xAxis": "campaign",
                "yAxis": "value",
                "data": scatter_data,
            }

        return AnomalyReport(
            total_anomalies_detected=len(classified),
            critical_count=crit,
            high_count=high,
            medium_count=med,
            low_count=low,
            primary_affected_channel=primary_channel,
            top_alerts=classified[:8],
            executive_summary=summary,
            visual_spec=visual_spec,
        )
