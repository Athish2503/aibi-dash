from pathlib import Path
from typing import Union, BinaryIO
import io
import pandas as pd
from backend.app.data.schemas import DatasetInspectionResult
from backend.app.data.loader import load_dataset_into_df


def inspect_dataset(
    source: Union[str, Path, BinaryIO, bytes, pd.DataFrame],
    file_name: str = "dataset.csv",
    sample_size: int = 5,
) -> DatasetInspectionResult:
    """
    Inspects a dataset (CSV or XLSX) to determine shape, column types, missing values,
    duplicates, memory footprint, and preview sample records.
    """
    df, detected_filename = load_dataset_into_df(source, file_name=file_name)
    file_name = detected_filename

    row_count = int(len(df))
    column_count = int(len(df.columns))
    columns = [str(c).strip() for c in df.columns]

    # Detected data types
    detected_types = {col: str(dtype) for col, dtype in zip(columns, df.dtypes)}

    # Missing values
    missing_values = {col: int(df[col].isna().sum()) for col in df.columns}
    missing_percentage = {
        col: round((count / row_count * 100.0) if row_count > 0 else 0.0, 2)
        for col, count in missing_values.items()
    }

    # Duplicate rows count
    duplicate_rows_count = int(df.duplicated().sum())

    # Memory usage in bytes
    memory_usage_bytes = int(df.memory_usage(deep=True).sum())

    # Sample records (clean NaNs for JSON serialization)
    sample_df = df.head(sample_size).copy()
    sample_records = sample_df.fillna("").to_dict(orient="records")

    return DatasetInspectionResult(
        file_name=file_name,
        row_count=row_count,
        column_count=column_count,
        columns=columns,
        detected_types=detected_types,
        missing_values=missing_values,
        missing_percentage=missing_percentage,
        duplicate_rows_count=duplicate_rows_count,
        memory_usage_bytes=memory_usage_bytes,
        sample_records=sample_records,
    )
