from typing import Any
from pydantic import BaseModel, Field


class RankedInsight(BaseModel):
    rank: int
    category: str = Field(description="'Win', 'Risk', 'Anomaly', 'Opportunity'")
    headline: str
    metric: str
    impact_magnitude: float
    description: str


class InsightRanker:
    """
    Ranks analytical observations by business materiality, financial impact, and deviation score.
    """

    @classmethod
    def rank_insights(
        cls,
        kpis: dict[str, Any],
        channels: list[dict[str, Any]],
        anomalies_count: int,
        primary_drag: Optional[str] = None,
    ) -> list[RankedInsight]:
        ranked = []
        rank_idx = 1

        # 1. Top Channel Win
        if channels:
            top_ch = channels[0]
            ranked.append(
                RankedInsight(
                    rank=rank_idx,
                    category="Win",
                    headline=f"{top_ch.get('Channel_Used')} Outperforming Market Benchmark",
                    metric="ROI",
                    impact_magnitude=float(top_ch.get("average_roi", 0.0)),
                    description=(
                        f"{top_ch.get('Channel_Used')} generates {top_ch.get('average_roi')}x ROI at "
                        f"${top_ch.get('average_acquisition_cost')} CAC across {top_ch.get('campaign_count')} campaigns."
                    ),
                )
            )
            rank_idx += 1

        # 2. Material Risk / Channel Drag
        if channels and len(channels) > 1:
            bot_ch = channels[-1]
            ranked.append(
                RankedInsight(
                    rank=rank_idx,
                    category="Risk",
                    headline=f"Efficiency Erosion in {bot_ch.get('Channel_Used')}",
                    metric="Acquisition_Cost",
                    impact_magnitude=float(bot_ch.get("average_acquisition_cost", 0.0)),
                    description=(
                        f"{bot_ch.get('Channel_Used')} lags with {bot_ch.get('average_roi')}x ROI and "
                        f"${bot_ch.get('average_acquisition_cost')} CAC, creating a performance drag."
                    ),
                )
            )
            rank_idx += 1

        # 3. Anomaly concentration
        if anomalies_count > 0:
            ranked.append(
                RankedInsight(
                    rank=rank_idx,
                    category="Anomaly",
                    headline=f"{anomalies_count} Statistical Outliers Requiring Governance Review",
                    metric="Outlier Count",
                    impact_magnitude=float(anomalies_count),
                    description="Outliers detected in campaign acquisition costs and conversion rates.",
                )
            )
            rank_idx += 1

        return ranked
