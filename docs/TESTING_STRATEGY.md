# Testing Strategy

## Unit tests
Cover inspector, validator, cleaner, KPI calculations, grouping, ranking, anomalies, plan validation.

## Data tests
Include valid data, missing columns, incorrect numeric types, missing values, duplicates, empty files, malformed CSV, extra columns, unusual duration values.

## Agent tests
Verify correct tool selection, correct filters, use of tool results, unsupported-question handling, and no fabricated values.

## Plan tests
Reject unknown fields, unsupported visuals, missing measures, duplicate IDs, invalid page references.

## Power BI adapter tests
Mock authentication failure, permission failure, model/report creation failure, timeout, and refresh failure.

## API tests
Verify status codes, schemas, validation errors, file handling, and job status.

## End-to-end
`upload → inspect → validate → analyze → plan → validate → generate`

Cloud publishing is a separate environment-dependent E2E test.
