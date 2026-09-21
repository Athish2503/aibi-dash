# AGENTS.md — AI Coding Agent Instructions

## Mission
Build the AI Power BI Dashboard Generator as a reliable, testable BI orchestration system.

## Product flow
`CSV/XLSX upload → inspect → validate → profile/clean → analyze → plan dashboard → validate plan → generate Power BI definition → publish → AI analytics`

## Technology
- Backend: Python + FastAPI
- Data: Pandas + NumPy
- Contracts: Pydantic
- Frontend: React + Vite
- BI target: Power BI / Fabric APIs and supported report-definition/PBIR approaches
- LLM: provider-agnostic adapter
- Tests: pytest for backend

## Non-negotiable rules
1. Never invent analytical results.
2. Deterministic analytics tools are the source of truth.
3. Validate structured LLM output.
4. Keep FastAPI routes thin.
5. Keep tools independently testable.
6. Do not couple core analytics to Power BI.
7. Never commit credentials.
8. Validate file type, size, schema, and data quality.
9. Avoid unnecessary frameworks.
10. Add tests for every business rule.
11. Do not claim Power BI publishing works until tested in a real configured environment.
12. Isolate uncertain external API behavior behind adapters.

## Agent rules
The LLM may classify intent, select tools, propose dashboard plans, and explain tool results.
It may not fabricate KPI values, bypass validation, execute arbitrary generated code, or invent external API behavior.

## Coding workflow
Before coding: read relevant docs, inspect the repository, identify the smallest change, define the interface.
After coding: add tests, run tests, update docs if behavior changed, and report files changed/tests/limitations.
