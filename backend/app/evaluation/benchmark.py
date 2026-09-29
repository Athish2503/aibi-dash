from typing import Any, Optional
from pydantic import BaseModel, Field


class BenchmarkQuestion(BaseModel):
    id: str
    category: str = Field(description="'metric_query', 'channel_analysis', 'investigation', 'anomaly', 'dax_generation', 'scenario'")
    question: str
    expected_metric_or_tool: str
    ground_truth_validator: str = ""


class BenchmarkSuite:
    """
    Standard benchmark evaluation suite containing representative enterprise marketing questions.
    """

    BENCHMARK_CASES = [
        BenchmarkQuestion(
            id="q01",
            category="metric_query",
            question="What is the average ROI across all campaigns?",
            expected_metric_or_tool="calculate_kpis",
            ground_truth_validator="average_roi",
        ),
        BenchmarkQuestion(
            id="q02",
            category="metric_query",
            question="What is the average customer acquisition cost (CAC)?",
            expected_metric_or_tool="calculate_kpis",
            ground_truth_validator="average_acquisition_cost",
        ),
        BenchmarkQuestion(
            id="q03",
            category="channel_analysis",
            question="Which marketing channel generated the highest return on investment?",
            expected_metric_or_tool="analyze_channels",
            ground_truth_validator="Channel_Used",
        ),
        BenchmarkQuestion(
            id="q04",
            category="investigation",
            question="Why did ROI drop and what is the primary contributor?",
            expected_metric_or_tool="investigate_root_cause",
            ground_truth_validator="primary_contributor",
        ),
        BenchmarkQuestion(
            id="q05",
            category="anomaly",
            question="Detect any cost or conversion rate anomalies in our dataset.",
            expected_metric_or_tool="detect_anomalies",
            ground_truth_validator="anomalies",
        ),
        BenchmarkQuestion(
            id="q06",
            category="dax_generation",
            question="Generate a DAX measure for Channel Average ROI",
            expected_metric_or_tool="dax_copilot",
            ground_truth_validator="AVERAGE",
        ),
        BenchmarkQuestion(
            id="q07",
            category="scenario",
            question="What happens if Meta spend increases by 20%?",
            expected_metric_or_tool="simulate_scenario",
            ground_truth_validator="spend_variance_pct",
        ),
    ]

    @classmethod
    def get_all_questions(cls) -> list[BenchmarkQuestion]:
        return list(cls.BENCHMARK_CASES)
