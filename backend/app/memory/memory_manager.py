import threading
from typing import Any, Optional
from datetime import datetime, timezone
from pydantic import BaseModel, Field


class MemoryEntry(BaseModel):
    id: str
    entry_type: str = Field(description="'conversation', 'investigation', 'anomaly', 'decision'")
    dataset_id: str
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    content: dict[str, Any]
    tags: list[str] = Field(default_factory=list)


class ConversationTurn(BaseModel):
    role: str = Field(description="'user' or 'assistant'")
    text: str
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    entities_mentioned: list[str] = Field(default_factory=list)


class MemoryManager:
    """
    Unified Agent Memory Manager:
    Maintains 3 distinct tiers of memory:
    1. Conversation Memory (Multi-turn dialogue history)
    2. Analytical Memory (Past investigations, detected anomalies, what-if simulations)
    3. Business Memory (Corporate goals, KPI targets, business constraints)
    """

    def __init__(self):
        self._lock = threading.Lock()
        self._conversation_history: dict[str, list[ConversationTurn]] = {}
        self._analytical_memory: dict[str, list[MemoryEntry]] = {}

    def add_turn(self, session_id: str, role: str, text: str, entities: list[str] = None) -> None:
        with self._lock:
            if session_id not in self._conversation_history:
                self._conversation_history[session_id] = []
            self._conversation_history[session_id].append(
                ConversationTurn(role=role, text=text, entities_mentioned=entities or [])
            )

    def get_conversation_history(self, session_id: str, limit: int = 10) -> list[ConversationTurn]:
        with self._lock:
            history = self._conversation_history.get(session_id, [])
            return history[-limit:]

    def record_analytical_memory(
        self,
        dataset_id: str,
        entry_type: str,
        content: dict[str, Any],
        tags: list[str] = None,
    ) -> MemoryEntry:
        entry = MemoryEntry(
            id=f"mem_{datetime.now(timezone.utc).strftime('%Y%m%d%H%M%S%f')}",
            entry_type=entry_type,
            dataset_id=dataset_id,
            content=content,
            tags=tags or [],
        )
        with self._lock:
            if dataset_id not in self._analytical_memory:
                self._analytical_memory[dataset_id] = []
            self._analytical_memory[dataset_id].append(entry)
        return entry

    def retrieve_analytical_memories(
        self, dataset_id: str, entry_type: Optional[str] = None
    ) -> list[MemoryEntry]:
        with self._lock:
            entries = self._analytical_memory.get(dataset_id, [])
            if entry_type:
                return [e for e in entries if e.entry_type == entry_type]
            return list(entries)

    def clear(self) -> None:
        with self._lock:
            self._conversation_history.clear()
            self._analytical_memory.clear()


memory_manager = MemoryManager()
