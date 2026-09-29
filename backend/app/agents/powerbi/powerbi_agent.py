from typing import Any, Optional
from pydantic import BaseModel, Field
from backend.app.agents.powerbi.dax_agent import DAXIntelligenceAgent, DAXAgentResult
from backend.app.agents.powerbi.visual_agent import VisualIntelligenceAgent, VisualCompositionPlan
from backend.app.agent.plan_schemas import DashboardPlan, MeasureSpec


class PowerBIAgentResponse(BaseModel):
    action_type: str
    dax_result: Optional[DAXAgentResult] = None
    visual_composition: Optional[VisualCompositionPlan] = None
    summary: str


class PowerBICopilotAgent:
    """
    Unified Power BI Copilot Agent:
    Handles natural language DAX authoring/repair and visual composition recommendations.
    """

    def __init__(self):
        self.dax_agent = DAXIntelligenceAgent()
        self.visual_agent = VisualIntelligenceAgent()

    def handle_dax_request(
        self,
        prompt: str,
        table_name: str = "Campaigns",
        available_columns: Optional[list[str]] = None,
    ) -> PowerBIAgentResponse:
        result = self.dax_agent.generate_and_verify_measure(
            prompt=prompt,
            table_name=table_name,
            available_columns=available_columns,
        )
        status_msg = "verified and valid" if result.is_valid else "requires review"
        summary = (
            f"Generated measure '{result.measure_name}' ({status_msg}): "
            f"`{result.dax_expression}`. {result.explanation}"
        )
        return PowerBIAgentResponse(
            action_type="dax_generation",
            dax_result=result,
            summary=summary,
        )

    def handle_visual_request(self, intent: str, metric: str = "ROI") -> PowerBIAgentResponse:
        composition = self.visual_agent.recommend_composition(intent=intent, metric=metric)
        summary = (
            f"Recommended {len(composition.visuals)}-visual composition: '{composition.composition_title}'. "
            f"{composition.executive_takeaway}"
        )
        return PowerBIAgentResponse(
            action_type="visual_composition",
            visual_composition=composition,
            summary=summary,
        )
