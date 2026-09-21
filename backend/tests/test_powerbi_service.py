import pytest
from unittest.mock import patch
import pandas as pd
from fastapi.testclient import TestClient

from backend.app.main import app
from backend.app.data.storage import save_dataset
from backend.app.powerbi.service_adapter import PowerBIServiceAdapter
from backend.app.powerbi.service_schemas import PublishingState, ServiceConfigStatus


@pytest.fixture
def client():
    return TestClient(app)


@pytest.fixture
def sample_dataset():
    df = pd.DataFrame({
        "Campaign_ID": [1, 2],
        "Company": ["Acme", "Beta"],
        "Channel_Used": ["Search", "Social"],
        "Acquisition_Cost": [100.0, 200.0],
        "ROI": [2.5, 3.8],
    })
    return save_dataset(df, filename="Service_Test_Data.csv")


def test_service_adapter_config_status():
    adapter = PowerBIServiceAdapter()
    status = adapter.get_config_status()
    assert isinstance(status, ServiceConfigStatus)
    assert hasattr(status, "configured")
    assert hasattr(status, "mock_mode")


def test_service_publish_lifecycle(client, sample_dataset):
    # 1. Generate Power BI project
    gen_resp = client.post(
        "/api/v1/powerbi/generate",
        json={"dataset_id": sample_dataset, "custom_project_name": "Service_Publish_Test"},
    )
    assert gen_resp.status_code == 200
    artifact_id = gen_resp.json()["artifact_id"]

    # 2. Test publishing in mock mode
    adapter = PowerBIServiceAdapter()
    with patch.object(adapter, "mock_mode", True):
        res = adapter.publish_project(artifact_id=artifact_id, workspace_id="ws_marketing_123")
        assert res.state == PublishingState.REFRESHED
        assert res.report_id is not None
        assert res.dataset_id is not None
        assert "app.powerbi.com" in res.web_url
        assert len(res.steps) == 6

        step_names = [s.step for s in res.steps]
        assert "Authentication" in step_names
        assert "Workspace Verification" in step_names
        assert "Semantic Model Creation" in step_names
        assert "Report Definition Provisioning" in step_names
        assert "Publish to Power BI Service" in step_names
        assert "Initial Data Refresh" in step_names


def test_service_publish_not_configured_returns_clean_state(client, sample_dataset):
    gen_resp = client.post(
        "/api/v1/powerbi/generate",
        json={"dataset_id": sample_dataset},
    )
    artifact_id = gen_resp.json()["artifact_id"]

    adapter = PowerBIServiceAdapter()
    with patch.object(adapter, "mock_mode", False), patch.object(adapter, "client_id", None):
        res = adapter.publish_project(artifact_id=artifact_id)
        assert res.state == PublishingState.NOT_CONFIGURED
        assert res.error is not None
        assert "not configured" in res.error.lower()


def test_api_service_endpoints(client, sample_dataset):
    # Status endpoint
    status_resp = client.get("/api/v1/powerbi/service/status")
    assert status_resp.status_code == 200
    assert "mock_mode" in status_resp.json()

    # Generate first
    gen_resp = client.post(
        "/api/v1/powerbi/generate",
        json={"dataset_id": sample_dataset},
    )
    artifact_id = gen_resp.json()["artifact_id"]

    # Publish endpoint
    pub_resp = client.post(
        "/api/v1/powerbi/service/publish",
        json={"artifact_id": artifact_id, "workspace_id": "test_ws"},
    )
    assert pub_resp.status_code == 200
    pub_data = pub_resp.json()
    assert pub_data["state"] in [PublishingState.REFRESHED.value, PublishingState.NOT_CONFIGURED.value]

    # Refresh endpoint
    ref_resp = client.post(
        "/api/v1/powerbi/service/refresh",
        json={"dataset_id": "ds_test_123"},
    )
    assert ref_resp.status_code == 200
    assert ref_resp.json()["success"] is True
