import pytest
import pandas as pd
from pathlib import Path

from backend.app.agent.orchestrator import (
    AgentOrchestrator,
    QueryIntent,
    GroundedAnswer,
    Insight,
    Recommendation,
    ExecutiveReport,
)
from backend.app.agent.llm_adapter import MockLLMAdapter
from backend.app.data.cleaner import clean_dataset

FIXTURES_DIR = Path(__file__).parent / "fixtures"
SAMPLE_CSV = FIXTURES_DIR / "sample_campaigns.csv"


@pytest.fixture
def sample_df():
    raw_df = pd.read_csv(SAMPLE_CSV)
    cleaned_df, _ = clean_dataset(raw_df)
    return cleaned_df


def test_intent_parsing_grounded_example():
    orchestrator = AgentOrchestrator()
    intent = orchestrator.parse_intent("Which channel had the best ROI for 30-day campaigns?")

    assert intent.tool_name == "analyze_channels"
    assert intent.filters.get("Duration") == 30
    assert intent.metric == "ROI"


def test_intent_parsing_other_queries():
    orchestrator = AgentOrchestrator()

    intent_kpis = orchestrator.parse_intent("What are our overall summary KPIs?")
    assert intent_kpis.tool_name == "calculate_kpis"

    intent_anom = orchestrator.parse_intent("Are there any anomalies or outliers in campaign costs?")
    assert intent_anom.tool_name == "detect_anomalies"

    intent_rank = orchestrator.parse_intent("Show me the top 5 campaigns by ROI")
    assert intent_rank.tool_name == "rank_campaigns"


def test_answer_natural_language_query_grounded_execution(sample_df):
    orchestrator = AgentOrchestrator()
    question = "Which channel had the best ROI for 30-day campaigns?"
    response = orchestrator.answer_natural_language_query(question, sample_df)

    assert isinstance(response, GroundedAnswer)
    assert response.question == question
    assert "analyze_channels" in response.tools_used
    assert response.filters_applied.get("Duration") == 30
    assert len(response.evidence) > 0

    # Verification of deterministic truth:
    # In sample_campaigns.csv with Duration 30 days:
    # Google Ads has 3 campaigns (3.2, 3.8, 2.1) -> avg 3.0333
    # YouTube has 1 campaign (1.2) -> avg 1.2
    top_channel_evidence = response.evidence[0]
    assert top_channel_evidence["Channel_Used"] == "Google Ads"
    assert "Google Ads" in response.answer
    assert "3.03" in response.answer or "3.0333" in response.answer


def test_answer_with_mock_llm(sample_df):
    mock_llm = MockLLMAdapter(default_response="Based on the data, Google Ads achieved 3.03x ROI.")
    orchestrator = AgentOrchestrator(llm_adapter=mock_llm)

    response = orchestrator.answer_natural_language_query("Which channel had the best ROI for 30-day campaigns?", sample_df)
    assert response.answer == "Based on the data, Google Ads achieved 3.03x ROI."
    assert "analyze_channels" in response.tools_used
    assert len(response.evidence) > 0


def test_generate_insights(sample_df):
    orchestrator = AgentOrchestrator()
    insights = orchestrator.generate_insights(sample_df)

    assert len(insights) >= 3
    for ins in insights:
        assert isinstance(ins, Insight)
        assert len(ins.observation) > 0
        assert len(ins.metric) > 0
        assert len(ins.evidence) > 0
        assert len(ins.comparison) > 0
        assert ins.caveat is not None


def test_generate_recommendations(sample_df):
    orchestrator = AgentOrchestrator()
    recommendations = orchestrator.generate_recommendations(sample_df)

    assert len(recommendations) >= 2
    for rec in recommendations:
        assert isinstance(rec, Recommendation)
        assert len(rec.recommendation) > 0
        assert len(rec.historical_evidence) > 0
        assert len(rec.actionable_step) > 0
        assert "not guarantee" in rec.caveat.lower() or "guarantee" in rec.caveat.lower()


def test_generate_executive_report(sample_df):
    orchestrator = AgentOrchestrator()
    report = orchestrator.generate_executive_report(sample_df, dataset_name="Q3 Marketing")

    assert isinstance(report, ExecutiveReport)
    assert report.dataset_name == "Q3 Marketing"
    assert report.kpis["total_campaigns"] == 10
    assert len(report.key_insights) > 0
    assert len(report.recommendations) > 0
