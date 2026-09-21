import json
import os
from typing import Optional

from backend.app.powerbi.schemas import (
    PowerBIValidationResult,
    PBIPManifest,
    PBIRDefinition,
    PBISMDefinition,
    TMSLDatabase,
    ReportDefinition,
)


class PowerBIArtifactValidator:
    """
    Performs structural, relational, and spatial validation on generated
    Power BI Project (.pbip) artifacts.
    """

    def validate_project_directory(self, project_dir: str) -> PowerBIValidationResult:
        """
        Validates all files in a generated PBIP project directory.
        """
        errors: list[str] = []
        warnings: list[str] = []
        checked: list[str] = []

        if not os.path.exists(project_dir):
            return PowerBIValidationResult(
                is_valid=False,
                errors=[f"Project directory '{project_dir}' does not exist."],
                warnings=[],
                checked_components=["directory_existence"],
            )

        checked.append("directory_existence")
        project_name = os.path.basename(os.path.normpath(project_dir))

        # 1. Manifest (.pbip) check
        pbip_file = os.path.join(project_dir, f"{project_name}.pbip")
        if not os.path.exists(pbip_file):
            # Check for any .pbip file in directory
            candidates = [f for f in os.listdir(project_dir) if f.endswith(".pbip")]
            if candidates:
                pbip_file = os.path.join(project_dir, candidates[0])
            else:
                errors.append(f"Root .pbip file '{project_name}.pbip' not found.")
                pbip_file = None

        if pbip_file:
            checked.append("pbip_manifest")
            try:
                with open(pbip_file, "r", encoding="utf-8") as f:
                    manifest_data = json.load(f)
                manifest = PBIPManifest.model_validate(manifest_data)
                if not manifest.artifacts:
                    errors.append(".pbip manifest must list at least one report artifact.")
            except Exception as e:
                errors.append(f"Failed to parse .pbip manifest: {str(e)}")

        # 2. Report directory checks
        report_dir = os.path.join(project_dir, f"{project_name}.Report")
        if not os.path.exists(report_dir):
            errors.append(f"Report directory '{report_dir}' not found.")
            report_data = None
        else:
            checked.append("report_directory")
            # definition.pbir
            pbir_file = os.path.join(report_dir, "definition.pbir")
            if not os.path.exists(pbir_file):
                errors.append("definition.pbir not found in report directory.")
            else:
                checked.append("pbir_definition")
                try:
                    with open(pbir_file, "r", encoding="utf-8") as f:
                        pbir_data = json.load(f)
                    PBIRDefinition.model_validate(pbir_data)
                except Exception as e:
                    errors.append(f"Invalid definition.pbir schema: {str(e)}")

            # report.json
            report_file = os.path.join(report_dir, "report.json")
            if not os.path.exists(report_file):
                errors.append("report.json not found in report directory.")
                report_data = None
            else:
                checked.append("report_json")
                try:
                    with open(report_file, "r", encoding="utf-8") as f:
                        report_data = json.load(f)
                    ReportDefinition.model_validate(report_data)
                except Exception as e:
                    errors.append(f"Invalid report.json schema: {str(e)}")
                    report_data = None

        # 3. SemanticModel directory checks
        semantic_dir = os.path.join(project_dir, f"{project_name}.SemanticModel")
        tmsl_db = None
        if not os.path.exists(semantic_dir):
            errors.append(f"SemanticModel directory '{semantic_dir}' not found.")
        else:
            checked.append("semantic_model_directory")
            # definition.pbism
            pbism_file = os.path.join(semantic_dir, "definition.pbism")
            if not os.path.exists(pbism_file):
                errors.append("definition.pbism not found in SemanticModel directory.")
            else:
                checked.append("pbism_definition")
                try:
                    with open(pbism_file, "r", encoding="utf-8") as f:
                        pbism_data = json.load(f)
                    PBISMDefinition.model_validate(pbism_data)
                except Exception as e:
                    errors.append(f"Invalid definition.pbism: {str(e)}")

            # model.bim
            model_file = os.path.join(semantic_dir, "model.bim")
            if not os.path.exists(model_file):
                errors.append("model.bim not found in SemanticModel directory.")
            else:
                checked.append("model_bim_schema")
                try:
                    with open(model_file, "r", encoding="utf-8") as f:
                        model_data = json.load(f)
                    tmsl_db = TMSLDatabase.model_validate(model_data)

                    # Validate TMSL rules
                    if tmsl_db.compatibilityLevel < 1500:
                        errors.append(
                            f"model.bim compatibilityLevel ({tmsl_db.compatibilityLevel}) should be >= 1500."
                        )
                    if not tmsl_db.model.tables:
                        errors.append("model.bim must define at least one table.")
                    else:
                        table = tmsl_db.model.tables[0]
                        if not table.columns:
                            warnings.append(f"Table '{table.name}' has no columns.")
                        for m in table.measures:
                            if not m.expression or not m.expression.strip():
                                errors.append(f"Measure '{m.name}' has an empty DAX expression.")
                except Exception as e:
                    errors.append(f"Invalid model.bim schema: {str(e)}")

        # 4. Cross-component relational validation (Report -> Semantic Model bindings)
        if report_data and tmsl_db and tmsl_db.model.tables:
            checked.append("report_semantic_cross_validation")
            table = tmsl_db.model.tables[0]
            defined_measures = {m.name for m in table.measures}
            defined_columns = {c.name for c in table.columns}

            for page in report_data.get("pages", []):
                canvas_w = page.get("width", 1280)
                canvas_h = page.get("height", 720)

                for vc in page.get("visualContainers", []):
                    # Spatial boundary check
                    x, y = vc.get("x", 0), vc.get("y", 0)
                    w, h = vc.get("width", 0), vc.get("height", 0)
                    if x < 0 or y < 0:
                        errors.append(f"Visual '{vc.get('title')}' has negative coordinates ({x}, {y}).")
                    if x + w > canvas_w + 10:  # small tolerance
                        warnings.append(f"Visual '{vc.get('title')}' exceeds canvas width: {x + w} > {canvas_w}.")
                    if y + h > canvas_h + 10:
                        warnings.append(f"Visual '{vc.get('title')}' exceeds canvas height: {y + h} > {canvas_h}.")

                    # Query binding check
                    q = vc.get("query", {})
                    meas = q.get("measure")
                    if meas and meas not in defined_measures:
                        errors.append(
                            f"Visual '{vc.get('title')}' references measure '{meas}' which does not exist in model.bim."
                        )

                    sec_m = q.get("secondary_measure")
                    if sec_m and sec_m not in defined_measures:
                        errors.append(
                            f"Visual '{vc.get('title')}' references secondary measure '{sec_m}' missing in model.bim."
                        )

                    cat = q.get("category")
                    if cat and cat not in defined_columns:
                        errors.append(
                            f"Visual '{vc.get('title')}' references column '{cat}' which does not exist in model.bim."
                        )

                    sec_c = q.get("secondary_category")
                    if sec_c and sec_c not in defined_columns:
                        errors.append(
                            f"Visual '{vc.get('title')}' references secondary column '{sec_c}' missing in model.bim."
                        )

                    # Slicer column check
                    if vc.get("type") == "slicer":
                        scol = q.get("column")
                        if scol and scol not in defined_columns:
                            errors.append(
                                f"Slicer '{vc.get('title')}' references column '{scol}' missing in model.bim."
                            )

        return PowerBIValidationResult(
            is_valid=(len(errors) == 0),
            errors=errors,
            warnings=warnings,
            checked_components=checked,
        )
