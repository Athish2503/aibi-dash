# Power BI Automation Strategy

## Objective
Convert a validated dashboard plan into Power BI-compatible model/report artifacts and, when configured, publish them.

## Important constraint
Do not assume arbitrary PBIX files can simply be created by sending JSON to an API. Use supported Power BI/Fabric automation surfaces and report-definition/PBIR approaches where applicable.

## Stages
1. Generate Power BI-independent dashboard plan.
2. Generate semantic-model and measure specifications.
3. Translate to the selected supported report-definition representation.
4. Validate in Power BI Desktop where practical.
5. Add Power BI Service/Fabric authentication and publishing.
6. Implement refresh/status/link handling.

## Template-first strategy
Start with a controlled set of report pages and visual patterns. The agent selects and configures these rather than generating an unconstrained report.

## Example visual specification
```json
{
  "id": "roi_by_channel",
  "type": "bar_chart",
  "title": "ROI by Channel",
  "category": "Channel_Used",
  "measure": "Average ROI"
}
```

## Publishing states
`NOT_CONFIGURED → AUTHENTICATED → WORKSPACE_READY → MODEL_CREATED → REPORT_CREATED → PUBLISHED → REFRESHED`

Failures must produce recoverable status and diagnostics.

## Security
Credentials belong in secure configuration/environment variables. Current Power BI API capabilities and permissions must be verified against current Microsoft documentation before implementing the publishing adapter.
