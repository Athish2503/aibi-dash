from typing import Tuple
import re
import pandas as pd
from backend.app.data.schemas import (
    CATEGORICAL_COLUMNS,
    NUMERIC_COLUMNS,
    DatasetCleaningResult,
)


def extract_duration_days(val) -> int | None:
    """
    Extracts numeric day count from string values like '30 days', '15 Days', or numbers like 30.
    """
    if pd.isna(val):
        return None
    if isinstance(val, (int, float)):
        return int(val) if not pd.isna(val) else None
    val_str = str(val).strip()
    match = re.search(r"(\d+)", val_str)
    if match:
        return int(match.group(1))
    return None


def clean_dataset(
    df: pd.DataFrame, drop_duplicates: bool = True
) -> Tuple[pd.DataFrame, DatasetCleaningResult]:
    """
    Cleans and standardizes the marketing dataset.
    Returns the cleaned DataFrame and a structured cleaning result summary.
    """
    original_row_count = int(len(df))
    cleaned_df = df.copy()
    cleaning_log: list[str] = []
    normalized_columns: list[str] = []

    # 1. Clean column headers (strip whitespace)
    cleaned_df.columns = [str(c).strip() for c in cleaned_df.columns]

    # 2. Drop rows with null Campaign_ID
    if "Campaign_ID" in cleaned_df.columns:
        null_id_count = int(cleaned_df["Campaign_ID"].isna().sum())
        if null_id_count > 0:
            cleaned_df = cleaned_df.dropna(subset=["Campaign_ID"])
            cleaning_log.append(f"Dropped {null_id_count} rows with missing Campaign_ID")

    # 3. Deduplicate rows if requested
    if drop_duplicates:
        dup_count = int(cleaned_df.duplicated().sum())
        if dup_count > 0:
            cleaned_df = cleaned_df.drop_duplicates()
            cleaning_log.append(f"Removed {dup_count} exact duplicate rows")

    # 4. Strip whitespace from string/categorical columns
    for col in CATEGORICAL_COLUMNS:
        if col in cleaned_df.columns:
            cleaned_df[col] = cleaned_df[col].astype(str).str.strip()
            # Replace string 'nan' or 'None' with empty or standard unknown if needed
            cleaned_df[col] = cleaned_df[col].replace({"nan": "", "None": "", "null": ""})
            normalized_columns.append(col)

    if "Company" in cleaned_df.columns:
        cleaned_df["Company"] = cleaned_df["Company"].astype(str).str.strip()

    # 5. Normalize Duration -> Duration_Days
    if "Duration" in cleaned_df.columns:
        cleaned_df["Duration_Days"] = cleaned_df["Duration"].apply(extract_duration_days)
        # Default missing duration to median or leave as nullable Int64
        cleaned_df["Duration_Days"] = cleaned_df["Duration_Days"].astype("Int64")
        normalized_columns.append("Duration_Days")
        cleaning_log.append("Normalized 'Duration' into numeric 'Duration_Days' (days)")

    # 6. Coerce numeric columns
    for col in NUMERIC_COLUMNS:
        if col in cleaned_df.columns:
            cleaned_df[col] = pd.to_numeric(cleaned_df[col], errors="coerce")
            normalized_columns.append(col)

    # 7. Add derived analytical columns if appropriate (as noted in DATA_MODEL.md)
    if "Acquisition_Cost" in cleaned_df.columns:
        # Round acquisition cost to 2 decimal places
        cleaned_df["Acquisition_Cost"] = cleaned_df["Acquisition_Cost"].round(2)

    if "ROI" in cleaned_df.columns:
        cleaned_df["ROI"] = cleaned_df["ROI"].round(4)

    if "Conversion_Rate" in cleaned_df.columns:
        cleaned_df["Conversion_Rate"] = cleaned_df["Conversion_Rate"].round(4)

    cleaned_row_count = int(len(cleaned_df))
    dropped_row_count = original_row_count - cleaned_row_count

    result = DatasetCleaningResult(
        original_row_count=original_row_count,
        cleaned_row_count=cleaned_row_count,
        dropped_row_count=dropped_row_count,
        normalized_columns=list(set(normalized_columns)),
        cleaning_log=cleaning_log,
    )

    return cleaned_df, result
