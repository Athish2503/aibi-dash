import pytest
from pydantic import ValidationError
from backend.app.agent.plan_schemas import (
    AggregationType,
    DashboardPage,
    DashboardPlan,
    MeasureFormat,
    MeasureSpec,
    SlicerFilterType,
    SlicerSpec,
    VisualSpec,
    VisualType,
)


def test_visual_spec_valid():
    visual = VisualSpec(
        id="vis_roi_bar",
        title="ROI by Channel",
        type=VisualType.BAR_CHART,
        category="Channel_Used",
        measure="Average ROI",
        aggregation=AggregationType.AVG,
        width=6,
        height=4,
    )
    assert visual.id == "vis_roi_bar"
    assert visual.type == VisualType.BAR_CHART
    assert visual.width == 6
    assert visual.height == 4
    assert visual.sort_order == "desc"


def test_visual_spec_invalid_width():
    with pytest.raises(ValidationError):
        VisualSpec(
            id="invalid_width_vis",
            title="Invalid",
            type=VisualType.BAR_CHART,
            measure="ROI",
            width=13,  # max is 12
        )


def test_measure_spec():
    measure = MeasureSpec(
        name="Average ROI",
        column="ROI",
        aggregation=AggregationType.AVG,
        format=MeasureFormat.NUMBER,
        dax_expression="AVERAGE(Campaigns[ROI])",
    )
    assert measure.name == "Average ROI"
    assert measure.format == MeasureFormat.NUMBER
    assert "AVERAGE" in measure.dax_expression


def test_slicer_spec():
    slicer = SlicerSpec(
        id="slicer_company",
        column="Company",
        display_name="Select Company",
        filter_type=SlicerFilterType.DROPDOWN,
    )
    assert slicer.id == "slicer_company"
    assert slicer.filter_type == SlicerFilterType.DROPDOWN


def test_dashboard_plan_structure():
    plan = DashboardPlan(
        dataset_name="Test Campaigns",
        title="Test Marketing Plan",
        description="A plan for testing",
        pages=[
            DashboardPage(
                id="page_1",
                title="Overview",
                description="Summary",
                visuals=[
                    VisualSpec(
                        id="vis_1",
                        title="Total Campaigns",
                        type=VisualType.KPI_CARD,
                        measure="Campaign_ID",
                        aggregation=AggregationType.DISTINCT_COUNT,
                    )
                ],
            )
        ],
        measures=[
            MeasureSpec(
                name="Total Campaigns",
                column="Campaign_ID",
                aggregation=AggregationType.DISTINCT_COUNT,
                format=MeasureFormat.INTEGER,
            )
        ],
    )
    assert plan.plan_id.startswith("plan_")
    assert len(plan.pages) == 1
    assert len(plan.measures) == 1
    dumped = plan.model_dump()
    assert dumped["title"] == "Test Marketing Plan"
