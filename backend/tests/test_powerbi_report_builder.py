import pytest

from backend.app.agent.plan_schemas import (
    DashboardPlan,
    DashboardPage,
    VisualSpec,
    SlicerSpec,
    VisualType,
    AggregationType,
    SlicerFilterType,
    MeasureSpec,
    MeasureFormat,
)
from backend.app.powerbi.report_builder import ReportBuilder


def test_build_definition_pbir():
    builder = ReportBuilder()
    pbir = builder.build_definition_pbir("Marketing_Dashboard")
    assert pbir.version == "1.0"
    assert pbir.datasetReference.byPath is not None
    assert pbir.datasetReference.byPath.path == "../Marketing_Dashboard.SemanticModel"


def test_calculate_visual_positions():
    builder = ReportBuilder()
    visuals = [
        VisualSpec(id="v1", title="V1", type=VisualType.KPI_CARD, measure="ROI", width=4, height=2),
        VisualSpec(id="v2", title="V2", type=VisualType.KPI_CARD, measure="Cost", width=4, height=2),
        VisualSpec(id="v3", title="V3", type=VisualType.BAR_CHART, measure="ROI", category="Channel", width=8, height=4),
    ]

    positions = builder._calculate_visual_positions(visuals, has_slicers=True)
    assert len(positions) == 3

    for pos in positions:
        assert pos["x"] >= 0
        assert pos["y"] >= 0
        assert pos["x"] + pos["width"] <= 1280
        assert pos["y"] + pos["height"] <= 720


def test_build_report_definition_with_slicers_and_visuals():
    builder = ReportBuilder()

    plan = DashboardPlan(
        dataset_name="Campaigns.csv",
        title="Marketing Analytics",
        description="Comprehensive dashboard",
        measures=[
            MeasureSpec(name="Average ROI", column="ROI", aggregation=AggregationType.AVG),
            MeasureSpec(name="Acquisition Cost", column="Acquisition_Cost", aggregation=AggregationType.SUM),
        ],
        pages=[
            DashboardPage(
                id="page_overview",
                title="Executive Overview",
                description="High level metrics",
                slicers=[
                    SlicerSpec(id="s1", column="Channel_Used", display_name="Channel", filter_type=SlicerFilterType.DROPDOWN),
                ],
                visuals=[
                    VisualSpec(id="kpi1", title="Avg ROI", type=VisualType.KPI_CARD, measure="Average ROI", width=3, height=2),
                    VisualSpec(
                        id="bar1",
                        title="ROI by Channel",
                        type=VisualType.BAR_CHART,
                        category="Channel_Used",
                        measure="Average ROI",
                        width=6,
                        height=4,
                    ),
                    VisualSpec(
                        id="donut1",
                        title="Channel Distribution",
                        type=VisualType.DONUT_CHART,
                        category="Channel_Used",
                        measure="Average ROI",
                        width=3,
                        height=4,
                    ),
                    VisualSpec(
                        id="scatter1",
                        title="Cost vs ROI",
                        type=VisualType.SCATTER_PLOT,
                        category="Channel_Used",
                        measure="Average ROI",
                        secondary_measure="Acquisition Cost",
                        width=6,
                        height=4,
                    ),
                ],
            )
        ],
    )

    report_def = builder.build_report_definition(plan, table_name="Campaigns")
    assert len(report_def.pages) == 1
    page = report_def.pages[0]
    assert page.displayName == "Executive Overview"
    assert page.width == 1280
    assert page.height == 720

    # 1 slicer + 4 visuals = 5 visual containers
    assert len(page.visualContainers) == 5

    # Check slicer
    slicer_vc = page.visualContainers[0]
    assert slicer_vc.type == "slicer"
    assert slicer_vc.title == "Channel"

    # Check KPI Card
    kpi_vc = page.visualContainers[1]
    assert kpi_vc.type == "card"
    assert kpi_vc.title == "Avg ROI"

    # Check Bar Chart
    bar_vc = page.visualContainers[2]
    assert bar_vc.type == "barChart"
    assert bar_vc.query["category"] == "Channel_Used"

    # Check Scatter Plot
    scatter_vc = page.visualContainers[4]
    assert scatter_vc.type == "scatterChart"
    assert scatter_vc.query["secondary_measure"] == "Acquisition Cost"
