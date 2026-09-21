import pytest
from backend.app.agent.dashboard_planner import DashboardPlanner
from backend.app.agent.llm_adapter import MockLLMAdapter, GeminiAdapter
from backend.app.agent.plan_schemas import (
    AggregationType,
    DashboardPage,
    DashboardPlan,
    MeasureFormat,
    MeasureSpec,
    VisualSpec,
    VisualType,
)
from backend.app.config import settings


def test_generate_deterministic_plan():
    planner = DashboardPlanner()
    plan = planner.generate_deterministic_plan(dataset_name="Digital Marketing Campaigns")

    assert plan.dataset_name == "Digital Marketing Campaigns"
    assert len(plan.pages) == 3
    assert len(plan.measures) >= 4
    assert plan.validation is not None
    assert plan.validation.is_valid is True

    # Page 1 checks
    page1 = plan.pages[0]
    assert page1.id == "page_executive_summary"
    visual_types = [v.type for v in page1.visuals]
    assert VisualType.KPI_CARD in visual_types
    assert VisualType.BAR_CHART in visual_types
    assert VisualType.DONUT_CHART in visual_types

    # Page 2 checks
    page2 = plan.pages[1]
    assert page2.id == "page_channel_audience"
    assert any(v.type == VisualType.MATRIX for v in page2.visuals)

    # Page 3 checks
    page3 = plan.pages[2]
    assert page3.id == "page_efficiency_duration"
    assert any(v.type == VisualType.SCATTER_PLOT for v in page3.visuals)


def test_plan_with_ai_mock_success():
    valid_ai_plan = DashboardPlan(
        dataset_name="Test Campaigns",
        title="Custom AI Plan",
        description="Plan created by AI",
        measures=[
            MeasureSpec(
                name="Average ROI",
                column="ROI",
                aggregation=AggregationType.AVG,
                format=MeasureFormat.NUMBER,
            )
        ],
        pages=[
            DashboardPage(
                id="page_custom",
                title="AI Custom Page",
                description="Custom summary",
                visuals=[
                    VisualSpec(
                        id="vis_ai_roi",
                        title="ROI by Channel",
                        type=VisualType.BAR_CHART,
                        category="Channel_Used",
                        measure="Average ROI",
                    )
                ],
            )
        ],
    )

    mock_adapter = MockLLMAdapter(default_response=valid_ai_plan.model_dump_json())
    planner = DashboardPlanner(llm_adapter=mock_adapter)

    plan = planner.plan_with_ai(
        dataset_name="Test Campaigns",
        columns=["ROI", "Channel_Used", "Campaign_ID"],
        user_prompt="Focus on channel ROI",
    )

    assert plan.title == "Custom AI Plan"
    assert len(plan.pages) == 1
    assert plan.pages[0].id == "page_custom"
    assert plan.validation.is_valid is True


def test_plan_with_ai_fallback_on_invalid_output():
    # LLM outputs non-conforming or corrupted JSON
    bad_mock_adapter = MockLLMAdapter(default_response="Not valid JSON at all")
    planner = DashboardPlanner(llm_adapter=bad_mock_adapter)

    plan = planner.plan_with_ai(
        dataset_name="Fallback Test",
        columns=["Campaign_ID", "Company", "Channel_Used", "ROI", "Conversion_Rate", "Acquisition_Cost", "Duration", "Location", "Campaign_Type", "Target_Audience"],
    )

    # Must fall back gracefully to deterministic plan
    assert plan is not None
    assert len(plan.pages) == 3
    assert plan.validation is not None
    assert plan.validation.is_valid is True
    assert any("used deterministic template" in w for w in plan.validation.warnings)


@pytest.mark.skipif(not settings.GEMINI_API_KEY, reason="GEMINI_API_KEY not configured")
def test_live_gemini_plan_generation():
    """Live integration test against Gemini 2.5 Flash using configured credentials."""
    gemini_adapter = GeminiAdapter(timeout_seconds=20.0)
    planner = DashboardPlanner(llm_adapter=gemini_adapter)

    columns = [
        "Campaign_ID",
        "Company",
        "Campaign_Type",
        "Target_Audience",
        "Duration",
        "Channel_Used",
        "Conversion_Rate",
        "Acquisition_Cost",
        "ROI",
        "Location",
    ]

    plan = planner.plan_with_ai(
        dataset_name="Live Marketing Campaigns",
        columns=columns,
        user_prompt="Create a 2-page marketing dashboard with focus on ROI and audience segmentation.",
    )

    assert plan is not None
    assert len(plan.pages) >= 2
    assert plan.validation is not None
    assert plan.validation.is_valid is True
