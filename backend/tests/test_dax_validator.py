import pytest
from backend.app.powerbi.dax_validator import DeterministicDAXValidator, DAXValidationResult


def test_dax_validator_simple_average():
    expr = "AVERAGE('Campaigns'[ROI])"
    res = DeterministicDAXValidator.validate(
        expression=expr,
        available_columns=["ROI", "Acquisition_Cost", "Channel_Used"],
    )
    assert res.is_valid is True
    assert len(res.errors) == 0
    assert "ROI" in res.referenced_columns
    assert "AVERAGE" in res.used_functions
    assert res.complexity == "Standard"


def test_dax_validator_unbalanced_parentheses():
    expr = "AVERAGE('Campaigns'[ROI]"
    res = DeterministicDAXValidator.validate(expr)
    assert res.is_valid is False
    assert any("closing parenthesis" in e.lower() for e in res.errors)


def test_dax_validator_unbalanced_brackets():
    expr = "AVERAGE('Campaigns'[ROI)"
    res = DeterministicDAXValidator.validate(expr)
    assert res.is_valid is False
    assert any("bracket" in e.lower() for e in res.errors)


def test_dax_validator_missing_column():
    expr = "SUM('Campaigns'[NonExistentColumn])"
    res = DeterministicDAXValidator.validate(
        expression=expr,
        available_columns=["ROI", "Acquisition_Cost"],
    )
    assert res.is_valid is False
    assert any("nonexistentcolumn" in e.lower() for e in res.errors)


def test_dax_validator_advanced_time_intelligence():
    expr = """
    VAR CurrentROI = AVERAGE('Campaigns'[ROI])
    VAR PriorROI = CALCULATE(AVERAGE('Campaigns'[ROI]), SAMEPERIODLASTYEAR('Calendar'[Date]))
    RETURN DIVIDE(CurrentROI - PriorROI, PriorROI, 0)
    """
    res = DeterministicDAXValidator.validate(
        expression=expr,
        available_columns=["ROI", "Date"],
    )
    assert res.is_valid is True
    assert res.complexity == "Advanced"
    assert "DIVIDE" in res.used_functions
    assert "CALCULATE" in res.used_functions
    assert "SAMEPERIODLASTYEAR" in res.used_functions


def test_dax_validator_divide_warning():
    expr = "SUM('Campaigns'[Acquisition_Cost]) / SUM('Campaigns'[ROI])"
    res = DeterministicDAXValidator.validate(
        expression=expr,
        available_columns=["Acquisition_Cost", "ROI"],
    )
    assert res.is_valid is True
    assert any("DIVIDE" in w for w in res.warnings)
