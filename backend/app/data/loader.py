from pathlib import Path
from typing import Union, BinaryIO, Tuple
import io
import pandas as pd


def load_dataset_into_df(
    source: Union[str, Path, BinaryIO, bytes, pd.DataFrame],
    file_name: str = "dataset.csv",
) -> Tuple[pd.DataFrame, str]:
    """
    Loads a dataset from CSV or XLSX (Excel) into a pandas DataFrame.
    Returns (DataFrame, file_name).
    """
    if isinstance(source, pd.DataFrame):
        return source, file_name

    if isinstance(source, (str, Path)):
        path = Path(source)
        if not path.exists():
            raise FileNotFoundError(f"File not found: {path}")
        if path.stat().st_size == 0:
            raise ValueError(f"File is empty: {path}")

        name = path.name
        suffix = path.suffix.lower()
        if suffix == ".xlsx":
            df = pd.read_excel(path, engine="openpyxl")
        elif suffix == ".csv":
            df = pd.read_csv(path)
        else:
            raise ValueError(f"Unsupported file extension '{suffix}'. Only .csv and .xlsx are supported.")
        return df, name

    if isinstance(source, bytes):
        if len(source) == 0:
            raise ValueError("Provided file buffer is empty")
        buffer = io.BytesIO(source)
        if file_name.lower().endswith(".xlsx"):
            df = pd.read_excel(buffer, engine="openpyxl")
        else:
            df = pd.read_csv(buffer)
        return df, file_name

    if hasattr(source, "read"):
        content = source.read()
        if len(content) == 0:
            raise ValueError("Provided file buffer is empty")
        
        if isinstance(content, str):
            buffer = io.StringIO(content)
            df = pd.read_csv(buffer)
        else:
            buffer = io.BytesIO(content)
            if file_name.lower().endswith(".xlsx"):
                df = pd.read_excel(buffer, engine="openpyxl")
            else:
                df = pd.read_csv(buffer)
        return df, file_name

    raise TypeError(f"Unsupported source type for loading dataset: {type(source)}")
