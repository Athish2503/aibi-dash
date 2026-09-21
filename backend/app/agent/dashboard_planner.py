import logging
from typing import Optional

try:
    from backend.app.agent.llm_adapter import LLMAdapter, get_llm_adapter
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
    from backend.app.agent.plan_validator import validate_dashboard_plan
    from backend.app.agent.visualization_selector import analyze_columns
    from backend.app.data.schemas import DatasetProfileResult, EXPECTED_COLUMNS, NUMERIC_COLUMNS
except ImportError:
    from app.agent.llm_adapter import LLMAdapter, get_llm_adapter
    from app.agent.plan_schemas import (
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
    from app.agent.plan_validator import validate_dashboard_plan
    from app.agent.visualization_selector import analyze_columns
    from app.data.schemas import DatasetProfileResult, EXPECTED_COLUMNS, NUMERIC_COLUMNS

logger = logging.getLogger(__name__)


class DashboardPlanner:
    """
    Orchestrates the generation of Power BI-ready typed dashboard plans
    using deterministic templates and AI-assisted customization with Gemini.
    """

    def __init__(self, llm_adapter: Optional[LLMAdapter] = None):
        self._llm_adapter = llm_adapter

    @property
    def llm_adapter(self) -> LLMAdapter:
        if self._llm_adapter is None:
            self._llm_adapter = get_llm_adapter()
        return self._llm_adapter

    def generate_deterministic_plan(
        self,
        dataset_name: str = "Digital Marketing Campaigns",
        columns: Optional[list[str]] = None,
        profile: Optional[DatasetProfileResult] = None,
    ) -> DashboardPlan:
        """
        Creates a battle-tested, standard 3-page Marketing Campaign Dashboard Plan.
        Guaranteed to be deterministic, reproducible, and valid.
        """
        cols = columns or EXPECTED_COLUMNS
        col_roles = analyze_columns(cols, profile=profile)

        # 1. Semantic Measures
        measures = [
            MeasureSpec(
                name="Total Campaigns",
                column="Campaign_ID" if "Campaign_ID" in cols else cols[0],
                aggregation=AggregationType.DISTINCT_COUNT,
                format=MeasureFormat.INTEGER,
                dax_expression=f"DISTINCTCOUNT(Campaigns[{'Campaign_ID' if 'Campaign_ID' in cols else cols[0]}])",
                description="Total count of unique marketing campaigns evaluated.",
            ),
            MeasureSpec(
                name="Average ROI",
                column="ROI" if "ROI" in cols else col_roles.metrics[0] if col_roles.metrics else cols[0],
                aggregation=AggregationType.AVG,
                format=MeasureFormat.NUMBER,
                dax_expression=f"AVERAGE(Campaigns[{'ROI' if 'ROI' in cols else col_roles.metrics[0] if col_roles.metrics else cols[0]}])",
                description="Mean Return on Investment across campaigns.",
            ),
            MeasureSpec(
                name="Average Conversion Rate",
                column="Conversion_Rate" if "Conversion_Rate" in cols else col_roles.metrics[0] if col_roles.metrics else cols[0],
                aggregation=AggregationType.AVG,
                format=MeasureFormat.PERCENTAGE,
                dax_expression=f"AVERAGE(Campaigns[{'Conversion_Rate' if 'Conversion_Rate' in cols else col_roles.metrics[0] if col_roles.metrics else cols[0]}])",
                description="Mean conversion percentage across campaigns.",
            ),
            MeasureSpec(
                name="Average Acquisition Cost",
                column="Acquisition_Cost" if "Acquisition_Cost" in cols else col_roles.metrics[0] if col_roles.metrics else cols[0],
                aggregation=AggregationType.AVG,
                format=MeasureFormat.CURRENCY,
                dax_expression=f"AVERAGE(Campaigns[{'Acquisition_Cost' if 'Acquisition_Cost' in cols else col_roles.metrics[0] if col_roles.metrics else cols[0]}])",
                description="Mean customer acquisition cost in currency units.",
            ),
            MeasureSpec(
                name="Total Acquisition Cost",
                column="Acquisition_Cost" if "Acquisition_Cost" in cols else col_roles.metrics[0] if col_roles.metrics else cols[0],
                aggregation=AggregationType.SUM,
                format=MeasureFormat.CURRENCY,
                dax_expression=f"SUM(Campaigns[{'Acquisition_Cost' if 'Acquisition_Cost' in cols else col_roles.metrics[0] if col_roles.metrics else cols[0]}])",
                description="Total capital allocated to campaign acquisitions.",
            ),
        ]

        # 2. Page 1: Executive Summary / Overview
        page_1 = DashboardPage(
            id="page_executive_summary",
            title="Executive Summary",
            description="High-level performance KPIs and channel/type distribution across all digital marketing campaigns.",
            slicers=[
                SlicerSpec(id="slicer_company", column="Company", display_name="Company", filter_type=SlicerFilterType.DROPDOWN),
                SlicerSpec(id="slicer_location", column="Location", display_name="Location", filter_type=SlicerFilterType.DROPDOWN),
                SlicerSpec(id="slicer_campaign_type", column="Campaign_Type", display_name="Campaign Type", filter_type=SlicerFilterType.DROPDOWN),
            ] if all(c in cols for c in ["Company", "Location", "Campaign_Type"]) else [],
            visuals=[
                VisualSpec(id="kpi_total_campaigns", title="Total Campaigns", type=VisualType.KPI_CARD, measure="Total Campaigns", width=3, height=2),
                VisualSpec(id="kpi_avg_roi", title="Average ROI", type=VisualType.KPI_CARD, measure="Average ROI", width=3, height=2),
                VisualSpec(id="kpi_avg_conv_rate", title="Avg Conversion Rate", type=VisualType.KPI_CARD, measure="Average Conversion Rate", width=3, height=2),
                VisualSpec(id="kpi_avg_acq_cost", title="Avg Acquisition Cost", type=VisualType.KPI_CARD, measure="Average Acquisition Cost", width=3, height=2),
                VisualSpec(
                    id="chart_roi_by_channel",
                    title="Average ROI by Channel",
                    type=VisualType.BAR_CHART,
                    category="Channel_Used" if "Channel_Used" in cols else cols[1],
                    measure="Average ROI",
                    width=6,
                    height=5,
                    description="Compares channel profitability to identify high-return channels.",
                ),
                VisualSpec(
                    id="chart_campaigns_by_type",
                    title="Campaigns by Type",
                    type=VisualType.DONUT_CHART,
                    category="Campaign_Type" if "Campaign_Type" in cols else cols[1],
                    measure="Total Campaigns",
                    width=6,
                    height=5,
                    description="Portfolio share of different campaign types.",
                ),
                VisualSpec(
                    id="chart_roi_by_location",
                    title="Average ROI by Geographic Location",
                    type=VisualType.COLUMN_CHART,
                    category="Location" if "Location" in cols else cols[1],
                    measure="Average ROI",
                    width=12,
                    height=5,
                    description="Geographic breakdown of campaign return on investment.",
                ),
            ],
        )

        # 3. Page 2: Channel & Audience Deep Dive
        page_2 = DashboardPage(
            id="page_channel_audience",
            title="Channel & Audience Performance",
            description="Detailed audience segmentation and cross-channel conversion efficiency.",
            slicers=[
                SlicerSpec(id="slicer_channel", column="Channel_Used", display_name="Channel", filter_type=SlicerFilterType.DROPDOWN),
                SlicerSpec(id="slicer_audience", column="Target_Audience", display_name="Target Audience", filter_type=SlicerFilterType.DROPDOWN),
            ] if all(c in cols for c in ["Channel_Used", "Target_Audience"]) else [],
            visuals=[
                VisualSpec(
                    id="chart_conv_by_channel",
                    title="Conversion Rate by Channel",
                    type=VisualType.COLUMN_CHART,
                    category="Channel_Used" if "Channel_Used" in cols else cols[1],
                    measure="Average Conversion Rate",
                    width=6,
                    height=5,
                    description="Identifies channels with the strongest user intent and conversion efficiency.",
                ),
                VisualSpec(
                    id="chart_roi_by_audience",
                    title="Average ROI by Target Audience",
                    type=VisualType.BAR_CHART,
                    category="Target_Audience" if "Target_Audience" in cols else cols[1],
                    measure="Average ROI",
                    width=6,
                    height=5,
                    description="Highlights target audience segments yielding the highest financial returns.",
                ),
                VisualSpec(
                    id="matrix_channel_audience",
                    title="Channel by Audience Performance Matrix",
                    type=VisualType.MATRIX,
                    category="Channel_Used" if "Channel_Used" in cols else cols[1],
                    secondary_category="Target_Audience" if "Target_Audience" in cols else cols[2],
                    measure="Average ROI",
                    width=12,
                    height=6,
                    description="Cross-tabulation showing audience resonance across different marketing channels.",
                ),
            ],
        )

        # 4. Page 3: Cost Efficiency & Duration Analysis
        page_3 = DashboardPage(
            id="page_efficiency_duration",
            title="Cost Efficiency & Duration",
            description="Cost vs. ROI relationship, duration sensitivity, and top individual campaign benchmarks.",
            slicers=[
                SlicerSpec(id="slicer_duration", column="Duration", display_name="Duration", filter_type=SlicerFilterType.DROPDOWN),
            ] if "Duration" in cols else [],
            visuals=[
                VisualSpec(
                    id="scatter_cost_vs_roi",
                    title="Acquisition Cost vs ROI",
                    type=VisualType.SCATTER_PLOT,
                    category="Campaign_ID" if "Campaign_ID" in cols else cols[0],
                    measure="Average ROI",
                    secondary_measure="Average Acquisition Cost",
                    width=7,
                    height=6,
                    description="Scatter plot identifying high-efficiency (low cost, high ROI) outliers.",
                ),
                VisualSpec(
                    id="chart_roi_by_duration",
                    title="Average ROI by Campaign Duration",
                    type=VisualType.COLUMN_CHART,
                    category="Duration" if "Duration" in cols else cols[1],
                    measure="Average ROI",
                    width=5,
                    height=6,
                    description="Assesses how campaign flight length impacts overall return.",
                ),
                VisualSpec(
                    id="table_top_campaigns",
                    title="Campaign Performance Detail",
                    type=VisualType.TABLE,
                    category="Campaign_ID" if "Campaign_ID" in cols else cols[0],
                    measure="Average ROI",
                    width=12,
                    height=6,
                    description="Detailed tabular ranking of individual campaigns by performance.",
                ),
            ],
        )

        plan = DashboardPlan(
            dataset_name=dataset_name,
            title=f"{dataset_name} Performance Dashboard Plan",
            description="Comprehensive 3-page Power BI dashboard plan covering Executive Overview, Channel & Audience Performance, and Cost Efficiency.",
            pages=[page_1, page_2, page_3],
            measures=measures,
        )

        # Validate before returning
        validate_dashboard_plan(plan, available_columns=cols, numeric_columns=NUMERIC_COLUMNS, profile=profile)
        return plan

    def plan_with_ai(
        self,
        dataset_name: str = "Digital Marketing Campaigns",
        columns: Optional[list[str]] = None,
        profile: Optional[DatasetProfileResult] = None,
        user_prompt: Optional[str] = None,
    ) -> DashboardPlan:
        """
        Uses Gemini AI to generate a customized dashboard plan based on dataset profile
        and optional user requirements.
        Strictly validates the output; gracefully falls back to deterministic template if validation fails.
        """
        cols = columns or EXPECTED_COLUMNS
        col_roles = analyze_columns(cols, profile=profile)

        system_instruction = (
            "You are an expert Power BI Solution Architect and Data Analyst.\n"
            "Your task is to generate a structured, production-grade Dashboard Plan in JSON format.\n"
            "STRICT RULES:\n"
            "1. ONLY use columns that exist in the provided dataset column list.\n"
            "2. NEVER invent column names or metrics.\n"
            "3. Numeric measures must only use numeric columns.\n"
            "4. Every visual ID and page ID must be unique and descriptive.\n"
            "5. Plan must include 2-3 logical pages (e.g. Executive Summary, Channel Analysis, Efficiency).\n"
            "6. Provide clean, valid DAX expressions for measures where applicable."
        )

        profile_summary = ""
        if profile:
            profile_summary = (
                f"Total Records: {profile.total_records}\n"
                f"Numeric Columns: {list(profile.numeric_profiles.keys())}\n"
                f"Categorical Columns: {list(profile.categorical_profiles.keys())}\n"
            )

        prompt = (
            f"Generate a DashboardPlan for dataset '{dataset_name}'.\n"
            f"Available Columns: {cols}\n"
            f"Identified Roles: Metrics={col_roles.metrics}, Dimensions={col_roles.dimensions}, Geography={col_roles.geography}, Duration={col_roles.duration_or_time}\n"
            f"{profile_summary}\n"
            f"User Specific Requirements: {user_prompt or 'Create an executive marketing dashboard emphasizing ROI, channel breakdown, and acquisition cost efficiency.'}\n"
        )

        try:
            logger.info("Requesting structured dashboard plan from LLM...")
            ai_plan = self.llm_adapter.generate_structured(
                prompt=prompt,
                response_model=DashboardPlan,
                system_instruction=system_instruction,
            )

            # Validate the AI-generated plan against real dataset schema
            val_result = validate_dashboard_plan(
                ai_plan,
                available_columns=cols,
                numeric_columns=col_roles.metrics or NUMERIC_COLUMNS,
                profile=profile,
            )

            if val_result.is_valid:
                logger.info("AI-generated dashboard plan validated successfully.")
                return ai_plan
            else:
                logger.warning(
                    f"AI-generated plan failed validation ({len(val_result.errors)} errors). Falling back to deterministic plan. Errors: {val_result.errors}"
                )
                fallback = self.generate_deterministic_plan(dataset_name=dataset_name, columns=cols, profile=profile)
                if fallback.validation:
                    fallback.validation.warnings.append(
                        f"AI plan fell back to deterministic template due to schema validation errors: {val_result.errors[:3]}"
                    )
                return fallback

        except Exception as e:
            logger.warning(f"Error during AI plan generation ({e}). Falling back to deterministic plan.")
            fallback = self.generate_deterministic_plan(dataset_name=dataset_name, columns=cols, profile=profile)
            if fallback.validation:
                fallback.validation.warnings.append(f"AI plan generation failed with error: {str(e)}; used deterministic template.")
            return fallback
