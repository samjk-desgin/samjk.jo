import { AnnualFinancialRow } from '../types/analytics';

export function formatCurrencyB(value: number | null): string {
  if (value === null || !Number.isFinite(value)) return 'N/A';
  return value < 0
    ? `-$${Math.abs(value).toFixed(1)}B`
    : `$${value.toFixed(1)}B`;
}

export function formatSignedCurrencyB(value: number | null): string {
  if (value === null || !Number.isFinite(value)) return 'N/A';
  if (value === 0) return '$0.0B';
  return value < 0
    ? `-$${Math.abs(value).toFixed(1)}B`
    : `+$${value.toFixed(1)}B`;
}

export function getOperatingProfit(row: AnnualFinancialRow): number {
  return Number((row.operatingRevenueUsdB - row.operatingExpensesUsdB).toFixed(2));
}

export function getPreTaxIncome(row: AnnualFinancialRow): number {
  const opProfit = getOperatingProfit(row);
  return Number(
    (opProfit + row.nonOperatingNetUsdB - row.financeCostsUsdB).toFixed(2)
  );
}

export function getNetIncome(row: AnnualFinancialRow): number {
  const preTax = getPreTaxIncome(row);
  return Number((preTax - row.incomeTaxExpenseUsdB).toFixed(2));
}

export function getOperatingMarginPct(row: AnnualFinancialRow): number | null {
  if (
    row.operatingRevenueUsdB === null ||
    row.operatingRevenueUsdB === undefined ||
    row.operatingRevenueUsdB <= 0
  ) {
    return null;
  }
  const opProfit = getOperatingProfit(row);
  return (opProfit / row.operatingRevenueUsdB) * 100;
}

/**
 * Debt-to-Equity Ratio (Interest-Bearing Debt Basis)
 * Formula: Total Interest-Bearing Debt / Shareholders' Equity
 * Guarded when debt is missing or equity is missing / non-positive.
 */
export function getDebtToEquityRatio(row: AnnualFinancialRow): number | null {
  const debt = row.totalInterestBearingDebtUsdB;
  const equity = row.shareholdersEquityUsdB;
  if (
    debt === null ||
    debt === undefined ||
    equity === null ||
    equity === undefined ||
    equity <= 0
  ) {
    return null;
  }
  return debt / equity;
}

/**
 * Current Ratio
 * Formula: Current Assets / Current Liabilities
 * Guarded when inputs are missing or Current Liabilities <= 0.
 */
export function getCurrentRatio(row: AnnualFinancialRow): number | null {
  const currentAssets = row.currentAssetsUsdB;
  const currentLiabilities = row.currentLiabilitiesUsdB;
  if (
    currentAssets === null ||
    currentAssets === undefined ||
    currentLiabilities === null ||
    currentLiabilities === undefined ||
    currentLiabilities <= 0
  ) {
    return null;
  }
  return currentAssets / currentLiabilities;
}

/**
 * Free Cash Flow
 * Formula: Operating Cash Flow - Capital Expenditures
 * Guarded when either underlying input is missing.
 */
export function getFreeCashFlow(row: AnnualFinancialRow): number | null {
  const ocf = row.operatingCashFlowUsdB;
  const capex = row.capitalExpendituresUsdB;
  if (ocf === null || ocf === undefined || capex === null || capex === undefined) {
    return null;
  }
  return Number((ocf - capex).toFixed(2));
}
