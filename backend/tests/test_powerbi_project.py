import os
import zipfile
import pytest
import pandas as pd

from backend.app.agent.plan_schemas import (
    DashboardPlan,
    DashboardPage,
    VisualSpec,
    VisualType,
    AggregationType,
    MeasureSpec,
)
from backend.app.powerbi.project_builder import ProjectBuilder


def test_build_project_complete(tmp_path):
    builder = ProjectBuilder(output_root=str(tmp_path))

    df = pd.DataFrame({
        "Campaign_ID": [1, 2],
        "Channel_Used": ["Email", "Social"],
        "ROI": [3.5, 4.2],
        "Acquisition_Cost": [150.0, 200.0],
    })

    plan = DashboardPlan(
        dataset_name="Campaigns.csv",
        title="Test Marketing",
        description="Testing project build",
        measures=[
            MeasureSpec(name="Average ROI", column="ROI", aggregation=AggregationType.AVG),
        ],
        pages=[
            DashboardPage(
                id="p1",
                title="Page 1",
                description="Summary",
                visuals=[
                    VisualSpec(id="v1", title="ROI Card", type=VisualType.KPI_CARD, measure="Average ROI"),
                ],
            )
        ],
    )

    result = builder.build_project(
        plan=plan,
        columns_info=df,
        custom_project_name="Marketing_Test_Proj",
    )

    project_dir = result["project_dir"]
    assert os.path.exists(project_dir)

    # Check .pbip
    pbip_file = os.path.join(project_dir, "Marketing_Test_Proj.pbip")
    assert os.path.exists(pbip_file)

    # Check Report dir
    report_dir = os.path.join(project_dir, "Marketing_Test_Proj.Report")
    assert os.path.exists(os.path.join(report_dir, "definition.pbir"))
    assert os.path.exists(os.path.join(report_dir, "report.json"))

    # Check SemanticModel dir
    semantic_dir = os.path.join(project_dir, "Marketing_Test_Proj.SemanticModel")
    assert os.path.exists(os.path.join(semantic_dir, "definition.pbism"))
    assert os.path.exists(os.path.join(semantic_dir, "model.bim"))

    # Check data file
    data_dir = os.path.join(project_dir, "data")
    assert os.path.exists(data_dir)
    assert len(os.listdir(data_dir)) == 1

    # Check launcher scripts
    assert os.path.exists(os.path.join(project_dir, "run_in_powerbi.bat"))
    assert os.path.exists(os.path.join(project_dir, "launch_report.ps1"))

    # Check zip
    zip_path = result["zip_path"]
    assert os.path.exists(zip_path)
    assert zipfile.is_zipfile(zip_path)

    with zipfile.ZipFile(zip_path, "r") as z:
        names = z.namelist()
        assert any("Marketing_Test_Proj.pbip" in n for n in names)
        assert any("report.json" in n for n in names)
        assert any("model.bim" in n for n in names)
        assert any("run_in_powerbi.bat" in n for n in names)
        assert any("launch_report.ps1" in n for n in names)

