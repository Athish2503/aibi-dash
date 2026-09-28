import os
import json
import pytest
import pandas as pd
from fastapi.testclient import TestClient

from backend.app.main import app
from backend.app.agent.dashboard_planner import DashboardPlanner
from backend.app.data.profiler import profile_dataset
from backend.app.data.storage import save_dataset
from backend.app.dashboard.spec import DashboardSpec
from backend.app.dashboard.solution_builder import BISolutionBuilder


client = TestClient(app)


@pytest.fixture
def sample_df():
    return pd.DataFrame({
        "Campaign_ID": [f"C{i:03d}" for i in range(1, 21)],
        "Channel_Used": ["Google Ads", "LinkedIn Ads", "Meta Ads", "TikTok Ads"] * 5,
        "Target_Audience": ["Enterprise B2B", "Millennials", "Retail Buyers", "Students"] * 5,
        "Location": ["North America", "EMEA", "APAC", "LATAM"] * 5,
        "Acquisition_Cost": [120.0, 350.0, 95.0, 60.0] * 5,
        "ROI": [4.5, 3.2, 5.8, 6.1] * 5,
        "Conversion_Rate": [8.5, 5.2, 11.0, 14.2] * 5,
        "Duration_Days": [30, 45, 15, 60] * 5,
    })


def test_dashboard_spec_roundtrip(sample_df):
    profile = profile_dataset(sample_df)
    planner = DashboardPlanner()
    plan = planner.generate_deterministic_plan(
        dataset_name="Test_Marketing.csv",
        columns=list(sample_df.columns),
        profile=profile,
    )

    spec = DashboardSpec.from_dashboard_plan(plan, dataset_id="ds_123")
    assert spec.title == plan.title
    assert spec.dataset_name == "Test_Marketing.csv"
    assert spec.dataset_id == "ds_123"
    assert len(spec.pages) == len(plan.pages)
    assert len(spec.global_filters) > 0

    web_spec = spec.to_web_spec()
    assert "pages" in web_spec
    assert "globalFilters" in web_spec
    assert "measures" in web_spec
    assert web_spec["pages"][0]["visuals"][0]["type"] in [
        v.type.value if hasattr(v.type, "value") else str(v.type)
        for v in plan.pages[0].visuals
    ]


def test_bi_solution_builder_creates_all_synchronized_artifacts(sample_df, tmp_path):
    builder = BISolutionBuilder(output_root=str(tmp_path))
    profile = profile_dataset(sample_df)
    planner = DashboardPlanner()
    plan = planner.generate_deterministic_plan(
        dataset_name="Campaigns.csv",
        columns=list(sample_df.columns),
        profile=profile,
    )

    result = builder.build_solution(
        spec_or_plan=plan,
        df=sample_df,
        dataset_id="ds_test",
        custom_project_name="Campaign_Intelligence",
        profile=profile,
    )

    assert result["solution_id"].startswith("sol_")
    assert result["artifact_id"].startswith("pbi_")
    assert result["project_name"] == "Campaign_Intelligence"
    assert os.path.exists(result["pbip_path"])
    assert os.path.exists(result["zip_path"])
    assert os.path.exists(result["manifest_path"])

    artifact_dir = result["artifact_dir"]

    # 1. Target 1: Web dashboard IR
    web_spec_path = os.path.join(artifact_dir, "web-dashboard", "dashboard-spec.json")
    assert os.path.exists(web_spec_path)
    with open(web_spec_path, "r", encoding="utf-8") as f:
        web_spec_loaded = json.load(f)
    assert web_spec_loaded["title"] == plan.title

    # 2. Analytics snapshot
    kpis_path = os.path.join(artifact_dir, "analytics", "kpis.json")
    assert os.path.exists(kpis_path)
    with open(kpis_path, "r", encoding="utf-8") as f:
        kpis_data = json.load(f)
    assert kpis_data["total_campaigns"] == 20
    assert kpis_data["average_roi"] > 0

    segments_path = os.path.join(artifact_dir, "analytics", "segments.json")
    assert os.path.exists(segments_path)

    anomalies_path = os.path.join(artifact_dir, "analytics", "anomalies.json")
    assert os.path.exists(anomalies_path)

    # 3. Metadata
    assert os.path.exists(os.path.join(artifact_dir, "metadata", "dataset-profile.json"))
    assert os.path.exists(os.path.join(artifact_dir, "metadata", "dashboard-plan.json"))
    assert os.path.exists(os.path.join(artifact_dir, "metadata", "validation-report.json"))

    # 4. Manifest
    with open(result["manifest_path"], "r", encoding="utf-8") as f:
        manifest = json.load(f)
    assert manifest["solution_id"] == result["solution_id"]
    assert manifest["powerbi"]["is_valid"] is True
    assert manifest["web_dashboard"]["status"] == "ready"


def test_api_build_bi_solution_endpoint(sample_df):
    dataset_id = "test_build_solution_api_ds"
    save_dataset(sample_df, "Marketing_Q4.csv", dataset_id=dataset_id)


    response = client.post(
        "/api/v1/powerbi/build-solution",
        json={
            "dataset_id": dataset_id,
            "custom_project_name": "API_Solution_Test",
            "ai_assisted": False,
        },
    )

    assert response.status_code == 200
    data = response.json()
    assert data["solution_id"].startswith("sol_")
    assert data["artifact_id"].startswith("pbi_")
    assert data["project_name"] == "API_Solution_Test"
    assert "web_spec" in data
    assert "manifest" in data
    assert data["validation"]["is_valid"] is True
    assert data["web_spec"]["title"] is not None
