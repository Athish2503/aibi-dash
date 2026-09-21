import os
import json
import pytest
import pandas as pd

from backend.app.agent.plan_schemas import (
    DashboardPlan,
    DashboardPage,
    VisualSpec,
    VisualType,
    AggregationType,
    MeasureSpec,
    SlicerSpec,
    SlicerFilterType,
)
from backend.app.powerbi.project_builder import ProjectBuilder
from backend.app.powerbi.validator import PowerBIArtifactValidator


@pytest.fixture
def valid_project(tmp_path):
    builder = ProjectBuilder(output_root=str(tmp_path))
    df = pd.DataFrame({
        "Campaign_ID": [1, 2],
        "Channel_Used": ["Email", "Social"],
        "ROI": [3.5, 4.2],
        "Acquisition_Cost": [150.0, 200.0],
    })
    plan = DashboardPlan(
        dataset_name="Campaigns.csv",
        title="Valid Dashboard",
        description="A valid test plan",
        measures=[
            MeasureSpec(name="Average ROI", column="ROI", aggregation=AggregationType.AVG),
        ],
        pages=[
            DashboardPage(
                id="p1",
                title="Page 1",
                description="Summary",
                slicers=[
                    SlicerSpec(id="s1", column="Channel_Used", display_name="Channel", filter_type=SlicerFilterType.DROPDOWN),
                ],
                visuals=[
                    VisualSpec(id="v1", title="ROI Card", type=VisualType.KPI_CARD, measure="Average ROI"),
                ],
            )
        ],
    )
    result = builder.build_project(plan=plan, columns_info=df, custom_project_name="Valid_Project")
    return result["project_dir"]


def test_validator_passes_valid_project(valid_project):
    validator = PowerBIArtifactValidator()
    val_res = validator.validate_project_directory(valid_project)
    assert val_res.is_valid is True
    assert len(val_res.errors) == 0
    assert "pbip_manifest" in val_res.checked_components
    assert "report_json" in val_res.checked_components
    assert "model_bim_schema" in val_res.checked_components
    assert "report_semantic_cross_validation" in val_res.checked_components


def test_validator_fails_missing_directory():
    validator = PowerBIArtifactValidator()
    val_res = validator.validate_project_directory("nonexistent_dir_12345")
    assert val_res.is_valid is False
    assert any("does not exist" in e for e in val_res.errors)


def test_validator_fails_missing_manifest(valid_project):
    validator = PowerBIArtifactValidator()
    pbip_file = os.path.join(valid_project, "Valid_Project.pbip")
    os.remove(pbip_file)

    val_res = validator.validate_project_directory(valid_project)
    assert val_res.is_valid is False
    assert any(".pbip file" in e for e in val_res.errors)


def test_validator_fails_missing_measure_binding(valid_project):
    validator = PowerBIArtifactValidator()
    report_json_path = os.path.join(valid_project, "Valid_Project.Report", "report.json")

    with open(report_json_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    # Modify query to reference a non-existent measure
    data["pages"][0]["visualContainers"][1]["query"]["measure"] = "Non_Existent_Measure"

    with open(report_json_path, "w", encoding="utf-8") as f:
        json.dump(data, f)

    val_res = validator.validate_project_directory(valid_project)
    assert val_res.is_valid is False
    assert any("references measure 'Non_Existent_Measure'" in e for e in val_res.errors)


def test_validator_fails_missing_slicer_column_binding(valid_project):
    validator = PowerBIArtifactValidator()
    report_json_path = os.path.join(valid_project, "Valid_Project.Report", "report.json")

    with open(report_json_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    # Modify slicer query to reference non-existent column
    data["pages"][0]["visualContainers"][0]["query"]["column"] = "Missing_Column"

    with open(report_json_path, "w", encoding="utf-8") as f:
        json.dump(data, f)

    val_res = validator.validate_project_directory(valid_project)
    assert val_res.is_valid is False
    assert any("references column 'Missing_Column'" in e for e in val_res.errors)
