import threading
from typing import Optional
from backend.app.business.context import CompanyContext, KPITarget, BusinessGoal, BusinessRule


class ContextStore:
    """
    Thread-safe storage for business contexts indexed by dataset_id or company.
    """

    def __init__(self):
        self._lock = threading.Lock()
        self._contexts: dict[str, CompanyContext] = {}

    def get_context(self, dataset_id: str) -> CompanyContext:
        with self._lock:
            if dataset_id in self._contexts:
                return self._contexts[dataset_id]
            # Return standard default marketing context
            default_ctx = CompanyContext(
                company_name="Enterprise Performance Marketing",
                industry="Digital Commerce & Media",
                primary_goal="Maximize Cross-Channel Marketing ROI while maintaining CAC below $45.00",
                targets=[
                    KPITarget(metric_name="ROI", target_value=2.5, comparison_operator=">=", unit="x"),
                    KPITarget(metric_name="Acquisition_Cost", target_value=40.0, comparison_operator="<=", unit="$"),
                    KPITarget(metric_name="Conversion_Rate", target_value=0.08, comparison_operator=">=", unit="%"),
                ],
                goals=[
                    BusinessGoal(id="g_roi", name="Improve Channel Return on Investment", related_metrics=["ROI"]),
                    BusinessGoal(id="g_cac", name="Control Customer Acquisition Costs", related_metrics=["Acquisition_Cost"]),
                ],
                rules=[
                    BusinessRule(
                        id="r_cac_cap",
                        name="Maximum Allowable CAC",
                        metric_name="Acquisition_Cost",
                        condition="<= 55.0",
                        severity="critical",
                        action_message="Reallocate budget from high-CAC channels.",
                    )
                ],
            )
            self._contexts[dataset_id] = default_ctx
            return default_ctx

    def set_context(self, dataset_id: str, context: CompanyContext) -> None:
        with self._lock:
            self._contexts[dataset_id] = context

    def clear(self) -> None:
        with self._lock:
            self._contexts.clear()


context_store = ContextStore()
