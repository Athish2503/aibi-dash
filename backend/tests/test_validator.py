from pathlib import Path
from backend.app.data.validator import validate_dataset

FIXTURES_DIR = Path(__file__).parent / "fixtures"


def test_validate_valid_csv():
    file_path = FIXTURES_DIR / "sample_campaigns.csv"
    result = validate_dataset(file_path)

    assert result.is_valid is True
    assert len(result.errors) == 0
    assert len(result.missing_columns) == 0


def test_validate_valid_xlsx():
    file_path = FIXTURES_DIR / "sample_campaigns.xlsx"
    result = validate_dataset(file_path)

    assert result.is_valid is True
    assert len(result.errors) == 0
    assert len(result.missing_columns) == 0


def test_validate_missing_columns():
    file_path = FIXTURES_DIR / "invalid_missing_col.csv"
    result = validate_dataset(file_path)

    assert result.is_valid is False
    assert "ROI" in result.missing_columns
    assert "Channel_Used" in result.missing_columns
    assert "Location" in result.missing_columns
    error_types = [e.error_type for e in result.errors]
    assert "MISSING_COLUMNS" in error_types


def test_validate_invalid_types_and_bounds():
    file_path = FIXTURES_DIR / "invalid_types.csv"
    result = validate_dataset(file_path)

    assert result.is_valid is False
    error_types = [e.error_type for e in result.errors]
    assert "INVALID_NUMERIC_TYPE" in error_types
    assert "NEGATIVE_VALUE" in error_types


def test_validate_null_campaign_id():
    import pandas as pd
    df = pd.DataFrame({
        "Campaign_ID": [None, "CMP-002"],
        "Company": ["A", "B"],
        "Campaign_Type": ["Search", "Social"],
        "Target_Audience": ["Tech", "Health"],
        "Duration": ["30", "15"],
        "Channel_Used": ["Google Ads", "Facebook"],
        "Conversion_Rate": [0.05, 0.04],
        "Acquisition_Cost": [100.0, 150.0],
        "ROI": [2.0, 1.5],
        "Location": ["US", "UK"],
    })
    result = validate_dataset(df)
    assert result.is_valid is False
    assert any(e.error_type == "NULL_IDENTIFIERS" for e in result.errors)

