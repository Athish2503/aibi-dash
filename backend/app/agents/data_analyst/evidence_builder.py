from typing import Any, Optional
from pydantic import BaseModel, Field


class EvidenceItem(BaseModel):
    id: str
    source_tool: str
    metric: str
    dimension: Optional[str] = None
    segment_value: Optional[str] = None
    value: Any
    unit: str = ""
    formula_used: str = ""
    description: str


class EvidenceBuilder:
    """
    Constructs auditable, deterministic evidence records for analytical findings.
    """

    @classmethod
    def from_kpis(cls, kpis: dict[str, Any]) -> list[EvidenceItem]:
        items = []
        if "average_roi" in kpis:
            items.append(
                EvidenceItem(
                    id="ev_avg_roi",
                    source_tool="analytics.kpis.calculate_kpis",
                    metric="Average ROI",
                    value=kpis["average_roi"],
                    unit="x",
                    formula_used="MEAN(ROI)",
                    description=f"Calculated average ROI across campaigns: {kpis['average_roi']}x",
                )
            )
        if "average_conversion_rate" in kpis:
            items.append(
                EvidenceItem(
                    id="ev_avg_cvr",
                    source_tool="analytics.kpis.calculate_kpis",
                    metric="Average Conversion Rate",
                    value=kpis["average_conversion_rate"],
                    unit="%",
                    formula_used="MEAN(Conversion_Rate)",
                    description=f"Calculated average conversion rate: {round(kpis['average_conversion_rate'] * 100, 2)}%",
                )
            )
        if "average_acquisition_cost" in kpis:
            items.append(
                EvidenceItem(
                    id="ev_avg_cac",
                    source_tool="analytics.kpis.calculate_kpis",
                    metric="Average Acquisition Cost",
                    value=kpis["average_acquisition_cost"],
                    unit="$",
                    formula_used="MEAN(Acquisition_Cost)",
                    description=f"Calculated average acquisition cost: ${kpis['average_acquisition_cost']}",
                )
            )
        return items

    @classmethod
    def from_breakdown(
        cls, tool_name: str, dimension: str, rows: list[dict[str, Any]], metric_col: str = "average_roi"
    ) -> list[EvidenceItem]:
        items = []
        for i, row in enumerate(rows[:5]):  # Top 5 records as evidence
            seg_val = str(row.get(dimension, "Unknown"))
            val = row.get(metric_col, 0.0)
            items.append(
                EvidenceItem(
                    id=f"ev_{dimension.lower()}_{i}",
                    source_tool=tool_name,
                    metric=metric_col,
                    dimension=dimension,
                    segment_value=seg_val,
                    value=val,
                    formula_used=f"AGGREGATE({metric_col}) GROUP BY {dimension}",
                    description=f"{seg_val} {dimension}: {metric_col} = {val} ({row.get('campaign_count', 0)} campaigns)",
                )
            )
        return items
