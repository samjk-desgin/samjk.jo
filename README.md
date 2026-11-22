# AIRLYTICS — Airline Financial Analytics & AIS Platform

**Current Stage:** Stage 2: Interactive Financial Analysis & Benchmarking — Illustrative Data Mode  
**Version:** `0.2.0-alpha.1`

## Project Purpose

AIRLYTICS is a university Accounting Information Systems (AIS) and Business Analytics web platform designed for multi-year airline financial analysis, accounting ratio traceability, and side-by-side carrier benchmarking.

## Current Scope & Illustrative Data Policy

- All financial figures currently displayed for **Carrier A** (Full-Service Network Model) and **Carrier B** (Low-Cost Point-to-Point Model) across **FY 2020 – FY 2024** are **Illustrative Sample Data — Not Official Financial Results**.
- All derived totals (`Operating Profit`, `Pre-Tax Income`, `Net Income`, `Free Cash Flow`) and financial ratios are calculated dynamically from the underlying illustrative statement inputs via shared client-side TypeScript utilities (`src/utils/accounting.ts`).
- Missing inputs (such as `Inventory`, `Cash & Equivalents`, `EBITDA`, `FY 2019` opening balances for average-balance ratios, and operational capacity metrics like `ASM`, `RPM`, `CASM`, `RASM`, and `ROIC`) are explicitly shown as `N/A` rather than replaced with zero or fabricated estimates.
- Official airline annual reports, filing links, and audit opinions remain marked as **Pending Official Source** / **Pending Official Data**.

## Implemented Pages

1. **Dashboard**: Executive KPI cards (Operating Revenue, Debt-to-Equity, Operating Margin, Free Cash Flow), 5-year Chart.js trajectory & cost structure charts, and single-carrier or side-by-side comparison tables.
2. **Companies**: Entity profiles for Carrier A and Carrier B, five-year filing registry status tracker, operational fleet/network disclosure checklist (`N/A` until verified), and AIS data domain governance.
3. **Financial Analysis**: Interactive Three-Statement workspace (Income Statement, Balance Sheet, Cash Flow Statement) supporting Reported Values (`$B`), Horizontal Analysis (`YoY %` with zero-crossing turnaround/transition detection), and Vertical Analysis (`Common-Size %`). Note: Cash Flow Statement coverage currently includes `Operating Cash Flow`, `Capital Expenditures`, and `Free Cash Flow`.
4. **Company Comparison**: Multi-tab benchmarking across Profitability Spread, Capital & Leverage, and Cost Efficiency with Chart.js grouped bar/line charts and a 5-year Variance & Spread Matrix (using percentage points `pp` for percentage ratios).
5. **Financial Ratios**: Interactive 4-category ratio workspace with a Formula & Sensitivity Inspector, beginning/ending average-balance enforcement (`ROA`, `ROE`, `Asset Turnover`), safe-denominator guards, and 5-year Chart.js trend visualizations.
6. **Learning Center**: Educational reference covering airline accounting concepts (Air Traffic Liability, IFRS 16 / ASC 842 Aircraft Leases, Maintenance Reserves, Loyalty Programs), an aligned Ratio Guide, and an interactive AIS Architecture diagram.
7. **Reports**: Configurable executive & comparative reports for Carrier A, Carrier B, or Carrier A vs. B across FY 2020 – FY 2024 with dynamic narrative summaries, charts, formula traceability, browser Print / Save as PDF support, and CSV export.

## Technology Stack

- **Currently Implemented**: React 19, TypeScript, Tailwind CSS v4, Chart.js (`react-chartjs-2`), Lucide React, Vite.
- **Planned Infrastructure (Not Yet Implemented)**: MySQL relational database (`dim_airline_entity`, `fact_financial_statement`, `dim_filing_registry`, `fact_operational_capacity`), Python ETL & validation pipeline, and ingestion of official Form 10-K / IFRS annual reports.

## Local Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the development server on port `3000`:
   ```bash
   npm run dev
   ```
3. Run TypeScript type checking:
   ```bash
   npm run typecheck
   ```
4. Build for production:
   ```bash
   npm run build
   ```
