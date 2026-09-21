from backend.app.agent.plan_schemas import (
    AggregationType,
    DashboardPage,
    DashboardPlan,
    MeasureSpec,
    SlicerSpec,
    VisualSpec,
    VisualType,
)
from backend.app.agent.plan_validator import validate_dashboard_plan


def test_validate_valid_plan():
    plan = DashboardPlan(
        dataset_name="Test Dataset",
        title="Valid Plan",
        description="Valid description",
        measures=[
            MeasureSpec(
                name="Average ROI",
                column="ROI",
                aggregation=AggregationType.AVG,
            )
        ],
        pages=[
            DashboardPage(
                id="page_1",
                title="Overview",
                description="Summary page",
                slicers=[
                    SlicerSpec(id="slicer_channel", column="Channel_Used", display_name="Channel")
                ],
                visuals=[
                    VisualSpec(
                        id="vis_1",
                        title="Channel ROI",
                        type=VisualType.BAR_CHART,
                        category="Channel_Used",
                        measure="Average ROI",
                    )
                ],
            )
        ],
    )

    columns = ["Channel_Used", "ROI", "Campaign_ID"]
    numeric_columns = ["ROI"]

    result = validate_dashboard_plan(plan, available_columns=columns, numeric_columns=numeric_columns)
    assert result.is_valid is True
    assert len(result.errors) == 0


def test_validate_empty_pages_invalid():
    plan = DashboardPlan(
        dataset_name="Empty Plan",
        title="Empty",
        description="No pages",
        pages=[],
    )
    result = validate_dashboard_plan(plan)
    assert result.is_valid is False
    assert any("at least one page" in e for e in result.errors)


def test_validate_nonexistent_column():
    plan = DashboardPlan(
        dataset_name="Test Dataset",
        title="Invalid Column Plan",
        description="Bad column reference",
        pages=[
            DashboardPage(
                id="page_1",
                title="Overview",
                description="Summary",
                visuals=[
                    VisualSpec(
                        id="vis_bad_col",
                        title="Bad Column Visual",
                        type=VisualType.BAR_CHART,
                        category="NonExistentColumn",
                        measure="ROI",
                    )
                ],
            )
        ],
    )
    result = validate_dashboard_plan(plan, available_columns=["ROI", "Channel_Used"])
    assert result.is_valid is False
    assert any("NonExistentColumn" in e for e in result.errors)


def test_validate_duplicate_visual_id():
    plan = DashboardPlan(
        dataset_name="Test Dataset",
        title="Duplicate Visual ID",
        description="Duplicate visual IDs",
        pages=[
            DashboardPage(
                id="page_1",
                title="Overview",
                description="Summary",
                visuals=[
                    VisualSpec(id="vis_dup", title="Vis 1", type=VisualType.KPI_CARD, measure="ROI"),
                    VisualSpec(id="vis_dup", title="Vis 2", type=VisualType.KPI_CARD, measure="ROI"),
                ],
            )
        ],
    )
    result = validate_dashboard_plan(plan, available_columns=["ROI"])
    assert result.is_valid is False
    assert any("Duplicate visual id 'vis_dup'" in e for e in result.errors)


def test_validate_numeric_aggregation_on_string():
    plan = DashboardPlan(
        dataset_name="Test Dataset",
        title="Invalid Aggregation",
        description="Avg applied to string",
        measures=[
            MeasureSpec(
                name="Average Channel",
                column="Channel_Used",
                aggregation=AggregationType.AVG,
            )
        ],
        pages=[
            DashboardPage(
                id="page_1",
                title="Overview",
                description="Summary",
                visuals=[
                    VisualSpec(
                        id="vis_bad_agg",
                        title="Bad Aggregation",
                        type=VisualType.BAR_CHART,
                        category="Location",
                        measure="Average Channel",
                    )
                ],
            )
        ],
    )
    columns = ["Channel_Used", "Location", "ROI"]
    numeric_columns = ["ROI"]
    result = validate_dashboard_plan(plan, available_columns=columns, numeric_columns=numeric_columns)
    assert result.is_valid is False
    assert any("non-numeric column 'Channel_Used'" in e for e in result.errors)
