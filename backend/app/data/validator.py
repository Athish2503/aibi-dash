from pathlib import Path
from typing import Union
import pandas as pd
from backend.app.data.schemas import (
    EXPECTED_COLUMNS,
    NUMERIC_COLUMNS,
    DatasetValidationResult,
    ValidationErrorDetail,
)
from backend.app.data.loader import load_dataset_into_df


def validate_dataset(
    source: Union[str, Path, pd.DataFrame],
    file_name: str = "dataset.csv",
) -> DatasetValidationResult:
    """
    Validates a dataset against the expected marketing campaign schema and business rules.
    Supports both CSV and XLSX formats.
    """
    if isinstance(source, pd.DataFrame):
        df = source
    elif isinstance(source, (str, Path)):
        path = Path(source)
        if not path.exists():
            return DatasetValidationResult(
                is_valid=False,
                detected_columns=[],
                missing_columns=EXPECTED_COLUMNS,
                extra_columns=[],
                errors=[
                    ValidationErrorDetail(
                        error_type="FILE_NOT_FOUND",
                        message=f"Dataset file not found: {path}",
                    )
                ],
            )
        try:
            df, _ = load_dataset_into_df(path)
        except Exception as e:
            return DatasetValidationResult(
                is_valid=False,
                detected_columns=[],
                missing_columns=EXPECTED_COLUMNS,
                extra_columns=[],
                errors=[
                    ValidationErrorDetail(
                        error_type="FILE_PARSE_ERROR",
                        message=f"Failed to parse dataset file: {str(e)}",
                    )
                ],
            )
    else:
        try:
            df, _ = load_dataset_into_df(source, file_name=file_name)
        except Exception as e:
            return DatasetValidationResult(
                is_valid=False,
                detected_columns=[],
                missing_columns=EXPECTED_COLUMNS,
                extra_columns=[],
                errors=[
                    ValidationErrorDetail(
                        error_type="FILE_PARSE_ERROR",
                        message=f"Failed to load dataset: {str(e)}",
                    )
                ],
            )

    errors: list[ValidationErrorDetail] = []
    warnings: list[str] = []

    detected_columns = [str(c).strip() for c in df.columns]
    missing_columns = [col for col in EXPECTED_COLUMNS if col not in detected_columns]
    extra_columns = [col for col in detected_columns if col not in EXPECTED_COLUMNS]

    if missing_columns:
        errors.append(
            ValidationErrorDetail(
                field="schema",
                error_type="MISSING_COLUMNS",
                message=f"Required columns missing: {', '.join(missing_columns)}",
            )
        )

    if extra_columns:
        warnings.append(f"Unexpected extra columns detected: {', '.join(extra_columns)}")

    # If all required columns are present, perform deep data quality validation
    if not missing_columns:
        # 1. Campaign_ID nulls and duplicates
        null_ids = int(df["Campaign_ID"].isna().sum())
        if null_ids > 0:
            errors.append(
                ValidationErrorDetail(
                    field="Campaign_ID",
                    error_type="NULL_IDENTIFIERS",
                    message=f"Found {null_ids} records with null or missing Campaign_ID",
                )
            )

        duplicate_id_count = int(df["Campaign_ID"].duplicated().sum())
        if duplicate_id_count > 0:
            warnings.append(
                f"Dataset contains {duplicate_id_count} duplicate Campaign_ID records"
            )

        # 2. Check numeric columns
        for num_col in NUMERIC_COLUMNS:
            series = df[num_col]
            # Try to coerce numeric
            coerced = pd.to_numeric(series, errors="coerce")
            invalid_num_mask = series.notna() & coerced.isna()
            invalid_count = int(invalid_num_mask.sum())

            if invalid_count > 0:
                sample_invalids = series[invalid_num_mask].head(5).tolist()
                errors.append(
                    ValidationErrorDetail(
                        field=num_col,
                        error_type="INVALID_NUMERIC_TYPE",
                        message=f"Column '{num_col}' contains {invalid_count} non-numeric values",
                        sample_values=sample_invalids,
                    )
                )
            else:
                # Value boundary checks on valid numbers
                if num_col == "Acquisition_Cost":
                    negatives = int((coerced < 0).sum())
                    if negatives > 0:
                        errors.append(
                            ValidationErrorDetail(
                                field=num_col,
                                error_type="NEGATIVE_VALUE",
                                message=f"Column '{num_col}' has {negatives} negative values",
                            )
                        )
                elif num_col == "Conversion_Rate":
                    negatives = int((coerced < 0).sum())
                    if negatives > 0:
                        errors.append(
                            ValidationErrorDetail(
                                field=num_col,
                                error_type="NEGATIVE_VALUE",
                                message=f"Column '{num_col}' has {negatives} negative values",
                            )
                        )
                    # Check for rate > 100 (possible percentage scale confusion)
                    over_100 = int((coerced > 100.0).sum())
                    if over_100 > 0:
                        warnings.append(
                            f"Column '{num_col}' has {over_100} values greater than 100"
                        )

        # 3. Check Duration column format
        if "Duration" in df.columns:
            null_durations = int(df["Duration"].isna().sum())
            if null_durations > 0:
                warnings.append(f"Column 'Duration' has {null_durations} null values")

    is_valid = len(errors) == 0

    return DatasetValidationResult(
        is_valid=is_valid,
        expected_columns=EXPECTED_COLUMNS,
        detected_columns=detected_columns,
        missing_columns=missing_columns,
        extra_columns=extra_columns,
        errors=errors,
        warnings=warnings,
    )
