from typing import Any, Optional
import pandas as pd
from backend.app.semantic.metric_resolver import SemanticResolutionResult
from backend.app.analytics.kpis import calculate_kpis
from backend.app.analytics.segmentation import (
    analyze_channels,
    analyze_audiences,
    analyze_campaign_types,
    analyze_duration,
    analyze_geography,
    rank_performers,
    apply_filters,
)
from backend.app.analytics.trends import analyze_trends_by_duration
from backend.app.analytics.correlations import compute_correlations


class AnalystQueryPlanner:
    """
    Selects and executes deterministic analytics tools based on semantic concepts and user query.
    """

    @classmethod
    def execute_analysis(
        cls,
        df: pd.DataFrame,
        semantic: SemanticResolutionResult,
        filters: Optional[dict[str, Any]] = None,
    ) -> dict[str, Any]:
        filters = filters or {}
        dim_cols = [d.column_name for d in semantic.resolved_dimensions]
        results: dict[str, Any] = {}

        # 1. Base KPIs
        filtered_df = apply_filters(df, filters)
        results["kpis"] = calculate_kpis(filtered_df)

        # 2. Dimensional breakdowns
        if "Channel_Used" in dim_cols or not dim_cols:
            results["channels"] = analyze_channels(df, filters=filters)

        if "Target_Audience" in dim_cols:
            results["audiences"] = analyze_audiences(df, filters=filters)

        if "Campaign_Type" in dim_cols:
            results["campaign_types"] = analyze_campaign_types(df, filters=filters)

        if "Location" in dim_cols:
            results["geography"] = analyze_geography(df, filters=filters)

        if "Duration_Days" in dim_cols or "Duration" in dim_cols:
            results["duration"] = analyze_duration(df, filters=filters)
            results["duration_trends"] = analyze_trends_by_duration(df, metric_col="ROI")

        # 3. Rankings
        if "top" in semantic.original_query.lower() or "best" in semantic.original_query.lower():
            results["top_campaigns"] = rank_performers(df, metric="ROI", top_n=5, ascending=False, filters=filters)
        elif "bottom" in semantic.original_query.lower() or "worst" in semantic.original_query.lower():
            results["bottom_campaigns"] = rank_performers(df, metric="ROI", top_n=5, ascending=True, filters=filters)

        # 4. Correlations if requested
        if any(term in semantic.original_query.lower() for term in ("correlat", "relationship", "driver", "impact")):
            results["correlations"] = compute_correlations(df)

        return results
