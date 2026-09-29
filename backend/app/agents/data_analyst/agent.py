from typing import Any, Optional
import pandas as pd
from pydantic import BaseModel, Field
from backend.app.semantic.metric_resolver import MetricResolver, SemanticResolutionResult
from backend.app.agents.data_analyst.query_planner import AnalystQueryPlanner
from backend.app.agents.data_analyst.evidence_builder import EvidenceBuilder, EvidenceItem


class AnalystResponse(BaseModel):
    summary: str
    detailed_findings: list[str] = Field(default_factory=list)
    evidence: list[EvidenceItem] = Field(default_factory=list)
    raw_data: dict[str, Any] = Field(default_factory=dict)
    visual_spec: Optional[dict[str, Any]] = None


class DataAnalystAgent:
    """
    Data Analyst Agent:
    Specialized agent for deterministic KPI calculation, filtering, aggregation, and ranking.
    Adheres strictly to the invariant: Never invent numbers.
    """

    def analyze(
        self,
        df: pd.DataFrame,
        query: str,
        filters: Optional[dict[str, Any]] = None,
        semantic: Optional[SemanticResolutionResult] = None,
    ) -> AnalystResponse:
        if df is None or df.empty:
            return AnalystResponse(summary="The dataset is empty. No analysis can be performed.")

        semantic_res = semantic or MetricResolver.resolve_query(query)
        results = AnalystQueryPlanner.execute_analysis(df, semantic_res, filters=filters)

        kpis = results.get("kpis", {})
        evidence_items: list[EvidenceItem] = EvidenceBuilder.from_kpis(kpis)
        findings: list[str] = []

        findings.append(
            f"Dataset contains {kpis.get('total_campaigns', 0):,} active campaigns with an Average ROI of "
            f"{kpis.get('average_roi', 0.0)}x, Average CAC of ${kpis.get('average_acquisition_cost', 0.0)}, "
            f"and Average Conversion Rate of {round(kpis.get('average_conversion_rate', 0.0) * 100, 2)}%."
        )

        visual_spec = None

        # Process channel breakdowns
        if "channels" in results and results["channels"]:
            channels = results["channels"]
            evidence_items.extend(EvidenceBuilder.from_breakdown("analyze_channels", "Channel_Used", channels))
            top_ch = channels[0]
            bot_ch = channels[-1]
            findings.append(
                f"Top channel by ROI is {top_ch.get('Channel_Used')} ({top_ch.get('average_roi')}x ROI, "
                f"${top_ch.get('average_acquisition_cost')} CAC) compared to {bot_ch.get('Channel_Used')} "
                f"({bot_ch.get('average_roi')}x ROI)."
            )
            # Create standard visual spec
            chart_data = [
                {
                    "name": str(c.get("Channel_Used")),
                    "ROI": c.get("average_roi"),
                    "CAC": c.get("average_acquisition_cost"),
                    "Conversion_Rate": round(c.get("average_conversion_rate", 0) * 100, 2),
                }
                for c in channels
            ]
            visual_spec = {
                "type": "bar",
                "title": "Cross-Channel ROI & CAC Comparison",
                "xAxis": "name",
                "yAxis": "ROI",
                "data": chart_data,
                "secondaryYAxis": "CAC",
            }

        # Process audience breakdowns
        if "audiences" in results and results["audiences"]:
            audiences = results["audiences"]
            evidence_items.extend(EvidenceBuilder.from_breakdown("analyze_audiences", "Target_Audience", audiences))
            top_aud = audiences[0]
            findings.append(
                f"Highest yield demographic cohort is {top_aud.get('Target_Audience')} with "
                f"{top_aud.get('average_roi')}x ROI."
            )

        # Process correlations
        if "correlations" in results and results["correlations"].get("key_correlations"):
            top_corr = results["correlations"]["key_correlations"][0]
            findings.append(f"Notable statistical relationship: {top_corr.get('description')}.")

        summary = f"Completed deterministic analysis for '{query}'. " + findings[0]

        return AnalystResponse(
            summary=summary,
            detailed_findings=findings,
            evidence=evidence_items,
            raw_data=results,
            visual_spec=visual_spec,
        )
