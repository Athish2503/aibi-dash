from typing import Any, Callable, Optional
from pydantic import BaseModel, Field, ConfigDict
import inspect
import logging

logger = logging.getLogger(__name__)


class ToolDefinition(BaseModel):
    """Metadata describing a callable agent tool."""
    model_config = ConfigDict(arbitrary_types_allowed=True)

    name: str
    description: str
    category: str = Field(description="Tool category: dataset, analytics, planning, reporting")
    parameters: dict[str, Any] = Field(default_factory=dict, description="JSON Schema of tool parameters")
    func: Any = Field(exclude=True)  # Callable function reference


class ToolExecutionError(Exception):
    """Raised when execution of a registered tool fails."""
    pass


class ToolRegistry:
    """Registry that catalogues, inspects, and executes tools for the AI agent."""

    def __init__(self):
        self._tools: dict[str, ToolDefinition] = {}

    def register(
        self,
        name: str,
        description: str,
        category: str = "analytics",
        parameters: Optional[dict[str, Any]] = None,
    ):
        """Decorator to register a function as an agent tool."""
        def decorator(func: Callable) -> Callable:
            tool_params = parameters
            if tool_params is None:
                # Infer parameters from signature if not explicitly provided
                sig = inspect.signature(func)
                props = {}
                required = []
                for p_name, p in sig.parameters.items():
                    if p_name in ("self", "df"):  # Usually injected or data context
                        continue
                    prop_type = "string"
                    if p.annotation in (int, Optional[int]):
                        prop_type = "integer"
                    elif p.annotation in (float, Optional[float]):
                        prop_type = "number"
                    elif p.annotation in (bool, Optional[bool]):
                        prop_type = "boolean"
                    elif p.annotation in (dict, Optional[dict], Optional[dict[str, Any]]):
                        prop_type = "object"
                    elif p.annotation in (list, Optional[list]):
                        prop_type = "array"

                    props[p_name] = {
                        "type": prop_type,
                        "description": f"Parameter {p_name}",
                    }
                    if p.default == inspect.Parameter.empty:
                        required.append(p_name)

                tool_params = {
                    "type": "object",
                    "properties": props,
                    "required": required,
                }

            tool_def = ToolDefinition(
                name=name,
                description=description.strip(),
                category=category,
                parameters=tool_params,
                func=func,
            )
            self._tools[name] = tool_def
            return func

        return decorator

    def get_tool(self, name: str) -> ToolDefinition:
        """Retrieves a registered tool by name."""
        if name not in self._tools:
            raise KeyError(f"Tool '{name}' is not registered in ToolRegistry.")
        return self._tools[name]

    def list_tools(self, category: Optional[str] = None) -> list[ToolDefinition]:
        """Lists all registered tools, optionally filtered by category."""
        if category:
            return [t for t in self._tools.values() if t.category.lower() == category.lower()]
        return list(self._tools.values())

    def get_tools_schema_for_llm(self, categories: Optional[list[str]] = None) -> list[dict[str, Any]]:
        """
        Exports registered tools formatted for LLM system prompts or function calling schemas.
        """
        schemas = []
        for tool in self._tools.values():
            if categories and tool.category not in categories:
                continue
            schemas.append({
                "name": tool.name,
                "description": tool.description,
                "parameters": tool.parameters,
                "category": tool.category,
            })
        return schemas

    def execute_tool(self, name: str, **kwargs) -> Any:
        """Executes a registered tool deterministically."""
        tool = self.get_tool(name)
        try:
            return tool.func(**kwargs)
        except Exception as e:
            logger.error(f"Error executing tool '{name}': {e}", exc_info=True)
            raise ToolExecutionError(f"Execution of tool '{name}' failed: {e}") from e


# Global default registry instance
default_tool_registry = ToolRegistry()


# --- Auto-register analytics and core tools ---

def _register_builtin_tools(registry: ToolRegistry):
    try:
        from backend.app.analytics.kpis import calculate_kpis
        from backend.app.analytics.segmentation import (
            analyze_channels,
            analyze_audiences,
            analyze_campaign_types,
            analyze_duration,
            analyze_geography,
            analyze_companies,
            rank_campaigns,
        )
        from backend.app.analytics.anomalies import detect_anomalies
        from backend.app.data.inspector import inspect_dataset
        from backend.app.data.validator import validate_dataset
        from backend.app.data.cleaner import clean_dataset
        from backend.app.data.profiler import profile_dataset
        from backend.app.agent.visualization_selector import analyze_columns, select_visualization
        from backend.app.agent.plan_validator import validate_dashboard_plan
    except ImportError:
        from app.analytics.kpis import calculate_kpis
        from app.analytics.segmentation import (
            analyze_channels,
            analyze_audiences,
            analyze_campaign_types,
            analyze_duration,
            analyze_geography,
            analyze_companies,
            rank_campaigns,
        )
        from app.analytics.anomalies import detect_anomalies
        from app.data.inspector import inspect_dataset
        from app.data.validator import validate_dataset
        from app.data.cleaner import clean_dataset
        from app.data.profiler import profile_dataset
        from app.agent.visualization_selector import analyze_columns, select_visualization
        from app.agent.plan_validator import validate_dashboard_plan

    # Analytics tools
    registry.register(
        name="calculate_kpis",
        description="Calculates core marketing KPIs: Total Campaigns, Average ROI, Average Conversion Rate, and Average Acquisition Cost.",
        category="analytics",
        parameters={
            "type": "object",
            "properties": {},
        },
    )(calculate_kpis)

    registry.register(
        name="analyze_channels",
        description="Calculates campaign count, avg ROI, avg conversion rate, and avg acquisition cost grouped by Channel_Used. Optionally takes filters (e.g. {'Duration': 30}).",
        category="analytics",
        parameters={
            "type": "object",
            "properties": {
                "filters": {"type": "object", "description": "Optional filters such as Duration, Location, Company"}
            },
        },
    )(analyze_channels)

    registry.register(
        name="analyze_audiences",
        description="Calculates campaign count, avg ROI, avg conversion rate, and avg acquisition cost grouped by Target_Audience. Optionally takes filters.",
        category="analytics",
        parameters={
            "type": "object",
            "properties": {
                "filters": {"type": "object", "description": "Optional filters"}
            },
        },
    )(analyze_audiences)

    registry.register(
        name="analyze_campaign_types",
        description="Calculates performance metrics grouped by Campaign_Type (Search, Social, Display, Email, Video). Optionally takes filters.",
        category="analytics",
        parameters={
            "type": "object",
            "properties": {
                "filters": {"type": "object", "description": "Optional filters"}
            },
        },
    )(analyze_campaign_types)

    registry.register(
        name="analyze_duration",
        description="Calculates performance metrics grouped by campaign Duration (days). Optionally takes filters.",
        category="analytics",
        parameters={
            "type": "object",
            "properties": {
                "filters": {"type": "object", "description": "Optional filters"}
            },
        },
    )(analyze_duration)

    registry.register(
        name="analyze_geography",
        description="Calculates performance metrics grouped by campaign Location / country. Optionally takes filters.",
        category="analytics",
        parameters={
            "type": "object",
            "properties": {
                "filters": {"type": "object", "description": "Optional filters"}
            },
        },
    )(analyze_geography)

    registry.register(
        name="analyze_companies",
        description="Calculates performance metrics grouped by Company for competitive benchmarking. Optionally takes filters.",
        category="analytics",
        parameters={
            "type": "object",
            "properties": {
                "filters": {"type": "object", "description": "Optional filters"}
            },
        },
    )(analyze_companies)

    registry.register(
        name="rank_campaigns",
        description="Ranks individual campaigns by a specific metric (ROI, Conversion_Rate, Acquisition_Cost). Returns top N campaigns.",
        category="analytics",
        parameters={
            "type": "object",
            "properties": {
                "metric": {"type": "string", "description": "Metric to rank by: 'ROI', 'Conversion_Rate', or 'Acquisition_Cost'"},
                "top_n": {"type": "integer", "description": "Number of campaigns to return (default 5)"},
                "ascending": {"type": "boolean", "description": "True for worst/lowest, False for top/best"},
                "filters": {"type": "object", "description": "Optional filters"},
            },
        },
    )(rank_campaigns)

    registry.register(
        name="detect_anomalies",
        description="Detects statistical anomalies and outliers in campaign performance using transparent IQR or z-score methods.",
        category="analytics",
        parameters={
            "type": "object",
            "properties": {
                "method": {"type": "string", "description": "'iqr' or 'zscore'"},
                "columns": {"type": "array", "items": {"type": "string"}, "description": "Metrics to test (default: ROI, Acquisition_Cost, Conversion_Rate)"},
                "threshold": {"type": "number", "description": "Outlier threshold (default 1.5 for IQR, 3.0 for z-score)"},
            },
        },
    )(detect_anomalies)

    # Dataset tools
    registry.register(
        name="inspect_dataset",
        description="Inspects file metadata, shape, column data types, missing values, and sample records.",
        category="dataset",
    )(inspect_dataset)

    registry.register(
        name="validate_dataset",
        description="Validates dataset schema against expected marketing campaign structure and data quality rules.",
        category="dataset",
    )(validate_dataset)

    registry.register(
        name="clean_dataset",
        description="Cleans and normalizes dataset (normalizes duration to days, coerces numerics, trims strings).",
        category="dataset",
    )(clean_dataset)

    registry.register(
        name="profile_dataset",
        description="Computes categorical distributions and numeric summary statistics across the dataset.",
        category="dataset",
    )(profile_dataset)

    # Planning tools
    registry.register(
        name="analyze_columns",
        description="Categorizes columns into roles: identifier, measure, dimension, date/time, geography.",
        category="planning",
    )(analyze_columns)

    registry.register(
        name="select_visualization",
        description="Selects the optimal visualization type based on assigned column roles.",
        category="planning",
    )(select_visualization)

    registry.register(
        name="validate_dashboard_plan",
        description="Validates a dashboard plan JSON structure against Power BI compatibility rules.",
        category="planning",
    )(validate_dashboard_plan)


_register_builtin_tools(default_tool_registry)
