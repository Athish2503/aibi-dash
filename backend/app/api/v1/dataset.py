from fastapi import APIRouter, UploadFile, File, HTTPException, status
import io
import pandas as pd
from typing import Any
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

router = APIRouter()


class DatasetPipelineResponse(BaseModel):
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


@router.post("/pipeline", response_model=DatasetPipelineResponse)
async def process_dataset_pipeline(file: UploadFile = File(...)):
    """
    Executes the complete dataset intelligence pipeline:
    Inspect -> Validate -> Clean -> Profile (supports CSV and XLSX)
    """
    content, filename = await _read_and_validate_upload(file)
    try:
        # 1. Inspect
        inspection = inspect_dataset(content, file_name=filename)

        # 2. Validate
        raw_df, _ = load_dataset_into_df(content, file_name=filename)
        validation = validate_dataset(raw_df, file_name=filename)

        if not validation.is_valid:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail={
                    "message": "Dataset failed schema validation",
                    "validation": validation.model_dump(),
                },
            )

        # 3. Clean
        cleaned_df, cleaning = clean_dataset(raw_df)

        # 4. Profile
        profiling = profile_dataset(cleaned_df)

        return DatasetPipelineResponse(
            inspection=inspection,
            validation=validation,
            cleaning=cleaning,
            profiling=profiling,
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Failed to process dataset pipeline: {str(e)}",
        )
