from typing import Any, Optional
import pandas as pd
import numpy as np
from pydantic import BaseModel, Field


class DimensionScore(BaseModel):
    score: float = Field(ge=0.0, le=100.0, description="Score from 0 to 100")
    details: str = Field(description="Summary explanation of the dimension score")
    metrics: dict[str, Any] = Field(default_factory=dict, description="Detailed sub-metrics")


class DataQualityReport(BaseModel):
    overall_score: float = Field(ge=0.0, le=100.0, description="Weighted composite data quality score (0-100)")
    grade: str = Field(description="Letter grade (A+, A, B, C, D, F)")
    completeness: DimensionScore
    validity: DimensionScore
    consistency: DimensionScore
    uniqueness: DimensionScore
    statistical_health: DimensionScore
    recommendations: list[str] = Field(default_factory=list)
    passed_audit: bool = Field(description="Whether dataset meets minimum threshold for reliable BI generation")


class DataQualityEngine:
    """
    Deterministic Data Quality Engine.
    Evaluates 5 core dimensions:
    1. Completeness: Missing/null value penalty
    2. Validity: Schema & business range adherence (e.g. 0 <= CVR <= 1, CAC > 0)
    3. Consistency: Type uniformity and format sanity
    4. Uniqueness: Duplicate row & duplicate ID penalty
    5. Statistical Health: Outlier concentration and variance check
    """

    CRITICAL_MARKETING_COLUMNS = [
        "ROI",
        "Acquisition_Cost",
        "Conversion_Rate",
        "Channel_Used",
        "Campaign_Type",
    ]

    @classmethod
    def evaluate(cls, df: pd.DataFrame) -> DataQualityReport:
        if df is None or df.empty:
            empty_dim = DimensionScore(score=0.0, details="Dataset is empty or null.", metrics={})
            return DataQualityReport(
                overall_score=0.0,
                grade="F",
                completeness=empty_dim,
                validity=empty_dim,
                consistency=empty_dim,
                uniqueness=empty_dim,
                statistical_health=empty_dim,
                recommendations=["Upload a valid, non-empty dataset."],
                passed_audit=False,
            )

        total_rows = len(df)
        total_cells = df.size
        recs: list[str] = []

        # 1. Completeness (Weight: 25%)
        null_cells = int(df.isna().sum().sum())
        cell_completeness_pct = ((total_cells - null_cells) / total_cells) * 100 if total_cells > 0 else 0.0

        # Check critical column completeness
        critical_present = [c for c in cls.CRITICAL_MARKETING_COLUMNS if c in df.columns]
        critical_null_pct = 0.0
        if critical_present:
            crit_nulls = df[critical_present].isna().sum().sum()
            critical_null_pct = (crit_nulls / (len(critical_present) * total_rows)) * 100
        completeness_score = max(0.0, min(100.0, round(cell_completeness_pct * 0.7 + (100.0 - critical_null_pct) * 0.3, 1)))
        
        if completeness_score < 90:
            recs.append(f"Impute missing values: {null_cells} null cells detected across {len(df.columns)} columns.")

        completeness_dim = DimensionScore(
            score=completeness_score,
            details=f"{round(cell_completeness_pct, 1)}% complete cells, {round(critical_null_pct, 1)}% nulls in critical metrics.",
            metrics={"total_null_cells": null_cells, "cell_completeness_pct": round(cell_completeness_pct, 2)},
        )

        # 2. Validity (Weight: 25%)
        # Business constraints:
        # - Conversion_Rate: [0.0, 1.0] (or [0, 100] if percentage scale)
        # - Acquisition_Cost: > 0
        # - ROI: valid float
        validity_penalties = 0.0
        validity_details_list = []

        if "Conversion_Rate" in df.columns:
            cvr_series = pd.to_numeric(df["Conversion_Rate"], errors="coerce")
            invalid_cvr = ((cvr_series < 0) | (cvr_series > 100)).sum()
            if invalid_cvr > 0:
                validity_penalties += min(30.0, (invalid_cvr / total_rows) * 100 * 2)
                validity_details_list.append(f"{invalid_cvr} invalid Conversion_Rate entries")

        if "Acquisition_Cost" in df.columns:
            ac_series = pd.to_numeric(df["Acquisition_Cost"], errors="coerce")
            invalid_ac = (ac_series < 0).sum()
            if invalid_ac > 0:
                validity_penalties += min(30.0, (invalid_ac / total_rows) * 100 * 2)
                validity_details_list.append(f"{invalid_ac} negative Acquisition_Cost entries")

        if "ROI" in df.columns:
            roi_series = pd.to_numeric(df["ROI"], errors="coerce")
            nan_roi = roi_series.isna().sum()
            if nan_roi > 0:
                validity_penalties += min(20.0, (nan_roi / total_rows) * 100)
                validity_details_list.append(f"{nan_roi} non-numeric ROI values")

        validity_score = max(0.0, min(100.0, round(100.0 - validity_penalties, 1)))
        validity_dim = DimensionScore(
            score=validity_score,
            details="All numeric domain constraints passed." if not validity_details_list else "; ".join(validity_details_list),
            metrics={"penalties_applied": round(validity_penalties, 2)},
        )

        # 3. Consistency (Weight: 20%)
        # Check standard types, absence of mixed types, clean string fields
        inconsistent_cols = 0
        for col in df.columns:
            # Check mixed types in object columns
            if df[col].dtype == object:
                types_in_col = df[col].dropna().map(type).nunique()
                if types_in_col > 1:
                    inconsistent_cols += 1

        consistency_penalty = min(40.0, inconsistent_cols * 10.0)
        consistency_score = max(0.0, min(100.0, round(100.0 - consistency_penalty, 1)))
        consistency_dim = DimensionScore(
            score=consistency_score,
            details=f"Type uniformity verified across {len(df.columns) - inconsistent_cols}/{len(df.columns)} columns.",
            metrics={"inconsistent_type_columns": inconsistent_cols},
        )

        # 4. Uniqueness (Weight: 15%)
        duplicate_rows = int(df.duplicated().sum())
        dup_row_pct = (duplicate_rows / total_rows) * 100 if total_rows > 0 else 0.0

        dup_id_pct = 0.0
        if "Campaign_ID" in df.columns:
            dup_ids = int(df["Campaign_ID"].duplicated().sum())
            dup_id_pct = (dup_ids / total_rows) * 100

        uniqueness_penalty = min(50.0, dup_row_pct * 2 + dup_id_pct * 1.5)
        uniqueness_score = max(0.0, min(100.0, round(100.0 - uniqueness_penalty, 1)))
        if duplicate_rows > 0:
            recs.append(f"Deduplicate dataset: {duplicate_rows} exact duplicate rows found.")

        uniqueness_dim = DimensionScore(
            score=uniqueness_score,
            details=f"{duplicate_rows} duplicate rows ({round(dup_row_pct, 2)}%).",
            metrics={"duplicate_rows": duplicate_rows, "duplicate_row_pct": round(dup_row_pct, 2)},
        )

        # 5. Statistical Health / Outlier Hygiene (Weight: 15%)
        # Check if extreme outliers (> 5 standard deviations) corrupt core metrics
        extreme_outliers = 0
        for num_col in ["ROI", "Acquisition_Cost", "Conversion_Rate"]:
            if num_col in df.columns:
                series = pd.to_numeric(df[num_col], errors="coerce").dropna()
                if len(series) > 10 and series.std() > 0:
                    z_scores = np.abs((series - series.mean()) / series.std())
                    extreme_outliers += int((z_scores > 5.0).sum())

        stat_penalty = min(30.0, (extreme_outliers / total_rows) * 100 * 5)
        statistical_score = max(0.0, min(100.0, round(100.0 - stat_penalty, 1)))
        statistical_dim = DimensionScore(
            score=statistical_score,
            details=f"{extreme_outliers} extreme statistical outliers (>5σ) detected.",
            metrics={"extreme_outliers_count": extreme_outliers},
        )

        # Composite Score Calculation
        overall = (
            completeness_score * 0.25
            + validity_score * 0.25
            + consistency_score * 0.20
            + uniqueness_score * 0.15
            + statistical_score * 0.15
        )
        overall_score = round(overall, 1)

        # Grade Assignment
        if overall_score >= 95:
            grade = "A+"
        elif overall_score >= 90:
            grade = "A"
        elif overall_score >= 80:
            grade = "B"
        elif overall_score >= 70:
            grade = "C"
        elif overall_score >= 60:
            grade = "D"
        else:
            grade = "F"

        passed = overall_score >= 70.0 and critical_null_pct < 20.0

        if not recs:
            recs.append("Data quality meets high integrity standards for automated Power BI modeling.")

        return DataQualityReport(
            overall_score=overall_score,
            grade=grade,
            completeness=completeness_dim,
            validity=validity_dim,
            consistency=consistency_dim,
            uniqueness=uniqueness_dim,
            statistical_health=statistical_dim,
            recommendations=recs,
            passed_audit=passed,
        )
