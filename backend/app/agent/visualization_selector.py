from typing import Optional
from pydantic import BaseModel, Field

try:
    from backend.app.agent.plan_schemas import VisualType
    from backend.app.data.schemas import DatasetProfileResult
except ImportError:
    from app.agent.plan_schemas import VisualType
    from app.data.schemas import DatasetProfileResult


class ColumnRoles(BaseModel):
    """Categorized analytical roles of dataset columns."""
    identifiers: list[str] = Field(default_factory=list)
    metrics: list[str] = Field(default_factory=list)
    dimensions: list[str] = Field(default_factory=list)
    geography: list[str] = Field(default_factory=list)
    duration_or_time: list[str] = Field(default_factory=list)


def analyze_columns(
    columns: list[str],
    detected_types: Optional[dict[str, str]] = None,
    profile: Optional[DatasetProfileResult] = None,
) -> ColumnRoles:
    """
    Deterministic tool to classify columns into analytical roles based on
    names, detected types, and dataset profiles.
    """
    detected_types = detected_types or {}
    roles = ColumnRoles()

    geo_keywords = {"location", "country", "city", "state", "region", "zip", "geography"}
    duration_keywords = {"duration", "date", "time", "month", "year", "day", "week"}
    id_keywords = {"id", "key", "code", "index", "campaign_id"}

    for col in columns:
        col_lower = col.lower().strip()
        col_type = detected_types.get(col, "").lower()

        # Check for ID / Key
        if any(col_lower == k or col_lower.endswith(f"_{k}") for k in id_keywords):
            roles.identifiers.append(col)
        # Check for Geography
        elif any(k in col_lower for k in geo_keywords):
            roles.geography.append(col)
            roles.dimensions.append(col)
        # Check for Duration / Temporal
        elif any(k in col_lower for k in duration_keywords):
            roles.duration_or_time.append(col)
            # Could also be a metric or dimension depending on type
            if "int" in col_type or "float" in col_type or "number" in col_type:
                roles.metrics.append(col)
            else:
                roles.dimensions.append(col)
        # Check for numeric metrics
        elif "int" in col_type or "float" in col_type or "number" in col_type:
            roles.metrics.append(col)
        elif profile and col in profile.numeric_profiles:
            roles.metrics.append(col)
        else:
            roles.dimensions.append(col)

    return roles


def select_visualization(
    category_column: Optional[str] = None,
    measure_column: Optional[str] = None,
    secondary_category: Optional[str] = None,
    secondary_measure: Optional[str] = None,
    cardinality: Optional[int] = None,
    analytical_intent: Optional[str] = None,
) -> VisualType:
    """
    Deterministic rule-based visual selector mapping data characteristics
    and analytical intent to the optimal visualization type.
    """
    intent = (analytical_intent or "").lower()

    # Rule 1: Single summary metric without dimension -> KPI Card
    if not category_column and measure_column:
        return VisualType.KPI_CARD

    # Rule 2: Two continuous numeric metrics comparison -> Scatter Plot
    if category_column and measure_column and secondary_measure:
        return VisualType.SCATTER_PLOT

    # Rule 3: Multi-dimensional breakdown or ranking matrix
    if category_column and secondary_category:
        if "matrix" in intent or "cross" in intent or "tabular" in intent:
            return VisualType.MATRIX
        return VisualType.COLUMN_CHART

    # Rule 4: Temporal / Duration / Trend analysis
    if category_column:
        cat_lower = category_column.lower()
        if any(t in cat_lower for t in ("date", "time", "month", "year", "day", "week")):
            return VisualType.LINE_CHART
        if "duration" in cat_lower:
            return VisualType.BAR_CHART

    # Rule 5: Low cardinality composition / share
    if cardinality is not None:
        if 2 <= cardinality <= 5 and ("share" in intent or "split" in intent or "composition" in intent):
            return VisualType.DONUT_CHART
        if cardinality > 20:
            return VisualType.TABLE

    # Rule 6: Intent-specific overrides
    if "distribution" in intent or "scatter" in intent:
        return VisualType.SCATTER_PLOT
    if "proportion" in intent or "share" in intent or "donut" in intent:
        return VisualType.DONUT_CHART
    if "matrix" in intent or "grid" in intent:
        return VisualType.MATRIX
    if "table" in intent or "detail" in intent or "ranking" in intent:
        return VisualType.TABLE

    # Default for category + metric
    return VisualType.BAR_CHART
