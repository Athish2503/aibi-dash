import pytest
from pydantic import BaseModel

from backend.app.agent.llm_adapter import (
    GeminiAdapter,
    LLMAuthenticationError,
    LLMResponseValidationError,
    MockLLMAdapter,
    get_llm_adapter,
)


class DummyResponse(BaseModel):
    summary: str
    count: int


def test_mock_llm_adapter_structured():
    mock_json = '{"summary": "Top performing channels identified", "count": 5}'
    adapter = MockLLMAdapter(default_response=mock_json)

    result = adapter.generate_structured("Analyze channels", DummyResponse)
    assert isinstance(result, DummyResponse)
    assert result.summary == "Top performing channels identified"
    assert result.count == 5


def test_mock_llm_adapter_markdown_strip():
    mock_markdown = '```json\n{"summary": "Cleaned JSON inside markdown", "count": 10}\n```'
    adapter = MockLLMAdapter(default_response=mock_markdown)

    result = adapter.generate_structured("Analyze markdown output", DummyResponse)
    assert result.count == 10
    assert result.summary == "Cleaned JSON inside markdown"


def test_mock_llm_adapter_validation_error():
    invalid_json = '{"invalid_field": 123}'
    adapter = MockLLMAdapter(default_response=invalid_json)

    with pytest.raises(LLMResponseValidationError):
        adapter.generate_structured("Prompt expecting DummyResponse", DummyResponse)


def test_gemini_adapter_missing_key():
    adapter = GeminiAdapter(api_key="")
    with pytest.raises(LLMAuthenticationError):
        adapter.generate("Hello world")


def test_get_llm_adapter_factory():
    mock_adapter = get_llm_adapter("mock")
    assert isinstance(mock_adapter, MockLLMAdapter)

    with pytest.raises(ValueError):
        get_llm_adapter("unknown_provider")
