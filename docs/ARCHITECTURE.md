# Architecture

## Backend
```text
backend/app/
├── main.py
├── config.py
├── api/
├── agent/
├── data/
├── analytics/
├── powerbi/
└── services/
```

Suggested modules:
- `data/inspector.py`
- `data/validator.py`
- `data/profiler.py`
- `data/cleaner.py`
- `analytics/kpis.py`
- `analytics/channels.py`
- `analytics/audiences.py`
- `analytics/campaign_types.py`
- `analytics/duration.py`
- `analytics/geography.py`
- `analytics/benchmarking.py`
- `analytics/rankings.py`
- `analytics/anomalies.py`
- `agent/orchestrator.py`
- `agent/tool_registry.py`
- `agent/dashboard_planner.py`
- `powerbi/report_builder.py`
- `powerbi/adapter.py`
- `powerbi/publisher.py`

## Frontend
```text
frontend/src/
├── components/
├── pages/
├── features/
├── services/
├── hooks/
├── types/
└── utils/
```

## Dependency rule
Analytics must not depend on API routes, React, or Power BI. Power BI code must be behind an adapter boundary.
