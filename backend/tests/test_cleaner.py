import pandas as pd
from backend.app.data.cleaner import clean_dataset, extract_duration_days


def test_extract_duration_days():
    assert extract_duration_days("30 days") == 30
    assert extract_duration_days(" 15 Days ") == 15
    assert extract_duration_days(45) == 45
    assert extract_duration_days("60") == 60
    assert extract_duration_days(None) is None


def test_clean_dataset_normalization():
    data = {
        "Campaign_ID": ["C1", "C2", "C3", "C1"],  # Duplicate C1
        "Company": [" TechCorp ", "HealthPlus", "RetailMax", " TechCorp "],
        "Campaign_Type": ["Search", "Social", "Display", "Search"],
        "Target_Audience": ["Tech", "Health", "Young", "Tech"],
        "Duration": ["30 days", "15 Days", "45", "30 days"],
        "Channel_Used": ["Google Ads", "Facebook", "Instagram", "Google Ads"],
        "Conversion_Rate": ["0.08", "0.04", 0.06, "0.08"],
        "Acquisition_Cost": ["450.00", 210.50, "320", "450.00"],
        "ROI": ["3.2", 1.8, "2.5", "3.2"],
        "Location": [" US ", "UK", "Canada", " US "],
    }
    raw_df = pd.DataFrame(data)
    cleaned_df, cleaning_result = clean_dataset(raw_df, drop_duplicates=True)

    # Check deduplication
    assert cleaning_result.dropped_row_count == 1
    assert len(cleaned_df) == 3

    # Check Duration_Days column created
    assert "Duration_Days" in cleaned_df.columns
    assert list(cleaned_df["Duration_Days"]) == [30, 15, 45]

    # Check whitespace stripping
    assert cleaned_df["Company"].iloc[0] == "TechCorp"
    assert cleaned_df["Location"].iloc[0] == "US"

    # Check numeric types
    assert pd.api.types.is_numeric_dtype(cleaned_df["Conversion_Rate"])
    assert pd.api.types.is_numeric_dtype(cleaned_df["Acquisition_Cost"])
    assert pd.api.types.is_numeric_dtype(cleaned_df["ROI"])
