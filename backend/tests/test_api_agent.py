import pytest
from fastapi.testclient import TestClient
from pathlib import Path
import pandas as pd

from backend.app.main import app
from backend.app.data.storage import save_dataset
from backend.app.data.cleaner import clean_dataset

client = TestClient(app)

FIXTURES_DIR = Path(__file__).parent / "fixtures"
SAMPLE_CSV = FIXTURES_DIR / "sample_campaigns.csv"


@pytest.fixture
def active_dataset_id():
    raw_df = pd.read_csv(SAMPLE_CSV)
    cleaned_df, _ = clean_dataset(raw_df)
    ds_id = save_dataset(cleaned_df, filename="sample_campaigns.csv")
    return ds_id


def test_chat_endpoint_success(active_dataset_id):
    payload = {
        "dataset_id": active_dataset_id,
        "question": "Which channel had the best ROI for 30-day campaigns?",
        "conversation_history": [],
    }
    response = client.post("/api/v1/chat", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert "answer" in data
    assert "evidence" in data
    assert "tools_used" in data
    assert "analyze_channels" in data["tools_used"]
    assert len(data["evidence"]) > 0
    assert "Google Ads" in data["answer"]
    assert "visual_spec" in data and data["visual_spec"] is not None
    assert data["visual_spec"]["type"] == "bar"
    assert "steps" in data and len(data["steps"]) >= 3
    assert "follow_ups" in data and len(data["follow_ups"]) >= 2


def test_chat_endpoint_multi_turn(active_dataset_id):
    # Pass prior turn in conversation_history and ask pronoun question
    history = [
        {"role": "user", "text": "Which channel has the highest ROI?"},
        {"role": "assistant", "text": "Google Ads achieved 3.03x ROI."},
    ]
    payload = {
        "dataset_id": active_dataset_id,
        "question": "What about its CAC?",
        "conversation_history": history,
    }
    response = client.post("/api/v1/chat", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["filters_applied"].get("Channel_Used") == "Google Ads"


def test_chat_endpoint_dataset_not_found():
    payload = {
        "dataset_id": "nonexistent_id_999",
        "question": "Which channel is best?",
    }
    response = client.post("/api/v1/chat", json=payload)
    assert response.status_code == 404


def test_insights_endpoint(active_dataset_id):
    payload = {"dataset_id": active_dataset_id}
    response = client.post("/api/v1/insights", json=payload)
    assert response.status_code == 200
    insights = response.json()

    assert isinstance(insights, list)
    assert len(insights) >= 3
    first = insights[0]
    assert "observation" in first
    assert "metric" in first
    assert "evidence" in first


def test_recommendations_endpoint(active_dataset_id):
    payload = {"dataset_id": active_dataset_id}
    response = client.post("/api/v1/recommendations", json=payload)
    assert response.status_code == 200
    recommendations = response.json()

    assert isinstance(recommendations, list)
    assert len(recommendations) >= 2
    first = recommendations[0]
    assert "recommendation" in first
    assert "historical_evidence" in first
    assert "caveat" in first


def test_executive_report_endpoint(active_dataset_id):
    payload = {
        "dataset_id": active_dataset_id,
        "dataset_name": "Executive Marketing Report",
    }
    response = client.post("/api/v1/executive-report", json=payload)
    assert response.status_code == 200
    report = response.json()

    assert report["dataset_name"] == "Executive Marketing Report"
    assert "kpis" in report
    assert "key_insights" in report
    assert "recommendations" in report


def test_end_to_end_upload_to_chat():
    # 1. Upload CSV to pipeline
    with open(SAMPLE_CSV, "rb") as f:
        files = {"file": ("sample_campaigns.csv", f, "text/csv")}
        pipeline_resp = client.post("/api/v1/dataset/pipeline", files=files)

    assert pipeline_resp.status_code == 200
    pipeline_data = pipeline_resp.json()
    assert "dataset_id" in pipeline_data
    dataset_id = pipeline_data["dataset_id"]
    assert dataset_id is not None

    # 2. Chat with uploaded dataset using dataset_id
    chat_resp = client.post(
        "/api/v1/chat",
        json={
            "dataset_id": dataset_id,
            "question": "Which channel had the best ROI for 30-day campaigns?",
        },
    )
    assert chat_resp.status_code == 200
    chat_data = chat_resp.json()
    assert "Google Ads" in chat_data["answer"]
    assert "analyze_channels" in chat_data["tools_used"]
