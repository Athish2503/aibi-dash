import pytest
import pandas as pd
from backend.app.analytics.comparator import DatasetComparator


def test_dataset_comparator_deterministic():
    df_a = pd.DataFrame({
        "Campaign_ID": [1, 2, 3],
        "Channel_Used": ["Google Ads", "Facebook", "Instagram"],
        "Target_Audience": ["Men 18-24", "Women 25-34", "All 35-44"],
        "ROI": [2.0, 3.0, 4.0],  # Mean = 3.0
        "Acquisition_Cost": [100.0, 150.0, 200.0],  # Mean = 150.0
        "Conversion_Rate": [0.02, 0.04, 0.06],  # Mean = 0.04
    })

    df_b = pd.DataFrame({
        "Campaign_ID": [4, 5, 6],
        "Channel_Used": ["Google Ads", "Facebook", "Instagram"],
        "Target_Audience": ["Men 18-24", "Women 25-34", "All 35-44"],
        "ROI": [2.5, 3.5, 5.0],  # Mean = 3.6667 (+0.6667)
        "Acquisition_Cost": [90.0, 140.0, 190.0],  # Mean = 140.0 (-10.0, improved)
        "Conversion_Rate": [0.03, 0.05, 0.07],  # Mean = 0.05 (+0.01)
    })

    res = DatasetComparator.compare(df_a, df_b, label_a="Q1 2026", label_b="Q2 2026")

    assert res.total_records_baseline == 3
    assert res.total_records_comparison == 3
    assert res.records_delta == 0

    # ROI increased -> positive sentiment
    assert res.roi.baseline_value == 3.0
    assert res.roi.comparison_value > 3.6
    assert res.roi.sentiment == "positive"

    # CAC decreased -> positive sentiment (lower cost is better)
    assert res.cac.baseline_value == 150.0
    assert res.cac.comparison_value == 140.0
    assert res.cac.absolute_delta == -10.0
    assert res.cac.sentiment == "positive"

    # Channels
    assert len(res.channels) == 3
    insta = next(c for c in res.channels if c.channel == "Instagram")
    assert insta.roi_delta == 1.0
    assert insta.cac_delta == -10.0

    # Executive summary
    assert len(res.executive_summary) >= 2
    assert any("ROI shifted by" in s for s in res.executive_summary)


def test_dataset_comparator_identical_datasets():
    df = pd.DataFrame({
        "Campaign_ID": [1, 2],
        "Channel_Used": ["Google Ads", "Facebook"],
        "Target_Audience": ["Men", "Women"],
        "ROI": [4.0, 6.0],
        "Acquisition_Cost": [120.0, 180.0],
        "Conversion_Rate": [0.05, 0.08],
    })

    res = DatasetComparator.compare(df, df, label_a="Period A", label_b="Period B")
    assert res.records_delta == 0
    assert res.roi.absolute_delta == 0.0
    assert res.roi.percentage_change == 0.0
    assert res.roi.sentiment == "neutral"
    assert res.cac.absolute_delta == 0.0
    assert res.cac.sentiment == "neutral"
    assert res.conversion_rate.absolute_delta == 0.0
    assert res.top_roi_winner is None
    assert res.biggest_laggard is None
    assert any("identical performance" in s.lower() for s in res.executive_summary)


def test_dataset_comparator_formatted_currency_and_nulls():
    df_raw = pd.DataFrame({
        "Campaign_ID": [1, 2, 3],
        "Channel_Used": ["Google Ads", "Facebook", "Instagram"],
        "Target_Audience": ["Aud A", "Aud B", "Aud C"],
        "ROI": ["4.5", "5.5", None],
        "Acquisition_Cost": ["$12,500.00", "$15,200.50", "2000"],
        "Conversion_Rate": ["5.5%", "6.2%", "7.0%"],
    })

    res = DatasetComparator.compare(df_raw, df_raw, label_a="Raw A", label_b="Raw B")
    assert res.cac.baseline_value > 9000
    assert res.cac.comparison_value > 9000
    assert res.cac.absolute_delta == 0.0
    assert res.roi.baseline_value == 5.0
    assert res.conversion_rate.baseline_value > 0
    for ch in res.channels:
        assert ch.cac_baseline is not None
        assert ch.roi_baseline is not None

