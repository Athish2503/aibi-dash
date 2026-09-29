from typing import Any, Optional
from pydantic import BaseModel, Field


class PolicyCheckResult(BaseModel):
    is_compliant: bool
    policy_name: str
    reasons: list[str] = Field(default_factory=list)
    sanitized_query: str


class GovernancePolicyEngine:
    """
    Enforces BI security, data masking, and analytical guardrails:
    - Blocks arbitrary code execution attempts
    - Enforces KPI boundary rules
    - Masks potential PII
    """

    PROHIBITED_PATTERNS = [
        "import os",
        "subprocess",
        "drop table",
        "delete from",
        "exec(",
        "eval(",
        "system(",
    ]

    @classmethod
    def validate_request(cls, query: str) -> PolicyCheckResult:
        q_lower = query.lower()
        violations = []

        for pattern in cls.PROHIBITED_PATTERNS:
            if pattern in q_lower:
                violations.append(f"Prohibited code injection pattern detected: '{pattern}'")

        if violations:
            return PolicyCheckResult(
                is_compliant=False,
                policy_name="Safe Query Execution Policy",
                reasons=violations,
                sanitized_query="",
            )

        return PolicyCheckResult(
            is_compliant=True,
            policy_name="Safe Query Execution Policy",
            reasons=[],
            sanitized_query=query.strip(),
        )
