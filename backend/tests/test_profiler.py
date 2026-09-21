from pathlib import Path
import pandas as pd
from backend.app.data.cleaner import clean_dataset
from backend.app.data.profiler import profile_dataset

FIXTURES_DIR = Path(__file__).parent / "fixtures"


def test_profile_dataset():
    file_path = FIXTURES_DIR / "sample_campaigns.csv"
    raw_df = pd.read_csv(file_path)
    cleaned_df, _ = clean_dataset(raw_df)

    profile = profile_dataset(cleaned_df)

    assert profile.total_records == 10
    # Numeric profiles
    assert "Conversion_Rate" in profile.numeric_profiles
    assert "Acquisition_Cost" in profile.numeric_profiles
    assert "ROI" in profile.numeric_profiles
    assert "Duration_Days" in profile.numeric_profiles

    roi_stats = profile.numeric_profiles["ROI"]
    assert roi_stats.min == 0.9
    assert roi_stats.max == 6.3
    assert roi_stats.count == 10

    # Categorical profiles
    assert "Channel_Used" in profile.categorical_profiles
    channel_stats = profile.categorical_profiles["Channel_Used"]
    assert channel_stats.distinct_count > 0
    top_channel_names = [v.value for v in channel_stats.top_values]
    assert "Google Ads" in top_channel_names

    # Duration summary
    assert profile.duration_summary is not None
    assert profile.duration_summary["min_days"] == 15
    assert profile.duration_summary["max_days"] == 60
