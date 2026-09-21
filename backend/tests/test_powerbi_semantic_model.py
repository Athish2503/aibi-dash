import pytest
import pandas as pd

from backend.app.agent.plan_schemas import (
    MeasureSpec,
    AggregationType,
    MeasureFormat,
)
from backend.app.powerbi.schemas import TMSLDataType
from backend.app.powerbi.semantic_model_builder import SemanticModelBuilder


def test_sanitize_table_name():
    builder = SemanticModelBuilder()
    assert builder.sanitize_table_name("Campaigns.csv") == "Campaigns"
    assert builder.sanitize_table_name("my sample-dataset 2024.xlsx") == "my_sampledataset_2024"
    assert builder.sanitize_table_name("12345.csv") == "Campaigns"
    assert builder.sanitize_table_name("Marketing Performance.csv") == "Marketing_Performance"


def test_map_dtype_to_tmsl():
    builder = SemanticModelBuilder()
    assert builder.map_dtype_to_tmsl("int64") == TMSLDataType.INT64
    assert builder.map_dtype_to_tmsl("int32") == TMSLDataType.INT64
    assert builder.map_dtype_to_tmsl("float64") == TMSLDataType.DOUBLE
    assert builder.map_dtype_to_tmsl("float32") == TMSLDataType.DOUBLE
    assert builder.map_dtype_to_tmsl("datetime64[ns]") == TMSLDataType.DATETIME
    assert builder.map_dtype_to_tmsl("bool") == TMSLDataType.BOOLEAN
    assert builder.map_dtype_to_tmsl("object") == TMSLDataType.STRING
    assert builder.map_dtype_to_tmsl("category") == TMSLDataType.STRING


def test_generate_dax_expressions():
    builder = SemanticModelBuilder()
    table = "Campaigns"

    m_avg = MeasureSpec(name="Average ROI", column="ROI", aggregation=AggregationType.AVG)
    assert builder.generate_dax_expression(m_avg, table) == "AVERAGE('Campaigns'[ROI])"

    m_sum = MeasureSpec(name="Total Cost", column="Acquisition_Cost", aggregation=AggregationType.SUM)
    assert builder.generate_dax_expression(m_sum, table) == "SUM('Campaigns'[Acquisition_Cost])"

    m_count = MeasureSpec(name="Total Records", column="Campaign_ID", aggregation=AggregationType.COUNT)
    assert builder.generate_dax_expression(m_count, table) == "COUNT('Campaigns'[Campaign_ID])"

    m_dist = MeasureSpec(name="Distinct Campaigns", column="Campaign_ID", aggregation=AggregationType.DISTINCT_COUNT)
    assert builder.generate_dax_expression(m_dist, table) == "DISTINCTCOUNT('Campaigns'[Campaign_ID])"

    m_min = MeasureSpec(name="Min ROI", column="ROI", aggregation=AggregationType.MIN)
    assert builder.generate_dax_expression(m_min, table) == "MIN('Campaigns'[ROI])"

    m_max = MeasureSpec(name="Max ROI", column="ROI", aggregation=AggregationType.MAX)
    assert builder.generate_dax_expression(m_max, table) == "MAX('Campaigns'[ROI])"

    # Custom expression
    m_custom = MeasureSpec(
        name="Cost Per Conversion",
        column="Acquisition_Cost",
        aggregation=AggregationType.AVG,
        dax_expression="DIVIDE(SUM('Campaigns'[Acquisition_Cost]), SUM('Campaigns'[Clicks]), 0)",
    )
    assert builder.generate_dax_expression(m_custom, table) == "DIVIDE(SUM('Campaigns'[Acquisition_Cost]), SUM('Campaigns'[Clicks]), 0)"


def test_build_m_partition_expression():
    builder = SemanticModelBuilder()
    csv_expr = builder.build_m_partition_expression("Campaigns", "./data/Campaigns.csv")
    assert any("Csv.Document" in line for line in csv_expr)
    assert any("Table.PromoteHeaders" in line for line in csv_expr)

    xlsx_expr = builder.build_m_partition_expression("Campaigns", "./data/Campaigns.xlsx")
    assert any("Excel.Workbook" in line for line in xlsx_expr)


def test_build_semantic_model_complete():
    builder = SemanticModelBuilder()
    df = pd.DataFrame({
        "Campaign_ID": [1, 2, 3],
        "Company": ["A", "B", "C"],
        "Acquisition_Cost": [100.5, 200.0, 300.25],
        "ROI": [2.5, 3.1, 4.0],
    })

    measures = [
        MeasureSpec(name="Average ROI", column="ROI", aggregation=AggregationType.AVG, format=MeasureFormat.NUMBER),
        MeasureSpec(name="Total Spend", column="Acquisition_Cost", aggregation=AggregationType.SUM, format=MeasureFormat.CURRENCY),
    ]

    tmsl_db = builder.build_semantic_model(
        dataset_name="Campaigns.csv",
        columns_info=df,
        measures=measures,
        data_source_path="./data/Campaigns.csv",
    )

    assert tmsl_db.compatibilityLevel == 1550
    assert len(tmsl_db.model.tables) == 1
    table = tmsl_db.model.tables[0]
    assert table.name == "Campaigns"
    assert len(table.columns) == 4
    assert len(table.measures) == 2
    assert table.measures[0].name == "Average ROI"
    assert table.measures[0].expression == "AVERAGE('Campaigns'[ROI])"
    assert table.measures[1].name == "Total Spend"
    assert table.measures[1].formatString == "$#,0.00;($#,0.00);$#,0.00"
    assert len(table.partitions) == 1
