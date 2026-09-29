from enum import Enum
from typing import Any
from pydantic import BaseModel, Field


class AnomalySeverity(str, Enum):
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"


class ClassifiedAnomaly(BaseModel):
    id: str
    campaign_id: str
    channel: str
    company: str
    metric: str
    actual_value: float
    deviation_score: float
    severity: AnomalySeverity
    financial_impact_usd: float = 0.0
    reason: str
    suggested_action: str


class AnomalySeverityClassifier:
    """
    Classifies statistical anomalies by operational & financial severity.
    """

    @classmethod
    def classify(cls, raw_anomalies: list[dict[str, Any]]) -> list[ClassifiedAnomaly]:
        classified = []
        for i, raw in enumerate(raw_anomalies):
            metric = raw.get("metric", "Unknown")
            val = float(raw.get("actual_value", 0.0))
            dev = float(raw.get("z_score", raw.get("iqr_multiplier", 2.0)))
            channel = str(raw.get("channel", "Unknown"))
            company = str(raw.get("company", "Unknown"))
            cid = str(raw.get("campaign_id", f"camp_{i}"))

            # Calculate financial impact proxy
            impact = round(val * 100 if metric == "Acquisition_Cost" else abs(dev) * 500, 2)

            # Assign severity
            if abs(dev) >= 4.0 or (metric == "Acquisition_Cost" and val > 100):
                sev = AnomalySeverity.CRITICAL
                action = f"Immediately audit bidding strategy and budget cap on {channel} (Campaign {cid})."
            elif abs(dev) >= 3.0:
                sev = AnomalySeverity.HIGH
                action = f"Investigate performance divergence in {channel}; review landing page and conversion funnel."
            elif abs(dev) >= 2.0:
                sev = AnomalySeverity.MEDIUM
                action = f"Monitor {channel} campaign over next flight; check for seasonality or ad fatigue."
            else:
                sev = AnomalySeverity.LOW
                action = f"Log anomaly for weekly BI review."

            reason = raw.get("reason", f"Value {val} deviates significantly ({round(dev, 2)}σ) from normal distribution.")

            classified.append(
                ClassifiedAnomaly(
                    id=f"anom_{i}",
                    campaign_id=cid,
                    channel=channel,
                    company=company,
                    metric=metric,
                    actual_value=round(val, 4),
                    deviation_score=round(dev, 2),
                    severity=sev,
                    financial_impact_usd=impact,
                    reason=reason,
                    suggested_action=action,
                )
            )

        # Sort by severity priority: CRITICAL > HIGH > MEDIUM > LOW
        priority_map = {
            AnomalySeverity.CRITICAL: 0,
            AnomalySeverity.HIGH: 1,
            AnomalySeverity.MEDIUM: 2,
            AnomalySeverity.LOW: 3,
        }
        classified.sort(key=lambda a: (priority_map[a.severity], -abs(a.deviation_score)))
        return classified
