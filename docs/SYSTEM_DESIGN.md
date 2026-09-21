# System Design

## High-level flow
```text
User
 ↓
React Frontend
 ↓
FastAPI
 ↓
Agent Orchestrator
 ├─ Dataset Inspector
 ├─ Validator
 ├─ Profiler/Cleaner
 ├─ KPI Engine
 ├─ Analysis Tools
 ├─ Anomaly Detector
 ├─ Dashboard Planner
 ├─ Plan Validator
 └─ Report Builder
       ↓
Power BI Adapter
       ↓
Power BI / Fabric
```

## Principles
- Deterministic computation first.
- LLM orchestration second.
- Strong schemas at boundaries.
- External-system adapters.
- Template-driven report generation initially.
- Preserve intermediate artifacts.

## Pipeline
1. Ingestion
2. Inspection
3. Validation
4. Preparation
5. Analytics
6. Dashboard planning
7. Plan validation
8. Report generation
9. Publishing
10. AI analytics

The LLM decides which tool to call; tools determine what the data says.
