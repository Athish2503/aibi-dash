import re
from typing import Any
import pandas as pd
from pydantic import BaseModel, Field
from backend.app.business.context import BusinessRule
from backend.app.analytics.kpis import calculate_kpis


class RuleViolation(BaseModel):
    rule_id: str
    rule_name: str
    severity: str
    metric_name: str
    condition: str
    actual_value: float
    action_message: str


class BusinessRuleEngine:
    """
    Evaluates business rules against analytical dataset metrics.
    """

    @classmethod
    def evaluate_rules(cls, df: pd.DataFrame, rules: list[BusinessRule]) -> list[RuleViolation]:
        if not rules or df is None or df.empty:
            return []

        kpis = calculate_kpis(df)
        violations: list[RuleViolation] = []

        for rule in rules:
            key = rule.metric_name.lower().replace(" ", "_")
            if "roi" in key:
                actual = float(kpis.get("average_roi", 0.0))
            elif "cvr" in key or "conversion" in key:
                actual = float(kpis.get("average_conversion_rate", 0.0))
            elif "cac" in key or "acquisition" in key:
                actual = float(kpis.get("average_acquisition_cost", 0.0))
            else:
                actual = float(kpis.get(key, 0.0))

            cond = rule.condition.strip()
            match = re.match(r"^(>=|<=|>|<|==)\s*(-?\d+(?:\.\d+)?)$", cond)
            if not match:
                continue

            op, thresh_str = match.groups()
            thresh = float(thresh_str)

            breached = False
            if op == "<=" and not (actual <= thresh):
                breached = True
            elif op == "<" and not (actual < thresh):
                breached = True
            elif op == ">=" and not (actual >= thresh):
                breached = True
            elif op == ">" and not (actual > thresh):
                breached = True
            elif op == "==" and actual != thresh:
                breached = True

            if breached:
                violations.append(
                    RuleViolation(
                        rule_id=rule.id,
                        rule_name=rule.name,
                        severity=rule.severity,
                        metric_name=rule.metric_name,
                        condition=rule.condition,
                        actual_value=actual,
                        action_message=rule.action_message,
                    )
                )

        return violations
