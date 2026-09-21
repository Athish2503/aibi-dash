import json
import re
from typing import Any, Optional

from backend.app.agent.plan_schemas import (
    DashboardPlan,
    DashboardPage,
    VisualSpec,
    SlicerSpec,
    VisualType,
    SlicerFilterType,
)
from backend.app.powerbi.schemas import (
    PBIRDefinition,
    PBIRDatasetReference,
    PBIRDatasetReferenceByPath,
    ReportVisualContainer,
    ReportPage,
    ReportDefinition,
)


class ReportBuilder:
    """
    Builds Power BI Report Definition (report.json and definition.pbir)
    from a validated DashboardPlan, supporting automated layout,
    visual container projections, slicers, and theme configuration.
    """

    CANVAS_WIDTH = 1280
    CANVAS_HEIGHT = 720
    MARGIN_LEFT = 20
    MARGIN_TOP = 20
    SLICER_HEIGHT = 65
    GAP = 12
    TOTAL_GRID_COLS = 12

    VISUAL_TYPE_MAP = {
        VisualType.KPI_CARD: "card",
        VisualType.BAR_CHART: "barChart",
        VisualType.COLUMN_CHART: "columnChart",
        VisualType.LINE_CHART: "lineChart",
        VisualType.DONUT_CHART: "donutChart",
        VisualType.SCATTER_PLOT: "scatterChart",
        VisualType.TABLE: "tableEx",
        VisualType.MATRIX: "pivotTable",
        VisualType.TREEMAP: "treeMap",
    }

    @staticmethod
    def sanitize_name(name: str) -> str:
        """Sanitizes strings for identifiers."""
        cleaned = re.sub(r"[^a-zA-Z0-9_]", "", name.replace(" ", "_"))
        return cleaned or "Visual"

    def build_definition_pbir(self, semantic_model_name: str) -> PBIRDefinition:
        """Generates definition.pbir linking report to semantic model."""
        return PBIRDefinition(
            version="1.0",
            datasetReference=PBIRDatasetReference(
                byPath=PBIRDatasetReferenceByPath(
                    path=f"../{semantic_model_name}.SemanticModel"
                )
            ),
        )

    def _calculate_visual_positions(
        self, visuals: list[VisualSpec], has_slicers: bool
    ) -> list[dict[str, int]]:
        """
        Translates 12-column grid specs into 1280x720 canvas pixel coordinates.
        Supports explicit grid_row/grid_col or automatic flex flow placement.
        """
        usable_width = self.CANVAS_WIDTH - (2 * self.MARGIN_LEFT)
        col_unit = (usable_width - (self.TOTAL_GRID_COLS - 1) * self.GAP) / self.TOTAL_GRID_COLS

        start_y = (
            self.MARGIN_TOP + self.SLICER_HEIGHT + self.GAP
            if has_slicers
            else self.MARGIN_TOP
        )
        usable_height = self.CANVAS_HEIGHT - start_y - self.MARGIN_TOP
        row_unit = 135

        positions: list[dict[str, int]] = []
        current_col = 0
        current_row = 0

        for vis in visuals:
            w_units = max(1, min(12, vis.width))
            h_units = max(1, min(6, vis.height))

            if vis.grid_col is not None and vis.grid_row is not None:
                col_idx = max(0, min(11, vis.grid_col))
                row_idx = max(0, vis.grid_row)
            else:
                # Flow layout
                if current_col + w_units > self.TOTAL_GRID_COLS:
                    current_col = 0
                    current_row += 1
                col_idx = current_col
                row_idx = current_row
                current_col += w_units

            px_x = int(self.MARGIN_LEFT + col_idx * (col_unit + self.GAP))
            px_y = int(start_y + row_idx * (row_unit + self.GAP))
            px_w = int(w_units * col_unit + (w_units - 1) * self.GAP)
            px_h = int(h_units * row_unit + (h_units - 1) * self.GAP)

            # Prevent visual overflow beyond canvas
            if px_x + px_w > self.CANVAS_WIDTH:
                px_w = self.CANVAS_WIDTH - px_x - self.MARGIN_LEFT
            if px_y + px_h > self.CANVAS_HEIGHT:
                px_h = self.CANVAS_HEIGHT - px_y - self.MARGIN_TOP

            positions.append(
                {
                    "x": max(0, px_x),
                    "y": max(0, px_y),
                    "width": max(100, px_w),
                    "height": max(80, px_h),
                }
            )

        return positions

    def _build_slicer_containers(
        self, slicers: list[SlicerSpec], table_name: str
    ) -> list[ReportVisualContainer]:
        """Builds visual containers for top-level interactive slicers."""
        if not slicers:
            return []

        usable_width = self.CANVAS_WIDTH - (2 * self.MARGIN_LEFT)
        slicer_w = min(220, int((usable_width - (len(slicers) - 1) * self.GAP) / len(slicers)))

        containers: list[ReportVisualContainer] = []
        for i, s in enumerate(slicers):
            x = self.MARGIN_LEFT + i * (slicer_w + self.GAP)
            y = self.MARGIN_TOP

            slicer_type = (
                "Dropdown"
                if s.filter_type == SlicerFilterType.DROPDOWN
                else "Checkbox"
            )

            config = {
                "name": f"slicer_{s.id}",
                "singleVisual": {
                    "visualType": "slicer",
                    "projections": {
                        "Values": [{"queryRef": f"{table_name}.{s.column}"}]
                    },
                    "prototypeQuery": {
                        "Version": 2,
                        "From": [{"Name": "t", "Entity": table_name, "Type": 0}],
                        "Select": [
                            {
                                "Column": {
                                    "Expression": {"SourceRef": {"Source": "t"}},
                                    "Property": s.column,
                                },
                                "Name": f"{table_name}.{s.column}",
                            }
                        ],
                    },
                    "objects": {
                        "general": [
                            {
                                "properties": {
                                    "filter": {
                                        "filter": {
                                            "Version": 2,
                                            "From": [{"Name": "t", "Entity": table_name, "Type": 0}],
                                        }
                                    }
                                }
                            }
                        ],
                        "header": [
                            {"properties": {"text": {"expr": {"Literal": {"Value": f"'{s.display_name}'"}}}}}
                        ],
                    },
                },
            }

            containers.append(
                ReportVisualContainer(
                    id=s.id,
                    type="slicer",
                    title=s.display_name,
                    x=x,
                    y=y,
                    width=slicer_w,
                    height=self.SLICER_HEIGHT,
                    z=100 + i,
                    config=config,
                    query={"column": s.column, "table": table_name},
                )
            )

        return containers

    def _build_visual_container(
        self,
        vis: VisualSpec,
        pos: dict[str, int],
        table_name: str,
        z_index: int,
    ) -> ReportVisualContainer:
        """Constructs an individual typed visual container with query bindings."""
        pbi_type = self.VISUAL_TYPE_MAP.get(vis.type, "columnChart")

        # Query projections and bindings
        projections: dict[str, list[Any]] = {}
        selects: list[dict[str, Any]] = []

        # 1. Primary measure
        measure_query_ref = f"{table_name}.[{vis.measure}]"
        selects.append(
            {
                "Measure": {
                    "Expression": {"SourceRef": {"Source": "t"}},
                    "Property": vis.measure,
                },
                "Name": measure_query_ref,
            }
        )

        if vis.type == VisualType.KPI_CARD:
            projections["Values"] = [{"queryRef": measure_query_ref}]
        elif vis.type in [VisualType.BAR_CHART, VisualType.COLUMN_CHART, VisualType.LINE_CHART]:
            projections["Y"] = [{"queryRef": measure_query_ref}]
            if vis.category:
                cat_query_ref = f"{table_name}.{vis.category}"
                projections["Category"] = [{"queryRef": cat_query_ref}]
                selects.append(
                    {
                        "Column": {
                            "Expression": {"SourceRef": {"Source": "t"}},
                            "Property": vis.category,
                        },
                        "Name": cat_query_ref,
                    }
                )
            if vis.secondary_category:
                sec_query_ref = f"{table_name}.{vis.secondary_category}"
                projections["Series"] = [{"queryRef": sec_query_ref}]
                selects.append(
                    {
                        "Column": {
                            "Expression": {"SourceRef": {"Source": "t"}},
                            "Property": vis.secondary_category,
                        },
                        "Name": sec_query_ref,
                    }
                )
        elif vis.type == VisualType.DONUT_CHART:
            projections["Y"] = [{"queryRef": measure_query_ref}]
            if vis.category:
                cat_query_ref = f"{table_name}.{vis.category}"
                projections["Category"] = [{"queryRef": cat_query_ref}]
                selects.append(
                    {
                        "Column": {
                            "Expression": {"SourceRef": {"Source": "t"}},
                            "Property": vis.category,
                        },
                        "Name": cat_query_ref,
                    }
                )
        elif vis.type == VisualType.SCATTER_PLOT:
            projections["Y"] = [{"queryRef": measure_query_ref}]
            if vis.secondary_measure:
                sec_m_ref = f"{table_name}.[{vis.secondary_measure}]"
                projections["X"] = [{"queryRef": sec_m_ref}]
                selects.append(
                    {
                        "Measure": {
                            "Expression": {"SourceRef": {"Source": "t"}},
                            "Property": vis.secondary_measure,
                        },
                        "Name": sec_m_ref,
                    }
                )
            if vis.category:
                cat_query_ref = f"{table_name}.{vis.category}"
                projections["Details"] = [{"queryRef": cat_query_ref}]
                selects.append(
                    {
                        "Column": {
                            "Expression": {"SourceRef": {"Source": "t"}},
                            "Property": vis.category,
                        },
                        "Name": cat_query_ref,
                    }
                )
        elif vis.type in [VisualType.TABLE, VisualType.MATRIX]:
            projections["Values"] = [{"queryRef": measure_query_ref}]
            if vis.category:
                cat_query_ref = f"{table_name}.{vis.category}"
                projections["Values"].append({"queryRef": cat_query_ref})
                selects.append(
                    {
                        "Column": {
                            "Expression": {"SourceRef": {"Source": "t"}},
                            "Property": vis.category,
                        },
                        "Name": cat_query_ref,
                    }
                )
        elif vis.type == VisualType.TREEMAP:
            projections["Values"] = [{"queryRef": measure_query_ref}]
            if vis.category:
                cat_query_ref = f"{table_name}.{vis.category}"
                projections["Group"] = [{"queryRef": cat_query_ref}]
                selects.append(
                    {
                        "Column": {
                            "Expression": {"SourceRef": {"Source": "t"}},
                            "Property": vis.category,
                        },
                        "Name": cat_query_ref,
                    }
                )

        config = {
            "name": vis.id,
            "singleVisual": {
                "visualType": pbi_type,
                "projections": projections,
                "prototypeQuery": {
                    "Version": 2,
                    "From": [{"Name": "t", "Entity": table_name, "Type": 0}],
                    "Select": selects,
                },
                "vcObjects": {
                    "title": [
                        {
                            "properties": {
                                "show": {"expr": {"Literal": {"Value": "true"}}},
                                "text": {"expr": {"Literal": {"Value": f"'{vis.title}'"}}},
                            }
                        }
                    ]
                },
            },
        }

        query_payload = {
            "measure": vis.measure,
            "category": vis.category,
            "secondary_category": vis.secondary_category,
            "secondary_measure": vis.secondary_measure,
            "aggregation": vis.aggregation.value,
        }

        return ReportVisualContainer(
            id=vis.id,
            type=pbi_type,
            title=vis.title,
            x=pos["x"],
            y=pos["y"],
            width=pos["width"],
            height=pos["height"],
            z=z_index,
            config=config,
            query=query_payload,
        )

    def build_report_definition(
        self, plan: DashboardPlan, table_name: str
    ) -> ReportDefinition:
        """
        Translates full DashboardPlan into the top-level ReportDefinition (report.json).
        """
        pages: list[ReportPage] = []

        for p_idx, page_spec in enumerate(plan.pages):
            has_slicers = len(page_spec.slicers) > 0
            slicer_containers = self._build_slicer_containers(page_spec.slicers, table_name)
            positions = self._calculate_visual_positions(page_spec.visuals, has_slicers)

            visual_containers: list[ReportVisualContainer] = list(slicer_containers)
            for v_idx, vis in enumerate(page_spec.visuals):
                pos = positions[v_idx]
                vc = self._build_visual_container(
                    vis=vis,
                    pos=pos,
                    table_name=table_name,
                    z_index=v_idx + 1,
                )
                visual_containers.append(vc)

            page_name = f"ReportSection_{p_idx + 1}_{self.sanitize_name(page_spec.id)}"
            pages.append(
                ReportPage(
                    id=page_spec.id,
                    name=page_name,
                    displayName=page_spec.title,
                    width=self.CANVAS_WIDTH,
                    height=self.CANVAS_HEIGHT,
                    visualContainers=visual_containers,
                )
            )

        report_config = {
            "version": "1.0",
            "themeCollection": {
                "baseTheme": {"name": "CY24SU02", "reportVersionAtImport": "5.60"},
            },
            "settings": {
                "useNewFilterPaneExperience": True,
                "allowChangeFilterTypes": True,
            },
        }

        return ReportDefinition(
            config=report_config,
            layoutOptimization=0,
            pages=pages,
        )
