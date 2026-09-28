from __future__ import annotations
import uuid
from datetime import datetime, timezone
from typing import Any, Literal, Optional
from pydantic import BaseModel, Field

from backend.app.agent.plan_schemas import (
    AggregationType,
    DashboardPage,
    DashboardPlan,
    MeasureFormat,
    MeasureSpec,
    PlanValidationResult,
    SlicerFilterType,
    SlicerSpec,
    VisualSpec,
    VisualType,
)


class DashboardSpec(BaseModel):
    """
    Canonical Intermediate Representation (IR) for dashboards.
    Acts as the single source of dashboard intent compiled to both
    the React Web Dashboard Engine and Microsoft Power BI (PBIR/PBIP).
    """
    spec_id: str = Field(default_factory=lambda: f"spec_{uuid.uuid4().hex[:8]}")
    dataset_id: Optional[str] = Field(default=None, description="Identifier of the bound dataset")
    dataset_name: str = Field(description="Source dataset filename or table name")
    title: str = Field(description="Human-readable dashboard title")
    description: str = Field(default="", description="Executive summary and analytical goals")
    version: str = Field(default="1.0.0", description="Specification schema version")
    pages: list[DashboardPage] = Field(default_factory=list, description="List of logical dashboard pages")
    measures: list[MeasureSpec] = Field(default_factory=list, description="Semantic DAX/business measures")
    global_filters: list[SlicerSpec] = Field(default_factory=list, description="Cross-page global slicers")
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    validation: Optional[PlanValidationResult] = None
    metadata: dict[str, Any] = Field(default_factory=dict, description="Extensible metadata tags")

    @classmethod
    def from_dashboard_plan(
        cls,
        plan: DashboardPlan,
        dataset_id: Optional[str] = None,
        metadata: Optional[dict[str, Any]] = None,
    ) -> DashboardSpec:
        """Translates an AI or deterministic DashboardPlan into the canonical DashboardSpec IR."""
        # Collect global filters from pages slicers
        seen_cols = set()
        global_filters: list[SlicerSpec] = []
        for page in plan.pages:
            for s in page.slicers:
                if s.column not in seen_cols:
                    seen_cols.add(s.column)
                    global_filters.append(s)

        return cls(
            spec_id=plan.plan_id or f"spec_{uuid.uuid4().hex[:8]}",
            dataset_id=dataset_id,
            dataset_name=plan.dataset_name,
            title=plan.title,
            description=plan.description,
            pages=plan.pages,
            measures=plan.measures,
            global_filters=global_filters,
            created_at=plan.created_at or datetime.now(timezone.utc).isoformat(),
            validation=plan.validation,
            metadata=metadata or {},
        )

    def to_dashboard_plan(self) -> DashboardPlan:
        """Converts back to DashboardPlan for PBIR and DAX generation tools."""
        return DashboardPlan(
            plan_id=self.spec_id,
            dataset_name=self.dataset_name,
            title=self.title,
            description=self.description,
            pages=self.pages,
            measures=self.measures,
            created_at=self.created_at,
            validation=self.validation,
        )

    def to_web_spec(self) -> dict[str, Any]:
        """
        Serializes into a rich, optimized format for the React Web Visualization engine.
        Includes visual positioning, cross-filter capabilities, and drill-down paths.
        """
        return {
            "specId": self.spec_id,
            "datasetId": self.dataset_id,
            "title": self.title,
            "description": self.description,
            "version": self.version,
            "createdAt": self.created_at,
            "globalFilters": [
                {
                    "id": f.id,
                    "column": f.column,
                    "displayName": f.display_name,
                    "filterType": f.filter_type.value if hasattr(f.filter_type, "value") else str(f.filter_type),
                    "defaultValue": f.default_value,
                }
                for f in self.global_filters
            ],
            "measures": [
                {
                    "name": m.name,
                    "column": m.column,
                    "aggregation": m.aggregation.value if hasattr(m.aggregation, "value") else str(m.aggregation),
                    "format": m.format.value if hasattr(m.format, "value") else str(m.format),
                    "daxExpression": m.dax_expression,
                    "description": m.description,
                }
                for m in self.measures
            ],
            "pages": [
                {
                    "id": p.id,
                    "title": p.title,
                    "description": p.description,
                    "visuals": [
                        {
                            "id": v.id,
                            "title": v.title,
                            "type": v.type.value if hasattr(v.type, "value") else str(v.type),
                            "category": v.category,
                            "secondaryCategory": v.secondary_category,
                            "measure": v.measure,
                            "secondaryMeasure": v.secondary_measure,
                            "aggregation": v.aggregation.value if hasattr(v.aggregation, "value") else str(v.aggregation),
                            "sortBy": v.sort_by,
                            "sortOrder": v.sort_order,
                            "gridWidth": v.width,
                            "gridHeight": v.height,
                            "description": v.description,
                            "supportsDrilldown": v.type in (VisualType.BAR_CHART, VisualType.COLUMN_CHART),
                            "drilldownPath": ["Channel_Used", "Campaign_Type", "Location"] if v.category == "Channel_Used" else None,
                        }
                        for v in p.visuals
                    ],
                    "slicers": [
                        {
                            "id": s.id,
                            "column": s.column,
                            "displayName": s.display_name,
                            "filterType": s.filter_type.value if hasattr(s.filter_type, "value") else str(s.filter_type),
                        }
                        for s in p.slicers
                    ],
                }
                for p in self.pages
            ],
        }


class BISolutionManifest(BaseModel):
    """Tracks all synchronized artifacts generated for a unified BI Solution."""
    solution_id: str
    spec_id: str
    project_name: str
    timestamp: str
    web_dashboard: dict[str, Any]
    powerbi: dict[str, Any]
    analytics: dict[str, Any]
    metadata: dict[str, Any]
