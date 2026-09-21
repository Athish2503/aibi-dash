import json
import os
import re
import shutil
import uuid
import zipfile
from typing import Optional, Union
import pandas as pd

from backend.app.config import settings
from backend.app.agent.plan_schemas import DashboardPlan
from backend.app.data.schemas import DatasetProfileResult
from backend.app.powerbi.schemas import (
    PBIPManifest,
    PBIPArtifact,
    PBIPArtifactReport,
    PBIPSettings,
)
from backend.app.powerbi.semantic_model_builder import SemanticModelBuilder
from backend.app.powerbi.report_builder import ReportBuilder


class ProjectBuilder:
    """
    Assembles complete Power BI Project (.pbip) directory structures
    and bundles them into standalone zip distributions.
    """

    def __init__(self, output_root: Optional[str] = None):
        self.output_root = output_root or str(settings.GENERATED_DIR)
        os.makedirs(self.output_root, exist_ok=True)
        self.semantic_builder = SemanticModelBuilder()
        self.report_builder = ReportBuilder()

    @staticmethod
    def sanitize_project_name(name: str) -> str:
        """Sanitizes project name for filesystem paths."""
        cleaned = re.sub(r"[^a-zA-Z0-9_-]", "_", name).strip("_")
        return cleaned or "PowerBI_Dashboard"

    def build_project(
        self,
        plan: DashboardPlan,
        columns_info: Union[dict[str, str], list[str], pd.DataFrame, DatasetProfileResult],
        dataset_content: Optional[bytes] = None,
        dataset_filename: Optional[str] = None,
        custom_project_name: Optional[str] = None,
    ) -> dict:
        """
        Builds the entire .pbip directory tree and packages it as a zip archive.
        Returns paths and manifest information.
        """
        artifact_id = f"pbi_{uuid.uuid4().hex[:10]}"
        raw_name = custom_project_name or plan.title or plan.dataset_name
        project_name = self.sanitize_project_name(raw_name)

        artifact_dir = os.path.join(self.output_root, artifact_id)
        project_dir = os.path.join(artifact_dir, project_name)
        report_dir = os.path.join(project_dir, f"{project_name}.Report")
        semantic_dir = os.path.join(project_dir, f"{project_name}.SemanticModel")
        data_dir = os.path.join(project_dir, "data")

        os.makedirs(report_dir, exist_ok=True)
        os.makedirs(semantic_dir, exist_ok=True)
        os.makedirs(data_dir, exist_ok=True)

        files_created: list[str] = []

        # 1. Save data file
        ds_name = dataset_filename or f"{self.semantic_builder.sanitize_table_name(plan.dataset_name)}.csv"
        data_file_path = os.path.join(data_dir, ds_name)
        relative_data_path = f"./data/{ds_name}"

        if dataset_content:
            with open(data_file_path, "wb") as f:
                f.write(dataset_content)
            files_created.append(data_file_path)
        elif isinstance(columns_info, pd.DataFrame):
            columns_info.to_csv(data_file_path, index=False)
            files_created.append(data_file_path)

        # 2. Build and write Semantic Model (TMSL/BIM & PBISM)
        tmsl_db = self.semantic_builder.build_semantic_model(
            dataset_name=plan.dataset_name,
            columns_info=columns_info,
            measures=plan.measures,
            data_source_path=relative_data_path,
        )

        model_bim_path = os.path.join(semantic_dir, "model.bim")
        with open(model_bim_path, "w", encoding="utf-8") as f:
            json.dump(tmsl_db.model_dump(), f, indent=2)
        files_created.append(model_bim_path)

        pbism_path = os.path.join(semantic_dir, "definition.pbism")
        with open(pbism_path, "w", encoding="utf-8") as f:
            json.dump(self.semantic_builder.build_definition_pbism().model_dump(), f, indent=2)
        files_created.append(pbism_path)

        # 3. Build and write Report Definition (report.json & definition.pbir)
        table_name = tmsl_db.model.tables[0].name if tmsl_db.model.tables else "Campaigns"
        report_def = self.report_builder.build_report_definition(plan, table_name)

        report_json_path = os.path.join(report_dir, "report.json")
        with open(report_json_path, "w", encoding="utf-8") as f:
            json.dump(report_def.model_dump(), f, indent=2)
        files_created.append(report_json_path)

        pbir_path = os.path.join(report_dir, "definition.pbir")
        with open(pbir_path, "w", encoding="utf-8") as f:
            json.dump(
                self.report_builder.build_definition_pbir(project_name).model_dump(),
                f,
                indent=2,
            )
        files_created.append(pbir_path)

        # 4. Build and write Root .pbip manifest
        pbip_manifest = PBIPManifest(
            version="1.0",
            artifacts=[
                PBIPArtifact(
                    report=PBIPArtifactReport(path=f"{project_name}.Report")
                )
            ],
            settings=PBIPSettings(enableAutoAuth=True),
        )

        pbip_file_path = os.path.join(project_dir, f"{project_name}.pbip")
        with open(pbip_file_path, "w", encoding="utf-8") as f:
            json.dump(pbip_manifest.model_dump(), f, indent=2)
        files_created.append(pbip_file_path)

        # 5. Package as ZIP archive
        zip_path = os.path.join(artifact_dir, f"{project_name}.zip")
        with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as zip_f:
            for root, _, files in os.walk(project_dir):
                for file in files:
                    full_p = os.path.join(root, file)
                    rel_p = os.path.relpath(full_p, artifact_dir)
                    zip_f.write(full_p, rel_p)
        files_created.append(zip_path)

        return {
            "artifact_id": artifact_id,
            "project_name": project_name,
            "project_dir": project_dir,
            "artifact_dir": artifact_dir,
            "pbip_path": pbip_file_path,
            "zip_path": zip_path,
            "report_json_path": report_json_path,
            "model_bim_path": model_bim_path,
            "files_created": files_created,
            "table_name": table_name,
        }
