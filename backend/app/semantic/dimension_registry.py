from typing import Optional
from enum import Enum
from pydantic import BaseModel, Field


class DimensionType(str, Enum):
    CATEGORICAL = "categorical"
    GEOGRAPHIC = "geographic"
    TEMPORAL = "temporal"
    IDENTIFIER = "identifier"


class SemanticDimension(BaseModel):
    id: str
    column_name: str
    display_name: str
    dimension_type: DimensionType
    synonyms: list[str] = Field(default_factory=list)
    hierarchy: Optional[str] = None
    level: int = 0
    description: str = ""


class DimensionRegistry:
    """
    Registry for dimensional metadata, semantic hierarchies, and synonyms.
    """

    def __init__(self):
        self._dimensions: dict[str, SemanticDimension] = {}
        self._register_default_dimensions()

    def _register_default_dimensions(self):
        dims = [
            SemanticDimension(
                id="dim_channel",
                column_name="Channel_Used",
                display_name="Marketing Channel",
                dimension_type=DimensionType.CATEGORICAL,
                synonyms=["channel", "platform", "media", "medium", "network", "traffic source", "ad network"],
                description="Marketing channel (e.g. Google Ads, Meta, YouTube, LinkedIn)",
            ),
            SemanticDimension(
                id="dim_location",
                column_name="Location",
                display_name="Geography / Location",
                dimension_type=DimensionType.GEOGRAPHIC,
                synonyms=["location", "geo", "region", "city", "country", "territory", "geography"],
                hierarchy="Geography",
                level=1,
                description="Target geographic market",
            ),
            SemanticDimension(
                id="dim_campaign_type",
                column_name="Campaign_Type",
                display_name="Campaign Type",
                dimension_type=DimensionType.CATEGORICAL,
                synonyms=["campaign type", "type", "format", "tactic", "strategy", "campaign objective"],
                description="Strategic format of campaign (Search, Display, Social, Influencer)",
            ),
            SemanticDimension(
                id="dim_target_audience",
                column_name="Target_Audience",
                display_name="Target Audience",
                dimension_type=DimensionType.CATEGORICAL,
                synonyms=["audience", "target audience", "demographic", "segment", "customer cohort"],
                description="Target demographic cohort",
            ),
            SemanticDimension(
                id="dim_duration",
                column_name="Duration_Days",
                display_name="Campaign Duration (Days)",
                dimension_type=DimensionType.TEMPORAL,
                synonyms=["duration", "days", "length", "flight", "period", "run time"],
                description="Active duration of the campaign in days",
            ),
            SemanticDimension(
                id="dim_company",
                column_name="Company",
                display_name="Company / Brand",
                dimension_type=DimensionType.CATEGORICAL,
                synonyms=["company", "brand", "client", "advertiser", "organization"],
                description="Brand or corporate entity sponsoring the campaign",
            ),
        ]
        for d in dims:
            self._dimensions[d.id] = d

    def get_dimension(self, dimension_id: str) -> Optional[SemanticDimension]:
        return self._dimensions.get(dimension_id)

    def list_dimensions(self) -> list[SemanticDimension]:
        return list(self._dimensions.values())


dimension_registry = DimensionRegistry()
