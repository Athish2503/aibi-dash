from typing import Any, Optional
from enum import Enum
from pydantic import BaseModel, Field


class AgentType(str, Enum):
    DATA_ANALYST = "data_analyst"
    INVESTIGATOR = "investigator"
    ANOMALY_AGENT = "anomaly_agent"
    POWERBI_AGENT = "powerbi_agent"
    SCENARIO_AGENT = "scenario_agent"
    RECOMMENDATION_AGENT = "recommendation_agent"
    EXECUTIVE_AGENT = "executive_agent"
    SUPERVISOR = "supervisor"


class TaskStatus(str, Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    SKIPPED = "skipped"


class TaskNode(BaseModel):
    id: str
    title: str
    agent_type: AgentType
    action: str
    params: dict[str, Any] = Field(default_factory=dict)
    dependencies: list[str] = Field(default_factory=list)
    status: TaskStatus = TaskStatus.PENDING
    result: Optional[Any] = None
    error: Optional[str] = None


class TaskGraph(BaseModel):
    graph_id: str
    goal: str
    nodes: list[TaskNode] = Field(default_factory=list)

    def add_node(self, node: TaskNode) -> None:
        self.nodes.append(node)

    def get_node(self, node_id: str) -> Optional[TaskNode]:
        for n in self.nodes:
            if n.id == node_id:
                return n
        return None

    def get_ready_nodes(self) -> list[TaskNode]:
        completed_ids = {n.id for n in self.nodes if n.status == TaskStatus.COMPLETED}
        ready = []
        for n in self.nodes:
            if n.status == TaskStatus.PENDING:
                if all(dep in completed_ids for dep in n.dependencies):
                    ready.append(n)
        return ready

    def is_finished(self) -> bool:
        return all(n.status in (TaskStatus.COMPLETED, TaskStatus.FAILED, TaskStatus.SKIPPED) for n in self.nodes)
