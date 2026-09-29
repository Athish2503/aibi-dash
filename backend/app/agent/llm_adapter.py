from abc import ABC, abstractmethod
from typing import Any, Optional, Type, TypeVar
import json
import logging
import httpx
from pydantic import BaseModel, ValidationError

try:
    from backend.app.config import settings
except ImportError:
    from app.config import settings

logger = logging.getLogger(__name__)

T = TypeVar("T", bound=BaseModel)


class LLMError(Exception):
    """Base exception for LLM provider errors."""
    pass


class LLMAuthenticationError(LLMError):
    """Raised when LLM API authentication fails."""
    pass


class LLMResponseValidationError(LLMError):
    """Raised when LLM response does not conform to the required schema."""
    pass


class LLMAdapter(ABC):
    """Abstract interface for LLM providers (provider-agnostic)."""

    @abstractmethod
    def generate(
        self,
        prompt: str,
        system_instruction: Optional[str] = None,
        response_mime_type: str = "text/plain",
    ) -> str:
        """Generate raw text response from the model."""
        pass

    def generate_structured(
        self,
        prompt: str,
        response_model: Type[T],
        system_instruction: Optional[str] = None,
    ) -> T:
        """Generate structured response validated against a Pydantic model."""
        # Include json schema instruction to guide the LLM
        schema_prompt = (
            f"{prompt}\n\n"
            f"You MUST respond ONLY with valid JSON strictly conforming to this JSON Schema:\n"
            f"{json.dumps(response_model.model_json_schema())}"
        )
        
        raw_text = self.generate(
            prompt=schema_prompt,
            system_instruction=system_instruction,
            response_mime_type="application/json",
        )
        
        # Clean markdown codeblocks if model wrapped output in ```json ... ```
        cleaned_text = raw_text.strip()
        if cleaned_text.startswith("```"):
            lines = cleaned_text.splitlines()
            if lines[0].startswith("```"):
                lines = lines[1:]
            if lines and lines[-1].startswith("```"):
                lines = lines[:-1]
            cleaned_text = "\n".join(lines).strip()

        try:
            return response_model.model_validate_json(cleaned_text)
        except ValidationError as e:
            logger.error(f"Failed to validate LLM response against {response_model.__name__}: {e}")
            raise LLMResponseValidationError(
                f"LLM output did not conform to schema {response_model.__name__}: {e}\nRaw output: {raw_text}"
            ) from e


class GeminiAdapter(LLMAdapter):
    """Google Gemini AI adapter using direct REST API."""

    def __init__(
        self,
        api_key: Optional[str] = None,
        model: Optional[str] = None,
        timeout_seconds: float = 30.0,
    ):
        self.api_key = api_key if api_key is not None else settings.GEMINI_API_KEY
        self.model = model or settings.GEMINI_MODEL or "gemini-3.6-flash"
        self.timeout_seconds = timeout_seconds
        self.base_url = "https://generativelanguage.googleapis.com/v1beta"

        if not self.api_key:
            logger.warning("GeminiAdapter initialized without GEMINI_API_KEY.")

    def generate(
        self,
        prompt: str,
        system_instruction: Optional[str] = None,
        response_mime_type: str = "text/plain",
    ) -> str:
        if not self.api_key:
            raise LLMAuthenticationError("GEMINI_API_KEY is not configured.")

        url = f"{self.base_url}/models/{self.model}:generateContent?key={self.api_key}"

        payload: dict[str, Any] = {
            "contents": [
                {
                    "role": "user",
                    "parts": [{"text": prompt}],
                }
            ],
            "generationConfig": {
                "temperature": 0.2,
                "responseMimeType": response_mime_type,
            },
        }

        if system_instruction:
            payload["systemInstruction"] = {
                "parts": [{"text": system_instruction}]
            }

        try:
            with httpx.Client(timeout=self.timeout_seconds) as client:
                response = client.post(url, json=payload)
        except httpx.RequestError as e:
            raise LLMError(f"Network error communicating with Gemini API: {e}") from e

        if response.status_code == 400 or response.status_code == 401 or response.status_code == 403:
            raise LLMAuthenticationError(
                f"Gemini API authentication/request error ({response.status_code}): {response.text}"
            )
        elif response.status_code != 200:
            raise LLMError(f"Gemini API returned HTTP {response.status_code}: {response.text}")

        data = response.json()
        try:
            candidates = data.get("candidates", [])
            if not candidates:
                raise LLMError(f"No response candidates returned by Gemini: {data}")
            
            parts = candidates[0].get("content", {}).get("parts", [])
            if not parts:
                raise LLMError(f"Candidate contains no content parts: {candidates[0]}")

            return parts[0].get("text", "")
        except (KeyError, IndexError) as e:
            raise LLMError(f"Failed to parse Gemini response payload: {e}") from e


class OllamaAdapter(LLMAdapter):
    """Ollama AI adapter using local REST API (e.g. Llama 3 / Llama 3.2)."""

    def __init__(
        self,
        base_url: Optional[str] = None,
        model: Optional[str] = None,
        timeout_seconds: float = 60.0,
    ):
        raw_url = base_url or getattr(settings, "OLLAMA_BASE_URL", None) or "http://127.0.0.1:11434"
        if "localhost" in raw_url:
            raw_url = raw_url.replace("localhost", "127.0.0.1")
        self.base_url = raw_url.rstrip("/")
        self.model = model or getattr(settings, "OLLAMA_MODEL", None) or "llama3.2:1b"
        self.timeout_seconds = timeout_seconds

    def is_available(self) -> bool:
        """Check if local Ollama server is running and reachable."""
        try:
            with httpx.Client(timeout=1.0) as client:
                res = client.get(f"{self.base_url}/api/tags")
                return res.status_code == 200
        except Exception:
            return False

    def list_installed_models(self) -> list[str]:
        """Fetch list of models available in the local Ollama instance."""
        try:
            with httpx.Client(timeout=1.5) as client:
                res = client.get(f"{self.base_url}/api/tags")
                if res.status_code == 200:
                    data = res.json()
                    return [m.get("name") for m in data.get("models", []) if m.get("name")]
        except Exception as e:
            logger.debug(f"Could not query Ollama models: {e}")
        return []

    def generate(
        self,
        prompt: str,
        system_instruction: Optional[str] = None,
        response_mime_type: str = "text/plain",
    ) -> str:
        # Prefer Ollama /api/chat endpoint for clean conversational roles and reliable instruction following
        chat_url = f"{self.base_url}/api/chat"
        sys_msg = system_instruction or "You are an internal corporate data reporting assistant. You summarize internal database metrics for Power BI dashboards. Present the data clearly with Markdown formatting and bullet points."
        
        chat_payload: dict[str, Any] = {
            "model": self.model,
            "messages": [
                {"role": "system", "content": sys_msg},
                {"role": "user", "content": prompt},
            ],
            "stream": False,
            "options": {
                "temperature": 0.2,
                "num_predict": 1024,
            },
        }
        if response_mime_type == "application/json":
            chat_payload["format"] = "json"

        raw_output = ""
        try:
            with httpx.Client(timeout=25.0) as client:
                response = client.post(chat_url, json=chat_payload)
                if response.status_code == 200:
                    data = response.json()
                    raw_output = data.get("message", {}).get("content", "")
                else:
                    # Fallback to /api/generate
                    gen_url = f"{self.base_url}/api/generate"
                    gen_payload: dict[str, Any] = {
                        "model": self.model,
                        "prompt": prompt,
                        "system": sys_msg,
                        "stream": False,
                        "options": {"temperature": 0.2, "num_predict": 1024},
                    }
                    if response_mime_type == "application/json":
                        gen_payload["format"] = "json"
                    gen_res = client.post(gen_url, json=gen_payload)
                    if gen_res.status_code == 200:
                        raw_output = gen_res.json().get("response", "")
                    else:
                        raise LLMError(f"Ollama returned HTTP {gen_res.status_code}: {gen_res.text}")
        except httpx.ConnectError as e:
            raise LLMError(f"Ollama server is unreachable at {self.base_url}. Ensure 'ollama serve' is running.") from e
        except httpx.TimeoutException as e:
            raise LLMError(f"Ollama request timed out after 25 seconds.") from e
        except httpx.RequestError as e:
            raise LLMError(f"Network error communicating with Ollama API: {e}") from e

        # Check for model refusal text or empty output and raise so caller falls back to deterministic answer
        refusal_triggers = [
            "i can't provide",
            "i cannot provide",
            "i am unable to provide",
            "i can't give",
            "cannot provide financial",
            "i cannot fulfill",
            "cannot provide a response",
        ]
        if not raw_output.strip() or any(trig in raw_output.lower() for trig in refusal_triggers):
            raise LLMError(f"Ollama model output refused or empty: {raw_output}")

        return raw_output


class MockLLMAdapter(LLMAdapter):
    """Mock LLM adapter for deterministic, network-free testing."""

    def __init__(self, canned_responses: Optional[dict[str, str]] = None, default_response: str = "{}"):
        self.canned_responses = canned_responses or {}
        self.default_response = default_response
        self.call_history: list[dict[str, Any]] = []

    def generate(
        self,
        prompt: str,
        system_instruction: Optional[str] = None,
        response_mime_type: str = "text/plain",
    ) -> str:
        self.call_history.append({
            "prompt": prompt,
            "system_instruction": system_instruction,
            "response_mime_type": response_mime_type,
        })
        for trigger, response in self.canned_responses.items():
            if trigger in prompt:
                return response
        return self.default_response


import sys

# Global runtime active configuration (can be updated dynamically via UI/API)
_RUNTIME_MODEL_CONFIG: dict[str, str] = {
    "provider": "mock" if "pytest" in sys.modules else getattr(settings, "LLM_PROVIDER", "gemini"),
    "model": getattr(settings, "GEMINI_MODEL", "gemini-3.6-flash"),
}


def set_runtime_model(provider: str, model: str) -> dict[str, str]:
    """Updates the active LLM provider and model for the entire system."""
    _RUNTIME_MODEL_CONFIG["provider"] = provider
    _RUNTIME_MODEL_CONFIG["model"] = model
    logger.info(f"Switched active AI model to: provider={provider}, model={model}")
    return dict(_RUNTIME_MODEL_CONFIG)


def get_runtime_model() -> dict[str, str]:
    """Returns the current active LLM provider and model."""
    return dict(_RUNTIME_MODEL_CONFIG)


def get_available_models() -> dict[str, Any]:
    """Inspects system and returns available models and providers."""
    ollama_models = []
    ollama_online = False
    try:
        ollama_test = OllamaAdapter()
        installed = ollama_test.list_installed_models()
        if installed:
            ollama_online = True
            for m in installed:
                is_llama = "llama" in m.lower() or "mistral" in m.lower()
                ollama_models.append({
                    "id": m,
                    "name": f"{m} (Local)",
                    "provider": "ollama",
                    "badge": "Llama Family" if is_llama else "Local Model",
                    "family": "llama" if is_llama else "ollama",
                })
        else:
            ollama_online = ollama_test.is_available()
    except Exception as e:
        logger.warning(f"Error checking Ollama status: {e}")

    # Fallback default llama models if none returned from active server
    if not ollama_models:
        ollama_models = [
            {"id": "llama3.2:1b", "name": "Llama 3.2 1B (Ollama)", "provider": "ollama", "badge": "Fast Local", "family": "llama"},
            {"id": "llama3:8b", "name": "Llama 3 8B (Ollama)", "provider": "ollama", "badge": "High Accuracy", "family": "llama"},
            {"id": "mistral:7b", "name": "Mistral 7B (Ollama)", "provider": "ollama", "badge": "Llama Architecture", "family": "llama"},
        ]

    cloud_models = [
        {"id": "gemini-3.6-flash", "name": "Gemini 3.6 Flash", "provider": "gemini", "badge": "Cloud Fast", "family": "gemini"},
        {"id": "gemini-2.5-pro", "name": "Gemini 2.5 Pro", "provider": "gemini", "badge": "Cloud Reasoning", "family": "gemini"},
    ]

    current = get_runtime_model()

    return {
        "active_provider": current["provider"],
        "active_model": current["model"],
        "ollama_online": ollama_online,
        "models": [
            *ollama_models,
            *cloud_models,
            {"id": "deterministic", "name": "Deterministic Engine (No LLM)", "provider": "mock", "badge": "Grounded Tool Truth", "family": "tools"},
        ],
    }


def get_llm_adapter(
    provider: Optional[str] = None,
    model: Optional[str] = None,
) -> LLMAdapter:
    """Factory function to get the configured LLM adapter."""
    selected_provider = provider or _RUNTIME_MODEL_CONFIG.get("provider") or settings.LLM_PROVIDER
    selected_model = model or _RUNTIME_MODEL_CONFIG.get("model")

    if selected_provider == "ollama":
        return OllamaAdapter(model=selected_model)
    elif selected_provider == "gemini":
        return GeminiAdapter(model=selected_model)
    elif selected_provider == "mock" or selected_model == "deterministic":
        return MockLLMAdapter()
    elif provider is not None:
        raise ValueError(f"Unsupported LLM provider: '{provider}'. Supported: 'ollama', 'gemini', 'mock'.")
    else:
        # Fallback to Ollama or Gemini based on availability
        try:
            ollama = OllamaAdapter(model=selected_model)
            if ollama.is_available():
                return ollama
        except Exception:
            pass
        return GeminiAdapter(model=selected_model)

