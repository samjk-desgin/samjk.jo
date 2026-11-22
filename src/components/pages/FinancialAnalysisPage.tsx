import React, { useMemo, useState } from 'react';
import { ArrowLeft, Info, Search } from 'lucide-react';
import { ILLUSTRATIVE_CARRIERS } from '../../data/illustrativeData';
import { AnnualFinancialRow } from '../../types/analytics';
import {
  formatCurrencyB,
  getFreeCashFlow,
  getNetIncome,
  getOperatingProfit,
  getPreTaxIncome,
} from '../../utils/accounting';

interface FinancialAnalysisPageProps {
  onReturnToDashboard: () => void;
  onOpenMethodology: () => void;
}

type CompanyScope = 'carrier-a' | 'carrier-b' | 'compare';
type StatementTab = 'income-statement' | 'balance-sheet' | 'cash-flow';
type AnalysisMode = 'reported' | 'horizontal' | 'vertical';

interface StatementLineDefinition {
  id: string;
  label: string;
  formulaTooltip?: string;
  isTotal?: boolean;
  isMemo?: boolean;
  getValue: (row: AnnualFinancialRow) => number | null;
}

function getCommonSizeBase(
  row: AnnualFinancialRow,
  statement: StatementTab
): number | null {
  if (statement === 'balance-sheet') {
    return row.totalAssetsUsdB > 0 ? row.totalAssetsUsdB : null;
  }
  return row.operatingRevenueUsdB > 0 ? row.operatingRevenueUsdB : null;
}

function formatYoYCell(
  currentVal: number | null,
  priorVal: number | null
): string {
  if (currentVal === null) return 'N/A';
  if (priorVal === null) return 'Baseline';
  if (priorVal === 0) return 'N/A';
  const pct = ((currentVal - priorVal) / Math.abs(priorVal)) * 100;
  const sign = pct > 0 ? '+' : '';
  return `${sign}${pct.toFixed(1)}%`;
}

function formatVerticalCell(
  val: number | null,
  baseVal: number | null
): string {
  if (val === null || baseVal === null || baseVal <= 0) return 'N/A';
  const pct = (val / baseVal) * 100;
  return `${pct.toFixed(1)}%`;
}

const STATEMENT_TABS: { id: StatementTab; label: string }[] = [
  { id: 'income-statement', label: 'Income Statement' },
  { id: 'balance-sheet', label: 'Balance Sheet' },
  { id: 'cash-flow', label: 'Cash Flow Statement' },
];

const ANALYSIS_MODES: { id: AnalysisMode; label: string }[] = [
  { id: 'reported', label: 'Reported Values ($B)' },
  { id: 'horizontal', label: 'Horizontal Analysis (YoY %)' },
  { id: 'vertical', label: 'Vertical Analysis (Common-Size %)' },
];

export const FinancialAnalysisPage: React.FC<FinancialAnalysisPageProps> = ({
  onReturnToDashboard,
  onOpenMethodology,
}) => {
  const [companyScope, setCompanyScope] = useState<CompanyScope>('carrier-a');
  const [statementTab, setStatementTab] = useState<StatementTab>('income-statement');
  const [analysisMode, setAnalysisMode] = useState<AnalysisMode>('reported');
  const [lineFilter, setLineFilter] = useState<string>('');
  const [activeTooltipId, setActiveTooltipId] = useState<string | null>(null);

  const carrierA = ILLUSTRATIVE_CARRIERS[0];
  const carrierB = ILLUSTRATIVE_CARRIERS[1];

  // Exactly five fiscal-year columns: FY 2020, FY 2021, FY 2022, FY 2023, FY 2024
  const fiscalYears = useMemo(
    () => carrierA.annualSeries.map((r) => r.fiscalYear),
    [carrierA]
  );

  const statementLines: StatementLineDefinition[] = useMemo(() => {
    if (statementTab === 'income-statement') {
      return [
        {
          id: 'op-rev',
          label: 'Operating Revenue ($B)',
          isTotal: true,
          getValue: (r) => r.operatingRevenueUsdB,
        },
        {
          id: 'op-exp',
          label: 'Operating Expenses ($B)',
          getValue: (r) => r.operatingExpensesUsdB,
        },
        {
          id: 'op-profit',
          label: 'Operating Profit / Loss (EBIT) ($B)',
          formulaTooltip: 'Operating Revenue − Operating Expenses',
          isTotal: true,
          getValue: (r) => getOperatingProfit(r),
        },
        {
          id: 'non-op',
          label: 'Non-Operating Income / (Expense), Net ($B)',
          getValue: (r) => r.nonOperatingNetUsdB,
        },
        {
          id: 'finance-costs',
          label: 'Finance Costs ($B)',
          getValue: (r) => r.financeCostsUsdB,
        },
        {
          id: 'pre-tax',
          label: 'Pre-Tax Income / Loss (EBT) ($B)',
          formulaTooltip: 'Operating Profit + Non-Operating Net − Finance Costs',
          isTotal: true,
          getValue: (r) => getPreTaxIncome(r),
        },
        {
          id: 'tax',
          label: 'Income Tax Expense / (Benefit) ($B)',
          getValue: (r) => r.incomeTaxExpenseUsdB,
        },
        {
          id: 'net-income',
          label: 'Net Income / Loss ($B)',
          formulaTooltip: 'Pre-Tax Income − Income Tax Expense / (Benefit)',
          isTotal: true,
          getValue: (r) => getNetIncome(r),
        },
      ];
    }

    if (statementTab === 'balance-sheet') {
      return [
        {
          id: 'curr-assets',
          label: 'Current Assets ($B)',
          getValue: (r) => r.currentAssetsUsdB ?? null,
        },
        {
          id: 'non-curr-assets',
          label: 'Non-Current Assets ($B)',
          formulaTooltip: 'Total Assets − Current Assets',
          getValue: (r) =>
            r.currentAssetsUsdB != null
              ? Number((r.totalAssetsUsdB - r.currentAssetsUsdB).toFixed(2))
              : null,
        },
        {
          id: 'total-assets',
          label: 'Total Assets ($B)',
          isTotal: true,
          getValue: (r) => r.totalAssetsUsdB,
        },
        {
          id: 'curr-liab',
          label: 'Current Liabilities ($B)',
          getValue: (r) => r.currentLiabilitiesUsdB ?? null,
        },
        {
          id: 'non-curr-liab',
          label: 'Non-Current Liabilities ($B)',
          formulaTooltip: 'Total Liabilities − Current Liabilities',
          getValue: (r) =>
            r.currentLiabilitiesUsdB != null
              ? Number((r.totalLiabilitiesUsdB - r.currentLiabilitiesUsdB).toFixed(2))
              : null,
        },
        {
          id: 'total-liab',
          label: 'Total Liabilities ($B)',
          isTotal: true,
          getValue: (r) => r.totalLiabilitiesUsdB,
        },
        {
          id: 'interest-debt',
          label: 'Total Interest-Bearing Debt ($B)',
          formulaTooltip: 'Subset of Total Liabilities used as Debt-to-Equity numerator',
          isMemo: true,
          getValue: (r) => r.totalInterestBearingDebtUsdB ?? null,
        },
        {
          id: 'equity',
          label: "Shareholders' Equity ($B)",
          isTotal: true,
          getValue: (r) => r.shareholdersEquityUsdB,
        },
        {
          id: 'liab-equity-check',
          label: "Total Liabilities & Shareholders' Equity ($B)",
          formulaTooltip: "Total Liabilities + Shareholders' Equity (Reconciles to Total Assets)",
          isTotal: true,
          getValue: (r) =>
            Number((r.totalLiabilitiesUsdB + r.shareholdersEquityUsdB).toFixed(2)),
        },
      ];
    }

    return [
      {
        id: 'ocf',
        label: 'Operating Cash Flow ($B)',
        isTotal: true,
        getValue: (r) => r.operatingCashFlowUsdB ?? null,
      },
      {
        id: 'capex',
        label: 'Capital Expenditures ($B)',
        getValue: (r) => r.capitalExpendituresUsdB ?? null,
      },
      {
        id: 'fcf',
        label: 'Free Cash Flow ($B)',
        formulaTooltip: 'Operating Cash Flow − Capital Expenditures',
        isTotal: true,
        getValue: (r) => getFreeCashFlow(r),
      },
      {
        id: 'rev-memo',
        label: 'Memo: Operating Revenue ($B)',
        formulaTooltip: 'Common-Size % denominator for Cash Flow Statement',
        isMemo: true,
        getValue: (r) => r.operatingRevenueUsdB,
      },
    ];
  }, [statementTab]);

  const filteredLines = useMemo(() => {
    if (!lineFilter.trim()) return statementLines;
    const q = lineFilter.toLowerCase();
    return statementLines.filter((line) => line.label.toLowerCase().includes(q));
  }, [statementLines, lineFilter]);

  const formatCellValue = (
    series: AnnualFinancialRow[],
    yearIndex: number,
    line: StatementLineDefinition
  ): string => {
    const row = series[yearIndex];
    const value = line.getValue(row);

    if (analysisMode === 'reported') {
      return formatCurrencyB(value);
    }

    if (analysisMode === 'horizontal') {
      const priorValue = yearIndex > 0 ? line.getValue(series[yearIndex - 1]) : null;
      return formatYoYCell(value, priorValue);
    }

    const baseVal = getCommonSizeBase(row, statementTab);
    return formatVerticalCell(value, baseVal);
  };

  const analysisModeDescription = useMemo(() => {
    if (analysisMode === 'reported') {
      return 'Displaying reported illustrative dollar figures in USD Billions ($B).';
    }
    if (analysisMode === 'horizontal') {
      return 'Horizontal trend analysis: YoY % = (Current Year − Prior Year) ÷ |Prior Year| × 100.';
    }
    if (statementTab === 'balance-sheet') {
      return 'Vertical common-size analysis: each Balance Sheet line expressed as % of Total Assets.';
    }
    return 'Vertical common-size analysis: each line expressed as % of Operating Revenue.';
  }, [analysisMode, statementTab]);

  const activeStatementTitle =
    STATEMENT_TABS.find((t) => t.id === statementTab)?.label ?? 'Income Statement';

  const activeCarrierLabel =
    companyScope === 'compare'
      ? 'Carrier A vs. Carrier B (Side-by-Side)'
      : companyScope === 'carrier-b'
      ? carrierB.name
      : carrierA.name;

  const renderLineLabelCell = (line: StatementLineDefinition) => {
    const isTooltipOpen = activeTooltipId === line.id;
    return (
      <div className="relative flex items-center gap-1.5">
        <span
          className={`whitespace-nowrap ${
            line.isTotal
              ? 'font-semibold text-[#0B192C]'
              : line.isMemo
              ? 'text-slate-500'
              : 'font-medium text-slate-800'
          }`}
        >
          {line.label}
        </span>
        {line.formulaTooltip && (
          <button
            type="button"
            title={line.formulaTooltip}
            aria-label={`Formula for ${line.label}: ${line.formulaTooltip}`}
            onMouseEnter={() => setActiveTooltipId(line.id)}
            onMouseLeave={() => setActiveTooltipId(null)}
            onFocus={() => setActiveTooltipId(line.id)}
            onBlur={() => setActiveTooltipId(null)}
            onClick={() =>
              setActiveTooltipId((prev) => (prev === line.id ? null : line.id))
            }
            className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded text-slate-400 hover:text-[#0B192C] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0B192C]"
          >
            <Info className="h-3.5 w-3.5" />
          </button>
        )}
        {line.formulaTooltip && isTooltipOpen && (
          <div
            role="tooltip"
            className="absolute left-0 top-full z-20 mt-1.5 w-max max-w-xs rounded-md bg-[#0B192C] px-2.5 py-1.5 font-mono text-[11px] font-normal text-white shadow-lg"
          >
            Formula: {line.formulaTooltip}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header & Return Link */}
      <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <button
            type="button"
            onClick={onReturnToDashboard}
            className="mb-3 inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-[#0B192C] transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Dashboard</span>
          </button>
          <h1 className="font-display text-2xl font-bold tracking-tight text-[#0B192C] sm:text-3xl">
            Three-Statement Financial Analysis
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Examine Income Statement, Balance Sheet, and Cash Flow figures across reported,
            horizontal, and common-size views.
          </p>
        </div>

        <div className="text-xs text-slate-500 flex flex-wrap items-center gap-2">
          <span>5-Year Analytical Horizon</span>
          <span aria-hidden="true">·</span>
          <span className="font-mono">FY 2020 – FY 2024</span>
          <span aria-hidden="true">·</span>
          <span>Illustrative Sample Data</span>
        </div>
      </section>

      {/* Illustrative Sample Data Disclaimer */}
      <section
        aria-label="Illustrative Data Disclaimer"
        className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="flex items-start gap-3">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-[#1E3A5F]" />
          <div className="text-xs leading-relaxed text-slate-600">
            <span className="font-semibold text-[#0B192C]">
              Illustrative Sample Data Notice:
            </span>{' '}
            All figures in this Financial Analysis workspace are derived from the Stage 1
            illustrative carrier datasets. Verified Form 10-K / IFRS annual report lines will
            replace these placeholders in Stage 2+.
          </div>
        </div>
        <button
          type="button"
          onClick={onOpenMethodology}
          className="shrink-0 self-start rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-[#0B192C] hover:bg-slate-100 transition-colors sm:self-center whitespace-nowrap"
        >
          View Data Policy
        </button>
      </section>

      {/* Interactive Workspace Controls */}
      <section
        aria-label="Financial Analysis Controls"
        className="space-y-4 rounded-xl border border-slate-200 bg-white p-5"
      >
        {/* Row 1: Company Selector + Fiscal Year Range */}
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-1 text-xs font-medium text-slate-500">Company:</span>
            <div className="inline-flex flex-wrap items-center gap-1 rounded-lg bg-slate-100 p-1">
              <button
                type="button"
                onClick={() => setCompanyScope('carrier-a')}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
                  companyScope === 'carrier-a'
                    ? 'bg-white text-[#0B192C] shadow-sm'
                    : 'text-slate-600 hover:text-[#0B192C]'
                }`}
              >
                Carrier A
              </button>
              <button
                type="button"
                onClick={() => setCompanyScope('carrier-b')}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
                  companyScope === 'carrier-b'
                    ? 'bg-white text-[#0B192C] shadow-sm'
                    : 'text-slate-600 hover:text-[#0B192C]'
                }`}
              >
                Carrier B
              </button>
              <button
                type="button"
                onClick={() => setCompanyScope('compare')}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
                  companyScope === 'compare'
                    ? 'bg-white text-[#0B192C] shadow-sm'
                    : 'text-slate-600 hover:text-[#0B192C]'
                }`}
              >
                Compare A vs B
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
            <span className="font-medium text-slate-500">Fiscal Year Range:</span>
            <span className="font-mono font-semibold text-[#0B192C]">
              FY2020 – FY2024
            </span>
            <span className="text-slate-300" aria-hidden="true">
              ·
            </span>
            <span className="text-slate-500">5 Annual Periods</span>
          </div>
        </div>

        {/* Row 2: Statement Tabs + Analysis Mode Selector */}
        <div className="flex flex-col gap-4 border-t border-slate-100 pt-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-1 text-xs font-medium text-slate-500">Statement:</span>
            <div
              role="tablist"
              aria-label="Financial Statements"
              className="inline-flex flex-wrap items-center gap-1 rounded-lg bg-slate-100 p-1"
            >
              {STATEMENT_TABS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={statementTab === tab.id}
                  onClick={() => {
                    setStatementTab(tab.id);
                    setActiveTooltipId(null);
                  }}
                  className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
                    statementTab === tab.id
                      ? 'bg-[#0B192C] text-white'
                      : 'text-slate-600 hover:text-[#0B192C]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-1 text-xs font-medium text-slate-500">Analysis Mode:</span>
            <div className="inline-flex flex-wrap items-center gap-1 rounded-lg bg-slate-100 p-1">
              {ANALYSIS_MODES.map((mode) => (
                <button
                  key={mode.id}
                  type="button"
                  onClick={() => setAnalysisMode(mode.id)}
                  className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
                    analysisMode === mode.id
                      ? 'bg-white text-[#0B192C] shadow-sm'
                      : 'text-slate-600 hover:text-[#0B192C]'
                  }`}
                >
                  {mode.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Financial Statement Table */}
      <section className="rounded-xl border border-slate-200 bg-white">
        <div className="flex flex-col gap-3 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-display text-base font-semibold text-[#0B192C]">
              {activeStatementTitle} · {activeCarrierLabel}
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">{analysisModeDescription}</p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={lineFilter}
              onChange={(e) => setLineFilter(e.target.value)}
              placeholder="Filter statement line items..."
              aria-label="Filter statement line items"
              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-8 pr-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-[#0B192C] focus:bg-white focus:outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          {companyScope === 'compare' ? (
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 bg-slate-50 text-slate-600">
                <tr>
                  <th
                    rowSpan={2}
                    className="px-5 py-3 font-semibold align-bottom border-r border-slate-200"
                  >
                    Line Item
                  </th>
                  {fiscalYears.map((yr) => (
                    <th
                      key={yr}
                      colSpan={2}
                      className="px-3 py-2 text-center font-mono font-semibold whitespace-nowrap border-b border-slate-200 border-r last:border-r-0"
                    >
                      {yr}
                    </th>
                  ))}
                </tr>
                <tr>
                  {fiscalYears.map((yr) => (
                    <React.Fragment key={`${yr}-sub`}>
                      <th className="px-2.5 py-2 text-right font-mono text-[11px] font-semibold text-[#0B192C] whitespace-nowrap">
                        A
                      </th>
                      <th className="px-2.5 py-2 text-right font-mono text-[11px] font-semibold text-[#0284C7] whitespace-nowrap border-r border-slate-200 last:border-r-0">
                        B
                      </th>
                    </React.Fragment>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLines.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="px-5 py-8 text-center text-slate-500">
                      No line items match &quot;{lineFilter}&quot;.
                    </td>
                  </tr>
                ) : (
                  filteredLines.map((line) => (
                    <tr
                      key={line.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        line.isTotal ? 'bg-slate-50/60' : ''
                      }`}
                    >
                      <td className="px-5 py-3 align-middle border-r border-slate-100">
                        {renderLineLabelCell(line)}
                      </td>
                      {fiscalYears.map((yr, idx) => (
                        <React.Fragment key={`${line.id}-${yr}`}>
                          <td
                            className={`px-2.5 py-3 text-right font-mono tabular-nums whitespace-nowrap align-middle text-[#0B192C] ${
                              line.isTotal ? 'font-semibold' : ''
                            }`}
                          >
                            {formatCellValue(carrierA.annualSeries, idx, line)}
                          </td>
                          <td
                            className={`px-2.5 py-3 text-right font-mono tabular-nums whitespace-nowrap align-middle text-[#0284C7] border-r border-slate-100 last:border-r-0 ${
                              line.isTotal ? 'font-semibold' : ''
                            }`}
                          >
                            {formatCellValue(carrierB.annualSeries, idx, line)}
                          </td>
                        </React.Fragment>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-5 py-3 font-semibold">Line Item</th>
                  {fiscalYears.map((yr) => (
                    <th
                      key={yr}
                      className="px-4 py-3 text-right font-mono font-semibold whitespace-nowrap"
                    >
                      {yr}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLines.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-8 text-center text-slate-500">
                      No line items match &quot;{lineFilter}&quot;.
                    </td>
                  </tr>
                ) : (
                  filteredLines.map((line) => {
                    const targetSeries =
                      companyScope === 'carrier-b'
                        ? carrierB.annualSeries
                        : carrierA.annualSeries;
                    return (
                      <tr
                        key={line.id}
                        className={`hover:bg-slate-50/80 transition-colors ${
                          line.isTotal ? 'bg-slate-50/60' : ''
                        }`}
                      >
                        <td className="px-5 py-3 align-middle">
                          {renderLineLabelCell(line)}
                        </td>
                        {fiscalYears.map((yr, idx) => (
                          <td
                            key={`${line.id}-${yr}`}
                            className={`px-4 py-3 text-right font-mono tabular-nums whitespace-nowrap align-middle ${
                              line.isTotal
                                ? 'font-semibold text-[#0B192C]'
                                : 'text-slate-600'
                            }`}
                          >
                            {formatCellValue(targetSeries, idx, line)}
                          </td>
                        ))}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          )}
        </div>

        <div className="flex flex-col gap-1 border-t border-slate-100 bg-slate-50/60 px-5 py-3 text-[11px] text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <span>
            Illustrative Sample Data · Hover or select the info icon beside any derived row
            to view its formula
          </span>
          {statementTab === 'cash-flow' && (
            <span>
              Stage 1 dataset covers Operating Cash Flow, Capital Expenditures, and Free Cash
              Flow
            </span>
          )}
        </div>
      </section>
    </div>
  );
};
