import json
import os
import uuid
from datetime import datetime, timezone
from typing import Any, Optional, Union
import pandas as pd

from backend.app.config import settings
from backend.app.agent.plan_schemas import DashboardPlan
from backend.app.data.schemas import DatasetProfileResult
from backend.app.data.profiler import profile_dataset
from backend.app.analytics.kpis import calculate_kpis
from backend.app.analytics.segmentation import analyze_channels, analyze_audiences, analyze_geography
from backend.app.analytics.anomalies import detect_anomalies
from backend.app.powerbi.project_builder import ProjectBuilder
from backend.app.powerbi.validator import PowerBIArtifactValidator
from backend.app.powerbi.desktop_validator import PowerBIDesktopValidator
from backend.app.dashboard.spec import DashboardSpec, BISolutionManifest


class BISolutionBuilder:
    """
    Dual-target compiler that compiles a canonical DashboardSpec IR into:
    1. Interactive Web Dashboard runtime specification (web-dashboard/dashboard-spec.json)
    2. Native Microsoft Power BI project (.pbip + .Report + .SemanticModel + DAX measures)
    3. Grounded deterministic analytics snapshots (KPIs, Segments, Anomalies)
    4. Validation and metadata verification reports
    """

    def __init__(self, output_root: Optional[str] = None):
        self.output_root = output_root or str(settings.GENERATED_DIR)
        os.makedirs(self.output_root, exist_ok=True)
        self.project_builder = ProjectBuilder(self.output_root)
        self.artifact_validator = PowerBIArtifactValidator()
        self.desktop_validator = PowerBIDesktopValidator()

    def build_solution(
        self,
        spec_or_plan: Union[DashboardSpec, DashboardPlan],
        df: pd.DataFrame,
        dataset_id: Optional[str] = None,
        dataset_filename: Optional[str] = None,
        custom_project_name: Optional[str] = None,
        profile: Optional[DatasetProfileResult] = None,
    ) -> dict[str, Any]:
        """
        Executes end-to-end synchronized build for both visualization targets.
        """
        # 1. Normalize to canonical DashboardSpec IR and DashboardPlan
        if isinstance(spec_or_plan, DashboardPlan):
            spec = DashboardSpec.from_dashboard_plan(spec_or_plan, dataset_id=dataset_id)
            plan = spec_or_plan
        else:
            spec = spec_or_plan
            plan = spec.to_dashboard_plan()

        raw_name = custom_project_name or spec.title or spec.dataset_name
        project_name = self.project_builder.sanitize_project_name(raw_name)
        solution_id = f"sol_{uuid.uuid4().hex[:10]}"

        # 2. Build Power BI Project (.pbip, .Report, .SemanticModel, zip)
        pbi_result = self.project_builder.build_project(
            plan=plan,
            columns_info=df,
            dataset_filename=dataset_filename or spec.dataset_name,
            custom_project_name=project_name,
        )

        artifact_dir = pbi_result["artifact_dir"]
        project_dir = pbi_result["project_dir"]

        # 3. Create synchronized deliverable directories inside the artifact bundle
        web_dir = os.path.join(artifact_dir, "web-dashboard")
        analytics_dir = os.path.join(artifact_dir, "analytics")
        metadata_dir = os.path.join(artifact_dir, "metadata")

        os.makedirs(web_dir, exist_ok=True)
        os.makedirs(analytics_dir, exist_ok=True)
        os.makedirs(metadata_dir, exist_ok=True)

        files_created = list(pbi_result["files_created"])

        # 4. Target 1: Export Web Dashboard Specification (IR)
        web_spec = spec.to_web_spec()
        web_spec_path = os.path.join(web_dir, "dashboard-spec.json")
        with open(web_spec_path, "w", encoding="utf-8") as f:
            json.dump(web_spec, f, indent=2)
        files_created.append(web_spec_path)

        # 5. Deterministic Analytics Snapshot (KPIs, Segments, Anomalies)
        kpis_data = calculate_kpis(df)
        kpis_path = os.path.join(analytics_dir, "kpis.json")
        with open(kpis_path, "w", encoding="utf-8") as f:
            json.dump(kpis_data, f, indent=2)
        files_created.append(kpis_path)

        segments_data = {
            "channels": analyze_channels(df) if "Channel_Used" in df.columns else [],
            "audiences": analyze_audiences(df) if "Target_Audience" in df.columns else [],
            "geography": analyze_geography(df) if "Location" in df.columns else [],
        }
        segments_path = os.path.join(analytics_dir, "segments.json")
        with open(segments_path, "w", encoding="utf-8") as f:
            json.dump(segments_data, f, indent=2)
        files_created.append(segments_path)

        anomalies_data = {
            "roi_anomalies": detect_anomalies(df, method="iqr", columns=["ROI"]) if "ROI" in df.columns else [],
            "cost_anomalies": detect_anomalies(df, method="iqr", columns=["Acquisition_Cost"]) if "Acquisition_Cost" in df.columns else [],
        }
        anomalies_path = os.path.join(analytics_dir, "anomalies.json")
        with open(anomalies_path, "w", encoding="utf-8") as f:
            json.dump(anomalies_data, f, indent=2)
        files_created.append(anomalies_path)


        # 6. Metadata & Validation Reports
        ds_profile = profile or profile_dataset(df)
        profile_path = os.path.join(metadata_dir, "dataset-profile.json")
        with open(profile_path, "w", encoding="utf-8") as f:
            json.dump(ds_profile.model_dump(), f, indent=2)
        files_created.append(profile_path)

        plan_path = os.path.join(metadata_dir, "dashboard-plan.json")
        with open(plan_path, "w", encoding="utf-8") as f:
            json.dump(plan.model_dump(), f, indent=2)
        files_created.append(plan_path)

        # Validate generated Power BI project structure
        validation = self.artifact_validator.validate_project_directory(project_dir)
        validation_path = os.path.join(metadata_dir, "validation-report.json")
        with open(validation_path, "w", encoding="utf-8") as f:
            json.dump(validation.model_dump(), f, indent=2)
        files_created.append(validation_path)

        # Detect local Power BI Desktop environment
        desktop_status = self.desktop_validator.detect_environment()

        # 7. Write Root Solution Manifest linking synchronized deliverables
        now_ts = datetime.now(timezone.utc).isoformat()
        manifest = BISolutionManifest(
            solution_id=solution_id,
            spec_id=spec.spec_id,
            project_name=project_name,
            timestamp=now_ts,
            web_dashboard={
                "status": "ready",
                "spec_path": web_spec_path,
                "pages_count": len(spec.pages),
                "visuals_count": sum(len(p.visuals) for p in spec.pages),
                "supports_cross_filtering": True,
                "supports_drilldown": True,
            },
            powerbi={
                "status": "ready",
                "pbip_path": pbi_result["pbip_path"],
                "zip_path": pbi_result["zip_path"],
                "report_dir": os.path.join(project_dir, f"{project_name}.Report"),
                "semantic_dir": os.path.join(project_dir, f"{project_name}.SemanticModel"),
                "is_valid": validation.is_valid,
            },
            analytics={
                "status": "computed",
                "kpis_path": kpis_path,
                "segments_path": segments_path,
                "anomalies_path": anomalies_path,
                "total_campaigns": kpis_data.get("total_campaigns", 0),
                "avg_roi": kpis_data.get("average_roi", 0.0),
            },
            metadata={
                "dataset_name": spec.dataset_name,
                "dataset_id": dataset_id,
                "files_count": len(files_created),
            },
        )

        manifest_path = os.path.join(artifact_dir, "solution-manifest.json")
        with open(manifest_path, "w", encoding="utf-8") as f:
            json.dump(manifest.model_dump(), f, indent=2)
        files_created.append(manifest_path)

        return {
            "solution_id": solution_id,
            "artifact_id": pbi_result["artifact_id"],
            "spec_id": spec.spec_id,
            "project_name": project_name,
            "artifact_dir": artifact_dir,
            "project_dir": project_dir,
            "pbip_path": pbi_result["pbip_path"],
            "zip_path": pbi_result["zip_path"],
            "manifest_path": manifest_path,
            "web_spec": web_spec,
            "validation": validation,
            "desktop_status": desktop_status,
            "files_created": files_created,
            "manifest": manifest.model_dump(),
            "synchronized_at": now_ts,
        }
