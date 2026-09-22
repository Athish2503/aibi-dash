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
    assert data["validation"]["is_valid"] is True


def test_api_compare_uploaded_datasets():
    file_path = FIXTURES_DIR / "sample_campaigns.csv"
    with open(file_path, "rb") as f1, open(file_path, "rb") as f2:
        response = client.post(
            "/api/v1/dataset/compare?label_a=Period1&label_b=Period2",
            files={
                "file_a": ("sample_campaigns.csv", f1, "text/csv"),
                "file_b": ("sample_campaigns.csv", f2, "text/csv"),
            },
        )
    assert response.status_code == 200
    data = response.json()
    assert data["baseline_label"] == "Period1"
    assert data["comparison_label"] == "Period2"
    assert "roi" in data
    assert "cac" in data
    assert "channels" in data
    assert len(data["channels"]) > 0


def test_api_compare_datasets_by_id():
    import pandas as pd
    from backend.app.data.storage import save_dataset

    df1 = pd.DataFrame({
        "Campaign_ID": [1], "Channel_Used": ["Social"], "ROI": [3.0],
        "Acquisition_Cost": [100.0], "Conversion_Rate": [0.05],
    })
    df2 = pd.DataFrame({
        "Campaign_ID": [2], "Channel_Used": ["Social"], "ROI": [4.0],
        "Acquisition_Cost": [80.0], "Conversion_Rate": [0.06],
    })
    id1 = save_dataset(df1, "d1.csv")
    id2 = save_dataset(df2, "d2.csv")

    response = client.post(
        "/api/v1/dataset/compare-by-id",
        json={"dataset_id_a": id1, "dataset_id_b": id2, "label_a": "Q1", "label_b": "Q2"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["roi"]["baseline_value"] == 3.0
    assert data["roi"]["comparison_value"] == 4.0
    assert data["roi"]["sentiment"] == "positive"



