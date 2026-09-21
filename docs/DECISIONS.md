# Architecture Decision Records

## ADR-001 — FastAPI
Use FastAPI for the backend because the project is Python/data-analysis heavy and requires typed APIs.

## ADR-002 — Deterministic analytics
KPI and analytical calculations are Python tools. The LLM orchestrates and explains.

## ADR-003 — Template-first Power BI
Start with controlled report templates and validated definitions for predictable generation.

## ADR-004 — LLM adapter
Keep the LLM provider behind an adapter so the application is not tightly coupled to one provider.

## ADR-005 — Local-first Power BI integration
Build the local intelligence pipeline before cloud publishing so environment-dependent authentication does not block core development.
