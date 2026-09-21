# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Digital Marketing & Growth Analysts, Campaign Managers, and BI teams who need to evaluate cross-channel marketing campaign performance, track ROI/conversion efficiency, and publish production-grade Power BI reports without manual dashboard authoring.

## Product Purpose

The AI Power BI Dashboard Generator transforms multi-channel digital marketing campaign datasets into validated business intelligence dashboards, automated Power BI report definitions (PBIR), and actionable AI-driven analytical insights.

Success means:
- Instant automated profiling and validation of raw marketing campaign data (~200,000 records).
- Deterministic calculation of core marketing metrics (ROI, Acquisition Cost, Conversion Rate, Channel Performance, Audience Segmentation).
- Automated generation of valid Power BI report definitions (PBIR) and optional publishing to Power BI Service / Microsoft Fabric.
- Trustworthy conversational analytics, anomaly detection, and budget allocation recommendations grounded exclusively in real data.

## Positioning

An end-to-end deterministic intelligence pipeline: raw marketing CSV validation -> automated KPI profiling -> PBIR report definition -> Power BI Service publishing & conversational insights.

Unlike generic BI tools or unstructured AI assistants:
- It enforces a strict boundary where deterministic analytical tools are the sole source of truth—KPIs and anomaly metrics are never invented or estimated by an LLM.
- It generates complete, standards-compliant Power BI report definitions (PBIR) that can be inspected locally in Power BI Desktop or deployed directly to the cloud.
- Power BI Service authentication is never a barrier to local development, exploration, or offline report generation.

## Operating Context

- **Data Inputs:** Multi-channel marketing campaign datasets (CSV/XLSX) spanning ~200,000 records with fields: `Campaign_ID`, `Company`, `Campaign_Type`, `Target_Audience`, `Duration`, `Channel_Used`, `Conversion_Rate`, `Acquisition_Cost`, `ROI`, and `Location`.
- **Primary Workflows:**
  1. Upload & Inspect: Schema validation, data type inference, hygiene and missing value profiling.
  2. Analytics & Profiling: Channel performance, audience segmentation, duration impact, cost efficiency, and anomaly identification.
  3. Dashboard Planning: Structured recommendation of dashboard pages, visual layouts, KPI cards, and interactive filters.
  4. Power BI Generation: Automated PBIR file generation ready for Power BI Desktop and Power BI Service/Fabric REST API publishing.
  5. AI Analytics: Natural-language querying, trend explanation, and data-backed marketing recommendations.
- **Environments:** Web-based operational UI (FastAPI + React/Vite), local file workflows, and optional enterprise Power BI / Fabric workspaces.

## Capabilities and Constraints

- **Deterministic Truth Rule:** The LLM may classify intent, select tools, propose layouts, and explain findings, but must never fabricate metric values or bypass validation checks.
- **Power BI Decoupling:** Core data profiling, validation, and dashboard planning must function independently of Power BI API connectivity or cloud credentials.
- **Data Ingestion Constraints:** Strict file size, MIME-type, and schema validation before downstream processing.
- **Extensible API & Contracts:** Thin FastAPI routes backed by rigorously tested domain services and Pydantic schema validation.

## Brand Commitments

- **Name:** AI Power BI Dashboard Generator
- **Voice & Tone:** Analytical, authoritative, precise, transparent, and executive-ready.
- **Aesthetic Direction:** Professional data-dense analytics workspace, clean visual hierarchy, crisp typography, and disciplined color attribution (preventing visual fatigue while highlighting anomalies and key benchmarks).

## Evidence on Hand

- Source scope specifications in `README.md` (10-field marketing dataset model and 200k record benchmark).
- Engineering contracts and architectural non-negotiables in `AGENTS.md`.
- Implemented backend data inspection, validation, and anomaly engines under `backend/`.
- Frontend application scaffolding under `frontend/`.

## Product Principles

1. **Deterministic Ground Truth:** All analytical calculations, rankings, and anomaly detections are computed by deterministic engines, never hallucinated.
2. **Zero-Friction Staging:** The user can inspect, validate, plan, and export full Power BI definitions locally without requiring cloud authentication or service credentials.
3. **Rigid Contract Validation:** Every stage of the pipeline—from data ingestion to PBIR layout generation—is guarded by explicit Pydantic schemas.
4. **Action-Oriented Intelligence:** Insights must bridge raw metrics and marketing decisions, highlighting cost inefficiencies, high-performing channels, and audience opportunities.

## Accessibility & Inclusion

- WCAG 2.1 AA compliant color contrast across all analytical charts, data grids, and status indicators.
- Colorblind-safe palettes for multi-channel attribution and anomaly flags.
- Keyboard-accessible interactive filters and clear semantic structure.
