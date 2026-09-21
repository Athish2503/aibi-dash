from typing import Any, Optional
from pydantic import BaseModel, Field

# The 10 standard columns for Cross-Channel Digital Marketing Campaign Performance
EXPECTED_COLUMNS = [
    "Campaign_ID",
    "Company",
    "Campaign_Type",
    "Target_Audience",
    "Duration",
    "Channel_Used",
    "Conversion_Rate",
    "Acquisition_Cost",
    "ROI",
    "Location",
]

NUMERIC_COLUMNS = ["Conversion_Rate", "Acquisition_Cost", "ROI"]
CATEGORICAL_COLUMNS = [
    "Company",
    "Campaign_Type",
    "Target_Audience",
    "Channel_Used",
    "Location",
]


class DatasetInspectionResult(BaseModel):
    file_name: str
    row_count: int
    column_count: int
    columns: list[str]
    detected_types: dict[str, str]
    missing_values: dict[str, int]
    missing_percentage: dict[str, float]
    duplicate_rows_count: int
    memory_usage_bytes: int
    sample_records: list[dict[str, Any]] = Field(default_factory=list)


class ValidationErrorDetail(BaseModel):
    field: Optional[str] = None
    error_type: str
    message: str
    row_indices: Optional[list[int]] = None
    sample_values: Optional[list[Any]] = None


class DatasetValidationResult(BaseModel):
    is_valid: bool
    expected_columns: list[str] = Field(default_factory=lambda: EXPECTED_COLUMNS)
    detected_columns: list[str]
    missing_columns: list[str]
    extra_columns: list[str]
    errors: list[ValidationErrorDetail] = Field(default_factory=list)
    warnings: list[str] = Field(default_factory=list)


class NumericColumnStats(BaseModel):
    count: int
    mean: float
    std: float
    min: float
    p25: float
    median: float
    p75: float
    max: float
    skewness: Optional[float] = None
    null_count: int


class CategoryValueCount(BaseModel):
    value: str
    count: int
    percentage: float


class CategoricalColumnStats(BaseModel):
    distinct_count: int
    null_count: int
    top_values: list[CategoryValueCount] = Field(default_factory=list)


class DatasetProfileResult(BaseModel):
    total_records: int
    numeric_profiles: dict[str, NumericColumnStats]
    categorical_profiles: dict[str, CategoricalColumnStats]
    duration_summary: Optional[dict[str, Any]] = None


class DatasetCleaningResult(BaseModel):
    original_row_count: int
    cleaned_row_count: int
    dropped_row_count: int
    normalized_columns: list[str]
    cleaning_log: list[str]
