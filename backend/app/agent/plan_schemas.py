from enum import Enum
from typing import Any, Literal, Optional
from datetime import datetime, timezone
import uuid
from pydantic import BaseModel, Field


class VisualType(str, Enum):
    KPI_CARD = "kpi_card"
    BAR_CHART = "bar_chart"
    COLUMN_CHART = "column_chart"
    LINE_CHART = "line_chart"
    DONUT_CHART = "donut_chart"
    SCATTER_PLOT = "scatter_plot"
    TABLE = "table"
    MATRIX = "matrix"
    TREEMAP = "treemap"


class AggregationType(str, Enum):
    SUM = "sum"
    AVG = "avg"
    COUNT = "count"
    DISTINCT_COUNT = "distinct_count"
    MIN = "min"
    MAX = "max"


class MeasureFormat(str, Enum):
    PERCENTAGE = "percentage"
    CURRENCY = "currency"
    NUMBER = "number"
    INTEGER = "integer"


class SlicerFilterType(str, Enum):
    DROPDOWN = "dropdown"
    CHECKBOX = "checkbox"
    SLIDER = "slider"
    RANGE = "range"


class VisualSpec(BaseModel):
    """Specification of an individual visual element on a dashboard page."""
    id: str = Field(description="Unique identifier for the visual")
    title: str = Field(description="Human-readable visual title")
    type: VisualType = Field(description="Type of chart/card visual")
    category: Optional[str] = Field(default=None, description="Primary categorical dimension column (e.g. Channel_Used)")
    secondary_category: Optional[str] = Field(default=None, description="Secondary breakdown or legend column (e.g. Campaign_Type)")
    measure: str = Field(description="Primary metric or measure name (e.g. Average ROI or ROI)")
    secondary_measure: Optional[str] = Field(default=None, description="Secondary metric (e.g. Acquisition_Cost for scatter plot)")
    aggregation: AggregationType = Field(default=AggregationType.AVG, description="Default aggregation to apply")
    sort_by: Optional[str] = Field(default=None, description="Field or measure to sort by")
    sort_order: Optional[Literal["asc", "desc"]] = Field(default="desc", description="Sort direction")
    width: int = Field(default=6, ge=1, le=12, description="Width in a 12-column grid layout")
    height: int = Field(default=4, ge=1, le=12, description="Relative height units")
    grid_row: Optional[int] = Field(default=None, description="Grid row position")
    grid_col: Optional[int] = Field(default=None, description="Grid column position")
    description: Optional[str] = Field(default=None, description="Explanation of the analytical intent of the visual")


class SlicerSpec(BaseModel):
    """Specification of a filter/slicer control for a dashboard page."""
    id: str = Field(description="Unique identifier for the slicer")
    column: str = Field(description="Dataset column that this slicer filters")
    display_name: str = Field(description="Display label for the slicer")
    filter_type: SlicerFilterType = Field(default=SlicerFilterType.DROPDOWN, description="UI widget type")
    default_value: Optional[Any] = Field(default=None, description="Optional default filter value")


class MeasureSpec(BaseModel):
    """Semantic model measure specification."""
    name: str = Field(description="Name of the measure (e.g. Average ROI)")
    column: str = Field(description="Source column in the dataset (e.g. ROI)")
    aggregation: AggregationType = Field(description="Aggregation function")
    format: MeasureFormat = Field(default=MeasureFormat.NUMBER, description="Display formatting")
    dax_expression: Optional[str] = Field(default=None, description="Power BI DAX calculation expression")
    description: Optional[str] = Field(default=None, description="Business meaning of this measure")


class DashboardPage(BaseModel):
    """A page within a dashboard containing visuals and slicers."""
    id: str = Field(description="Unique identifier for the page")
    title: str = Field(description="Display title for the page")
    description: str = Field(description="Executive summary of what this page analyzes")
    visuals: list[VisualSpec] = Field(default_factory=list, description="List of visual specifications")
    slicers: list[SlicerSpec] = Field(default_factory=list, description="List of slicer controls")


class PlanValidationResult(BaseModel):
    """Outcome of validating a dashboard plan against dataset schema and rules."""
    is_valid: bool
    errors: list[str] = Field(default_factory=list)
    warnings: list[str] = Field(default_factory=list)
    checked_rules: list[str] = Field(default_factory=list)


class DashboardPlan(BaseModel):
    """Full typed dashboard plan defining pages, visuals, slicers, and measures."""
    plan_id: str = Field(default_factory=lambda: f"plan_{uuid.uuid4().hex[:8]}")
    dataset_name: str
    title: str
    description: str
    pages: list[DashboardPage] = Field(default_factory=list)
    measures: list[MeasureSpec] = Field(default_factory=list)
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    validation: Optional[PlanValidationResult] = None
