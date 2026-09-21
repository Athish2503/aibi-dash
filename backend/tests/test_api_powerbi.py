import io
import pytest
import pandas as pd
from fastapi.testclient import TestClient

from backend.app.main import app
from backend.app.data.storage import save_dataset


@pytest.fixture
def client():
    return TestClient(app)


@pytest.fixture
def registered_dataset():
    df = pd.DataFrame({
        "Campaign_ID": [1, 2, 3],
        "Company": ["TechCorp", "Innovate", "Alpha"],
        "Campaign_Type": ["Search", "Social", "Display"],
        "Target_Audience": ["Men 18-24", "Women 25-34", "All 35-44"],
        "Duration": ["30 days", "15 days", "60 days"],
        "Channel_Used": ["Google Ads", "Facebook", "Instagram"],
        "Conversion_Rate": [0.05, 0.08, 0.03],
        "Acquisition_Cost": [150.0, 200.0, 120.0],
        "ROI": [3.5, 4.2, 2.1],
        "Location": ["New York", "London", "Tokyo"],
    })
    dataset_id = save_dataset(df, filename="Marketing_Campaigns.csv")
    return dataset_id


def test_api_powerbi_environment(client):
    response = client.get("/api/v1/powerbi/environment")
    assert response.status_code == 200
    data = response.json()
    assert "is_installed" in data
    assert "can_launch" in data
    assert "notes" in data


def test_api_powerbi_generate_success(client, registered_dataset):
    payload = {
        "dataset_id": registered_dataset,
        "custom_project_name": "API_Campaign_Test",
    }
    response = client.post("/api/v1/powerbi/generate", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert data["artifact_id"].startswith("pbi_")
    assert data["project_name"] == "API_Campaign_Test"
    assert data["pbip_path"].endswith(".pbip")
    assert data["zip_path"].endswith(".zip")
    assert data["validation"]["is_valid"] is True
    assert len(data["files_created"]) > 0

    # Test download endpoint
    artifact_id = data["artifact_id"]
    dl_resp = client.get(f"/api/v1/powerbi/download/{artifact_id}")
    assert dl_resp.status_code == 200
    assert dl_resp.headers["content-type"] == "application/zip"
    assert len(dl_resp.content) > 0

    # Test validate endpoint
    val_resp = client.post("/api/v1/powerbi/validate", json={"artifact_id": artifact_id})
    assert val_resp.status_code == 200
    val_data = val_resp.json()
    assert val_data["is_valid"] is True


def test_api_powerbi_generate_not_found(client):
    response = client.post(
        "/api/v1/powerbi/generate",
        json={"dataset_id": "nonexistent_dataset_9999"},
    )
    assert response.status_code == 404


def test_api_powerbi_launch(client, registered_dataset):
    # First generate
    gen_resp = client.post(
        "/api/v1/powerbi/generate",
        json={"dataset_id": registered_dataset},
    )
    artifact_id = gen_resp.json()["artifact_id"]

    # Call launch
    launch_resp = client.post(
        "/api/v1/powerbi/launch",
        json={"artifact_id": artifact_id},
    )
    assert launch_resp.status_code == 200
    res_data = launch_resp.json()
    assert "success" in res_data
