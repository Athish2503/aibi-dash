from pathlib import Path
import pytest
from backend.app.data.inspector import inspect_dataset

FIXTURES_DIR = Path(__file__).parent / "fixtures"


def test_inspect_valid_csv():
    file_path = FIXTURES_DIR / "sample_campaigns.csv"
    result = inspect_dataset(file_path)

    assert result.file_name == "sample_campaigns.csv"
    assert result.row_count == 10
    assert result.column_count == 10
    assert "Campaign_ID" in result.columns
    assert "ROI" in result.columns
    assert result.duplicate_rows_count == 0
    assert len(result.sample_records) == 5
    assert result.memory_usage_bytes > 0


def test_inspect_valid_xlsx():
    file_path = FIXTURES_DIR / "sample_campaigns.xlsx"
    result = inspect_dataset(file_path)

    assert result.file_name == "sample_campaigns.xlsx"
    assert result.row_count == 10
    assert result.column_count == 10
    assert "Campaign_ID" in result.columns
    assert "ROI" in result.columns
    assert len(result.sample_records) == 5


def test_inspect_file_not_found():
    with pytest.raises(FileNotFoundError):
        inspect_dataset(FIXTURES_DIR / "non_existent_file.csv")


def test_inspect_empty_source():
    import io
    empty_buf = io.BytesIO(b"")
    with pytest.raises(ValueError):
        inspect_dataset(empty_buf)
