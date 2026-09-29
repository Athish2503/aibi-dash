import threading
import time
from typing import Any, Optional
from datetime import datetime, timezone
from pydantic import BaseModel, Field


class AgentTraceSpan(BaseModel):
    span_id: str
    trace_id: str
    agent_name: str
    tool_name: str
    input_payload: dict[str, Any]
    output_summary: str
    duration_ms: float
    status: str = "success"
    error: Optional[str] = None
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class ObservabilityTracer:
    """
    In-memory, auditable Agent Trace Viewer and Observability Engine.
    Exposes structured execution trees (spans, durations, status, tool arguments).
    """

    def __init__(self):
        self._lock = threading.Lock()
        self._spans: list[AgentTraceSpan] = []

    def record_span(
        self,
        trace_id: str,
        agent_name: str,
        tool_name: str,
        input_payload: dict[str, Any],
        output_summary: str,
        duration_ms: float,
        status: str = "success",
        error: Optional[str] = None,
    ) -> AgentTraceSpan:
        span = AgentTraceSpan(
            span_id=f"span_{len(self._spans)+1}_{int(time.time()*1000)%100000}",
            trace_id=trace_id,
            agent_name=agent_name,
            tool_name=tool_name,
            input_payload=input_payload,
            output_summary=output_summary[:300],
            duration_ms=round(duration_ms, 2),
            status=status,
            error=error,
        )
        with self._lock:
            self._spans.append(span)
            if len(self._spans) > 1000:
                self._spans = self._spans[-800:]
        return span

    def get_traces_by_id(self, trace_id: str) -> list[AgentTraceSpan]:
        with self._lock:
            return [s for s in self._spans if s.trace_id == trace_id]

    def get_recent_spans(self, limit: int = 50) -> list[AgentTraceSpan]:
        with self._lock:
            return list(self._spans[-limit:])

    def clear(self) -> None:
        with self._lock:
            self._spans.clear()


observability_tracer = ObservabilityTracer()
