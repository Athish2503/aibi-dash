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
from backend.app.powerbi.project_builder import ProjectBuilder
from backend.app.powerbi.validator import PowerBIArtifactValidator
from backend.app.powerbi.desktop_validator import PowerBIDesktopValidator

router = APIRouter()
project_builder = ProjectBuilder()
artifact_validator = PowerBIArtifactValidator()
desktop_validator = PowerBIDesktopValidator()


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
