from enum import Enum
from typing import Optional
from datetime import datetime, timezone
from pydantic import BaseModel, Field


class PublishingState(str, Enum):
    NOT_CONFIGURED = "NOT_CONFIGURED"
    AUTHENTICATED = "AUTHENTICATED"
    WORKSPACE_READY = "WORKSPACE_READY"
    MODEL_CREATED = "MODEL_CREATED"
    REPORT_CREATED = "REPORT_CREATED"
    PUBLISHED = "PUBLISHED"
    REFRESHED = "REFRESHED"
    FAILED = "FAILED"


class PublishStepStatus(BaseModel):
    step: str
    state: PublishingState
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    details: Optional[str] = None


class PublishRequest(BaseModel):
    artifact_id: str = Field(description="Identifier of generated Power BI project bundle to publish")
    workspace_id: Optional[str] = Field(default=None, description="Optional override for target workspace ID")
    target_report_name: Optional[str] = Field(default=None, description="Optional custom name for published report")


class RefreshRequest(BaseModel):
    dataset_id: str = Field(description="ID of dataset to refresh in Power BI Service")
    workspace_id: Optional[str] = Field(default=None, description="Workspace ID")


class PublishingResult(BaseModel):
    state: PublishingState
    artifact_id: str
    report_name: str
    workspace_id: Optional[str] = None
    report_id: Optional[str] = None
    dataset_id: Optional[str] = None
    web_url: Optional[str] = None
    embed_url: Optional[str] = None
    steps: list[PublishStepStatus] = Field(default_factory=list)
    is_mock: bool = False
    error: Optional[str] = None


class ServiceConfigStatus(BaseModel):
    configured: bool
    client_id_set: bool
    tenant_id_set: bool
    secret_set: bool
    workspace_id_set: bool
    mock_mode: bool
    authority_url: str
    notes: str


class RefreshResult(BaseModel):
    success: bool
    dataset_id: str
    refresh_status: str
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    message: str
