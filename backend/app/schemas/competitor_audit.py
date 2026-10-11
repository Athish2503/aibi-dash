from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any


class CompetitorAuditRequest(BaseModel):
    company_name: str = Field(..., description="Target company name")
    company_url: str = Field(..., description="Target company domain/URL")
    value_proposition: str = Field(..., description="One-sentence product/value proposition")
    competitor_urls: List[str] = Field(
        ...,
        min_length=1,
        max_length=4,
        description="1 to 4 competitor domains"
    )
    primary_objective: str = Field(
        default="Accelerate Qualified Enterprise Pipeline",
        description="Target business objective"
    )


class CompetitorMatrixRow(BaseModel):
    capability: str = Field(..., description="e.g. Pricing Transparency, Trust/Proof, Interactive Demo, AEO/GEO")
    user_state: str = Field(..., description="How the user executes this lever")
    competitor_state: str = Field(..., description="How competitors execute this lever")
    business_impact: str = Field(..., description="Commercial risk or revenue consequence")


class RevenueLeak(BaseModel):
    friction_point: str = Field(..., description="Identified bottleneck on user site")
    competitor_benchmark: str = Field(..., description="What the competitor does instead")
    estimated_revenue_risk: str = Field(..., description="High, Medium, or Low")
    recommended_fix: str = Field(..., description="Actionable immediate solution")


class GrowthBet(BaseModel):
    priority: str = Field(..., description="P1 Critical, P2 High, P3 Medium")
    title: str = Field(..., description="Actionable strategic initiative headline")
    strategic_rationale: str = Field(..., description="Why this works based on competitor proof")
    action_steps: List[str] = Field(..., description="Concrete tactical implementation steps")
    expected_business_lift: str = Field(..., description="Quantified expectation (e.g. +22% MQL conversion)")


class SprintPhase(BaseModel):
    phase_name: str = Field(..., description="e.g. Month 1: Quick-Wins & Conversion Plugs")
    tasks: List[str] = Field(..., description="Concrete task list")


class CompetitorAuditResponse(BaseModel):
    executive_summary: str
    gap_matrix: List[CompetitorMatrixRow]
    revenue_leaks: List[RevenueLeak]
    growth_bets: List[GrowthBet]
    sprint_plan: List[SprintPhase]
    scraped_signals: Optional[Dict[str, Any]] = Field(
        default_factory=dict,
        description="Scraped structural and commercial signals for user and competitors"
    )
