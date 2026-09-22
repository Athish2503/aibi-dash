import glob
import os
from typing import Optional
from fastapi import APIRouter, HTTPException, status, Query, UploadFile, File
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field

from backend.app.config import settings
from backend.app.data.storage import get_dataset, get_dataset_metadata
from backend.app.data.profiler import profile_dataset
from backend.app.data.cleaner import clean_dataset
from backend.app.data.inspector import inspect_dataset
from backend.app.data.validator import validate_dataset
from backend.app.data.loader import load_dataset_into_df
from backend.app.agent.plan_schemas import DashboardPlan
from backend.app.agent.dashboard_planner import DashboardPlanner
from backend.app.powerbi.schemas import (
    PowerBIGenerationResult,
    PowerBIValidationResult,
    DesktopEnvironmentStatus,
)
from backend.app.powerbi.service_schemas import (
    PublishRequest,
    PublishingResult,
    ServiceConfigStatus,
    RefreshRequest,
    RefreshResult,
)
from backend.app.powerbi.project_builder import ProjectBuilder
from backend.app.powerbi.validator import PowerBIArtifactValidator
from backend.app.powerbi.desktop_validator import PowerBIDesktopValidator
from backend.app.powerbi.service_adapter import PowerBIServiceAdapter
from backend.app.powerbi.dax_validator import DeterministicDAXValidator, DAXValidationResult
from backend.app.powerbi.dax_copilot import DAXCoPilot, DAXCoPilotResult, DAXTemplate

router = APIRouter()
project_builder = ProjectBuilder()
artifact_validator = PowerBIArtifactValidator()
desktop_validator = PowerBIDesktopValidator()
service_adapter = PowerBIServiceAdapter()
dax_copilot = DAXCoPilot()
dax_validator = DeterministicDAXValidator()


class GeneratePowerBIRequest(BaseModel):
    dataset_id: str = Field(description="Identifier of previously uploaded and registered dataset")
    custom_project_name: Optional[str] = Field(default=None, description="Custom name for the Power BI project")
    ai_assisted: bool = Field(default=False, description="Whether to use AI to formulate the dashboard plan")
    prompt: Optional[str] = Field(default=None, description="Custom prompt/goals for dashboard design")
    plan: Optional[DashboardPlan] = Field(default=None, description="Optional pre-existing DashboardPlan")


class ValidatePowerBIRequest(BaseModel):
    artifact_id: Optional[str] = Field(default=None, description="ID of generated artifact to validate")
    project_dir: Optional[str] = Field(default=None, description="Explicit directory path of project")


class LaunchPowerBIRequest(BaseModel):
    artifact_id: str = Field(description="ID of generated artifact to open in Power BI Desktop")


class GenerateDAXRequest(BaseModel):
    prompt: str = Field(description="Natural-language description of calculation requirement")
    dataset_id: Optional[str] = Field(default=None, description="Optional dataset ID for schema column discovery")
    table_name: Optional[str] = Field(default="Campaigns", description="Target table name")
    custom_columns: Optional[list[str]] = Field(default=None, description="Explicit columns list")


class ValidateDAXRequest(BaseModel):
    expression: str = Field(description="DAX formula expression to validate")
    dataset_id: Optional[str] = Field(default=None, description="Optional dataset ID for schema column discovery")
    table_name: Optional[str] = Field(default="Campaigns", description="Target table name")
    available_columns: Optional[list[str]] = Field(default=None, description="Explicit available columns list")
    available_measures: Optional[list[str]] = Field(default=None, description="Explicit available measures list")


@router.post("/generate", response_model=PowerBIGenerationResult)
async def generate_powerbi_project(request: GeneratePowerBIRequest):
    """
    Generates a full Power BI Project (.pbip) bundle including TMSL/BIM semantic model,
    DAX measures, PBIR report definition, and zip distribution.
    """
    df = get_dataset(request.dataset_id)
    if df is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Dataset with ID '{request.dataset_id}' not found.",
        )

    meta = get_dataset_metadata(request.dataset_id) or {}
    dataset_name = meta.get("filename", "Campaign_Data.csv")

    try:
        # Determine plan
        if request.plan:
            plan = request.plan
        else:
            profile = profile_dataset(df)
            planner = DashboardPlanner()
            if request.ai_assisted:
                plan = planner.plan_with_ai(
                    dataset_name=dataset_name,
                    columns=list(df.columns),
                    profile=profile,
                    user_prompt=request.prompt,
                )
            else:
                plan = planner.generate_deterministic_plan(
                    dataset_name=dataset_name,
                    columns=list(df.columns),
                    profile=profile,
                )

        # Build project
        project_info = project_builder.build_project(
            plan=plan,
            columns_info=df,
            dataset_filename=dataset_name,
            custom_project_name=request.custom_project_name,
        )

        # Validate generated artifacts
        validation = artifact_validator.validate_project_directory(project_info["project_dir"])

        # Detect desktop environment
        desktop_status = desktop_validator.detect_environment()

        return PowerBIGenerationResult(
            artifact_id=project_info["artifact_id"],
            project_name=project_info["project_name"],
            output_dir=project_info["project_dir"],
            pbip_path=project_info["pbip_path"],
            zip_path=project_info["zip_path"],
            files_created=project_info["files_created"],
            validation=validation,
            desktop_status=desktop_status,
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate Power BI project: {str(e)}",
        )


@router.post("/validate", response_model=PowerBIValidationResult)
async def validate_powerbi_project(request: ValidatePowerBIRequest):
    """
    Performs structural, schema, and relational validation on a generated
    Power BI Project directory.
    """
    target_dir = request.project_dir

    if not target_dir and request.artifact_id:
        artifact_root = os.path.join(str(settings.GENERATED_DIR), request.artifact_id)
        if os.path.isdir(artifact_root):
            # Look for project folder inside
            subdirs = [
                os.path.join(artifact_root, d)
                for d in os.listdir(artifact_root)
                if os.path.isdir(os.path.join(artifact_root, d))
            ]
            if subdirs:
                target_dir = subdirs[0]
            else:
                target_dir = artifact_root

    if not target_dir or not os.path.exists(target_dir):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Target project directory not found for validation.",
        )

    return artifact_validator.validate_project_directory(target_dir)


@router.get("/environment", response_model=DesktopEnvironmentStatus)
async def get_desktop_environment():
    """
    Detects whether Power BI Desktop is installed locally, checks registry,
    and reports execution capabilities.
    """
    return desktop_validator.detect_environment()


@router.post("/launch")
async def launch_powerbi_desktop(request: LaunchPowerBIRequest):
    """
    Attempts to open a generated .pbip project in the local Power BI Desktop instance.
    """
    artifact_root = os.path.join(str(settings.GENERATED_DIR), request.artifact_id)
    if not os.path.isdir(artifact_root):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Artifact '{request.artifact_id}' not found.",
        )

    # Find .pbip file
    pbip_matches = glob.glob(os.path.join(artifact_root, "**", "*.pbip"), recursive=True)
    if not pbip_matches:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No .pbip file found in artifact '{request.artifact_id}'.",
        )

    result = desktop_validator.launch_desktop(pbip_matches[0])
    return result


@router.get("/download/{artifact_id}")
async def download_powerbi_bundle(artifact_id: str):
    """
    Downloads the zipped standalone Power BI project bundle for local desktop use.
    """
    artifact_root = os.path.join(str(settings.GENERATED_DIR), artifact_id)
    if not os.path.isdir(artifact_root):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Artifact with ID '{artifact_id}' not found.",
        )

    zip_matches = glob.glob(os.path.join(artifact_root, "*.zip"))
    if not zip_matches:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No zip archive found for artifact '{artifact_id}'.",
        )

    zip_path = zip_matches[0]
    filename = os.path.basename(zip_path)

    return FileResponse(
        path=zip_path,
        media_type="application/zip",
        filename=filename,
    )


# --- Power BI Service / Fabric Endpoints ---

@router.get("/service/status", response_model=ServiceConfigStatus)
async def get_service_status():
    """
    Returns Azure AD and Power BI Service configuration and authentication readiness.
    """
    return service_adapter.get_config_status()


@router.post("/service/publish", response_model=PublishingResult)
async def publish_to_service(request: PublishRequest):
    """
    Publishes a generated Power BI artifact to Power BI Service / Fabric,
    progressing through: NOT_CONFIGURED -> AUTHENTICATED -> WORKSPACE_READY ->
    MODEL_CREATED -> REPORT_CREATED -> PUBLISHED -> REFRESHED.
    """
    result = service_adapter.publish_project(
        artifact_id=request.artifact_id,
        workspace_id=request.workspace_id,
        target_report_name=request.target_report_name,
    )
    return result


@router.post("/service/refresh", response_model=RefreshResult)
async def refresh_service_dataset(request: RefreshRequest):
    """
    Triggers an on-demand dataset refresh in Power BI Service.
    """
    return service_adapter.trigger_refresh(
        dataset_id=request.dataset_id,
        workspace_id=request.workspace_id,
    )


# --- DAX Formula Studio & Launcher Script Endpoints ---

@router.get("/dax/templates", response_model=list[DAXTemplate])
async def get_dax_templates():
    """
    Returns curated, production-grade marketing DAX templates for 1-click usage.
    """
    return dax_copilot.get_templates()


@router.post("/dax/generate", response_model=DAXCoPilotResult)
async def generate_dax_formula(request: GenerateDAXRequest):
    """
    Translates a plain-English metric description into a verified DAX expression.
    """
    cols = request.custom_columns
    if not cols and request.dataset_id:
        df = get_dataset(request.dataset_id)
        if df is not None:
            cols = list(df.columns)

    return dax_copilot.generate_measure(
        prompt=request.prompt,
        table_name=request.table_name or "Campaigns",
        available_columns=cols,
    )


@router.post("/dax/validate", response_model=DAXValidationResult)
async def validate_dax_formula(request: ValidateDAXRequest):
    """
    Deterministically validates a DAX expression against syntax, function lists,
    and dataset schema columns.
    """
    cols = request.available_columns
    if not cols and request.dataset_id:
        df = get_dataset(request.dataset_id)
        if df is not None:
            cols = list(df.columns)

    return dax_validator.validate(
        expression=request.expression,
        table_name=request.table_name or "Campaigns",
        available_columns=cols,
        available_measures=request.available_measures,
    )


@router.get("/launcher/{artifact_id}")
async def download_launcher_script(artifact_id: str, script_type: str = Query(default="bat")):
    """
    Downloads either 'run_in_powerbi.bat' or 'launch_report.ps1' directly for an artifact.
    """
    artifact_root = os.path.join(str(settings.GENERATED_DIR), artifact_id)
    if not os.path.isdir(artifact_root):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Artifact with ID '{artifact_id}' not found.",
        )

    target_name = "launch_report.ps1" if script_type.lower() == "ps1" else "run_in_powerbi.bat"
    matches = glob.glob(os.path.join(artifact_root, "**", target_name), recursive=True)
    if not matches:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Launcher script '{target_name}' not found for artifact '{artifact_id}'.",
        )

    media_type = "text/plain"
    return FileResponse(
        path=matches[0],
        media_type=media_type,
        filename=target_name,
    )

