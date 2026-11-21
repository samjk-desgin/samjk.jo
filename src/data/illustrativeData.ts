import {
  IllustrativeCarrierProfile,
  NavItem,
  PageBlueprint,
  PageId,
} from '../types/analytics';

export const NAVIGATION_ITEMS: NavItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    shortDescription: 'Key financial indicators and 5-year overview',
    stageStatus: 'Active (Stage 1)',
  },
  {
    id: 'companies',
    label: 'Companies',
    shortDescription: 'Airline entity profiles and reporting metadata',
    stageStatus: 'Planned (Stage 2+)',
  },
  {
    id: 'financial-analysis',
    label: 'Financial Analysis',
    shortDescription: 'Income statement, balance sheet, and cash flows',
    stageStatus: 'Planned (Stage 2+)',
  },
  {
    id: 'company-comparison',
    label: 'Company Comparison',
    shortDescription: 'Side-by-side 5-year airline benchmarking',
    stageStatus: 'Planned (Stage 2+)',
  },
  {
    id: 'financial-ratios',
    label: 'Financial Ratios',
    shortDescription: 'Liquidity, leverage, profitability, and aviation KPIs',
    stageStatus: 'Planned (Stage 2+)',
  },
  {
    id: 'learning-center',
    label: 'Learning Center',
    shortDescription: 'Accounting formulas and airline analytics concepts',
    stageStatus: 'Planned (Stage 2+)',
  },
  {
    id: 'reports',
    label: 'Reports',
    shortDescription: 'Structured analytical summaries and export views',
    stageStatus: 'Planned (Stage 2+)',
  },
];

/**
 * IMPORTANT NOTICE ON DATA INTEGRITY:
 * These records are strictly ILLUSTRATIVE PLACEHOLDER FIGURES created solely
 * to demonstrate layout geometry, Chart.js rendering, and reconciled accounting
 * identities during Stage 1 (Website Structure & Initial Dashboard Design).
 * They do NOT represent audited financial results of any real airline.
 * All ratios (Operating Margin, Debt-to-Equity, Current Ratio) and derived totals
 * (Operating Profit, Pre-Tax Income, Net Income, Free Cash Flow) are calculated
 * dynamically from these underlying illustrative line items.
 */
export const ILLUSTRATIVE_CARRIERS: IllustrativeCarrierProfile[] = [
  {
    id: 'carrier-a',
    name: 'Carrier A · Full-Service Network Model (Illustrative)',
    businessModel: 'Long-haul hub-and-spoke network archetype',
    reportingStandard: 'Illustrative GAAP / IFRS Structure · USD Billions',
    fiscalHorizon: 'FY 2020 – FY 2024 (Illustrative Sample)',
    annualSeries: [
      {
        fiscalYear: 'FY 2020',
        operatingRevenueUsdB: 18.4,
        operatingExpensesUsdB: 24.1,
        nonOperatingNetUsdB: 0.3,
        financeCostsUsdB: 1.1,
        incomeTaxExpenseUsdB: -0.3,
        currentAssetsUsdB: 16.8,
        totalAssetsUsdB: 62.5,
        currentLiabilitiesUsdB: 16.0,
        totalLiabilitiesUsdB: 58.9,
        totalInterestBearingDebtUsdB: 17.6,
        shareholdersEquityUsdB: 3.6,
        operatingCashFlowUsdB: -2.8,
        capitalExpendituresUsdB: 2.0,
      },
      {
        fiscalYear: 'FY 2021',
        operatingRevenueUsdB: 28.2,
        operatingExpensesUsdB: 29.5,
        nonOperatingNetUsdB: 0.4,
        financeCostsUsdB: 1.2,
        incomeTaxExpenseUsdB: -0.2,
        currentAssetsUsdB: 19.6,
        totalAssetsUsdB: 65.8,
        currentLiabilitiesUsdB: 17.5,
        totalLiabilitiesUsdB: 61.2,
        totalInterestBearingDebtUsdB: 19.3,
        shareholdersEquityUsdB: 4.6,
        operatingCashFlowUsdB: 1.6,
        capitalExpendituresUsdB: 2.5,
      },
      {
        fiscalYear: 'FY 2022',
        operatingRevenueUsdB: 44.6,
        operatingExpensesUsdB: 41.2,
        nonOperatingNetUsdB: -0.2,
        financeCostsUsdB: 1.2,
        incomeTaxExpenseUsdB: 0.5,
        currentAssetsUsdB: 19.2,
        totalAssetsUsdB: 68.4,
        currentLiabilitiesUsdB: 20.0,
        totalLiabilitiesUsdB: 61.9,
        totalInterestBearingDebtUsdB: 22.1,
        shareholdersEquityUsdB: 6.5,
        operatingCashFlowUsdB: 5.4,
        capitalExpendituresUsdB: 3.6,
      },
      {
        fiscalYear: 'FY 2023',
        operatingRevenueUsdB: 51.8,
        operatingExpensesUsdB: 46.5,
        nonOperatingNetUsdB: -0.3,
        financeCostsUsdB: 1.1,
        incomeTaxExpenseUsdB: 1.0,
        currentAssetsUsdB: 18.4,
        totalAssetsUsdB: 71.2,
        currentLiabilitiesUsdB: 20.0,
        totalLiabilitiesUsdB: 61.4,
        totalInterestBearingDebtUsdB: 25.5,
        shareholdersEquityUsdB: 9.8,
        operatingCashFlowUsdB: 7.2,
        capitalExpendituresUsdB: 4.5,
      },
      {
        fiscalYear: 'FY 2024',
        operatingRevenueUsdB: 54.9,
        operatingExpensesUsdB: 48.8,
        nonOperatingNetUsdB: -0.3,
        financeCostsUsdB: 1.0,
        incomeTaxExpenseUsdB: 1.2,
        currentAssetsUsdB: 19.6,
        totalAssetsUsdB: 73.6,
        currentLiabilitiesUsdB: 20.0,
        totalLiabilitiesUsdB: 60.2,
        totalInterestBearingDebtUsdB: 28.1,
        shareholdersEquityUsdB: 13.4,
        operatingCashFlowUsdB: 8.2,
        capitalExpendituresUsdB: 4.8,
      },
    ],
    costStructurePct: [
      { category: 'Aircraft Fuel & Oil', sharePct: 27.5 },
      { category: 'Salaries, Wages & Benefits', sharePct: 31.0 },
      { category: 'Maintenance & Materials', sharePct: 11.5 },
      { category: 'Aircraft Depreciation & Rent', sharePct: 10.0 },
      { category: 'Landing Fees & Ground Ops', sharePct: 12.5 },
      { category: 'Distribution & General Admin', sharePct: 7.5 },
    ],
  },
  {
    id: 'carrier-b',
    name: 'Carrier B · Low-Cost Point-to-Point Model (Illustrative)',
    businessModel: 'Short-to-medium-haul single-fleet archetype',
    reportingStandard: 'Illustrative GAAP / IFRS Structure · USD Billions',
    fiscalHorizon: 'FY 2020 – FY 2024 (Illustrative Sample)',
    annualSeries: [
      {
        fiscalYear: 'FY 2020',
        operatingRevenueUsdB: 9.1,
        operatingExpensesUsdB: 11.8,
        nonOperatingNetUsdB: 0.2,
        financeCostsUsdB: 0.6,
        incomeTaxExpenseUsdB: -0.1,
        currentAssetsUsdB: 13.2,
        totalAssetsUsdB: 31.4,
        currentLiabilitiesUsdB: 8.0,
        totalLiabilitiesUsdB: 22.8,
        totalInterestBearingDebtUsdB: 12.0,
        shareholdersEquityUsdB: 8.6,
        operatingCashFlowUsdB: -0.9,
        capitalExpendituresUsdB: 1.2,
      },
      {
        fiscalYear: 'FY 2021',
        operatingRevenueUsdB: 15.6,
        operatingExpensesUsdB: 15.9,
        nonOperatingNetUsdB: 0.3,
        financeCostsUsdB: 0.6,
        incomeTaxExpenseUsdB: -0.1,
        currentAssetsUsdB: 13.1,
        totalAssetsUsdB: 33.2,
        currentLiabilitiesUsdB: 8.5,
        totalLiabilitiesUsdB: 23.9,
        totalInterestBearingDebtUsdB: 11.6,
        shareholdersEquityUsdB: 9.3,
        operatingCashFlowUsdB: 1.9,
        capitalExpendituresUsdB: 1.5,
      },
      {
        fiscalYear: 'FY 2022',
        operatingRevenueUsdB: 23.8,
        operatingExpensesUsdB: 22.6,
        nonOperatingNetUsdB: 0.1,
        financeCostsUsdB: 0.5,
        incomeTaxExpenseUsdB: 0.2,
        currentAssetsUsdB: 13.8,
        totalAssetsUsdB: 35.1,
        currentLiabilitiesUsdB: 10.0,
        totalLiabilitiesUsdB: 24.7,
        totalInterestBearingDebtUsdB: 10.9,
        shareholdersEquityUsdB: 10.4,
        operatingCashFlowUsdB: 2.8,
        capitalExpendituresUsdB: 1.9,
      },
      {
        fiscalYear: 'FY 2023',
        operatingRevenueUsdB: 26.1,
        operatingExpensesUsdB: 25.4,
        nonOperatingNetUsdB: 0.3,
        financeCostsUsdB: 0.5,
        incomeTaxExpenseUsdB: 0.1,
        currentAssetsUsdB: 12.9,
        totalAssetsUsdB: 36.5,
        currentLiabilitiesUsdB: 10.0,
        totalLiabilitiesUsdB: 25.9,
        totalInterestBearingDebtUsdB: 10.8,
        shareholdersEquityUsdB: 10.6,
        operatingCashFlowUsdB: 2.7,
        capitalExpendituresUsdB: 2.4,
      },
      {
        fiscalYear: 'FY 2024',
        operatingRevenueUsdB: 27.9,
        operatingExpensesUsdB: 26.2,
        nonOperatingNetUsdB: 0.2,
        financeCostsUsdB: 0.4,
        incomeTaxExpenseUsdB: 0.4,
        currentAssetsUsdB: 13.3,
        totalAssetsUsdB: 37.8,
        currentLiabilitiesUsdB: 10.0,
        totalLiabilitiesUsdB: 26.1,
        totalInterestBearingDebtUsdB: 11.1,
        shareholdersEquityUsdB: 11.7,
        operatingCashFlowUsdB: 3.5,
        capitalExpendituresUsdB: 2.3,
      },
    ],
    costStructurePct: [
      { category: 'Aircraft Fuel & Oil', sharePct: 33.0 },
      { category: 'Salaries, Wages & Benefits', sharePct: 28.5 },
      { category: 'Maintenance & Materials', sharePct: 9.5 },
      { category: 'Aircraft Depreciation & Rent', sharePct: 11.0 },
      { category: 'Landing Fees & Ground Ops', sharePct: 12.0 },
      { category: 'Distribution & General Admin', sharePct: 6.0 },
    ],
  },
];

export const PAGE_BLUEPRINTS: Record<Exclude<PageId, 'dashboard'>, PageBlueprint> = {
  companies: {
    id: 'companies',
    title: 'Companies',
    subtitle: 'Airline Entity Profiles & Official Filing Registry',
    purpose:
      'Catalogs the two selected airline companies, their corporate governance details, fleet operating models, reporting currencies, and official annual report sources (Form 10-K / IFRS Annual Reports) used across the platform.',
    aisFocus:
      'Establishes entity metadata and chart-of-accounts standardization prior to multi-year financial comparison.',
    plannedComponents: [
      {
        name: 'Airline Profile Directory',
        description:
          'Structured overview cards presenting ticker symbol, headquarters, business model (Legacy vs. Low-Cost), fiscal year-end, and accounting standard.',
      },
      {
        name: 'Official Source Filing Log',
        description:
          'Auditable reference table linking each fiscal year (Year 1 to Year 5) to its published annual report, auditor opinion, and currency unit.',
      },
      {
        name: 'Operational Context Indicators',
        description:
          'Supplementary aviation scale metrics (fleet size, hub count, primary route network) separated cleanly from audited accounting tables.',
      },
    ],
    requiredOfficialInputs: [
      'Company legal name, ticker, exchange, and headquarters',
      'Accounting framework (US GAAP or IFRS) and fiscal calendar',
      'Published Annual Reports / Form 10-K filings for 5 consecutive fiscal years',
    ],
    previewTabs: ['Entity Profiles', 'Filing Registry', 'Fleet & Network Context'],
  },
  'financial-analysis': {
    id: 'financial-analysis',
    title: 'Financial Analysis',
    subtitle: 'Three-Statement Accounting Breakdown (5-Year Horizon)',
    purpose:
      'Provides structured horizontal (trend) and vertical (common-size) analysis of each airline’s Income Statement, Balance Sheet, and Statement of Cash Flows over five consecutive years.',
    aisFocus:
      'Teaches students how to standardize raw financial statement line items into normalized relational tables for multi-year analytical querying.',
    plannedComponents: [
      {
        name: 'Income Statement Analyzer',
        description:
          'Tracks Passenger Revenue, Cargo & Ancillary Revenue, Fuel Expense, Labor, Depreciation, EBIT, and Net Income with YoY % change columns.',
      },
      {
        name: 'Balance Sheet & Capital Structure View',
        description:
          'Examines Cash & Short-Term Investments, Flight Equipment, Lease Liabilities (IFRS 16 / ASC 842), Long-Term Debt, and Shareholders’ Equity.',
      },
      {
        name: 'Cash Flow Statement Breakdown',
        description:
          'Separates Operating Cash Flow, Capital Expenditures (aircraft acquisitions), and Financing Cash Flows to evaluate Free Cash Flow sustainability.',
      },
    ],
    requiredOfficialInputs: [
      'Audited Consolidated Statements of Operations (5 years)',
      'Audited Consolidated Balance Sheets (5 years)',
      'Audited Consolidated Statements of Cash Flows (5 years)',
    ],
    previewTabs: ['Income Statement', 'Balance Sheet', 'Cash Flow Statement', 'Common-Size %'],
  },
  'company-comparison': {
    id: 'company-comparison',
    title: 'Company Comparison',
    subtitle: 'Side-by-Side 5-Year Airline Benchmarking',
    purpose:
      'Enables direct visual and numerical benchmarking between two selected airline companies across profitability, capital intensity, cost discipline, and post-disruption recovery trajectories.',
    aisFocus:
      'Demonstrates cross-sectional accounting analytics by aligning two companies onto identical fiscal periods and normalized metric definitions.',
    plannedComponents: [
      {
        name: 'Dual-Airline Trend Overlay Charts',
        description:
          'Interactive Chart.js multi-line and grouped-bar comparisons for Revenue Growth, Operating Margin, and Return on Invested Capital.',
      },
      {
        name: 'Variance & Spread Matrix',
        description:
          'Tabular side-by-side matrix highlighting percentage-point spreads and dollar variances between Airline A and Airline B by fiscal year.',
      },
      {
        name: 'Aviation Cost Efficiency Benchmark',
        description:
          'Compares fuel share of operating expenses, labor intensity, and unit cost metrics (CASM vs. RASM where disclosed).',
      },
    ],
    requiredOfficialInputs: [
      'Normalized 5-year financial datasets for both Airline A and Airline B',
      'Consistent currency translation and fiscal year alignment',
      'Optional operating statistics (ASK/ASM, RPK/RPM, Load Factor)',
    ],
    previewTabs: ['Profitability Spread', 'Capital & Leverage', 'Cost Efficiency'],
  },
  'financial-ratios': {
    id: 'financial-ratios',
    title: 'Financial Ratios',
    subtitle: 'Ratio Computation Engine, Formulas & Interpretation',
    purpose:
      'Computes core accounting and aviation-specific financial ratios dynamically from statement inputs, displays exact mathematical formulas, and provides structured diagnostic interpretation.',
    aisFocus:
      'Connects raw ledger/statement balances to automated Python calculation pipelines and formula transparency.',
    plannedComponents: [
      {
        name: 'Liquidity & Solvency Ratios',
        description:
          'Current Ratio, Quick Ratio, Debt-to-Equity, Net Debt / EBITDA, and Interest Coverage Ratio with industry-specific aviation context.',
      },
      {
        name: 'Profitability & Efficiency Ratios',
        description:
          'Operating Margin, Net Profit Margin, Return on Assets (ROA), Return on Equity (ROE), and Asset Turnover.',
      },
      {
        name: 'Formula & Sensitivity Inspector',
        description:
          'Displays numerator/denominator components directly from the statement lines so users can trace every computed ratio back to the official report.',
      },
    ],
    requiredOfficialInputs: [
      'Verified Balance Sheet & Income Statement inputs for numerator/denominator traceability',
      'Lease liability and interest expense disclosures from financial statement footnotes',
    ],
    previewTabs: ['Profitability', 'Liquidity', 'Leverage & Solvency', 'Aviation Metrics'],
  },
  'learning-center': {
    id: 'learning-center',
    title: 'Learning Center',
    subtitle: 'Accounting Information Systems & Airline Financial Literacy',
    purpose:
      'Serves as the educational companion for university students, explaining how airline accounting works—from deferred ticket revenue (Air Traffic Liability) to aircraft lease capitalization and fuel cost sensitivity.',
    aisFocus:
      'Bridges financial accounting theory, AIS database design, and practical interpretation of airline performance indicators.',
    plannedComponents: [
      {
        name: 'Airline Accounting Concepts Library',
        description:
          'Concise modules on Air Traffic Liability, IFRS 16 / ASC 842 Lease Accounting, Maintenance Reserves, and Loyalty Program Deferred Revenue.',
      },
      {
        name: 'Ratio Formula Reference Guide',
        description:
          'Structured index explaining how each financial ratio is calculated, why airlines differ from retail or software firms, and common analytical pitfalls.',
      },
      {
        name: 'AIS Data Pipeline Architecture Guide',
        description:
          'Documents the relational MySQL schema, Python ETL/calculation flow, and Chart.js presentation layer used in the project.',
      },
    ],
    requiredOfficialInputs: [
      'Textbook and IFRS/GAAP accounting standards references',
      'University AIS rubric and analytical documentation standards',
    ],
    previewTabs: ['Accounting Concepts', 'Ratio Guide', 'AIS Architecture'],
  },
  reports: {
    id: 'reports',
    title: 'Reports',
    subtitle: 'Executive Analytical Summaries & Exportable Briefs',
    purpose:
      'Consolidates five-year findings, ratio trends, and comparative conclusions into structured, presentation-ready analytical reports suitable for academic evaluation and decision-making review.',
    aisFocus:
      'Delivers the final reporting output layer of an Accounting Information System—turning validated calculations into traceable management summaries.',
    plannedComponents: [
      {
        name: '5-Year Comparative Executive Summary',
        description:
          'Structured narrative and summary table highlighting key profitability shifts, balance sheet recovery, and comparative strengths.',
      },
      {
        name: 'Printable / Exportable Report View',
        description:
          'Clean formatted tables and charts ready for PDF print export or CSV dataset download for independent verification.',
      },
      {
        name: 'Methodology & Audit Trail Appendix',
        description:
          'Lists all official annual report citations, fiscal adjustments, and ratio calculation assumptions.',
      },
    ],
    requiredOfficialInputs: [
      'Completed 5-year analysis and verified ratio outputs from earlier modules',
      'Formal citations of official airline annual reports',
    ],
    previewTabs: ['Executive Summary', 'Comparison Matrix', 'Citations & Appendix'],
  },
};
