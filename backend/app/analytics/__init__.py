try:
    from backend.app.analytics.kpis import calculate_kpis
    from backend.app.analytics.segmentation import (
        apply_filters,
        analyze_channels,
        analyze_audiences,
        analyze_campaign_types,
        analyze_duration,
        analyze_geography,
        analyze_companies,
        rank_campaigns,
    )
    from backend.app.analytics.anomalies import detect_anomalies
except ImportError:
    from app.analytics.kpis import calculate_kpis
    from app.analytics.segmentation import (
        apply_filters,
        analyze_channels,
        analyze_audiences,
        analyze_campaign_types,
        analyze_duration,
        analyze_geography,
        analyze_companies,
        rank_campaigns,
    )
    from app.analytics.anomalies import detect_anomalies

__all__ = [
    "calculate_kpis",
    "apply_filters",
    "analyze_channels",
    "analyze_audiences",
    "analyze_campaign_types",
    "analyze_duration",
    "analyze_geography",
    "analyze_companies",
    "rank_campaigns",
    "detect_anomalies",
]
