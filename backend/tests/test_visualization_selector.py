from backend.app.agent.plan_schemas import VisualType
from backend.app.agent.visualization_selector import analyze_columns, select_visualization


def test_analyze_columns_marketing_dataset():
    cols = [
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
    detected_types = {
        "Campaign_ID": "string",
        "Company": "string",
        "Campaign_Type": "string",
        "Target_Audience": "string",
        "Duration": "string",
        "Channel_Used": "string",
        "Conversion_Rate": "float",
        "Acquisition_Cost": "float",
        "ROI": "float",
        "Location": "string",
    }

    roles = analyze_columns(cols, detected_types=detected_types)

    assert "Campaign_ID" in roles.identifiers
    assert "ROI" in roles.metrics
    assert "Conversion_Rate" in roles.metrics
    assert "Acquisition_Cost" in roles.metrics
    assert "Channel_Used" in roles.dimensions
    assert "Company" in roles.dimensions
    assert "Location" in roles.geography
    assert "Duration" in roles.duration_or_time


def test_select_visualization_kpi_card():
    # Metric without dimension -> KPI Card
    vis_type = select_visualization(category_column=None, measure_column="Average ROI")
    assert vis_type == VisualType.KPI_CARD


def test_select_visualization_scatter_plot():
    # Two metrics comparison -> Scatter Plot
    vis_type = select_visualization(
        category_column="Campaign_ID",
        measure_column="ROI",
        secondary_measure="Acquisition_Cost",
    )
    assert vis_type == VisualType.SCATTER_PLOT


def test_select_visualization_donut_chart():
    # Low cardinality composition -> Donut Chart
    vis_type = select_visualization(
        category_column="Campaign_Type",
        measure_column="Total Campaigns",
        cardinality=4,
        analytical_intent="composition share",
    )
    assert vis_type == VisualType.DONUT_CHART


def test_select_visualization_matrix():
    # Secondary category breakdown -> Matrix
    vis_type = select_visualization(
        category_column="Channel_Used",
        measure_column="Average ROI",
        secondary_category="Target_Audience",
        analytical_intent="matrix comparison",
    )
    assert vis_type == VisualType.MATRIX


def test_select_visualization_bar_chart():
    vis_type = select_visualization(
        category_column="Channel_Used",
        measure_column="Average ROI",
        cardinality=6,
    )
    assert vis_type == VisualType.BAR_CHART
