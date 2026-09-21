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


def get_llm_adapter(provider: Optional[str] = None) -> LLMAdapter:
    """Factory function to get the configured LLM adapter."""
    selected_provider = provider or settings.LLM_PROVIDER
    if selected_provider == "gemini":
        return GeminiAdapter()
    elif selected_provider == "mock":
        return MockLLMAdapter()
    else:
        raise ValueError(f"Unsupported LLM provider: {selected_provider}")
