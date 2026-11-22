import {
  AnnualFinancialRow,
  RatioCategory,
  RatioDefinitionMeta,
  RatioEvaluation,
  RatioId,
  RatioUnit,
} from '../types/analytics';

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

/**
 * Average Balance Calculation
 * Formula: (Beginning Balance + Ending Balance) / 2
 * Returns null if no prior fiscal period is available; never substitutes ending balance.
 */
export function computeAverageBalance(
  beginningBalance: number | null | undefined,
  endingBalance: number | null | undefined
): number | null {
  if (
    beginningBalance === null ||
    beginningBalance === undefined ||
    endingBalance === null ||
    endingBalance === undefined ||
    !Number.isFinite(beginningBalance) ||
    !Number.isFinite(endingBalance)
  ) {
    return null;
  }
  return (beginningBalance + endingBalance) / 2;
}

export function formatRatioValue(value: number | null, unit: RatioUnit): string {
  if (value === null || !Number.isFinite(value)) return 'N/A';
  if (unit === '%') return `${value.toFixed(1)}%`;
  if (unit === 'times') return `${value.toFixed(2)} times`;
  return `${value.toFixed(2)}x`;
}

export const RATIO_CATEGORY_LABELS: { id: RatioCategory; label: string }[] = [
  { id: 'profitability', label: 'Profitability' },
  { id: 'liquidity', label: 'Liquidity' },
  { id: 'leverage', label: 'Leverage & Solvency' },
  { id: 'cash-flow', label: 'Cash Flow Efficiency' },
];

export const RATIO_CATALOG: RatioDefinitionMeta[] = [
  {
    id: 'operating-margin',
    category: 'profitability',
    name: 'Operating Margin',
    formula: 'Operating Profit ÷ Operating Revenue × 100',
    unit: '%',
    sourceStatement: 'Income Statement',
  },
  {
    id: 'net-profit-margin',
    category: 'profitability',
    name: 'Net Profit Margin',
    formula: 'Net Income ÷ Operating Revenue × 100',
    unit: '%',
    sourceStatement: 'Income Statement',
  },
  {
    id: 'roa',
    category: 'profitability',
    name: 'Return on Assets (ROA)',
    formula: 'Net Income ÷ Average Total Assets × 100',
    unit: '%',
    sourceStatement: 'Income Statement & Balance Sheet',
    usesAverageBalance: true,
  },
  {
    id: 'roe',
    category: 'profitability',
    name: 'Return on Equity (ROE)',
    formula: "Net Income ÷ Average Shareholders' Equity × 100",
    unit: '%',
    sourceStatement: 'Income Statement & Balance Sheet',
    usesAverageBalance: true,
  },
  {
    id: 'asset-turnover',
    category: 'profitability',
    name: 'Asset Turnover',
    formula: 'Operating Revenue ÷ Average Total Assets',
    unit: 'x',
    sourceStatement: 'Income Statement & Balance Sheet',
    usesAverageBalance: true,
  },
  {
    id: 'current-ratio',
    category: 'liquidity',
    name: 'Current Ratio',
    formula: 'Current Assets ÷ Current Liabilities',
    unit: 'x',
    sourceStatement: 'Balance Sheet',
  },
  {
    id: 'quick-ratio',
    category: 'liquidity',
    name: 'Quick Ratio',
    formula: '(Current Assets − Inventory) ÷ Current Liabilities',
    unit: 'x',
    sourceStatement: 'Balance Sheet',
  },
  {
    id: 'debt-to-equity',
    category: 'leverage',
    name: 'Debt-to-Equity Ratio',
    formula: "Total Interest-Bearing Debt ÷ Shareholders' Equity",
    unit: 'x',
    sourceStatement: 'Balance Sheet',
  },
  {
    id: 'debt-to-assets',
    category: 'leverage',
    name: 'Debt-to-Assets Ratio',
    formula: 'Total Interest-Bearing Debt ÷ Total Assets',
    unit: 'x',
    sourceStatement: 'Balance Sheet',
  },
  {
    id: 'interest-coverage',
    category: 'leverage',
    name: 'Interest Coverage Ratio',
    formula: 'Operating Profit ÷ Finance Costs',
    unit: 'times',
    sourceStatement: 'Income Statement',
  },
  {
    id: 'net-debt-to-ebitda',
    category: 'leverage',
    name: 'Net Debt / EBITDA',
    formula: '(Total Interest-Bearing Debt − Cash & Equivalents) ÷ EBITDA',
    unit: 'x',
    sourceStatement: 'Balance Sheet & Cash Flow / D&A Notes',
  },
  {
    id: 'fcf-margin',
    category: 'cash-flow',
    name: 'Free Cash Flow Margin',
    formula: 'Free Cash Flow ÷ Operating Revenue × 100',
    unit: '%',
    sourceStatement: 'Cash Flow Statement & Income Statement',
  },
];

function safeDivide(
  numerator: number,
  denominator: number,
  multiplier = 1
): number | null {
  if (!Number.isFinite(numerator) || !Number.isFinite(denominator) || denominator <= 0) {
    return null;
  }
  const result = (numerator / denominator) * multiplier;
  return Number.isFinite(result) ? result : null;
}

export function evaluateRatio(
  ratioId: RatioId,
  series: AnnualFinancialRow[],
  yearIndex: number
): RatioEvaluation {
  const meta = RATIO_CATALOG.find((item) => item.id === ratioId)!;
  const row = series[yearIndex];
  const prevRow = yearIndex > 0 ? series[yearIndex - 1] : null;
  const fy = row.fiscalYear;

  switch (ratioId) {
    case 'operating-margin': {
      const opProfit = getOperatingProfit(row);
      const rev = row.operatingRevenueUsdB;
      const val = safeDivide(opProfit, rev, 100);
      return {
        ...meta,
        fiscalYear: fy,
        value: val,
        formattedValue: formatRatioValue(val, meta.unit),
        status: val !== null ? 'valid' : 'invalid-denominator',
        statusReason:
          val === null ? 'Mathematically invalid: Operating Revenue must be positive.' : undefined,
        numeratorLabel: 'Operating Profit (EBIT)',
        numeratorValueText: formatCurrencyB(opProfit),
        denominatorLabel: 'Operating Revenue',
        denominatorValueText: formatCurrencyB(rev),
        interpretation:
          val === null
            ? 'Operating Margin cannot be evaluated when Operating Revenue is zero or negative.'
            : val >= 8
            ? 'Indicates solid core airline unit profitability after fuel, labor, and fleet operating costs.'
            : val >= 0
            ? 'Positive operating margin, though relatively thin relative to fuel price and demand cyclicality.'
            : 'Negative operating margin indicates core flight revenues did not cover operating expenses in this period.',
      };
    }

    case 'net-profit-margin': {
      const netInc = getNetIncome(row);
      const rev = row.operatingRevenueUsdB;
      const val = safeDivide(netInc, rev, 100);
      return {
        ...meta,
        fiscalYear: fy,
        value: val,
        formattedValue: formatRatioValue(val, meta.unit),
        status: val !== null ? 'valid' : 'invalid-denominator',
        statusReason:
          val === null ? 'Mathematically invalid: Operating Revenue must be positive.' : undefined,
        numeratorLabel: 'Net Income / Loss',
        numeratorValueText: formatCurrencyB(netInc),
        denominatorLabel: 'Operating Revenue',
        denominatorValueText: formatCurrencyB(rev),
        interpretation:
          val === null
            ? 'Net Profit Margin requires positive Operating Revenue.'
            : val >= 0
            ? 'Measures bottom-line revenue conversion after non-operating items, finance costs, and income taxes.'
            : 'Net loss margin reflects operating deficits compounded by fixed aircraft financing obligations.',
      };
    }

    case 'roa': {
      const netInc = getNetIncome(row);
      if (!prevRow) {
        return {
          ...meta,
          fiscalYear: fy,
          value: null,
          formattedValue: 'N/A',
          status: 'unavailable',
          statusReason:
            'Unavailable: FY 2019 opening Total Assets are not in the dataset to compute Average Total Assets = (Beginning + Ending) ÷ 2.',
          numeratorLabel: 'Net Income / Loss',
          numeratorValueText: formatCurrencyB(netInc),
          denominatorLabel: 'Average Total Assets',
          denominatorValueText: 'N/A (FY 2019 opening balance unavailable)',
          interpretation:
            'ROA evaluates how efficiently capital-intensive aircraft and airport assets generate net earnings. Displayed as N/A for FY 2020 rather than substituting ending assets.',
        };
      }
      const avgAssets = computeAverageBalance(prevRow.totalAssetsUsdB, row.totalAssetsUsdB);
      const val = avgAssets !== null ? safeDivide(netInc, avgAssets, 100) : null;
      return {
        ...meta,
        fiscalYear: fy,
        value: val,
        formattedValue: formatRatioValue(val, meta.unit),
        status:
          avgAssets === null
            ? 'unavailable'
            : val === null
            ? 'invalid-denominator'
            : 'valid',
        statusReason:
          avgAssets !== null && val === null
            ? 'Mathematically invalid: Average Total Assets must be positive.'
            : undefined,
        numeratorLabel: 'Net Income / Loss',
        numeratorValueText: formatCurrencyB(netInc),
        denominatorLabel: 'Average Total Assets',
        denominatorValueText:
          avgAssets !== null
            ? `(${formatCurrencyB(prevRow.totalAssetsUsdB)} + ${formatCurrencyB(
                row.totalAssetsUsdB
              )}) ÷ 2 = ${formatCurrencyB(avgAssets)}`
            : 'N/A',
        interpretation:
          'Airlines operate heavy balance sheets due to owned and leased aircraft; positive ROA signals productive fleet deployment.',
      };
    }

    case 'roe': {
      const netInc = getNetIncome(row);
      if (!prevRow) {
        return {
          ...meta,
          fiscalYear: fy,
          value: null,
          formattedValue: 'N/A',
          status: 'unavailable',
          statusReason:
            "Unavailable: FY 2019 opening Shareholders' Equity is not in the dataset to compute Average Shareholders' Equity = (Beginning + Ending) ÷ 2.",
          numeratorLabel: 'Net Income / Loss',
          numeratorValueText: formatCurrencyB(netInc),
          denominatorLabel: "Average Shareholders' Equity",
          denominatorValueText: 'N/A (FY 2019 opening balance unavailable)',
          interpretation:
            "ROE measures return generated on shareholders' capital. Displayed as N/A for FY 2020 because FY 2019 opening equity is unavailable.",
        };
      }
      const avgEquity = computeAverageBalance(
        prevRow.shareholdersEquityUsdB,
        row.shareholdersEquityUsdB
      );
      const val = avgEquity !== null ? safeDivide(netInc, avgEquity, 100) : null;
      return {
        ...meta,
        fiscalYear: fy,
        value: val,
        formattedValue: formatRatioValue(val, meta.unit),
        status:
          avgEquity === null
            ? 'unavailable'
            : val === null
            ? 'invalid-denominator'
            : 'valid',
        statusReason:
          avgEquity !== null && val === null
            ? "Mathematically invalid: Average Shareholders' Equity is zero or negative."
            : undefined,
        numeratorLabel: 'Net Income / Loss',
        numeratorValueText: formatCurrencyB(netInc),
        denominatorLabel: "Average Shareholders' Equity",
        denominatorValueText:
          avgEquity !== null
            ? `(${formatCurrencyB(prevRow.shareholdersEquityUsdB)} + ${formatCurrencyB(
                row.shareholdersEquityUsdB
              )}) ÷ 2 = ${formatCurrencyB(avgEquity)}`
            : 'N/A',
        interpretation:
          'High airline ROE can reflect strong earnings or thin post-crisis equity bases; always interpret alongside Debt-to-Equity.',
      };
    }

    case 'asset-turnover': {
      const rev = row.operatingRevenueUsdB;
      if (!prevRow) {
        return {
          ...meta,
          fiscalYear: fy,
          value: null,
          formattedValue: 'N/A',
          status: 'unavailable',
          statusReason:
            'Unavailable: FY 2019 opening Total Assets are not in the dataset to compute Average Total Assets = (Beginning + Ending) ÷ 2.',
          numeratorLabel: 'Operating Revenue',
          numeratorValueText: formatCurrencyB(rev),
          denominatorLabel: 'Average Total Assets',
          denominatorValueText: 'N/A (FY 2019 opening balance unavailable)',
          interpretation:
            'Asset Turnover measures revenue generated per dollar of total assets. Displayed as N/A for FY 2020 because FY 2019 opening assets are unavailable.',
        };
      }
      const avgAssets = computeAverageBalance(prevRow.totalAssetsUsdB, row.totalAssetsUsdB);
      const val = avgAssets !== null ? safeDivide(rev, avgAssets, 1) : null;
      return {
        ...meta,
        fiscalYear: fy,
        value: val,
        formattedValue: formatRatioValue(val, meta.unit),
        status:
          avgAssets === null
            ? 'unavailable'
            : val === null
            ? 'invalid-denominator'
            : 'valid',
        statusReason:
          avgAssets !== null && val === null
            ? 'Mathematically invalid: Average Total Assets must be positive.'
            : undefined,
        numeratorLabel: 'Operating Revenue',
        numeratorValueText: formatCurrencyB(rev),
        denominatorLabel: 'Average Total Assets',
        denominatorValueText:
          avgAssets !== null
            ? `(${formatCurrencyB(prevRow.totalAssetsUsdB)} + ${formatCurrencyB(
                row.totalAssetsUsdB
              )}) ÷ 2 = ${formatCurrencyB(avgAssets)}`
            : 'N/A',
        interpretation:
          'Tracks fleet and asset utilization—higher asset turnover indicates greater revenue yield from the aircraft asset base.',
      };
    }

    case 'current-ratio': {
      const ca = row.currentAssetsUsdB ?? null;
      const cl = row.currentLiabilitiesUsdB ?? null;
      if (ca === null || cl === null) {
        return {
          ...meta,
          fiscalYear: fy,
          value: null,
          formattedValue: 'N/A',
          status: 'unavailable',
          statusReason:
            'Unavailable: Current Assets or Current Liabilities input is missing.',
          numeratorLabel: 'Current Assets',
          numeratorValueText: formatCurrencyB(ca),
          denominatorLabel: 'Current Liabilities',
          denominatorValueText: formatCurrencyB(cl),
          interpretation:
            'Measures short-term liquidity coverage against obligations due within 12 months.',
        };
      }
      const val = safeDivide(ca, cl, 1);
      return {
        ...meta,
        fiscalYear: fy,
        value: val,
        formattedValue: formatRatioValue(val, meta.unit),
        status: val !== null ? 'valid' : 'invalid-denominator',
        statusReason:
          val === null
            ? 'Mathematically invalid: Current Liabilities must be positive.'
            : undefined,
        numeratorLabel: 'Current Assets',
        numeratorValueText: formatCurrencyB(ca),
        denominatorLabel: 'Current Liabilities',
        denominatorValueText: formatCurrencyB(cl),
        interpretation:
          'Airlines often operate with Current Ratios near or below 1.0x because advance ticket sales (Air Traffic Liability) sit in Current Liabilities.',
      };
    }

    case 'quick-ratio': {
      const ca = row.currentAssetsUsdB ?? null;
      const cl = row.currentLiabilitiesUsdB ?? null;
      const inv = row.inventoryUsdB ?? null;
      if (ca === null || cl === null || inv === null) {
        return {
          ...meta,
          fiscalYear: fy,
          value: null,
          formattedValue: 'N/A',
          status: 'unavailable',
          statusReason:
            'Unavailable: Inventory data is not included in the Stage 1 illustrative dataset. Quick Ratio requires Current Assets, Inventory, and Current Liabilities.',
          numeratorLabel: 'Current Assets − Inventory',
          numeratorValueText:
            inv === null
              ? `${formatCurrencyB(ca)} − Missing Inventory`
              : formatCurrencyB(ca !== null ? ca - inv : null),
          denominatorLabel: 'Current Liabilities',
          denominatorValueText: formatCurrencyB(cl),
          interpretation:
            'Quick Ratio tests immediate liquidity excluding less-liquid inventories (such as spare parts). Displayed as N/A until Inventory figures are ingested from official reports.',
        };
      }
      const quickAssets = ca - inv;
      const val = safeDivide(quickAssets, cl, 1);
      return {
        ...meta,
        fiscalYear: fy,
        value: val,
        formattedValue: formatRatioValue(val, meta.unit),
        status: val !== null ? 'valid' : 'invalid-denominator',
        statusReason:
          val === null
            ? 'Mathematically invalid: Current Liabilities must be positive.'
            : undefined,
        numeratorLabel: 'Current Assets − Inventory',
        numeratorValueText: formatCurrencyB(quickAssets),
        denominatorLabel: 'Current Liabilities',
        denominatorValueText: formatCurrencyB(cl),
        interpretation:
          'Evaluates strict near-term solvency excluding inventory.',
      };
    }

    case 'debt-to-equity': {
      const debt = row.totalInterestBearingDebtUsdB ?? null;
      const equity = row.shareholdersEquityUsdB;
      if (debt === null) {
        return {
          ...meta,
          fiscalYear: fy,
          value: null,
          formattedValue: 'N/A',
          status: 'unavailable',
          statusReason:
            'Unavailable: Total Interest-Bearing Debt input is missing.',
          numeratorLabel: 'Total Interest-Bearing Debt',
          numeratorValueText: 'N/A',
          denominatorLabel: "Shareholders' Equity",
          denominatorValueText: formatCurrencyB(equity),
          interpretation:
            'Measures financial leverage using interest-bearing debt and lease obligations relative to equity.',
        };
      }
      const val = safeDivide(debt, equity, 1);
      return {
        ...meta,
        fiscalYear: fy,
        value: val,
        formattedValue: formatRatioValue(val, meta.unit),
        status: val !== null ? 'valid' : 'invalid-denominator',
        statusReason:
          val === null
            ? "Mathematically invalid: Shareholders' Equity is zero or negative."
            : undefined,
        numeratorLabel: 'Total Interest-Bearing Debt',
        numeratorValueText: formatCurrencyB(debt),
        denominatorLabel: "Shareholders' Equity",
        denominatorValueText: formatCurrencyB(equity),
        interpretation:
          'High Debt-to-Equity reflects heavy aircraft financing and capitalized lease liabilities (ASC 842 / IFRS 16); declining trends show balance-sheet deleveraging.',
      };
    }

    case 'debt-to-assets': {
      const debt = row.totalInterestBearingDebtUsdB ?? null;
      const assets = row.totalAssetsUsdB;
      if (debt === null) {
        return {
          ...meta,
          fiscalYear: fy,
          value: null,
          formattedValue: 'N/A',
          status: 'unavailable',
          statusReason:
            'Unavailable: Total Interest-Bearing Debt input is missing.',
          numeratorLabel: 'Total Interest-Bearing Debt',
          numeratorValueText: 'N/A',
          denominatorLabel: 'Total Assets',
          denominatorValueText: formatCurrencyB(assets),
          interpretation:
            'Shows the proportion of the airline asset base financed through interest-bearing debt and lease obligations.',
        };
      }
      const val = safeDivide(debt, assets, 1);
      return {
        ...meta,
        fiscalYear: fy,
        value: val,
        formattedValue: formatRatioValue(val, meta.unit),
        status: val !== null ? 'valid' : 'invalid-denominator',
        statusReason:
          val === null ? 'Mathematically invalid: Total Assets must be positive.' : undefined,
        numeratorLabel: 'Total Interest-Bearing Debt',
        numeratorValueText: formatCurrencyB(debt),
        denominatorLabel: 'Total Assets',
        denominatorValueText: formatCurrencyB(assets),
        interpretation:
          'Indicates capital structure reliance on debt financing across the fleet and airport asset base.',
      };
    }

    case 'interest-coverage': {
      const opProfit = getOperatingProfit(row);
      const financeCosts = row.financeCostsUsdB;
      const val = safeDivide(opProfit, financeCosts, 1);
      return {
        ...meta,
        fiscalYear: fy,
        value: val,
        formattedValue: formatRatioValue(val, meta.unit),
        status: val !== null ? 'valid' : 'invalid-denominator',
        statusReason:
          val === null
            ? 'Mathematically invalid: Finance Costs must be positive to compute coverage.'
            : undefined,
        numeratorLabel: 'Operating Profit (EBIT)',
        numeratorValueText: formatCurrencyB(opProfit),
        denominatorLabel: 'Finance Costs',
        denominatorValueText: formatCurrencyB(financeCosts),
        interpretation:
          val === null
            ? 'Interest Coverage requires positive Finance Costs.'
            : val < 0
            ? 'Negative coverage indicates operating losses did not cover interest obligations during the period.'
            : val < 1.5
            ? 'Tight interest coverage leaves limited margin of safety if ticket demand softens.'
            : 'Operating earnings comfortably cover annual debt and lease finance charges.',
      };
    }

    case 'net-debt-to-ebitda': {
      const debt = row.totalInterestBearingDebtUsdB ?? null;
      const cash = row.cashAndEquivalentsUsdB ?? null;
      const ebitda = row.ebitdaUsdB ?? null;
      if (debt === null || cash === null || ebitda === null) {
        return {
          ...meta,
          fiscalYear: fy,
          value: null,
          formattedValue: 'N/A',
          status: 'unavailable',
          statusReason:
            'Unavailable: Cash & Cash Equivalents and EBITDA (requiring Depreciation & Amortization disclosures) are not included in the Stage 1 illustrative dataset.',
          numeratorLabel: 'Net Debt (Debt − Cash)',
          numeratorValueText:
            debt !== null
              ? `${formatCurrencyB(debt)} − Missing Cash`
              : 'Missing Debt & Cash',
          denominatorLabel: 'EBITDA',
          denominatorValueText: 'Missing EBITDA (D&A not separated)',
          interpretation:
            'Net Debt / EBITDA measures years of operating cash earnings needed to retire net debt. Displayed as N/A until Cash and D&A inputs are added from official reports.',
        };
      }
      const netDebt = debt - cash;
      const val = safeDivide(netDebt, ebitda, 1);
      return {
        ...meta,
        fiscalYear: fy,
        value: val,
        formattedValue: formatRatioValue(val, meta.unit),
        status: val !== null ? 'valid' : 'invalid-denominator',
        statusReason:
          val === null ? 'Mathematically invalid: EBITDA must be positive.' : undefined,
        numeratorLabel: 'Net Debt (Debt − Cash)',
        numeratorValueText: formatCurrencyB(netDebt),
        denominatorLabel: 'EBITDA',
        denominatorValueText: formatCurrencyB(ebitda),
        interpretation:
          'Key airline credit metric measuring net leverage relative to pre-depreciation operating earnings.',
      };
    }

    case 'fcf-margin': {
      const fcf = getFreeCashFlow(row);
      const rev = row.operatingRevenueUsdB;
      if (fcf === null) {
        return {
          ...meta,
          fiscalYear: fy,
          value: null,
          formattedValue: 'N/A',
          status: 'unavailable',
          statusReason:
            'Unavailable: Operating Cash Flow or Capital Expenditures input is missing.',
          numeratorLabel: 'Free Cash Flow (OCF − CapEx)',
          numeratorValueText: 'N/A',
          denominatorLabel: 'Operating Revenue',
          denominatorValueText: formatCurrencyB(rev),
          interpretation:
            'Measures the percentage of operating revenue converted into Free Cash Flow after aircraft and facility CapEx.',
        };
      }
      const val = safeDivide(fcf, rev, 100);
      return {
        ...meta,
        fiscalYear: fy,
        value: val,
        formattedValue: formatRatioValue(val, meta.unit),
        status: val !== null ? 'valid' : 'invalid-denominator',
        statusReason:
          val === null ? 'Mathematically invalid: Operating Revenue must be positive.' : undefined,
        numeratorLabel: 'Free Cash Flow (OCF − CapEx)',
        numeratorValueText: formatCurrencyB(fcf),
        denominatorLabel: 'Operating Revenue',
        denominatorValueText: formatCurrencyB(rev),
        interpretation:
          val !== null && val < 0
            ? 'Negative FCF Margin reflects cash burn or heavy fleet capital expenditure exceeding operating cash inflows.'
            : 'Positive FCF Margin indicates self-funding capacity for fleet renewal, debt reduction, or shareholder returns.',
      };
    }
  }
}

export function evaluateCategoryRatios(
  category: RatioCategory,
  series: AnnualFinancialRow[],
  yearIndex: number
): RatioEvaluation[] {
  return RATIO_CATALOG.filter((item) => item.category === category).map((item) =>
    evaluateRatio(item.id, series, yearIndex)
  );
}
