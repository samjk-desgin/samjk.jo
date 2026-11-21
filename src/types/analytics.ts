export type PageId =
  | 'dashboard'
  | 'companies'
  | 'financial-analysis'
  | 'company-comparison'
  | 'financial-ratios'
  | 'learning-center'
  | 'reports';

export interface NavItem {
  id: PageId;
  label: string;
  shortDescription: string;
  stageStatus: 'Active (Stage 1)' | 'Planned (Stage 2+)';
}

/**
 * Underlying financial statement inputs for a single fiscal year (USD Billions).
 * Derived metrics (Operating Profit, Pre-Tax Income, Net Income, Operating Margin,
 * Debt-to-Equity Ratio, Current Ratio, and Free Cash Flow) are calculated
 * dynamically from these underlying line items to guarantee traceability.
 */
export interface AnnualFinancialRow {
  fiscalYear: string;
  operatingRevenueUsdB: number;
  operatingExpensesUsdB: number;
  nonOperatingNetUsdB: number;
  financeCostsUsdB: number;
  incomeTaxExpenseUsdB: number;
  currentAssetsUsdB?: number | null;
  totalAssetsUsdB: number;
  currentLiabilitiesUsdB?: number | null;
  totalLiabilitiesUsdB: number;
  totalInterestBearingDebtUsdB?: number | null;
  shareholdersEquityUsdB: number;
  operatingCashFlowUsdB?: number | null;
  capitalExpendituresUsdB?: number | null;
}

export interface CostStructureItem {
  category: string;
  sharePct: number;
}

export interface IllustrativeCarrierProfile {
  id: 'carrier-a' | 'carrier-b';
  name: string;
  businessModel: string;
  reportingStandard: string;
  fiscalHorizon: string;
  annualSeries: AnnualFinancialRow[];
  costStructurePct: CostStructureItem[];
}

export interface PageBlueprint {
  id: PageId;
  title: string;
  subtitle: string;
  purpose: string;
  aisFocus: string;
  plannedComponents: {
    name: string;
    description: string;
  }[];
  requiredOfficialInputs: string[];
  previewTabs: string[];
}
