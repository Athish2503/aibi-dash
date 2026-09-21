from typing import Optional

try:
    from backend.app.agent.plan_schemas import (
        AggregationType,
        DashboardPlan,
        PlanValidationResult,
        VisualType,
    )
    from backend.app.data.schemas import DatasetProfileResult
except ImportError:
    from app.agent.plan_schemas import (
        AggregationType,
        DashboardPlan,
        PlanValidationResult,
        VisualType,
    )
    from app.data.schemas import DatasetProfileResult


def validate_dashboard_plan(
    plan: DashboardPlan,
    available_columns: Optional[list[str]] = None,
    numeric_columns: Optional[list[str]] = None,
    profile: Optional[DatasetProfileResult] = None,
) -> PlanValidationResult:
    """
    Validates a DashboardPlan against structural rules, schema constraints,
    and Power BI generation requirements.
    """
    errors: list[str] = []
    warnings: list[str] = []
    checked_rules: list[str] = []

    # Derive numeric columns if profile is provided
    if profile:
        numeric_cols_set = set(profile.numeric_profiles.keys())
    elif numeric_columns:
        numeric_cols_set = set(numeric_columns)
    else:
        numeric_cols_set = None

    avail_cols_set = set(available_columns) if available_columns else None

    # Rule 1: Plan must have pages
    checked_rules.append("plan_has_pages")
    if not plan.pages:
        errors.append("Dashboard plan must contain at least one page.")

    # Rule 2: Measure definitions
    checked_rules.append("measure_definitions_valid")
    measure_names = {m.name for m in plan.measures}
    measure_by_name = {m.name: m for m in plan.measures}

    for m in plan.measures:
        if avail_cols_set and m.column not in avail_cols_set:
            errors.append(f"Measure '{m.name}' references non-existent column '{m.column}'.")
        if numeric_cols_set and m.column in avail_cols_set:
            if m.aggregation in {AggregationType.SUM, AggregationType.AVG} and m.column not in numeric_cols_set:
                errors.append(
                    f"Measure '{m.name}' applies numeric aggregation '{m.aggregation.value}' to non-numeric column '{m.column}'."
                )

    # Rule 3: Page uniqueness and structure
    checked_rules.append("page_structure_and_unique_ids")
    seen_page_ids = set()
    seen_visual_ids = set()

    for page_idx, page in enumerate(plan.pages):
        if not page.id:
            errors.append(f"Page at index {page_idx} missing 'id'.")
        elif page.id in seen_page_ids:
            errors.append(f"Duplicate page id '{page.id}' detected.")
        else:
            seen_page_ids.add(page.id)

        if not page.visuals:
            errors.append(f"Page '{page.title}' (id: {page.id}) has no visuals.")

        # Slicer checks
        seen_slicer_ids = set()
        for slicer in page.slicers:
            if slicer.id in seen_slicer_ids:
                errors.append(f"Duplicate slicer id '{slicer.id}' on page '{page.id}'.")
            else:
                seen_slicer_ids.add(slicer.id)

            if avail_cols_set and slicer.column not in avail_cols_set:
                errors.append(
                    f"Slicer '{slicer.id}' references non-existent column '{slicer.column}'."
                )

        # Visual checks
        for visual in page.visuals:
            # Check visual ID uniqueness
            if not visual.id:
                errors.append(f"Visual on page '{page.id}' missing 'id'.")
            elif visual.id in seen_visual_ids:
                errors.append(f"Duplicate visual id '{visual.id}' detected across plan.")
            else:
                seen_visual_ids.add(visual.id)

            # Check category column existence
            if visual.category and avail_cols_set and visual.category not in avail_cols_set:
                errors.append(
                    f"Visual '{visual.id}' references non-existent category column '{visual.category}'."
                )

            # Check secondary category existence
            if visual.secondary_category and avail_cols_set and visual.secondary_category not in avail_cols_set:
                errors.append(
                    f"Visual '{visual.id}' references non-existent secondary category column '{visual.secondary_category}'."
                )

            # Check measure column/definition existence
            metric_target = visual.measure
            if metric_target not in measure_names and avail_cols_set and metric_target not in avail_cols_set:
                errors.append(
                    f"Visual '{visual.id}' references measure '{metric_target}' which is not in plan measures or dataset columns."
                )

            # Check numeric compatibility for visuals
            if visual.type != VisualType.TABLE and metric_target in (avail_cols_set or set()):
                if numeric_cols_set and metric_target not in numeric_cols_set:
                    if visual.aggregation in {AggregationType.AVG, AggregationType.SUM}:
                        errors.append(
                            f"Visual '{visual.id}' uses aggregation '{visual.aggregation.value}' on non-numeric column '{metric_target}'."
                        )

            # Check scatter plot requirement
            if visual.type == VisualType.SCATTER_PLOT:
                if not visual.secondary_measure:
                    warnings.append(
                        f"Visual '{visual.id}' is a scatter plot but does not specify 'secondary_measure'."
                    )
                elif avail_cols_set and visual.secondary_measure not in avail_cols_set and visual.secondary_measure not in measure_names:
                    errors.append(
                        f"Visual '{visual.id}' secondary_measure '{visual.secondary_measure}' not found in dataset."
                    )

            # Check grid layout bounds
            if visual.width < 1 or visual.width > 12:
                errors.append(f"Visual '{visual.id}' has invalid grid width {visual.width} (must be 1-12).")
            if visual.height < 1:
                errors.append(f"Visual '{visual.id}' has invalid height {visual.height}.")

    is_valid = len(errors) == 0
    result = PlanValidationResult(
        is_valid=is_valid,
        errors=errors,
        warnings=warnings,
        checked_rules=checked_rules,
    )
    plan.validation = result
    return result
