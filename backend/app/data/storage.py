from typing import Optional
import os
import uuid
import pandas as pd
from pathlib import Path

try:
    from backend.app.config import settings
except ImportError:
    from app.config import settings

# In-memory session cache for fast access during execution
_DATASET_CACHE: dict[str, pd.DataFrame] = {}
_DATASET_METADATA: dict[str, dict] = {}


def save_dataset(df: pd.DataFrame, filename: str, dataset_id: Optional[str] = None) -> str:
    """
    Saves a cleaned DataFrame to disk and in-memory cache, returning its dataset_id.
    """
    did = dataset_id or f"ds_{uuid.uuid4().hex[:12]}"
    settings.setup_directories()

    # Store in-memory
    _DATASET_CACHE[did] = df.copy()
    _DATASET_METADATA[did] = {
        "dataset_id": did,
        "filename": filename,
        "rows": len(df),
        "columns": list(df.columns),
    }

    # Persist to disk as parquet/csv for reliability
    file_path = settings.UPLOAD_DIR / f"{did}.csv"
    try:
        df.to_csv(file_path, index=False)
    except Exception:
        pass

    return did


def get_dataset(dataset_id: str) -> Optional[pd.DataFrame]:
    """
    Retrieves a DataFrame by dataset_id, either from cache or disk.
    """
    if dataset_id in _DATASET_CACHE:
        return _DATASET_CACHE[dataset_id]

    # Look for file on disk in UPLOAD_DIR
    file_path = settings.UPLOAD_DIR / f"{dataset_id}.csv"
    if file_path.exists():
        df = pd.read_csv(file_path)
        _DATASET_CACHE[dataset_id] = df
        return df

    return None


def get_dataset_metadata(dataset_id: str) -> Optional[dict]:
    """Retrieves metadata for a registered dataset."""
    return _DATASET_METADATA.get(dataset_id)
