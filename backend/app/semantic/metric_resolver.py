import re
from typing import Any, Optional
from pydantic import BaseModel, Field
from backend.app.semantic.metric_registry import SemanticMetric, metric_registry
from backend.app.semantic.dimension_registry import SemanticDimension, dimension_registry


class ResolvedConcept(BaseModel):
    concept_type: str = Field(description="'metric' or 'dimension'")
    id: str
    display_name: str
    column_name: str
    matched_term: str
    confidence: float = Field(ge=0.0, le=1.0)


class SemanticResolutionResult(BaseModel):
    original_query: str
    resolved_metrics: list[ResolvedConcept] = Field(default_factory=list)
    resolved_dimensions: list[ResolvedConcept] = Field(default_factory=list)
    intent_summary: str = ""


class MetricResolver:
    """
    Translates free-form business queries into verified semantic metrics and dimensions.
    """

    @classmethod
    def resolve_query(cls, query: str) -> SemanticResolutionResult:
        q_lower = query.lower()
        resolved_metrics: list[ResolvedConcept] = []
        resolved_dimensions: list[ResolvedConcept] = []

        # 1. Resolve Metrics
        for metric in metric_registry.list_metrics():
            matched_synonym = None
            highest_conf = 0.0

            # Check technical & display names
            if metric.display_name.lower() in q_lower or metric.technical_name.lower() in q_lower:
                matched_synonym = metric.display_name
                highest_conf = 1.0
            else:
                for syn in metric.synonyms:
                    # Match whole words or phrase
                    pattern = rf"\b{re.escape(syn)}\b"
                    if re.search(pattern, q_lower):
                        matched_synonym = syn
                        highest_conf = 0.95
                        break
                    elif syn in q_lower:
                        matched_synonym = syn
                        highest_conf = 0.8
                        break

            # Handle concept bundles (e.g. "efficiency" -> ROI + CAC)
            if not matched_synonym:
                if "efficiency" in q_lower and metric.id in ("metric_roi", "metric_cac", "metric_efficiency_index"):
                    matched_synonym = "efficiency"
                    highest_conf = 0.85

            if matched_synonym:
                col = metric.base_columns[0] if metric.base_columns else metric.technical_name
                resolved_metrics.append(
                    ResolvedConcept(
                        concept_type="metric",
                        id=metric.id,
                        display_name=metric.display_name,
                        column_name=col,
                        matched_term=matched_synonym,
                        confidence=highest_conf,
                    )
                )

        # 2. Resolve Dimensions
        for dim in dimension_registry.list_dimensions():
            matched_synonym = None
            highest_conf = 0.0

            if dim.display_name.lower() in q_lower or dim.column_name.lower() in q_lower:
                matched_synonym = dim.display_name
                highest_conf = 1.0
            else:
                for syn in dim.synonyms:
                    pattern = rf"\b{re.escape(syn)}\b"
                    if re.search(pattern, q_lower):
                        matched_synonym = syn
                        highest_conf = 0.95
                        break
                    elif syn in q_lower:
                        matched_synonym = syn
                        highest_conf = 0.8
                        break

            if matched_synonym:
                resolved_dimensions.append(
                    ResolvedConcept(
                        concept_type="dimension",
                        id=dim.id,
                        display_name=dim.display_name,
                        column_name=dim.column_name,
                        matched_term=matched_synonym,
                        confidence=highest_conf,
                    )
                )

        # If no metrics resolved, default to ROI
        if not resolved_metrics:
            roi_metric = metric_registry.get_metric("metric_roi")
            if roi_metric:
                resolved_metrics.append(
                    ResolvedConcept(
                        concept_type="metric",
                        id=roi_metric.id,
                        display_name=roi_metric.display_name,
                        column_name="ROI",
                        matched_term="default",
                        confidence=0.5,
                    )
                )

        metric_names = [m.display_name for m in resolved_metrics]
        dim_names = [d.display_name for d in resolved_dimensions]
        summary = f"Analyzing {', '.join(metric_names)}"
        if dim_names:
            summary += f" grouped by {', '.join(dim_names)}"

        return SemanticResolutionResult(
            original_query=query,
            resolved_metrics=resolved_metrics,
            resolved_dimensions=resolved_dimensions,
            intent_summary=summary,
        )
