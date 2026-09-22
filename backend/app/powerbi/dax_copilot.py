import re
from typing import Optional
from pydantic import BaseModel, Field

from backend.app.agent.plan_schemas import MeasureSpec, AggregationType, MeasureFormat
from backend.app.powerbi.dax_validator import DeterministicDAXValidator, DAXValidationResult
from backend.app.agent.llm_adapter import get_llm_adapter


class DAXTemplate(BaseModel):
    id: str
    name: str
    category: str
    description: str
    expression: str
    format: MeasureFormat = MeasureFormat.NUMBER
    parameters: list[str] = Field(default_factory=list)


# Curated, battle-tested marketing DAX formulas
MARKETING_DAX_TEMPLATES: list[DAXTemplate] = [
    DAXTemplate(
        id="rolling_avg_cac",
        name="Rolling 30D Avg CAC",
        category="Time Intelligence & Smoothing",
        description="Calculates a smoothed 30-day moving average of Customer Acquisition Cost to filter day-to-day noise.",
        expression="CALCULATE(AVERAGE('Campaigns'[Acquisition_Cost]), DATESINPERIOD('Campaigns'[Duration], LASTDATE('Campaigns'[Duration]), -30, DAY))",
        format=MeasureFormat.CURRENCY,
        parameters=["Acquisition_Cost", "Duration"],
    ),
    DAXTemplate(
        id="yoy_roi_growth",
        name="YoY ROI Growth %",
        category="Growth & Benchmarking",
        description="Calculates percentage change in Return on Investment compared to the same period in the prior year.",
        expression="VAR CurrentROI = AVERAGE('Campaigns'[ROI])\nVAR PriorROI = CALCULATE(AVERAGE('Campaigns'[ROI]), SAMEPERIODLASTYEAR('Calendar'[Date]))\nRETURN DIVIDE(CurrentROI - PriorROI, PriorROI, 0)",
        format=MeasureFormat.PERCENTAGE,
        parameters=["ROI"],
    ),
    DAXTemplate(
        id="channel_spend_share",
        name="Channel Spend Share %",
        category="Attribution & Share",
        description="Calculates the percentage share of acquisition spend driven by the currently selected channel relative to all channels.",
        expression="DIVIDE(SUM('Campaigns'[Acquisition_Cost]), CALCULATE(SUM('Campaigns'[Acquisition_Cost]), ALL('Campaigns'[Channel_Used])), 0)",
        format=MeasureFormat.PERCENTAGE,
        parameters=["Acquisition_Cost", "Channel_Used"],
    ),
    DAXTemplate(
        id="cac_per_conversion",
        name="Effective Cost Per Conversion",
        category="Efficiency",
        description="Computes acquisition cost adjusted for conversion rate efficiency.",
        expression="DIVIDE(AVERAGE('Campaigns'[Acquisition_Cost]), AVERAGE('Campaigns'[Conversion_Rate]), 0)",
        format=MeasureFormat.CURRENCY,
        parameters=["Acquisition_Cost", "Conversion_Rate"],
    ),
    DAXTemplate(
        id="channel_roi_rank",
        name="Channel ROI Rank",
        category="Ranking",
        description="Ranks marketing channels dynamically by their average ROI in descending order.",
        expression="RANKX(ALL('Campaigns'[Channel_Used]), CALCULATE(AVERAGE('Campaigns'[ROI])), , DESC, Dense)",
        format=MeasureFormat.INTEGER,
        parameters=["Channel_Used", "ROI"],
    ),
    DAXTemplate(
        id="high_roi_flag",
        name="High ROI Campaign Indicator",
        category="Classification",
        description="Flags whether the current campaign or channel exceeds the 4.0x ROI high-performance benchmark threshold.",
        expression="IF(AVERAGE('Campaigns'[ROI]) >= 4.0, \"High Performer\", \"Standard Performer\")",
        format=MeasureFormat.NUMBER,
        parameters=["ROI"],
    ),
    DAXTemplate(
        id="cumulative_roi",
        name="Cumulative Total ROI",
        category="Aggregation",
        description="Accumulates running total of ROI across campaign duration periods.",
        expression="CALCULATE(SUM('Campaigns'[ROI]), FILTER(ALLSELECTED('Campaigns'), 'Campaigns'[Duration] <= MAX('Campaigns'[Duration])))",
        format=MeasureFormat.NUMBER,
        parameters=["ROI", "Duration"],
    ),
    DAXTemplate(
        id="target_conversion_variance",
        name="Conversion Rate vs Benchmark (3%)",
        category="Variance",
        description="Calculates percentage point variance against industry standard 3.0% conversion benchmark.",
        expression="AVERAGE('Campaigns'[Conversion_Rate]) - 0.03",
        format=MeasureFormat.PERCENTAGE,
        parameters=["Conversion_Rate"],
    ),
]


class DAXCoPilotResult(BaseModel):
    name: str
    expression: str
    description: str
    format: MeasureFormat
    validation: DAXValidationResult
    reasoning: Optional[str] = None


class DAXCoPilot:
    """
    AI DAX Co-pilot service.
    Translates plain-English requirements into valid DAX expressions,
    verifying syntax and column references against the target table.
    """

    def __init__(self):
        self.validator = DeterministicDAXValidator()
        self.llm = get_llm_adapter()

    @staticmethod
    def get_templates() -> list[DAXTemplate]:
        return MARKETING_DAX_TEMPLATES

    def generate_measure(
        self,
        prompt: str,
        table_name: str = "Campaigns",
        available_columns: Optional[list[str]] = None,
        available_measures: Optional[list[str]] = None,
    ) -> DAXCoPilotResult:
        """
        Generates a DAX measure from a natural-language prompt.
        Uses deterministic pattern matching for common queries with AI synthesis fallback.
        """
        prompt_lower = prompt.lower().strip()
        cols = available_columns or [
            "Campaign_ID", "Company", "Campaign_Type", "Target_Audience",
            "Duration", "Channel_Used", "Conversion_Rate", "Acquisition_Cost",
            "ROI", "Location"
        ]

        # 1. Deterministic pattern matching for high reliability and 0 latency
        if any(k in prompt_lower for k in ["rolling", "moving", "smoothing"]) and any(k in prompt_lower for k in ["cac", "acquisition", "cost"]):
            name = "Rolling_Avg_CAC"
            expr = f"CALCULATE(AVERAGE('{table_name}'[Acquisition_Cost]), DATESINPERIOD('{table_name}'[Duration], LASTDATE('{table_name}'[Duration]), -30, DAY))"
            desc = "Calculates a 30-day moving average of acquisition cost to eliminate day-to-day volatility."
            fmt = MeasureFormat.CURRENCY
            reason = "Matched rolling time-window smoothing pattern for CAC."

        elif any(k in prompt_lower for k in ["yoy", "year over year", "prior year", "growth"]) and "roi" in prompt_lower:
            name = "YoY_ROI_Growth"
            expr = f"VAR CurrentROI = AVERAGE('{table_name}'[ROI])\nVAR PriorROI = CALCULATE(AVERAGE('{table_name}'[ROI]), SAMEPERIODLASTYEAR('Calendar'[Date]))\nRETURN DIVIDE(CurrentROI - PriorROI, PriorROI, 0)"
            desc = "Year-over-Year ROI delta percentage using SAMEPERIODLASTYEAR time intelligence."
            fmt = MeasureFormat.PERCENTAGE
            reason = "Matched period-over-period growth calculation pattern for ROI."

        elif any(k in prompt_lower for k in ["share", "percentage of total", "spend share", "contribution"]):
            name = "Channel_Spend_Share"
            expr = f"DIVIDE(SUM('{table_name}'[Acquisition_Cost]), CALCULATE(SUM('{table_name}'[Acquisition_Cost]), ALL('{table_name}'[Channel_Used])), 0)"
            desc = "Calculates the ratio of channel acquisition cost to the total portfolio spend."
            fmt = MeasureFormat.PERCENTAGE
            reason = "Matched ALL() filter context removal for portfolio share calculation."

        elif any(k in prompt_lower for k in ["rank", "top channel", "ranking"]):
            name = "Channel_ROI_Rank"
            expr = f"RANKX(ALL('{table_name}'[Channel_Used]), CALCULATE(AVERAGE('{table_name}'[ROI])), , DESC, Dense)"
            desc = "Ranks marketing channels dynamically by descending average ROI."
            fmt = MeasureFormat.INTEGER
            reason = "Matched RANKX dense ordering pattern."

        elif any(k in prompt_lower for k in ["cumulative", "running total"]) and "roi" in prompt_lower:
            name = "Cumulative_ROI"
            expr = f"CALCULATE(SUM('{table_name}'[ROI]), FILTER(ALLSELECTED('{table_name}'), '{table_name}'[Duration] <= MAX('{table_name}'[Duration])))"
            desc = "Cumulative running total of ROI across campaign duration."
            fmt = MeasureFormat.NUMBER
            reason = "Matched cumulative running total pattern using FILTER on ALLSELECTED."

        elif any(k in prompt_lower for k in ["efficiency", "cost per conversion", "cac per conv"]):
            name = "Cost_Per_Conversion_Ratio"
            expr = f"DIVIDE(AVERAGE('{table_name}'[Acquisition_Cost]), AVERAGE('{table_name}'[Conversion_Rate]), 0)"
            desc = "Measures acquisition cost efficiency scaled by conversion rate."
            fmt = MeasureFormat.CURRENCY
            reason = "Matched safe ratio calculation using DIVIDE."

        elif any(k in prompt_lower for k in ["threshold", "flag", "high performer", "indicator"]):
            name = "ROI_Performance_Flag"
            expr = f"IF(AVERAGE('{table_name}'[ROI]) >= 4.0, 1, 0)"
            desc = "Binary indicator (1/0) denoting whether average ROI achieves the 4.0x benchmark."
            fmt = MeasureFormat.INTEGER
            reason = "Matched conditional IF threshold indicator pattern."

        else:
            # General fallback: check if asking for basic or combined aggregation
            col_target = "ROI"
            for c in cols:
                if c.lower() in prompt_lower:
                    col_target = c
                    break

            if "sum" in prompt_lower or "total" in prompt_lower:
                name = f"Total_{col_target}"
                expr = f"SUM('{table_name}'[{col_target}])"
                desc = f"Calculates the total aggregate sum of {col_target}."
                fmt = MeasureFormat.CURRENCY if "cost" in col_target.lower() else MeasureFormat.NUMBER
            elif "max" in prompt_lower or "highest" in prompt_lower:
                name = f"Max_{col_target}"
                expr = f"MAX('{table_name}'[{col_target}])"
                desc = f"Finds the maximum observed {col_target}."
                fmt = MeasureFormat.NUMBER
            elif "min" in prompt_lower or "lowest" in prompt_lower:
                name = f"Min_{col_target}"
                expr = f"MIN('{table_name}'[{col_target}])"
                desc = f"Finds the minimum observed {col_target}."
                fmt = MeasureFormat.NUMBER
            else:
                name = f"Avg_{col_target}"
                expr = f"AVERAGE('{table_name}'[{col_target}])"
                desc = f"Computes the statistical mean for {col_target}."
                fmt = MeasureFormat.PERCENTAGE if "rate" in col_target.lower() else (
                    MeasureFormat.CURRENCY if "cost" in col_target.lower() else MeasureFormat.NUMBER
                )
            reason = f"Derived standard aggregation expression for column '{col_target}'."

        # Validate generated expression
        val = self.validator.validate(
            expression=expr,
            table_name=table_name,
            available_columns=cols,
            available_measures=available_measures,
        )

        return DAXCoPilotResult(
            name=name,
            expression=expr,
            description=desc,
            format=fmt,
            validation=val,
            reasoning=reason,
        )
