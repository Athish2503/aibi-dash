import pytest
import pandas as pd
from backend.app.agent.tool_registry import ToolRegistry, default_tool_registry, ToolExecutionError


def test_default_tool_registry_populated():
    tools = default_tool_registry.list_tools()
    tool_names = [t.name for t in tools]

    # Required tool groups from AGENT_DESIGN.md
    assert "calculate_kpis" in tool_names
    assert "analyze_channels" in tool_names
    assert "analyze_audiences" in tool_names
    assert "analyze_campaign_types" in tool_names
    assert "analyze_duration" in tool_names
    assert "analyze_geography" in tool_names
    assert "analyze_companies" in tool_names
    assert "rank_campaigns" in tool_names
    assert "detect_anomalies" in tool_names
    assert "inspect_dataset" in tool_names
    assert "clean_dataset" in tool_names


def test_tool_registry_execution():
    custom_registry = ToolRegistry()

    @custom_registry.register(name="add_numbers", description="Adds two numbers", category="math")
    def add(a: int, b: int) -> int:
        return a + b

    result = custom_registry.execute_tool("add_numbers", a=5, b=10)
    assert result == 15


def test_tool_registry_nonexistent_tool():
    custom_registry = ToolRegistry()
    with pytest.raises(KeyError):
        custom_registry.execute_tool("nonexistent_tool")


def test_tool_schema_export():
    schemas = default_tool_registry.get_tools_schema_for_llm(categories=["analytics"])
    assert len(schemas) > 0
    for s in schemas:
        assert "name" in s
        assert "description" in s
        assert "parameters" in s
        assert s["category"] == "analytics"
