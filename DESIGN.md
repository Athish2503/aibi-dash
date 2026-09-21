---
name: AI Power BI Dashboard Generator
description: High-precision enterprise marketing intelligence and Power BI report orchestrator
colors:
  bg-canvas: "#090d16"
  bg-surface: "#0f172a"
  bg-surface-elevated: "#162033"
  bg-surface-hover: "#1e293b"
  border-default: "#1e293b"
  border-subtle: "rgba(255, 255, 255, 0.08)"
  border-strong: "#334155"
  primary: "#2563eb"
  primary-hover: "#1d4ed8"
  accent-secondary: "#3b82f6"
  text-primary: "#f8fafc"
  text-secondary: "#94a3b8"
  text-muted: "#64748b"
  success: "#10b981"
  warning: "#f59e0b"
  danger: "#ef4444"
  info: "#0284c7"
typography:
  body:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
  mono:
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace"
    fontSize: "0.75rem"
rounded:
  xs: "4px"
  sm: "6px"
  md: "10px"
  lg: "14px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "#ffffff"
    rounded: "{rounded.sm}"
    padding: "8px 16px"
  button-secondary:
    backgroundColor: "{colors.bg-surface-elevated}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.sm}"
    padding: "8px 16px"
  card:
    backgroundColor: "{colors.bg-surface}"
    rounded: "{rounded.lg}"
    padding: "24px"
---

## Overview

The AI Power BI Dashboard Generator interface is an authoritative, high-density enterprise operational workspace for digital marketing campaign analysis and automated Power BI PBIR architecture. It follows the **Operate** mode: high scanability, disciplined data hierarchy, zero amateur clichés or emoji icons, and strict tabular alignment.

## Colors

- **Canvas & Surfaces:** Obsidian foundation (`#090d16`) with layered slate containers (`#0f172a` primary surface, `#162033` elevated cards, `#1e293b` interactive hover states).
- **Primary Interactive:** Enterprise Cobalt (`#2563eb`) with deep azure hover (`#1d4ed8`). Used exclusively for decisive primary actions and active step badges.
- **Semantic Accents:**
  - Success / Passed: Emerald (`#10b981`)
  - Warning / Adapted: Amber (`#f59e0b`)
  - Error / Flagged: Rose (`#ef4444`)
  - Informational: Sky Blue (`#0284c7`)
- **Text:** High-contrast off-white (`#f8fafc`) for primary headings and metric values, slate silver (`#94a3b8`) for descriptions and labels, and dim slate (`#64748b`) for secondary metadata.

## Typography

- System font stack prioritizing crisp native rendering across platforms (`-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`).
- Monospace font stack for schema column names, file paths, and DAX expressions (`ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace`).
- Tabular numerals (`font-variant-numeric: tabular-nums`) applied globally across all data tables, metric tiles, percentages, and financial quantities.

## Layout

- Unified 1400px centered grid container (`.app-container`).
- Responsive multi-column metric grids adapting from single-column mobile viewports to 4-column desktop dashboards.
- Segmented pipeline navigation bar providing immediate visual feedback across 4 key stages: Ingest Dataset $\rightarrow$ Profiling & Intelligence $\rightarrow$ Dashboard Architecture $\rightarrow$ PBIR Artifacts & Deploy.

## Elevation & Depth

- Restrained elevation: Subtle 1px borders (`#1e293b`) with discrete box shadows (`0 1px 2px rgba(0,0,0,0.25)` to `0 4px 12px rgba(0,0,0,0.35)`).
- No arbitrary neon glowing halos, purple radial gradients, or heavy frosted glass blur.

## Shapes

- Compact, functional corner radii: `4px` for code pills and status tags, `6px` for buttons and table cells, `10px` for dialogs and segment bars, `14px` for parent cards.

## Components

- **Navbar:** Sticky slate header with bespoke SVG brand monogram and live telemetry indicators for API Engine, Desktop Runtime, and Cloud Deployment.
- **Upload Dropzone:** Dashed drop target with custom document icon, drag feedback, format specifications, and live phase-progression ticker.
- **Metric Tiles:** High-density KPI blocks featuring large tabular numbers and data quality validation chips.
- **Data & Schema Tables:** Clean spreadsheet-style tables with subtle row highlighting, uppercase column headers, and monospace type tags.
- **Analytical Copilot:** Grounded conversational console with deterministic evidence drawers displaying executed Python tools and computed metrics.

## Do's and Don'ts

### Do's
- Use tabular numerals for every numeric value, currency amount, and count.
- Use bespoke SVG micro-icons with consistent 1.5px/2px stroke width.
- Maintain clear semantic differentiation between dimensions (filters) and measures (metrics).
- Keep interactive controls accessible with high-contrast text and explicit focus-visible rings.

### Don'ts
- Do not use emoji glyphs in place of icons or badges.
- Do not use gradient text (`background-clip: text`) or colorful blurred halos.
- Do not display raw, unformatted JSON in user-facing evidence blocks.
- Do not invent KPI figures or bypass deterministic analytics validation.
