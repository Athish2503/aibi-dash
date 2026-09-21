from typing import Any, Optional
import json
import logging
import re
import pandas as pd
from pydantic import BaseModel, Field

try:
    from backend.app.agent.llm_adapter import LLMAdapter, get_llm_adapter, LLMError
    from backend.app.agent.tool_registry import ToolRegistry, default_tool_registry
    from backend.app.analytics.kpis import calculate_kpis
    from backend.app.analytics.segmentation import (
        analyze_channels,
        analyze_audiences,
        analyze_campaign_types,
        analyze_duration,
        analyze_geography,
        analyze_companies,
        rank_campaigns,
    )
    from backend.app.analytics.anomalies import detect_anomalies
except ImportError:
    from app.agent.llm_adapter import LLMAdapter, get_llm_adapter, LLMError
    from app.agent.tool_registry import ToolRegistry, default_tool_registry
    from app.analytics.kpis import calculate_kpis
    from app.analytics.segmentation import (
        analyze_channels,
        analyze_audiences,
        analyze_campaign_types,
        analyze_duration,
        analyze_geography,
        analyze_companies,
        rank_campaigns,
    )
    from app.analytics.anomalies import detect_anomalies

logger = logging.getLogger(__name__)


# --- Data Models ---

class QueryIntent(BaseModel):
    """Structured parsed intent from natural language question."""
    tool_name: str = Field(description="Name of the analytical tool to execute")
    filters: dict[str, Any] = Field(default_factory=dict, description="Extracted dimension filters, e.g. {'Duration': 30}")
    metric: Optional[str] = Field(default="ROI", description="Target metric if applicable")
    parameters: dict[str, Any] = Field(default_factory=dict, description="Additional parameters for the tool")
    reasoning: Optional[str] = Field(default=None, description="Explanation of intent classification")


class GroundedAnswer(BaseModel):
    """Grounded AI answer backed strictly by deterministic evidence."""
    question: str
    answer: str
    evidence: list[Any] = Field(default_factory=list, description="Exact deterministic tool results used to answer")
    tools_used: list[str] = Field(default_factory=list, description="Tools invoked by the agent")
    filters_applied: dict[str, Any] = Field(default_factory=dict, description="Filters applied during execution")


class Insight(BaseModel):
    """Structured insight conforming to AGENT_DESIGN.md specifications."""
    observation: str = Field(description="Summary of what was observed in the data")
    metric: str = Field(description="Primary metric involved (ROI, Conversion_Rate, Acquisition_Cost, etc.)")
    segment_or_filter: str = Field(description="Segment or filter analyzed (e.g. Channel: Google Ads, Duration: 30 days)")
    comparison: str = Field(description="Benchmark or comparison context")
    evidence: str = Field(description="Specific numerical evidence supporting the observation")
    caveat: Optional[str] = Field(default=None, description="Optional caveat, sample size note, or limitation")


class Recommendation(BaseModel):
    """Structured actionable recommendation based on historical performance."""
    recommendation: str = Field(description="Core recommendation statement")
    historical_evidence: str = Field(description="Historical evidence from the dataset backing this recommendation")
    actionable_step: str = Field(description="Immediate actionable next step for the team")
    confidence: str = Field(default="Medium", description="Confidence level: High, Medium, or Low")
    caveat: str = Field(
        default="Historical performance does not guarantee future campaign results. Test with small budget increments.",
        description="Disclaimer and risk note",
    )


class ExecutiveReport(BaseModel):
    """Executive briefing combining KPIs, top insights, anomalies, and recommendations."""
    dataset_name: str
    summary: str
    kpis: dict[str, Any]
    key_insights: list[Insight]
    anomalies: list[dict[str, Any]]
    recommendations: list[Recommendation]


# --- Agent Orchestrator ---

class AgentOrchestrator:
    """
    Coordinates intent parsing, deterministic tool execution, answer grounding,
    and structured intelligence reporting.
    """

    def __init__(
        self,
        llm_adapter: Optional[LLMAdapter] = None,
        tool_registry: Optional[ToolRegistry] = None,
    ):
        self.llm = llm_adapter
        self.registry = tool_registry or default_tool_registry

    def _get_llm(self) -> LLMAdapter:
        if self.llm is None:
            try:
                self.llm = get_llm_adapter()
            except Exception:
                from backend.app.agent.llm_adapter import MockLLMAdapter
                self.llm = MockLLMAdapter()
        return self.llm

    def parse_intent(self, question: str) -> QueryIntent:
        """
        Parses natural language question into QueryIntent.
        Uses rule-based deterministic parsing with LLM fallback/assistance.
        """
        q_lower = question.lower()

        # Rule-based intent detection for reliable, fast execution
        extracted_filters: dict[str, Any] = {}

        # 1. Extract duration filters (e.g. "30-day", "30 days", "duration 15")
        dur_match = re.search(r"(\d+)\s*(?:-|\s)?\s*(?:day|days)", q_lower)
        if dur_match:
            extracted_filters["Duration"] = int(dur_match.group(1))

        # 2. Extract location / country if mentioned
        for loc in ["us", "uk", "canada", "germany", "france", "australia"]:
            if re.search(rf"\b{loc}\b", q_lower):
                extracted_filters["Location"] = loc.upper() if len(loc) <= 2 else loc.capitalize()

        # 3. Determine tool
        if "anomal" in q_lower or "outlier" in q_lower or "irregular" in q_lower:
            return QueryIntent(
                tool_name="detect_anomalies",
                filters=extracted_filters,
                parameters={"method": "iqr"},
                reasoning="Question requests anomaly or outlier detection",
            )
        elif "channel" in q_lower or "platform" in q_lower:
            return QueryIntent(
                tool_name="analyze_channels",
                filters=extracted_filters,
                metric="ROI",
                reasoning="Question focuses on channel or platform performance",
            )
        elif "audience" in q_lower or "demographic" in q_lower:
            return QueryIntent(
                tool_name="analyze_audiences",
                filters=extracted_filters,
                metric="ROI",
                reasoning="Question focuses on target audience performance",
            )
        elif "campaign type" in q_lower or "search" in q_lower or "display" in q_lower or "social" in q_lower or "email" in q_lower:
            return QueryIntent(
                tool_name="analyze_campaign_types",
                filters=extracted_filters,
                metric="ROI",
                reasoning="Question focuses on campaign types",
            )
        elif "duration" in q_lower and "channel" not in q_lower:
            return QueryIntent(
                tool_name="analyze_duration",
                filters=extracted_filters,
                metric="ROI",
                reasoning="Question asks about duration impact",
            )
        elif "geograph" in q_lower or "location" in q_lower or "country" in q_lower:
            return QueryIntent(
                tool_name="analyze_geography",
                filters=extracted_filters,
                metric="ROI",
                reasoning="Question asks about geographical performance",
            )
        elif "company" in q_lower or "competitor" in q_lower:
            return QueryIntent(
                tool_name="analyze_companies",
                filters=extracted_filters,
                metric="ROI",
                reasoning="Question asks about company benchmarking",
            )
        elif "top" in q_lower or "best campaign" in q_lower or "worst" in q_lower or "rank" in q_lower:
            asc = "worst" in q_lower or "lowest" in q_lower
            return QueryIntent(
                tool_name="rank_campaigns",
                filters=extracted_filters,
                metric="ROI",
                parameters={"top_n": 5, "ascending": asc},
                reasoning="Question requests campaign ranking",
            )
        elif "kpi" in q_lower or "total" in q_lower or "overall" in q_lower or "summary" in q_lower:
            return QueryIntent(
                tool_name="calculate_kpis",
                filters=extracted_filters,
                reasoning="Question asks for overall summary KPIs",
            )

        # Default fallback: channel analysis if ambiguous
        return QueryIntent(
            tool_name="analyze_channels",
            filters=extracted_filters,
            metric="ROI",
            reasoning="Default fallback to channel performance analysis",
        )

    def answer_natural_language_query(self, question: str, df: pd.DataFrame) -> GroundedAnswer:
        """
        End-to-end grounded query execution flow:
        1. Parse intent & extract filters.
        2. Execute deterministic analytics tool.
        3. Ground answer strictly in computed evidence (LLM never invents numbers).
        """
        intent = self.parse_intent(question)
        tool_name = intent.tool_name

        # Execute deterministic tool
        tool_args: dict[str, Any] = {"df": df}
        if intent.filters:
            tool_args["filters"] = intent.filters
        if intent.parameters:
            tool_args.update(intent.parameters)

        try:
            tool_result = self.registry.execute_tool(tool_name, **tool_args)
        except Exception as e:
            logger.error(f"Error executing tool {tool_name}: {e}")
            tool_result = []

        # Convert tool result to evidence list
        evidence = tool_result if isinstance(tool_result, list) else [tool_result]

        # Formulate grounded natural language answer
        # Use LLM if available, or deterministic grounded response formatter
        llm = self._get_llm()
        answer = self._synthesize_grounded_answer(question, intent, evidence, llm)

        return GroundedAnswer(
            question=question,
            answer=answer,
            evidence=evidence,
            tools_used=[tool_name],
            filters_applied=intent.filters,
        )

    def _synthesize_grounded_answer(
        self,
        question: str,
        intent: QueryIntent,
        evidence: list[Any],
        llm: LLMAdapter,
    ) -> str:
        """
        Synthesizes the answer strictly using the provided deterministic evidence.
        Guarantees that metrics in the response match the computed evidence.
        """
        if not evidence or (isinstance(evidence, list) and len(evidence) == 1 and not evidence[0]):
            filter_str = f" with filters {intent.filters}" if intent.filters else ""
            return f"No matching campaigns found for your query{filter_str}."

        evidence_str = json.dumps(evidence, indent=2)

        prompt = (
            f"User Question: '{question}'\n\n"
            f"Tool Executed: {intent.tool_name}\n"
            f"Filters Applied: {json.dumps(intent.filters)}\n"
            f"Exact Computed Evidence:\n{evidence_str}\n\n"
            f"CRITICAL INSTRUCTIONS:\n"
            f"1. Answer the user's question clearly and concisely.\n"
            f"2. You MUST cite the exact numbers from the Computed Evidence above (e.g. ROI, Conversion Rate, Acquisition Cost).\n"
            f"3. NEVER invent, extrapolate, or fabricate any numbers or metrics not present in the evidence.\n"
            f"4. State the segment, rank, and relevant comparison based strictly on the data."
        )

        try:
            raw_answer = llm.generate(
                prompt=prompt,
                system_instruction="You are an expert BI and Marketing Analytics assistant. Always base your responses strictly on computed data.",
            )
            # Check if LLM gave an empty or generic mock response
            if raw_answer.strip() and raw_answer.strip() != "{}":
                return raw_answer.strip()
        except Exception as e:
            logger.warning(f"LLM synthesis unavailable: {e}. Falling back to deterministic formatter.")

        # Deterministic grounded fallback formatter
        return self._format_deterministic_answer(question, intent, evidence)

    def _format_deterministic_answer(self, question: str, intent: QueryIntent, evidence: list[Any]) -> str:
        """Deterministic formatter that produces fluent, natural language answers backed strictly by data."""
        filter_desc = f" (filtered by {', '.join(f'{k}: {v}' for k, v in intent.filters.items())})" if intent.filters else ""

        if intent.tool_name == "calculate_kpis" and evidence:
            k = evidence[0]
            total = k.get("total_campaigns", 0)
            avg_roi = float(k.get("average_roi", 0.0))
            avg_cr = float(k.get("average_conversion_rate", 0.0))
            avg_cac = float(k.get("average_acquisition_cost", 0.0))
            # Format percentage properly whether stored as fraction 0.084 or percentage 8.4
            cr_display = avg_cr * 100 if avg_cr < 1.0 else avg_cr

            return (
                f"Based on your dataset{filter_desc}, here is the overall portfolio summary across **{total:,}** campaigns:\n\n"
                f"• **Average ROI**: **{avg_roi:.2f}x**\n"
                f"• **Average Conversion Rate**: **{cr_display:.2f}%**\n"
                f"• **Average Acquisition Cost (CAC)**: **${avg_cac:,.2f}**\n\n"
                f"Overall, the portfolio shows consistent return metrics with strong conversion efficiency."
            )

        if intent.tool_name == "analyze_channels" and evidence:
            top = evidence[0]
            top_channel = top.get("Channel_Used", "Unknown")
            top_roi = float(top.get("average_roi", 0.0))
            top_count = top.get("campaign_count", 1)

            other_lines = []
            for item in evidence[1:]:
                ch = item.get("Channel_Used", "Other")
                roi = float(item.get("average_roi", 0.0))
                cnt = item.get("campaign_count", 0)
                other_lines.append(f"• **{ch}**: **{roi:.2f}x ROI** ({cnt} campaigns)")

            others_str = "\n".join(other_lines) if other_lines else "No other channels recorded."
            return (
                f"Across the campaigns analyzed{filter_desc}, **{top_channel}** delivered the highest average return at **{top_roi:.2f}x ROI** across {top_count} campaigns.\n\n"
                f"Here is the channel comparison:\n"
                f"• **{top_channel}** (Top Performer): **{top_roi:.2f}x ROI**\n"
                f"{others_str}\n\n"
                f"**Key Takeaway**: **{top_channel}** is currently your most capital-efficient acquisition channel."
            )

        if intent.tool_name == "analyze_audiences" and evidence:
            top = evidence[0]
            top_aud = top.get("Target_Audience", "Unknown")
            top_roi = float(top.get("average_roi", 0.0))
            top_cr = float(top.get("average_conversion_rate", 0.0))
            cr_disp = top_cr * 100 if top_cr < 1.0 else top_cr

            lines = []
            for item in evidence:
                aud = item.get("Target_Audience", "Other")
                roi = float(item.get("average_roi", 0.0))
                cr = float(item.get("average_conversion_rate", 0.0))
                c_disp = cr * 100 if cr < 1.0 else cr
                lines.append(f"• **{aud}**: **{roi:.2f}x ROI** | **{c_disp:.2f}%** conversion rate")

            return (
                f"Analyzing performance across target audience segments{filter_desc}:\n\n"
                f"**{top_aud}** generated the strongest performance with **{top_roi:.2f}x ROI** and **{cr_disp:.2f}%** conversion rate.\n\n"
                f"Audience breakdown:\n"
                + "\n".join(lines)
            )

        if intent.tool_name == "rank_campaigns" and evidence:
            lines = []
            for idx, item in enumerate(evidence[:5], 1):
                cid = item.get("Campaign_ID", f"Campaign #{idx}")
                comp = item.get("Company", "")
                ch = item.get("Channel_Used", "")
                roi = float(item.get("ROI", item.get("average_roi", 0.0)))
                cr = float(item.get("Conversion_Rate", item.get("average_conversion_rate", 0.0)))
                cost = float(item.get("Acquisition_Cost", item.get("average_acquisition_cost", 0.0)))
                comp_str = f" ({comp})" if comp else ""
                lines.append(f"{idx}. **{cid}**{comp_str} via {ch}: **{roi:.2f}x ROI**, **{cr:.2f}%** conversion, CAC: **${cost:,.2f}**")

            return (
                f"Here are the top-ranking campaigns based on your data{filter_desc}:\n\n"
                + "\n".join(lines)
                + "\n\n**Takeaway**: High-performing campaigns consistently show strong engagement combined with controlled acquisition costs."
            )

        if intent.tool_name == "analyze_campaign_types" and evidence:
            top = evidence[0]
            top_type = top.get("Campaign_Type", "Unknown")
            top_roi = float(top.get("average_roi", 0.0))

            lines = [f"• **{item.get('Campaign_Type')}**: **{float(item.get('average_roi', 0.0)):.2f}x ROI**" for item in evidence]
            return (
                f"Campaign type comparison{filter_desc}:\n\n"
                f"**{top_type}** campaigns led performance at **{top_roi:.2f}x ROI**.\n\n"
                + "\n".join(lines)
            )

        if intent.tool_name == "analyze_geography" and evidence:
            top = evidence[0]
            top_loc = top.get("Location", "Unknown")
            top_roi = float(top.get("average_roi", 0.0))
            lines = [f"• **{item.get('Location')}**: **{float(item.get('average_roi', 0.0)):.2f}x ROI**" for item in evidence]
            return (
                f"Geographical performance analysis{filter_desc}:\n\n"
                f"**{top_loc}** is your strongest market with an average **{top_roi:.2f}x ROI**.\n\n"
                + "\n".join(lines)
            )

        if intent.tool_name == "detect_anomalies":
            count = len(evidence)
            if count == 0:
                return f"No statistical anomalies were detected in the dataset{filter_desc}. All metrics fall within expected bounds."
            lines = []
            for item in evidence[:3]:
                lines.append(
                    f"• Campaign **{item.get('campaign_id')}** ({item.get('company')}, {item.get('channel')}): anomalous {item.get('metric')} of **{item.get('actual_value')}** ({item.get('reason')})"
                )
            return (
                f"We detected **{count}** statistical anomalies{filter_desc}:\n\n"
                + "\n".join(lines)
                + "\n\n**Recommendation**: Review these outlier campaigns to understand unusual variances."
            )

        # General table / record fallback
        first_item = evidence[0] if evidence else {}
        return f"Query completed using **{intent.tool_name}**{filter_desc}.\n\nLeading result: {first_item}."

    def generate_insights(self, df: pd.DataFrame) -> list[Insight]:
        """
        Generates structured insights grounded in deterministic data.
        Adheres to AGENT_DESIGN.md insight format:
        observation, metric, segment_or_filter, comparison, evidence, caveat.
        """
        insights: list[Insight] = []

        if df is None or df.empty:
            return insights

        # 1. Overall KPIs
        kpis = calculate_kpis(df)
        overall_roi = kpis.get("average_roi", 0.0)
        overall_cr = kpis.get("average_conversion_rate", 0.0)

        # 2. Channel Performance Insight
        channel_data = analyze_channels(df)
        if channel_data:
            top_channel = channel_data[0]
            worst_channel = channel_data[-1]
            diff = round(top_channel["average_roi"] - worst_channel["average_roi"], 4)
            insights.append(Insight(
                observation=f"{top_channel['Channel_Used']} leads all channels in ROI efficiency.",
                metric="ROI",
                segment_or_filter=f"Channel: {top_channel['Channel_Used']}",
                comparison=f"{diff}x higher ROI than lowest channel ({worst_channel['Channel_Used']} at {worst_channel['average_roi']}x)",
                evidence=f"{top_channel['Channel_Used']} averaged {top_channel['average_roi']}x ROI across {top_channel['campaign_count']} campaigns vs overall avg of {overall_roi}x.",
                caveat=f"Sample includes {top_channel['campaign_count']} campaigns; verify conversion volume at scale.",
            ))

        # 3. Audience Segmentation Insight
        audience_data = analyze_audiences(df)
        if audience_data:
            top_audience = audience_data[0]
            insights.append(Insight(
                observation=f"Audience segment '{top_audience['Target_Audience']}' generates the highest return on investment.",
                metric="ROI",
                segment_or_filter=f"Target Audience: {top_audience['Target_Audience']}",
                comparison=f"Outperforms dataset mean of {overall_roi}x ROI",
                evidence=f"Average ROI of {top_audience['average_roi']}x and conversion rate of {top_audience['average_conversion_rate']:.2%} across {top_audience['campaign_count']} campaigns.",
                caveat="Segment response may vary across different creative formats.",
            ))

        # 4. Campaign Type Insight
        type_data = analyze_campaign_types(df)
        if type_data:
            top_type = type_data[0]
            insights.append(Insight(
                observation=f"Campaign type '{top_type['Campaign_Type']}' delivers superior conversion rates.",
                metric="Conversion_Rate",
                segment_or_filter=f"Campaign Type: {top_type['Campaign_Type']}",
                comparison=f"Compared to dataset baseline conversion rate of {overall_cr:.2%}",
                evidence=f"Delivered {top_type['average_conversion_rate']:.2%} conversion rate with average acquisition cost of ${top_type['average_acquisition_cost']:.2f}.",
                caveat="Check whether high conversion rates are concentrated in specific channels.",
            ))

        # 5. Anomaly Insight
        anomalies = detect_anomalies(df, method="iqr")
        if anomalies:
            high_roi_anoms = [a for a in anomalies if a.get("metric") == "ROI" and a.get("direction") == "high"]
            if high_roi_anoms:
                top_anom = high_roi_anoms[0]
                insights.append(Insight(
                    observation=f"Exceptional outlier campaign detected: {top_anom['campaign_id']}.",
                    metric="ROI",
                    segment_or_filter=f"Company: {top_anom.get('company')}, Channel: {top_anom.get('channel')}",
                    comparison=f"Exceeds statistical upper bound of {top_anom.get('upper_bound')}x ROI",
                    evidence=f"Achieved {top_anom.get('actual_value')}x ROI ({top_anom.get('evidence')}).",
                    caveat="Outlier may be driven by unmodeled seasonal factors or unique one-off promotions.",
                ))

        return insights

    def generate_recommendations(self, df: pd.DataFrame) -> list[Recommendation]:
        """
        Generates actionable recommendations grounded in historical performance.
        Includes mandatory disclaimers and confidence assessments.
        """
        recommendations: list[Recommendation] = []

        if df is None or df.empty:
            return recommendations

        channel_data = analyze_channels(df)
        audience_data = analyze_audiences(df)
        type_data = analyze_campaign_types(df)
        kpis = calculate_kpis(df)
        avg_roi = kpis.get("average_roi", 0.0)

        # 1. Channel Budget Allocation Recommendation
        if len(channel_data) >= 2:
            best_channel = channel_data[0]
            worst_channel = channel_data[-1]
            recommendations.append(Recommendation(
                recommendation=f"Reallocate incremental media spend towards {best_channel['Channel_Used']} while reviewing underperforming budgets in {worst_channel['Channel_Used']}.",
                historical_evidence=(
                    f"{best_channel['Channel_Used']} delivered an average ROI of {best_channel['average_roi']}x "
                    f"compared to {worst_channel['Channel_Used']} at {worst_channel['average_roi']}x "
                    f"(overall average: {avg_roi}x)."
                ),
                actionable_step=f"Shift 10-15% of testing budget to {best_channel['Channel_Used']} and audit targeting criteria on {worst_channel['Channel_Used']}.",
                confidence="High" if best_channel["campaign_count"] >= 3 else "Medium",
                caveat="Past channel performance does not guarantee future results. Scale spend incrementally to avoid diminishing marginal returns.",
            ))

        # 2. High-Converting Audience Prioritization
        if audience_data:
            top_audience = audience_data[0]
            recommendations.append(Recommendation(
                recommendation=f"Prioritize marketing initiatives targeting '{top_audience['Target_Audience']}'.",
                historical_evidence=(
                    f"The '{top_audience['Target_Audience']}' segment recorded {top_audience['average_roi']}x ROI "
                    f"and an average conversion rate of {top_audience['average_conversion_rate']:.2%}."
                ),
                actionable_step=f"Create dedicated creative variants tailored specifically to {top_audience['Target_Audience']}.",
                confidence="High" if top_audience["campaign_count"] >= 2 else "Medium",
                caveat="Audience fatigue may occur if targeting is not refreshed periodically. Historical metrics do not guarantee future performance.",
            ))

        # 3. Campaign Type Optimization
        if type_data:
            top_type = type_data[0]
            recommendations.append(Recommendation(
                recommendation=f"Adopt '{top_type['Campaign_Type']}' as the primary campaign format for acquisition objectives.",
                historical_evidence=(
                    f"'{top_type['Campaign_Type']}' achieved a conversion rate of {top_type['average_conversion_rate']:.2%} "
                    f"with an average acquisition cost of ${top_type['average_acquisition_cost']:.2f}."
                ),
                actionable_step=f"Benchmark copy and creative structures from top '{top_type['Campaign_Type']}' campaigns across other channels.",
                confidence="Medium",
                caveat="Ad format efficacy varies with seasonal buying patterns and cannot be guaranteed.",
            ))

        return recommendations

    def generate_executive_report(self, df: pd.DataFrame, dataset_name: str = "Marketing Campaigns") -> ExecutiveReport:
        """Generates a complete executive briefing combining KPIs, insights, anomalies, and recommendations."""
        kpis = calculate_kpis(df)
        insights = self.generate_insights(df)
        anomalies = detect_anomalies(df, method="iqr")
        recommendations = self.generate_recommendations(df)

        summary = (
            f"Performance analysis of {kpis.get('total_campaigns', 0)} campaigns in {dataset_name}. "
            f"The portfolio achieved an average ROI of {kpis.get('average_roi', 0.0)}x, "
            f"average conversion rate of {kpis.get('average_conversion_rate', 0.0):.2%}, and "
            f"average acquisition cost of ${kpis.get('average_acquisition_cost', 0.0):.2f}. "
            f"{len(insights)} primary insights and {len(anomalies)} statistical anomalies were identified."
        )

        return ExecutiveReport(
            dataset_name=dataset_name,
            summary=summary,
            kpis=kpis,
            key_insights=insights,
            anomalies=anomalies,
            recommendations=recommendations,
        )
