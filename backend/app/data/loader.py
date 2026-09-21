from pathlib import Path
from typing import Union, BinaryIO, Tuple
import io
import re
import pandas as pd

# Canonical marketing aliases for automatic normalization
COLUMN_ALIAS_MAP = {
    "campaign_id": "Campaign_ID",
    "campaign id": "Campaign_ID",
    "campaignid": "Campaign_ID",
    "cmp_id": "Campaign_ID",
    "id": "Campaign_ID",
    "company": "Company",
    "company name": "Company",
    "company_name": "Company",
    "brand": "Company",
    "advertiser": "Company",
    "campaign_type": "Campaign_Type",
    "campaign type": "Campaign_Type",
    "campaigntype": "Campaign_Type",
    "type": "Campaign_Type",
    "ad_type": "Campaign_Type",
    "target_audience": "Target_Audience",
    "target audience": "Target_Audience",
    "targetaudience": "Target_Audience",
    "audience": "Target_Audience",
    "duration": "Duration",
    "duration days": "Duration",
    "duration_days": "Duration",
    "channel_used": "Channel_Used",
    "channel used": "Channel_Used",
    "channel": "Channel_Used",
    "platform": "Channel_Used",
    "media": "Channel_Used",
    "conversion_rate": "Conversion_Rate",
    "conversion rate": "Conversion_Rate",
    "conversionrate": "Conversion_Rate",
    "conv_rate": "Conversion_Rate",
    "conversion_%": "Conversion_Rate",
    "cvr": "Conversion_Rate",
    "acquisition_cost": "Acquisition_Cost",
    "acquisition cost": "Acquisition_Cost",
    "acquisitioncost": "Acquisition_Cost",
    "cost": "Acquisition_Cost",
    "spend": "Acquisition_Cost",
    "ad_spend": "Acquisition_Cost",
    "cac": "Acquisition_Cost",
    "roi": "ROI",
    "roas": "ROI",
    "return on investment": "ROI",
    "return_on_investment": "ROI",
    "location": "Location",
    "region": "Location",
    "country": "Location",
    "city": "Location",
    "geo": "Location",
}


def _clean_loaded_df(df: pd.DataFrame) -> pd.DataFrame:
    """Standardizes columns, removes blank trailing rows/columns, and applies alias mapping."""
    # 1. Clean column strings
    df.columns = [str(c).strip() for c in df.columns]

    # 2. Drop columns where all values are null and name starts with Unnamed:
    unnamed_empty = [c for c in df.columns if c.startswith("Unnamed:") and df[c].isna().all()]
    if unnamed_empty:
        df = df.drop(columns=unnamed_empty)

    # 3. Drop entirely blank rows
    df = df.dropna(how="all").reset_index(drop=True)

    # 4. Smart column alias mapping to standard schema where applicable
    new_cols = {}
    current_cols_lower = {str(c).lower(): str(c) for c in df.columns}
    for col in df.columns:
        clean_key = str(col).lower().replace("-", "_").strip()
        if clean_key in COLUMN_ALIAS_MAP:
            target = COLUMN_ALIAS_MAP[clean_key]
            # Only rename if target not already in dataframe
            if target not in df.columns or target == col:
                new_cols[col] = target

    if new_cols:
        df = df.rename(columns=new_cols)

    return df


def _read_excel_robust(source_or_buffer) -> pd.DataFrame:
    """Reads Excel file handling multiple sheets and openpyxl quirks."""
    try:
        excel_file = pd.ExcelFile(source_or_buffer, engine="openpyxl")
        target_sheet = excel_file.sheet_names[0]
        for sheet in excel_file.sheet_names:
            try:
                sample = pd.read_excel(excel_file, sheet_name=sheet, nrows=5)
                if len(sample) > 0 and len(sample.columns) > 0:
                    target_sheet = sheet
                    break
            except Exception:
                continue
        df = pd.read_excel(excel_file, sheet_name=target_sheet)
    except Exception:
        df = pd.read_excel(source_or_buffer)
    return df


def _read_csv_robust(source_or_buffer) -> pd.DataFrame:
    """Reads CSV handling various encodings (utf-8, utf-8-sig, latin1, cp1252)."""
    encodings = ["utf-8", "utf-8-sig", "latin1", "cp1252"]
    for enc in encodings:
        try:
            if hasattr(source_or_buffer, "seek"):
                source_or_buffer.seek(0)
            return pd.read_csv(source_or_buffer, encoding=enc)
        except (UnicodeDecodeError, pd.errors.ParserError):
            continue
    # Fallback
    if hasattr(source_or_buffer, "seek"):
        source_or_buffer.seek(0)
    return pd.read_csv(source_or_buffer, encoding_errors="replace")


def load_dataset_into_df(
    source: Union[str, Path, BinaryIO, bytes, pd.DataFrame],
    file_name: str = "dataset.csv",
) -> Tuple[pd.DataFrame, str]:
    """
    Loads a dataset from CSV or XLSX (Excel) into a pandas DataFrame with
    robust format detection, multi-encoding support, and intelligent column normalization.
    """
    clean_name = str(file_name).strip()
    ext = Path(clean_name).suffix.lower()
    is_excel = ext in [".xlsx", ".xls", ".xlsm", ".xlsb"]

    if isinstance(source, pd.DataFrame):
        return _clean_loaded_df(source.copy()), clean_name

    if isinstance(source, (str, Path)):
        path = Path(source)
        if not path.exists():
            raise FileNotFoundError(f"File not found: {path}")
        if path.stat().st_size == 0:
            raise ValueError(f"File is empty: {path}")

        name = path.name
        suffix = path.suffix.lower()
        if suffix in [".xlsx", ".xls", ".xlsm", ".xlsb"]:
            df = _read_excel_robust(path)
        else:
            df = _read_csv_robust(path)
        return _clean_loaded_df(df), name

    if isinstance(source, bytes):
        if len(source) == 0:
            raise ValueError("Provided file buffer is empty")
        buffer = io.BytesIO(source)
        if is_excel:
            df = _read_excel_robust(buffer)
        else:
            df = _read_csv_robust(buffer)
        return _clean_loaded_df(df), clean_name

    if hasattr(source, "read"):
        content = source.read()
        if len(content) == 0:
            raise ValueError("Provided file buffer is empty")

        if isinstance(content, str):
            buffer = io.StringIO(content)
            df = _read_csv_robust(buffer)
        else:
            buffer = io.BytesIO(content)
            if is_excel:
                df = _read_excel_robust(buffer)
            else:
                df = _read_csv_robust(buffer)
        return _clean_loaded_df(df), clean_name

    raise TypeError(f"Unsupported source type for loading dataset: {type(source)}")
