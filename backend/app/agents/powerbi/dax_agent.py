from typing import Any, Optional
from pydantic import BaseModel, Field
from backend.app.powerbi.dax_copilot import DAXCoPilot, DAXCoPilotResult
from backend.app.powerbi.dax_validator import DeterministicDAXValidator, DAXValidationResult


class DAXAgentResult(BaseModel):
    measure_name: str
    dax_expression: str
    is_valid: bool
    iterations_run: int
    validation: DAXValidationResult
    explanation: str
    repair_history: list[str] = Field(default_factory=list)


class DAXIntelligenceAgent:
    """
    Agentic DAX Intelligence:
    Implements autonomous Generate -> Validate -> Repair feedback loop.
    If DAX validator detects syntax or schema errors, the agent diagnoses the issue,
    repairs the expression, and re-validates before returning.
    """

    def __init__(self):
        self.copilot = DAXCoPilot()
        self.validator = DeterministicDAXValidator()

    def generate_and_verify_measure(
        self,
        prompt: str,
        table_name: str = "Campaigns",
        available_columns: Optional[list[str]] = None,
        max_repairs: int = 2,
    ) -> DAXAgentResult:
        # Step 1: Initial generation
        initial_res = self.copilot.generate_measure(
            prompt=prompt,
            table_name=table_name,
            available_columns=available_columns,
        )

        current_expr = initial_res.expression
        measure_name = initial_res.name
        repair_history: list[str] = []

        # Step 2: Validation loop
        validation = self.validator.validate(
            expression=current_expr,
            table_name=table_name,
            available_columns=available_columns,
        )

        iterations = 1
        while not validation.is_valid and iterations <= max_repairs:
            repair_history.append(
                f"Iteration {iterations} invalid: {', '.join(validation.errors)}. Attempting repair."
            )
            # Automatic repair rules:
            # 1. Fix unclosed parentheses
            if "Unbalanced parentheses" in str(validation.errors):
                open_cnt = current_expr.count("(")
                close_cnt = current_expr.count(")")
                if open_cnt > close_cnt:
                    current_expr = current_expr + (")" * (open_cnt - close_cnt))
                elif close_cnt > open_cnt:
                    current_expr = "(" * (close_cnt - open_cnt) + current_expr

            # 2. Fix missing table qualification on column references
            if available_columns:
                for col in available_columns:
                    # Replace naked [Column] with 'Table'[Column]
                    naked = f"[{col}]"
                    qualified = f"'{table_name}'[{col}]"
                    if naked in current_expr and qualified not in current_expr:
                        current_expr = current_expr.replace(naked, qualified)

            # Re-validate
            validation = self.validator.validate(
                expression=current_expr,
                table_name=table_name,
                available_columns=available_columns,
            )
            iterations += 1

        if validation.is_valid and repair_history:
            repair_history.append("Successfully repaired DAX expression to 100% syntactic and schema validity.")

        return DAXAgentResult(
            measure_name=measure_name,
            dax_expression=current_expr,
            is_valid=validation.is_valid,
            iterations_run=iterations,
            validation=validation,
            explanation=initial_res.description,
            repair_history=repair_history,
        )
