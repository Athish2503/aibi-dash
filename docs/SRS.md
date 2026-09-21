# Software Requirements Specification (SRS)

## Functional requirements
**FR-01:** Accept CSV and XLSX uploads.
**FR-02:** Inspect row count, columns, types, missing values, unique values, duplicates.
**FR-03:** Validate the expected marketing schema.
**FR-04:** Profile descriptive statistics and categorical cardinality.
**FR-05:** Perform controlled cleaning and type normalization.
**FR-06:** Calculate total campaigns, average ROI, average conversion rate, average acquisition cost.
**FR-07:** Analyze performance by Channel_Used.
**FR-08:** Analyze performance by Target_Audience.
**FR-09:** Analyze performance by Campaign_Type.
**FR-10:** Analyze performance by Duration.
**FR-11:** Analyze performance by Location.
**FR-12:** Analyze Acquisition Cost versus ROI.
**FR-13:** Benchmark Company performance.
**FR-14:** Rank top/bottom campaigns using a configurable score.
**FR-15:** Detect anomalies with transparent rules.
**FR-16:** Generate a typed dashboard plan.
**FR-17:** Validate dashboard plans.
**FR-18:** Generate supported Power BI report/model artifacts.
**FR-19:** Publish when Power BI credentials/workspace are configured.
**FR-20:** Accept natural-language analytical questions.
**FR-21:** Ground answers in tool results.
**FR-22:** Generate historical-data-based recommendations.
**FR-23:** Generate executive summaries.

## Non-functional requirements
- Reliable processing of the target dataset size.
- No secrets in source control.
- Modular, testable code.
- Explainable analytical outputs.
- Input validation at boundaries.
- Status/logging for long-running jobs.
- Extensible provider adapters.

## Error requirements
Errors should expose stage, category, human-readable message, and useful machine-readable details.
