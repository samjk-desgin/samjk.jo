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
  stageStatus: 'Implemented' | 'Implemented (Illustrative Data Mode)' | 'Planned';
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
  inventoryUsdB?: number | null;
  cashAndEquivalentsUsdB?: number | null;
  ebitdaUsdB?: number | null;
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

export type RatioCategory =
  | 'profitability'
  | 'liquidity'
  | 'leverage'
  | 'cash-flow';

export type RatioId =
  | 'operating-margin'
  | 'net-profit-margin'
  | 'roa'
  | 'roe'
  | 'asset-turnover'
  | 'current-ratio'
  | 'quick-ratio'
  | 'debt-to-equity'
  | 'debt-to-assets'
  | 'interest-coverage'
  | 'net-debt-to-ebitda'
  | 'fcf-margin';

export type RatioUnit = '%' | 'x' | 'times';

export type RatioStatus = 'valid' | 'unavailable' | 'invalid-denominator';

export interface RatioDefinitionMeta {
  id: RatioId;
  category: RatioCategory;
  name: string;
  formula: string;
  unit: RatioUnit;
  sourceStatement: string;
  usesAverageBalance?: boolean;
}

export interface RatioEvaluation extends RatioDefinitionMeta {
  fiscalYear: string;
  value: number | null;
  formattedValue: string;
  status: RatioStatus;
  statusReason?: string;
  numeratorLabel: string;
  numeratorValueText: string;
  denominatorLabel: string;
  denominatorValueText: string;
  interpretation: string;
}
