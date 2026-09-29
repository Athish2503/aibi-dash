from typing import Optional
from pydantic import BaseModel, Field
from backend.app.semantic.metric_registry import SemanticMetric, metric_registry
from backend.app.semantic.dimension_registry import SemanticDimension, dimension_registry


class BusinessSemanticModel(BaseModel):
    model_name: str = "Marketing Performance Semantic Model"
    description: str = "Semantic representation of cross-channel digital marketing campaigns"
    metrics: list[SemanticMetric] = Field(default_factory=list)
    dimensions: list[SemanticDimension] = Field(default_factory=list)

    @classmethod
    def default_model(cls) -> "BusinessSemanticModel":
        return cls(
            metrics=metric_registry.list_metrics(),
            dimensions=dimension_registry.list_dimensions(),
        )
