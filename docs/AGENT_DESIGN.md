# AI Agent Design

## Purpose
The agent orchestrates deterministic BI tools and converts their results into useful natural-language outputs.

## Tool groups
### Dataset
`inspect_dataset`, `validate_dataset`, `profile_dataset`, `clean_dataset`

### Analytics
`calculate_kpis`, `analyze_channels`, `analyze_audiences`, `analyze_campaign_types`, `analyze_duration`, `analyze_geography`, `analyze_companies`, `rank_campaigns`, `detect_anomalies`

### Planning
`analyze_columns`, `select_visualization`, `generate_dashboard_plan`, `validate_dashboard_plan`

### Power BI
`create_data_model`, `create_measures`, `create_powerbi_report`, `update_report_visuals`, `publish_report`, `get_report_status`, `refresh_dataset`, `get_report_link`

### Reporting
`answer_natural_language_query`, `generate_insights`, `generate_recommendations`, `generate_executive_report`

## Grounded NL query example
Question: Which channel had the best ROI for 30-day campaigns?

Flow:
1. Parse intent.
2. Extract Duration = 30.
3. Call channel analysis.
4. Read computed grouped results.
5. Answer using returned data.
6. Show filter/evidence.

The LLM must never invent the metric.

## Insight format
An insight should contain observation, metric, segment/filter, comparison, evidence, and optional caveat.

## Anomaly detection
Start with transparent methods such as IQR, z-score where appropriate, and explicit business rules. Record the method used.

## Recommendations
Recommendations must be based on historical performance and state their evidence. They are not guarantees.

## Guardrails
Never fabricate data, execute arbitrary model-generated code, expose secrets, bypass schema validation, or publish an unvalidated plan.
