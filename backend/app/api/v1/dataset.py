from fastapi import APIRouter, UploadFile, File, HTTPException, status, Query
import io
import pandas as pd
from typing import Any, Optional
from pydantic import BaseModel

from backend.app.config import settings
from backend.app.data.schemas import (
    DatasetInspectionResult,
    DatasetValidationResult,
    DatasetProfileResult,
    DatasetCleaningResult,
)
from backend.app.data.inspector import inspect_dataset
from backend.app.data.validator import validate_dataset
from backend.app.data.cleaner import clean_dataset
from backend.app.data.profiler import profile_dataset
from backend.app.data.loader import load_dataset_into_df
from backend.app.data.storage import save_dataset, get_dataset
from backend.app.agent.plan_schemas import DashboardPlan
from backend.app.agent.dashboard_planner import DashboardPlanner
from backend.app.analytics.comparator import DatasetComparator, DatasetComparisonResult

router = APIRouter()


class DatasetPipelineResponse(BaseModel):
    dataset_id: Optional[str] = None
    inspection: DatasetInspectionResult
    validation: DatasetValidationResult
    cleaning: DatasetCleaningResult
    profiling: DatasetProfileResult


async def _read_and_validate_upload(file: UploadFile) -> tuple[bytes, str]:
    """Helper to validate file format and size."""
    if not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File must have a valid filename.",
        )

    file_ext = "." + file.filename.lower().split(".")[-1] if "." in file.filename else ""
    if file_ext not in settings.ALLOWED_EXTENSIONS:
        allowed_list = ", ".join(sorted(settings.ALLOWED_EXTENSIONS))
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid file format '{file_ext}'. Supported formats: {allowed_list}.",
        )

    content = await file.read()
    if len(content) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The uploaded file is empty.",
        )

    if len(content) > settings.MAX_FILE_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File exceeds maximum allowed size of {settings.MAX_FILE_SIZE_BYTES // (1024*1024)}MB.",
        )

    return content, file.filename


@router.post("/inspect", response_model=DatasetInspectionResult)
async def inspect_uploaded_dataset(file: UploadFile = File(...)):
    """Inspects an uploaded CSV or XLSX file to report shape, data types, nulls, and sample records."""
    content, filename = await _read_and_validate_upload(file)
    try:
        result = inspect_dataset(content, file_name=filename)
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Error inspecting dataset: {str(e)}",
        )


@router.post("/validate", response_model=DatasetValidationResult)
async def validate_uploaded_dataset(file: UploadFile = File(...)):
    """Validates the uploaded CSV or XLSX schema and column constraints against marketing criteria."""
    content, filename = await _read_and_validate_upload(file)
    try:
        df, _ = load_dataset_into_df(content, file_name=filename)
        result = validate_dataset(df, file_name=filename)
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Error parsing/validating dataset: {str(e)}",
        )


@router.post("/profile", response_model=DatasetProfileResult)
async def profile_uploaded_dataset(file: UploadFile = File(...)):
    """Profiles the statistical and categorical distribution of the uploaded CSV or XLSX."""
    content, filename = await _read_and_validate_upload(file)
    try:
        df, _ = load_dataset_into_df(content, file_name=filename)
        cleaned_df, _ = clean_dataset(df)
        return profile_dataset(cleaned_df)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Error profiling dataset: {str(e)}",
        )


HTTP_422 = getattr(status, "HTTP_422_UNPROCESSABLE_CONTENT", 422)


@router.post("/pipeline", response_model=DatasetPipelineResponse)
async def process_dataset_pipeline(
    file: UploadFile = File(...),
    strict: bool = Query(default=False, description="Whether to fail on missing standard marketing columns"),
):
    """
    Executes the complete dataset intelligence pipeline:
    Inspect -> Validate -> Clean -> Profile (supports CSV and XLSX).
    When strict=False, allows flexible custom schemas while reporting quality/schema warnings.
    """
    content, filename = await _read_and_validate_upload(file)
    try:
        # 1. Inspect
        inspection = inspect_dataset(content, file_name=filename)

        # 2. Validate
        raw_df, _ = load_dataset_into_df(content, file_name=filename)
        validation = validate_dataset(raw_df, file_name=filename)

        if strict and not validation.is_valid:
            raise HTTPException(
                status_code=HTTP_422,
                detail={
                    "message": "Dataset failed strict marketing schema validation",
                    "validation": validation.model_dump(),
                },
            )

        # 3. Clean
        cleaned_df, cleaning = clean_dataset(raw_df)

        # 4. Profile
        profiling = profile_dataset(cleaned_df)

        # 5. Register in storage
        dataset_id = save_dataset(cleaned_df, filename=filename)

        return DatasetPipelineResponse(
            dataset_id=dataset_id,
            inspection=inspection,
            validation=validation,
            cleaning=cleaning,
            profiling=profiling,
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=HTTP_422,
            detail=f"Failed to process dataset pipeline: {str(e)}",
        )


@router.post("/plan", response_model=DashboardPlan)
async def generate_dashboard_plan_for_dataset(
    file: UploadFile = File(...),
    ai_assisted: bool = Query(default=False, description="Whether to customize the plan using Gemini AI"),
    prompt: Optional[str] = Query(default=None, description="Optional analytical goals or customization instructions"),
    strict: bool = Query(default=False, description="Whether to enforce strict marketing schema"),
):
    """
    Generates a Power BI-ready typed DashboardPlan for an uploaded CSV/XLSX dataset.
    Supports deterministic planning and AI-assisted customization with Gemini.
    """
    content, filename = await _read_and_validate_upload(file)
    try:
        raw_df, _ = load_dataset_into_df(content, file_name=filename)
        validation = validate_dataset(raw_df, file_name=filename)
        if strict and not validation.is_valid:
            raise HTTPException(
                status_code=HTTP_422,
                detail={
                    "message": "Dataset failed schema validation prior to planning",
                    "validation": validation.model_dump(),
                },
            )

        cleaned_df, _ = clean_dataset(raw_df)
        profiling = profile_dataset(cleaned_df)

        planner = DashboardPlanner()
        if ai_assisted:
            plan = planner.plan_with_ai(
                dataset_name=filename,
                columns=list(cleaned_df.columns),
                profile=profiling,
                user_prompt=prompt,
            )
        else:
            plan = planner.generate_deterministic_plan(
                dataset_name=filename,
                columns=list(cleaned_df.columns),
                profile=profiling,
            )

        return plan
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=HTTP_422,
            detail=f"Failed to generate dashboard plan: {str(e)}",
        )


class CompareByIdRequest(BaseModel):
    dataset_id_a: str
    dataset_id_b: str
    label_a: Optional[str] = "Baseline"
    label_b: Optional[str] = "Comparison"


@router.post("/compare", response_model=DatasetComparisonResult)
async def compare_uploaded_datasets(
    file_a: UploadFile = File(..., description="Baseline dataset (e.g. Q1 / Brand A)"),
    file_b: UploadFile = File(..., description="Comparison dataset (e.g. Q2 / Brand B)"),
    label_a: str = Query(default="Baseline"),
    label_b: str = Query(default="Comparison"),
):
    """
    Deterministically compares two uploaded marketing campaign datasets,
    calculating exact metric variances, channel-by-channel performance shifts,
    and executive highlight summaries.
    """
    content_a, fn_a = await _read_and_validate_upload(file_a)
    content_b, fn_b = await _read_and_validate_upload(file_b)

    try:
        raw_a, _ = load_dataset_into_df(content_a, file_name=fn_a)
        clean_a, _ = clean_dataset(raw_a)

        raw_b, _ = load_dataset_into_df(content_b, file_name=fn_b)
        clean_b, _ = clean_dataset(raw_b)

        result = DatasetComparator.compare(
            df_a=clean_a,
            df_b=clean_b,
            label_a=label_a or fn_a,
            label_b=label_b or fn_b,
        )
        return result
    except Exception as e:
        raise HTTPException(
            status_code=HTTP_422,
            detail=f"Failed to compare datasets: {str(e)}",
        )


@router.post("/compare-by-id", response_model=DatasetComparisonResult)
async def compare_datasets_by_id(request: CompareByIdRequest):
    """
    Compares two registered datasets by their session dataset IDs.
    """
    df_a = get_dataset(request.dataset_id_a)
    if df_a is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Baseline dataset '{request.dataset_id_a}' not found.",
        )

    df_b = get_dataset(request.dataset_id_b)
    if df_b is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Comparison dataset '{request.dataset_id_b}' not found.",
        )

    return DatasetComparator.compare(
        df_a=df_a,
        df_b=df_b,
        label_a=request.label_a or "Baseline",
        label_b=request.label_b or "Comparison",
    )


