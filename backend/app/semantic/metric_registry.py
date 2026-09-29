from typing import Any, Optional
from enum import Enum
from pydantic import BaseModel, Field


class MetricAggregation(str, Enum):
    SUM = "SUM"
    AVERAGE = "AVERAGE"
    COUNT = "COUNT"
    DISTINCT_COUNT = "DISTINCTCOUNT"
    RATIO = "RATIO"
    COMPUTED = "COMPUTED"


class SemanticMetric(BaseModel):
    id: str
    display_name: str
    technical_name: str
    dax_expression: str
    aggregation: MetricAggregation
    base_columns: list[str]
    unit: str = ""
    format_string: str = "#,0.00"
    synonyms: list[str] = Field(default_factory=list)
    description: str = ""
    is_favorable_when_higher: bool = True


class MetricRegistry:
    """
    Central repository of verified business metrics and formulas.
    """

    def __init__(self):
        self._metrics: dict[str, SemanticMetric] = {}
        self._register_default_metrics()

    def _register_default_metrics(self):
        defaults = [
            SemanticMetric(
                id="metric_roi",
                display_name="Average ROI",
                technical_name="Average_ROI",
                dax_expression="AVERAGE('Campaigns'[ROI])",
                aggregation=MetricAggregation.AVERAGE,
                base_columns=["ROI"],
                unit="x",
                format_string="0.00",
                synonyms=["roi", "return on investment", "return", "profitability", "yield", "efficiency"],
                description="Average return on marketing spend across campaigns",
                is_favorable_when_higher=True,
            ),
            SemanticMetric(
                id="metric_cac",
                display_name="Customer Acquisition Cost (CAC)",
                technical_name="Average_CAC",
                dax_expression="AVERAGE('Campaigns'[Acquisition_Cost])",
                aggregation=MetricAggregation.AVERAGE,
                base_columns=["Acquisition_Cost"],
                unit="$",
                format_string="$#,0.00",
                synonyms=["cac", "acquisition cost", "cost per acquisition", "cost", "cpa", "spend per customer"],
                description="Average cost to acquire one customer",
                is_favorable_when_higher=False,
            ),
            SemanticMetric(
                id="metric_cvr",
                display_name="Conversion Rate",
                technical_name="Average_Conversion_Rate",
                dax_expression="AVERAGE('Campaigns'[Conversion_Rate])",
                aggregation=MetricAggregation.AVERAGE,
                base_columns=["Conversion_Rate"],
                unit="%",
                format_string="0.0%",
                synonyms=["cvr", "conversion rate", "conversion", "conversions", "conversion efficiency", "funnel rate"],
                description="Percentage of prospects converting into customers",
                is_favorable_when_higher=True,
            ),
            SemanticMetric(
                id="metric_total_spend",
                display_name="Total Acquisition Spend",
                technical_name="Total_Acquisition_Cost",
                dax_expression="SUM('Campaigns'[Acquisition_Cost])",
                aggregation=MetricAggregation.SUM,
                base_columns=["Acquisition_Cost"],
                unit="$",
                format_string="$#,0",
                synonyms=["spend", "total spend", "budget", "total cost", "expenditure", "investment"],
                description="Sum total of acquisition costs across all campaigns",
                is_favorable_when_higher=False,
            ),
            SemanticMetric(
                id="metric_campaigns_count",
                display_name="Total Campaigns",
                technical_name="Total_Campaigns",
                dax_expression="DISTINCTCOUNT('Campaigns'[Campaign_ID])",
                aggregation=MetricAggregation.DISTINCT_COUNT,
                base_columns=["Campaign_ID"],
                unit="",
                format_string="#,0",
                synonyms=["campaign count", "total campaigns", "volume", "number of campaigns", "runs"],
                description="Distinct count of unique marketing campaigns",
                is_favorable_when_higher=True,
            ),
            SemanticMetric(
                id="metric_efficiency_index",
                display_name="Channel Efficiency Index",
                technical_name="Efficiency_Index",
                dax_expression="DIVIDE([Average_ROI], [Average_CAC], 0)",
                aggregation=MetricAggregation.COMPUTED,
                base_columns=["ROI", "Acquisition_Cost"],
                unit="",
                format_string="0.000",
                synonyms=["efficiency index", "channel efficiency", "blended efficiency", "roi per dollar"],
                description="Ratio of average ROI to average CAC",
                is_favorable_when_higher=True,
            ),
        ]
        for m in defaults:
            self._metrics[m.id] = m

    def get_metric(self, metric_id: str) -> Optional[SemanticMetric]:
        return self._metrics.get(metric_id)

    def list_metrics(self) -> list[SemanticMetric]:
        return list(self._metrics.values())

    def register_metric(self, metric: SemanticMetric) -> None:
        self._metrics[metric.id] = metric


metric_registry = MetricRegistry()
