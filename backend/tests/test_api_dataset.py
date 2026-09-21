from pathlib import Path
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)
FIXTURES_DIR = Path(__file__).parent / "fixtures"


def test_api_inspect_dataset():
    file_path = FIXTURES_DIR / "sample_campaigns.csv"
    with open(file_path, "rb") as f:
        response = client.post(
            "/api/v1/dataset/inspect",
            files={"file": ("sample_campaigns.csv", f, "text/csv")},
        )
    assert response.status_code == 200
    data = response.json()
    assert data["row_count"] == 10
    assert data["column_count"] == 10
    assert "Campaign_ID" in data["columns"]


def test_api_validate_dataset_success():
    file_path = FIXTURES_DIR / "sample_campaigns.csv"
    with open(file_path, "rb") as f:
        response = client.post(
            "/api/v1/dataset/validate",
            files={"file": ("sample_campaigns.csv", f, "text/csv")},
        )
    assert response.status_code == 200
    data = response.json()
    assert data["is_valid"] is True
    assert len(data["errors"]) == 0


def test_api_validate_dataset_failure():
    file_path = FIXTURES_DIR / "invalid_missing_col.csv"
    with open(file_path, "rb") as f:
        response = client.post(
            "/api/v1/dataset/validate",
            files={"file": ("invalid_missing_col.csv", f, "text/csv")},
        )
    assert response.status_code == 200
    data = response.json()
    assert data["is_valid"] is False
    assert len(data["errors"]) > 0


def test_api_pipeline_success():
    file_path = FIXTURES_DIR / "sample_campaigns.csv"
    with open(file_path, "rb") as f:
        response = client.post(
            "/api/v1/dataset/pipeline",
            files={"file": ("sample_campaigns.csv", f, "text/csv")},
        )
    assert response.status_code == 200
    data = response.json()
    assert "inspection" in data
    assert "validation" in data
    assert "cleaning" in data
    assert "profiling" in data
    assert data["validation"]["is_valid"] is True
    assert data["cleaning"]["cleaned_row_count"] == 10


def test_api_pipeline_xlsx():
    file_path = FIXTURES_DIR / "sample_campaigns.xlsx"
    with open(file_path, "rb") as f:
        response = client.post(
            "/api/v1/dataset/pipeline",
            files={"file": ("sample_campaigns.xlsx", f, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")},
        )
    assert response.status_code == 200
    data = response.json()
    assert data["inspection"]["row_count"] == 10
    assert data["validation"]["is_valid"] is True
    assert data["cleaning"]["cleaned_row_count"] == 10
    assert "Channel_Used" in data["profiling"]["categorical_profiles"]


def test_api_upload_unsupported_format():
    response = client.post(
        "/api/v1/dataset/inspect",
        files={"file": ("document.txt", b"some text", "text/plain")},
    )
    assert response.status_code == 400
    assert "Invalid file format" in response.json()["detail"]


def test_api_plan_deterministic():
    file_path = FIXTURES_DIR / "sample_campaigns.csv"
    with open(file_path, "rb") as f:
        response = client.post(
            "/api/v1/dataset/plan",
            files={"file": ("sample_campaigns.csv", f, "text/csv")},
        )
    assert response.status_code == 200
    data = response.json()
    assert "pages" in data
    assert len(data["pages"]) == 3
    assert data["validation"]["is_valid"] is True


