import pytest
import pandas as pd
from pathlib import Path

from backend.app.analytics.kpis import calculate_kpis
from backend.app.analytics.segmentation import (
    apply_filters,
    analyze_channels,
    analyze_audiences,
    analyze_campaign_types,
    analyze_duration,
    analyze_geography,
    analyze_companies,
    rank_campaigns,
)
from backend.app.analytics.anomalies import detect_anomalies
from backend.app.data.cleaner import clean_dataset

FIXTURES_DIR = Path(__file__).parent / "fixtures"
SAMPLE_CSV = FIXTURES_DIR / "sample_campaigns.csv"


@pytest.fixture
def sample_df():
    raw_df = pd.read_csv(SAMPLE_CSV)
    cleaned_df, _ = clean_dataset(raw_df)
    return cleaned_df


def test_calculate_kpis_normal(sample_df):
    kpis = calculate_kpis(sample_df)
    assert kpis["total_campaigns"] == 10
    assert kpis["average_roi"] > 0
    assert kpis["average_conversion_rate"] > 0
    assert kpis["average_acquisition_cost"] > 0
    assert kpis["min_roi"] <= kpis["max_roi"]
    assert kpis["total_acquisition_cost"] > 0


def test_calculate_kpis_empty():
    kpis = calculate_kpis(pd.DataFrame())
    assert kpis["total_campaigns"] == 0
    assert kpis["average_roi"] == 0.0
    assert kpis["average_conversion_rate"] == 0.0


def test_apply_filters(sample_df):
    filtered_30 = apply_filters(sample_df, {"Duration": 30})
    assert len(filtered_30) == 4
    for _, row in filtered_30.iterrows():
        assert row["Duration_Days"] == 30

    filtered_channel = apply_filters(sample_df, {"Channel_Used": "Google Ads"})
    assert len(filtered_channel) == 3


def test_analyze_channels(sample_df):
    channels = analyze_channels(sample_df)
    assert len(channels) > 0
    # Every channel must have required keys
    for ch in channels:
        assert "Channel_Used" in ch
        assert "campaign_count" in ch
        assert "average_roi" in ch
        assert "average_conversion_rate" in ch
        assert "average_acquisition_cost" in ch
    # Verify channels are sorted by average_roi descending
    rois = [ch["average_roi"] for ch in channels]
    assert rois == sorted(rois, reverse=True)


def test_analyze_channels_with_duration_filter(sample_df):
    # Question: Which channel had the best ROI for 30-day campaigns?
    channels_30 = analyze_channels(sample_df, filters={"Duration": 30})
    assert len(channels_30) > 0
    # In sample_campaigns.csv:
    # CMP-101: 30 days, Google Ads, ROI 3.2
    # CMP-105: 30, YouTube, ROI 1.2
    # CMP-106: 30 days, Google Ads, ROI 3.8
    # CMP-110: 30 days, Google Ads, ROI 2.1
    # Google Ads avg ROI: (3.2 + 3.8 + 2.1) / 3 = 3.0333
    # YouTube avg ROI: 1.2
    top = channels_30[0]
    assert top["Channel_Used"] == "Google Ads"
    assert top["campaign_count"] == 3
    assert abs(top["average_roi"] - 3.0333) < 0.01


def test_analyze_audiences(sample_df):
    audiences = analyze_audiences(sample_df)
    assert len(audiences) > 0
    assert all("Target_Audience" in a for a in audiences)


def test_analyze_campaign_types(sample_df):
    types = analyze_campaign_types(sample_df)
    assert len(types) > 0
    assert all("Campaign_Type" in t for t in types)


def test_analyze_duration(sample_df):
    durations = analyze_duration(sample_df)
    assert len(durations) > 0


def test_analyze_geography(sample_df):
    geo = analyze_geography(sample_df)
    assert len(geo) > 0
    assert all("Location" in g for g in geo)


def test_analyze_companies(sample_df):
    companies = analyze_companies(sample_df)
    assert len(companies) > 0
    assert all("Company" in c for c in companies)


def test_rank_campaigns(sample_df):
    top_3 = rank_campaigns(sample_df, metric="ROI", top_n=3, ascending=False)
    assert len(top_3) == 3
    assert top_3[0]["ROI"] >= top_3[1]["ROI"] >= top_3[2]["ROI"]

    worst_2 = rank_campaigns(sample_df, metric="ROI", top_n=2, ascending=True)
    assert len(worst_2) == 2
    assert worst_2[0]["ROI"] <= worst_2[1]["ROI"]


def test_detect_anomalies_iqr(sample_df):
    anomalies = detect_anomalies(sample_df, method="iqr", threshold=1.2)
    # Check structure of detected anomalies
    for anom in anomalies:
        assert "campaign_id" in anom
        assert "metric" in anom
        assert "actual_value" in anom
        assert "method" in anom
        assert anom["method"] == "iqr"
        assert "lower_bound" in anom
        assert "upper_bound" in anom
        assert "reason" in anom
        assert "evidence" in anom


def test_detect_anomalies_zscore(sample_df):
    anomalies = detect_anomalies(sample_df, method="zscore", threshold=2.0)
    for anom in anomalies:
        assert anom["method"] == "zscore"
        assert "z_score" in anom
        assert "mean" in anom
        assert "std" in anom
