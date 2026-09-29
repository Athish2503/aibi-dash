from typing import Any, Optional
from enum import Enum
from pydantic import BaseModel, Field


class GoalPriority(str, Enum):
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"


class TargetStatus(str, Enum):
    EXCEEDED = "exceeded"
    ON_TRACK = "on_track"
    AT_RISK = "at_risk"
    OFF_TRACK = "off_track"


class KPITarget(BaseModel):
    metric_name: str = Field(description="Name of metric: e.g. ROI, Acquisition_Cost, Conversion_Rate")
    target_value: float = Field(description="Target numerical value")
    comparison_operator: str = Field(default=">=", description="'>=', '<=', '>', '<', '=='")
    unit: str = Field(default="", description="'USD', '%', 'ratio'")
    tolerance_pct: float = Field(default=5.0, description="Tolerance before marking AT_RISK")


class BusinessGoal(BaseModel):
    id: str = Field(description="Unique goal identifier")
    name: str = Field(description="Goal title: e.g. 'Improve Paid Media ROI'")
    description: Optional[str] = None
    priority: GoalPriority = GoalPriority.HIGH
    related_metrics: list[str] = Field(default_factory=list)


class BusinessRule(BaseModel):
    id: str = Field(description="Unique rule identifier")
    name: str = Field(description="e.g. 'Max Allowable CAC'")
    metric_name: str
    condition: str = Field(description="e.g. '<= 45.0'")
    severity: str = Field(default="warning", description="'warning', 'critical'")
    action_message: str = Field(description="Guidance when rule is breached")


class CompanyContext(BaseModel):
    company_name: str = Field(default="Enterprise Organization")
    industry: str = Field(default="Digital Marketing & E-Commerce")
    business_model: str = Field(default="B2C / Performance Marketing")
    fiscal_period: str = Field(default="FY2026")
    primary_goal: Optional[str] = Field(default="Maximize Cross-Channel Marketing ROI")
    targets: list[KPITarget] = Field(default_factory=list)
    goals: list[BusinessGoal] = Field(default_factory=list)
    rules: list[BusinessRule] = Field(default_factory=list)
    key_dimensions: list[str] = Field(default_factory=lambda: ["Channel_Used", "Location", "Campaign_Type", "Target_Audience"])
