import pytest
from backend.app.powerbi.dax_copilot import DAXCoPilot, MARKETING_DAX_TEMPLATES


def test_dax_copilot_templates_available():
    templates = DAXCoPilot.get_templates()
    assert len(templates) >= 6
    ids = [t.id for t in templates]
    assert "rolling_avg_cac" in ids
    assert "yoy_roi_growth" in ids
    assert "channel_spend_share" in ids


def test_dax_copilot_generate_rolling_cac():
    copilot = DAXCoPilot()
    res = copilot.generate_measure(
        prompt="Calculate rolling 30-day average CAC",
        available_columns=["Acquisition_Cost", "Duration", "ROI"],
    )
    assert "Rolling" in res.name or "CAC" in res.name
    assert "DATESINPERIOD" in res.expression or "AVERAGE" in res.expression
    assert res.validation.is_valid is True


def test_dax_copilot_generate_yoy_roi():
    copilot = DAXCoPilot()
    res = copilot.generate_measure(
        prompt="Year-over-year ROI growth percentage",
        available_columns=["ROI", "Duration"],
    )
    assert "YoY" in res.name or "Growth" in res.name
    assert "SAMEPERIODLASTYEAR" in res.expression or "DIVIDE" in res.expression
    assert res.validation.is_valid is True


def test_dax_copilot_generate_channel_rank():
    copilot = DAXCoPilot()
    res = copilot.generate_measure(
        prompt="Rank top channels by performance",
        available_columns=["Channel_Used", "ROI"],
    )
    assert "RANKX" in res.expression
    assert res.validation.is_valid is True
