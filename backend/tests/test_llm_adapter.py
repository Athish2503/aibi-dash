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


def test_groq_adapter_missing_key():
    from backend.app.agent.llm_adapter import GroqAdapter
    adapter = GroqAdapter(api_key="")
    with pytest.raises(LLMAuthenticationError):
        adapter.generate("Hello world")


def test_get_llm_adapter_factory():
    mock_adapter = get_llm_adapter("mock")
    assert isinstance(mock_adapter, MockLLMAdapter)

    from backend.app.agent.llm_adapter import GroqAdapter
    groq_adapter = get_llm_adapter("groq", "openai/gpt-oss-120b")
    assert isinstance(groq_adapter, GroqAdapter)

    # Test 'grok' alias routes to GroqAdapter
    grok_adapter = get_llm_adapter("grok", "openai/gpt-oss-120b")
    assert isinstance(grok_adapter, GroqAdapter)

    with pytest.raises(ValueError):
        get_llm_adapter("unknown_provider")


def test_ollama_adapter_and_runtime_switching():
    from backend.app.agent.llm_adapter import (
        OllamaAdapter,
        GroqAdapter,
        set_runtime_model,
        get_runtime_model,
        get_available_models,
    )
    # Test adapter instantiation
    ollama = OllamaAdapter(model="llama3.2:1b")
    assert ollama.model == "llama3.2:1b"
    assert "11434" in ollama.base_url

    # Test factory with ollama
    ollama_from_factory = get_llm_adapter("ollama", "llama3.2:1b")
    assert isinstance(ollama_from_factory, OllamaAdapter)

    # Test runtime switching to Groq/Grok
    set_runtime_model("groq", "openai/gpt-oss-120b")
    current = get_runtime_model()
    assert current["provider"] == "groq"
    assert current["model"] == "openai/gpt-oss-120b"

    # Test runtime switching with grok alias
    set_runtime_model("grok", "openai/gpt-oss-120b")
    current = get_runtime_model()
    assert current["provider"] == "groq"

    # Test model listing includes Groq/Grok
    models_info = get_available_models()
    assert "models" in models_info
    assert any(m["provider"] == "groq" for m in models_info["models"])


def test_live_groq_api_call():
    from backend.app.config import settings
    from backend.app.agent.llm_adapter import GroqAdapter
    if not settings.GROQ_API_KEY:
        pytest.skip("GROQ_API_KEY not configured")

    adapter = GroqAdapter(timeout_seconds=20.0)
    response = adapter.generate("Respond with ONLY the word: SUCCESS")
    assert "SUCCESS" in response.upper()

