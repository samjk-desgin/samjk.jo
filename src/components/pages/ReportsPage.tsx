import React, { useMemo, useState } from 'react';
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  ChartOptions,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import {
  ArrowLeft,
  Download,
  FileText,
  Info,
  Printer,
} from 'lucide-react';
import { ILLUSTRATIVE_CARRIERS } from '../../data/illustrativeData';
import { AnnualFinancialRow, RatioEvaluation } from '../../types/analytics';
import {
  evaluateRatio,
  formatCurrencyB,
  formatRatioValue,
  formatSignedCurrencyB,
  getFreeCashFlow,
  getNetIncome,
  getOperatingMarginPct,
  getOperatingProfit,
  getPreTaxIncome,
  RATIO_CATALOG,
  RATIO_CATEGORY_LABELS,
} from '../../utils/accounting';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface ReportsPageProps {
  onReturnToDashboard: () => void;
  onOpenMethodology: () => void;
}

type ReportScope = 'carrier-a' | 'carrier-b' | 'compare';

function csvEscape(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function formatRatioSpread(evA: RatioEvaluation, evB: RatioEvaluation): string {
  if (evA.value === null || evB.value === null) return 'N/A';
  const diff = evA.value - evB.value;
  const sign = diff > 0 ? '+' : '';
  if (evA.unit === '%') return `${sign}${diff.toFixed(1)} pp`;
  if (evA.unit === 'times') return `${sign}${diff.toFixed(2)} times`;
  return `${sign}${diff.toFixed(2)}x`;
}

function formatYoYDelta(
  current: number | null,
  prior: number | null,
  isCurrency: boolean
): string {
  if (current === null || prior === null) return 'N/A';
  const diff = current - prior;
  if (isCurrency) return formatSignedCurrencyB(diff);
  const sign = diff > 0 ? '+' : '';
  return `${sign}${diff.toFixed(1)} pp`;
}

export const ReportsPage: React.FC<ReportsPageProps> = ({
  onReturnToDashboard,
  onOpenMethodology,
}) => {
  const [reportScope, setReportScope] = useState<ReportScope>('compare');
  const [selectedYear, setSelectedYear] = useState<string>('FY 2024');

  const carrierA = ILLUSTRATIVE_CARRIERS[0];
  const carrierB = ILLUSTRATIVE_CARRIERS[1];

  const fiscalYears = useMemo(
    () => carrierA.annualSeries.map((r) => r.fiscalYear),
    [carrierA]
  );

  const selectedYearIndex = useMemo(() => {
    const idx = fiscalYears.indexOf(selectedYear);
    return idx >= 0 ? idx : fiscalYears.length - 1;
  }, [fiscalYears, selectedYear]);

  const activeSingleCarrier = reportScope === 'carrier-b' ? carrierB : carrierA;

  const ratioEvaluationsA = useMemo(
    () =>
      RATIO_CATALOG.map((meta) =>
        evaluateRatio(meta.id, carrierA.annualSeries, selectedYearIndex)
      ),
    [carrierA.annualSeries, selectedYearIndex]
  );

  const ratioEvaluationsB = useMemo(
    () =>
      RATIO_CATALOG.map((meta) =>
        evaluateRatio(meta.id, carrierB.annualSeries, selectedYearIndex)
      ),
    [carrierB.annualSeries, selectedYearIndex]
  );

  const executiveSummaryBullets = useMemo(() => {
    const rowA = carrierA.annualSeries[selectedYearIndex];
    const rowB = carrierB.annualSeries[selectedYearIndex];
    const prevA = selectedYearIndex > 0 ? carrierA.annualSeries[selectedYearIndex - 1] : null;
    const prevB = selectedYearIndex > 0 ? carrierB.annualSeries[selectedYearIndex - 1] : null;

    if (reportScope === 'compare') {
      const revSpread = formatSignedCurrencyB(
        rowA.operatingRevenueUsdB - rowB.operatingRevenueUsdB
      );
      const opProfitA = getOperatingProfit(rowA);
      const opProfitB = getOperatingProfit(rowB);
      const marginA = getOperatingMarginPct(rowA);
      const marginB = getOperatingMarginPct(rowB);
      const marginSpread =
        marginA !== null && marginB !== null
          ? `${marginA - marginB > 0 ? '+' : ''}${(marginA - marginB).toFixed(1)} pp`
          : 'N/A';

      const fcfA = getFreeCashFlow(rowA);
      const fcfB = getFreeCashFlow(rowB);
      const deA = ratioEvaluationsA.find((r) => r.id === 'debt-to-equity');
      const deB = ratioEvaluationsB.find((r) => r.id === 'debt-to-equity');

      return [
        `Scale & Top-Line (${selectedYear}): Carrier A recorded illustrative Operating Revenue of ${formatCurrencyB(
          rowA.operatingRevenueUsdB
        )} versus ${formatCurrencyB(
          rowB.operatingRevenueUsdB
        )} for Carrier B (spread A − B: ${revSpread}).`,
        `Operating Profitability: Carrier A generated Operating Profit of ${formatCurrencyB(
          opProfitA
        )} (${formatRatioValue(marginA, '%')} margin) compared with ${formatCurrencyB(
          opProfitB
        )} (${formatRatioValue(marginB, '%')} margin) for Carrier B (margin spread A − B: ${marginSpread}).`,
        `Bottom-Line & Cash Generation: Net Income stood at ${formatCurrencyB(
          getNetIncome(rowA)
        )} for Carrier A and ${formatCurrencyB(
          getNetIncome(rowB)
        )} for Carrier B; Free Cash Flow reached ${formatCurrencyB(
          fcfA
        )} vs. ${formatCurrencyB(fcfB)} respectively.`,
        `Capital Structure & Missing-Data Discipline: Debt-to-Equity (interest-bearing debt basis) was ${
          deA?.formattedValue ?? 'N/A'
        } for Carrier A versus ${
          deB?.formattedValue ?? 'N/A'
        } for Carrier B. Quick Ratio and Net Debt / EBITDA remain N/A due to absent Inventory, Cash, and EBITDA disclosures${
          selectedYearIndex === 0
            ? '; FY 2020 ROA, ROE, and Asset Turnover are N/A because FY 2019 opening balances are unavailable'
            : ''
        }.`,
      ];
    }

    const row: AnnualFinancialRow =
      reportScope === 'carrier-b' ? rowB : rowA;
    const prevRow: AnnualFinancialRow | null =
      reportScope === 'carrier-b' ? prevB : prevA;
    const activeEvals =
      reportScope === 'carrier-b' ? ratioEvaluationsB : ratioEvaluationsA;

    const opProfit = getOperatingProfit(row);
    const netInc = getNetIncome(row);
    const margin = getOperatingMarginPct(row);
    const prevMargin = prevRow ? getOperatingMarginPct(prevRow) : null;
    const fcf = getFreeCashFlow(row);
    const deEval = activeEvals.find((r) => r.id === 'debt-to-equity');
    const currEval = activeEvals.find((r) => r.id === 'current-ratio');

    const revChangeText = prevRow
      ? ` (${formatYoYDelta(
          row.operatingRevenueUsdB,
          prevRow.operatingRevenueUsdB,
          true
        )} vs. ${prevRow.fiscalYear})`
      : ' (baseline dataset period; no prior year available)';

    const marginChangeText = prevRow
      ? ` (${formatYoYDelta(margin, prevMargin, false)} vs. ${prevRow.fiscalYear})`
      : '';

    return [
      `Operating Scale (${selectedYear}): ${activeSingleCarrier.name} generated illustrative Operating Revenue of ${formatCurrencyB(
        row.operatingRevenueUsdB
      )}${revChangeText}.`,
      `Profitability & Earnings: Operating Profit (EBIT) totaled ${formatCurrencyB(
        opProfit
      )} at an Operating Margin of ${formatRatioValue(
        margin,
        '%'
      )}${marginChangeText}, with bottom-line Net Income of ${formatCurrencyB(netInc)}.`,
      `Liquidity & Leverage: Current Ratio measured ${
        currEval?.formattedValue ?? 'N/A'
      } and Debt-to-Equity (interest-bearing debt basis) measured ${
        deEval?.formattedValue ?? 'N/A'
      }.`,
      `Cash Flow & Missing-Input Integrity: Free Cash Flow totaled ${formatCurrencyB(
        fcf
      )} (Operating Cash Flow ${formatCurrencyB(
        row.operatingCashFlowUsdB ?? null
      )} minus CapEx ${formatCurrencyB(
        row.capitalExpendituresUsdB ?? null
      )}). Quick Ratio and Net Debt / EBITDA remain N/A due to unavailable Stage 1/2 inputs${
        selectedYearIndex === 0
          ? '; FY 2020 ROA, ROE, and Asset Turnover are N/A due to missing FY 2019 opening balances'
          : ''
      }.`,
    ];
  }, [
    reportScope,
    selectedYear,
    selectedYearIndex,
    carrierA,
    carrierB,
    activeSingleCarrier.name,
    ratioEvaluationsA,
    ratioEvaluationsB,
  ]);

  const barChartData = useMemo(() => {
    if (reportScope === 'compare') {
      return {
        labels: fiscalYears,
        datasets: [
          {
            label: 'Carrier A Revenue ($B)',
            data: carrierA.annualSeries.map((r) => r.operatingRevenueUsdB),
            backgroundColor: '#0B192C',
            borderRadius: 4,
          },
          {
            label: 'Carrier B Revenue ($B)',
            data: carrierB.annualSeries.map((r) => r.operatingRevenueUsdB),
            backgroundColor: '#0284C7',
            borderRadius: 4,
          },
          {
            label: 'Carrier A Operating Profit ($B)',
            data: carrierA.annualSeries.map((r) => getOperatingProfit(r)),
            backgroundColor: '#64748B',
            borderRadius: 4,
          },
          {
            label: 'Carrier B Operating Profit ($B)',
            data: carrierB.annualSeries.map((r) => getOperatingProfit(r)),
            backgroundColor: '#38BDF8',
            borderRadius: 4,
          },
        ],
      };
    }

    const colorPrimary = reportScope === 'carrier-b' ? '#0284C7' : '#0B192C';
    const colorSecondary = reportScope === 'carrier-b' ? '#38BDF8' : '#64748B';
    return {
      labels: fiscalYears,
      datasets: [
        {
          label: `${activeSingleCarrier.id === 'carrier-b' ? 'Carrier B' : 'Carrier A'} Revenue ($B)`,
          data: activeSingleCarrier.annualSeries.map((r) => r.operatingRevenueUsdB),
          backgroundColor: colorPrimary,
          borderRadius: 4,
        },
        {
          label: `${activeSingleCarrier.id === 'carrier-b' ? 'Carrier B' : 'Carrier A'} Operating Profit ($B)`,
          data: activeSingleCarrier.annualSeries.map((r) => getOperatingProfit(r)),
          backgroundColor: colorSecondary,
          borderRadius: 4,
        },
      ],
    };
  }, [reportScope, fiscalYears, carrierA.annualSeries, carrierB.annualSeries, activeSingleCarrier]);

  const marginLineData = useMemo(() => {
    if (reportScope === 'compare') {
      return {
        labels: fiscalYears,
        datasets: [
          {
            label: 'Carrier A Operating Margin (%)',
            data: carrierA.annualSeries.map((_, idx) => {
              const v = evaluateRatio('operating-margin', carrierA.annualSeries, idx).value;
              return v !== null ? Number(v.toFixed(1)) : null;
            }),
            borderColor: '#0B192C',
            backgroundColor: 'rgba(11, 25, 44, 0.08)',
            tension: 0.25,
            fill: false,
            spanGaps: false,
            pointRadius: 4,
          },
          {
            label: 'Carrier B Operating Margin (%)',
            data: carrierB.annualSeries.map((_, idx) => {
              const v = evaluateRatio('operating-margin', carrierB.annualSeries, idx).value;
              return v !== null ? Number(v.toFixed(1)) : null;
            }),
            borderColor: '#0284C7',
            backgroundColor: 'rgba(2, 132, 199, 0.08)',
            tension: 0.25,
            fill: false,
            spanGaps: false,
            pointRadius: 4,
          },
        ],
      };
    }

    const lineColor = reportScope === 'carrier-b' ? '#0284C7' : '#0B192C';
    return {
      labels: fiscalYears,
      datasets: [
        {
          label: 'Operating Margin (%)',
          data: activeSingleCarrier.annualSeries.map((_, idx) => {
            const v = evaluateRatio(
              'operating-margin',
              activeSingleCarrier.annualSeries,
              idx
            ).value;
            return v !== null ? Number(v.toFixed(1)) : null;
          }),
          borderColor: lineColor,
          backgroundColor: 'rgba(11, 25, 44, 0.08)',
          tension: 0.25,
          fill: false,
          spanGaps: false,
          pointRadius: 4,
        },
        {
          label: 'Net Profit Margin (%)',
          data: activeSingleCarrier.annualSeries.map((_, idx) => {
            const v = evaluateRatio(
              'net-profit-margin',
              activeSingleCarrier.annualSeries,
              idx
            ).value;
            return v !== null ? Number(v.toFixed(1)) : null;
          }),
          borderColor: '#475569',
          backgroundColor: 'rgba(71, 85, 105, 0.08)',
          borderDash: [4, 4],
          tension: 0.25,
          fill: false,
          spanGaps: false,
          pointRadius: 4,
        },
      ],
    };
  }, [reportScope, fiscalYears, carrierA.annualSeries, carrierB.annualSeries, activeSingleCarrier]);

  const barChartOptions: ChartOptions<'bar'> = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
          align: 'end',
          labels: { boxWidth: 10, color: '#334155', font: { size: 11 } },
        },
      },
      scales: {
        x: { grid: { display: false }, ticks: { color: '#475569', font: { size: 11 } } },
        y: {
          grid: { color: '#E2E8F0' },
          ticks: {
            color: '#475569',
            font: { size: 11 },
            callback: (val) => `$${Number(val).toFixed(0)}B`,
          },
        },
      },
    }),
    []
  );

  const lineChartOptions: ChartOptions<'line'> = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
          align: 'end',
          labels: { boxWidth: 10, color: '#334155', font: { size: 11 } },
        },
      },
      scales: {
        x: { grid: { display: false }, ticks: { color: '#475569', font: { size: 11 } } },
        y: {
          grid: { color: '#E2E8F0' },
          ticks: {
            color: '#475569',
            font: { size: 11 },
            callback: (val) => `${Number(val).toFixed(1)}%`,
          },
        },
      },
    }),
    []
  );

  const handlePrint = () => {
    window.print();
  };

  const handleExportCsv = () => {
    const lines: string[] = [];
    const scopeLabel =
      reportScope === 'compare'
        ? 'Comparative Report (Carrier A vs. Carrier B)'
        : reportScope === 'carrier-b'
        ? 'Carrier B Report'
        : 'Carrier A Report';

    lines.push([csvEscape('AIRLYTICS Analytical Report'), csvEscape(scopeLabel)].join(','));
    lines.push([csvEscape('Focus Fiscal Year'), csvEscape(selectedYear)].join(','));
    lines.push(
      [
        csvEscape('Data Integrity Disclaimer'),
        csvEscape('Illustrative Sample Data — Not Official Financial Results.'),
      ].join(',')
    );
    lines.push(
      [
        csvEscape('Source Verification'),
        csvEscape('Pending Official Filing Selection'),
      ].join(',')
    );
    lines.push('');

    // Section 1: 5-Year Financial Performance Summary
    lines.push(csvEscape('Five-Year Financial Performance Summary ($B)'));
    if (reportScope === 'compare') {
      lines.push(
        [
          'Fiscal Year',
          'Carrier A Revenue ($B)',
          'Carrier B Revenue ($B)',
          'Carrier A Operating Profit ($B)',
          'Carrier B Operating Profit ($B)',
          'Carrier A Net Income ($B)',
          'Carrier B Net Income ($B)',
          'Carrier A Free Cash Flow ($B)',
          'Carrier B Free Cash Flow ($B)',
        ]
          .map(csvEscape)
          .join(',')
      );
      fiscalYears.forEach((yr, idx) => {
        const rA = carrierA.annualSeries[idx];
        const rB = carrierB.annualSeries[idx];
        lines.push(
          [
            yr,
            formatCurrencyB(rA.operatingRevenueUsdB),
            formatCurrencyB(rB.operatingRevenueUsdB),
            formatCurrencyB(getOperatingProfit(rA)),
            formatCurrencyB(getOperatingProfit(rB)),
            formatCurrencyB(getNetIncome(rA)),
            formatCurrencyB(getNetIncome(rB)),
            formatCurrencyB(getFreeCashFlow(rA)),
            formatCurrencyB(getFreeCashFlow(rB)),
          ]
            .map(csvEscape)
            .join(',')
        );
      });
    } else {
      lines.push(
        [
          'Fiscal Year',
          'Operating Revenue ($B)',
          'Operating Expenses ($B)',
          'Operating Profit ($B)',
          'Pre-Tax Income ($B)',
          'Net Income ($B)',
          'Free Cash Flow ($B)',
          'Total Assets ($B)',
          'Total Interest-Bearing Debt ($B)',
          "Shareholders' Equity ($B)",
        ]
          .map(csvEscape)
          .join(',')
      );
      activeSingleCarrier.annualSeries.forEach((r) => {
        lines.push(
          [
            r.fiscalYear,
            formatCurrencyB(r.operatingRevenueUsdB),
            formatCurrencyB(r.operatingExpensesUsdB),
            formatCurrencyB(getOperatingProfit(r)),
            formatCurrencyB(getPreTaxIncome(r)),
            formatCurrencyB(getNetIncome(r)),
            formatCurrencyB(getFreeCashFlow(r)),
            formatCurrencyB(r.totalAssetsUsdB),
            formatCurrencyB(r.totalInterestBearingDebtUsdB ?? null),
            formatCurrencyB(r.shareholdersEquityUsdB),
          ]
            .map(csvEscape)
            .join(',')
        );
      });
    }

    lines.push('');
    lines.push(
      csvEscape(`Financial Indicators & Ratio Traceability (${selectedYear})`)
    );

    if (reportScope === 'compare') {
      lines.push(
        [
          'Category',
          'Ratio',
          'Carrier A',
          'Carrier B',
          'Spread (A - B)',
          'Formula',
          'Carrier A Numerator / Denominator',
          'Carrier B Numerator / Denominator',
          'Source Statement',
        ]
          .map(csvEscape)
          .join(',')
      );
      RATIO_CATALOG.forEach((meta, i) => {
        const evA = ratioEvaluationsA[i];
        const evB = ratioEvaluationsB[i];
        const catLabel =
          RATIO_CATEGORY_LABELS.find((c) => c.id === meta.category)?.label ??
          meta.category;
        lines.push(
          [
            catLabel,
            meta.name,
            evA.formattedValue,
            evB.formattedValue,
            formatRatioSpread(evA, evB),
            meta.formula,
            `${evA.numeratorValueText} / ${evA.denominatorValueText}`,
            `${evB.numeratorValueText} / ${evB.denominatorValueText}`,
            meta.sourceStatement,
          ]
            .map(csvEscape)
            .join(',')
        );
      });
    } else {
      const activeEvals =
        reportScope === 'carrier-b' ? ratioEvaluationsB : ratioEvaluationsA;
      lines.push(
        [
          'Category',
          'Ratio',
          'Value',
          'Status',
          'Formula',
          'Numerator',
          'Denominator',
          'Source Statement',
        ]
          .map(csvEscape)
          .join(',')
      );
      activeEvals.forEach((ev) => {
        const catLabel =
          RATIO_CATEGORY_LABELS.find((c) => c.id === ev.category)?.label ?? ev.category;
        lines.push(
          [
            catLabel,
            ev.name,
            ev.formattedValue,
            ev.status === 'valid' ? 'Computed' : ev.statusReason ?? ev.status,
            ev.formula,
            `${ev.numeratorLabel}: ${ev.numeratorValueText}`,
            `${ev.denominatorLabel}: ${ev.denominatorValueText}`,
            ev.sourceStatement,
          ]
            .map(csvEscape)
            .join(',')
        );
      });
    }

    const csvContent = lines.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const slugYear = selectedYear.toLowerCase().replace(/\s+/g, '');
    const slugScope = reportScope === 'compare' ? 'comparative-a-vs-b' : reportScope;
    link.href = url;
    link.download = `airlytics-${slugScope}-${slugYear}-report.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const reportTitle =
    reportScope === 'compare'
      ? 'Comparative Airline Financial Report: Carrier A vs. Carrier B'
      : reportScope === 'carrier-b'
      ? 'Carrier B Financial Performance & Ratio Report'
      : 'Carrier A Financial Performance & Ratio Report';

  const rowA = carrierA.annualSeries[selectedYearIndex];
  const rowB = carrierB.annualSeries[selectedYearIndex];
  const singleRow = reportScope === 'carrier-b' ? rowB : rowA;
  const activeRatioEvals =
    reportScope === 'carrier-b' ? ratioEvaluationsB : ratioEvaluationsA;

  return (
    <div className="space-y-6">
      {/* Page Header + Export/Print Controls */}
      <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <button
            type="button"
            onClick={onReturnToDashboard}
            className="mb-3 inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-[#0B192C] transition-colors print:hidden"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Dashboard</span>
          </button>
          <h1 className="font-display text-2xl font-bold tracking-tight text-[#0B192C] sm:text-3xl">
            {reportTitle}
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Structured financial performance summary, ratio traceability, and exportable
            analytical brief for {selectedYear} across FY 2020 – FY 2024.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 print:hidden">
          <button
            type="button"
            onClick={handleExportCsv}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-[#0B192C] hover:bg-slate-50 transition-colors whitespace-nowrap"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#0B192C] px-3.5 py-2 text-xs font-medium text-white hover:bg-[#132844] transition-colors whitespace-nowrap"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>Print / Save as PDF</span>
          </button>
        </div>
      </section>

      {/* Mandatory Data Integrity & Source Verification Notice */}
      <section
        aria-label="Report Data Integrity Disclaimer"
        className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="flex items-start gap-3">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-[#1E3A5F]" />
          <div className="text-xs leading-relaxed text-slate-600">
            <span className="font-semibold text-[#0B192C]">
              Illustrative Sample Data — Not Official Financial Results.
            </span>{' '}
            Source Verification: Pending Official Filing Selection. All values and narrative
            summaries below are computed dynamically from the Stage 2 illustrative carrier
            datasets.
          </div>
        </div>
        <button
          type="button"
          onClick={onOpenMethodology}
          className="shrink-0 self-start rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-[#0B192C] hover:bg-slate-100 transition-colors sm:self-center whitespace-nowrap print:hidden"
        >
          View Data Policy
        </button>
      </section>

      {/* Report Configuration Controls (Hidden in Print) */}
      <section
        aria-label="Report Parameters"
        className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-5 lg:flex-row lg:items-center lg:justify-between print:hidden"
      >
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-1 text-xs font-medium text-slate-500">Report Scope:</span>
          <div className="inline-flex flex-wrap items-center gap-1 rounded-lg bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => setReportScope('carrier-a')}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
                reportScope === 'carrier-a'
                  ? 'bg-[#0B192C] text-white'
                  : 'text-slate-600 hover:text-[#0B192C]'
              }`}
            >
              Carrier A Report
            </button>
            <button
              type="button"
              onClick={() => setReportScope('carrier-b')}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
                reportScope === 'carrier-b'
                  ? 'bg-[#0B192C] text-white'
                  : 'text-slate-600 hover:text-[#0B192C]'
              }`}
            >
              Carrier B Report
            </button>
            <button
              type="button"
              onClick={() => setReportScope('compare')}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
                reportScope === 'compare'
                  ? 'bg-[#0B192C] text-white'
                  : 'text-slate-600 hover:text-[#0B192C]'
              }`}
            >
              Comparative (A vs. B)
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-1 text-xs font-medium text-slate-500">Focus Fiscal Year:</span>
          <div className="inline-flex flex-wrap items-center gap-1 rounded-lg bg-slate-100 p-1">
            {fiscalYears.map((yr) => (
              <button
                key={yr}
                type="button"
                onClick={() => setSelectedYear(yr)}
                className={`rounded-md px-2.5 py-1.5 font-mono text-xs font-medium transition-colors whitespace-nowrap ${
                  selectedYear === yr
                    ? 'bg-white text-[#0B192C] shadow-sm'
                    : 'text-slate-600 hover:text-[#0B192C]'
                }`}
              >
                {yr}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Dynamic Executive Summary */}
      <section
        aria-label="Dynamic Executive Summary"
        className="print-avoid-break rounded-xl border border-slate-200 bg-white p-6"
      >
        <div className="flex flex-col gap-2 border-b border-slate-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-[#0284C7]" />
            <h2 className="font-display text-base font-semibold text-[#0B192C]">
              Executive Summary · {selectedYear}
            </h2>
          </div>
          <div className="text-xs text-slate-500">
            Source Verification: Pending Official Filing Selection
          </div>
        </div>

        <ul className="mt-4 list-disc space-y-2.5 pl-5 text-xs leading-relaxed text-slate-700">
          {executiveSummaryBullets.map((bullet, idx) => (
            <li key={idx}>{bullet}</li>
          ))}
        </ul>
      </section>

      {/* Focus Fiscal Year Headline Summary Cards */}
      <section aria-label="Selected Year Financial Snapshot" className="print-avoid-break">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {reportScope === 'compare' ? (
            <>
              <div className="rounded-xl border border-slate-200 bg-white p-5">
                <div className="text-xs font-medium text-slate-500">
                  Operating Revenue ({selectedYear})
                </div>
                <div className="mt-2 flex items-baseline justify-between gap-2">
                  <span className="font-mono text-lg font-bold text-[#0B192C] tabular-nums">
                    A: {formatCurrencyB(rowA.operatingRevenueUsdB)}
                  </span>
                  <span className="font-mono text-lg font-bold text-[#0284C7] tabular-nums">
                    B: {formatCurrencyB(rowB.operatingRevenueUsdB)}
                  </span>
                </div>
                <div className="mt-2 text-[11px] font-mono text-slate-500 tabular-nums">
                  Spread (A − B):{' '}
                  {formatSignedCurrencyB(
                    rowA.operatingRevenueUsdB - rowB.operatingRevenueUsdB
                  )}
                </div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-5">
                <div className="text-xs font-medium text-slate-500">
                  Operating Profit ({selectedYear})
                </div>
                <div className="mt-2 flex items-baseline justify-between gap-2">
                  <span className="font-mono text-lg font-bold text-[#0B192C] tabular-nums">
                    A: {formatCurrencyB(getOperatingProfit(rowA))}
                  </span>
                  <span className="font-mono text-lg font-bold text-[#0284C7] tabular-nums">
                    B: {formatCurrencyB(getOperatingProfit(rowB))}
                  </span>
                </div>
                <div className="mt-2 text-[11px] font-mono text-slate-500 tabular-nums">
                  Spread (A − B):{' '}
                  {formatSignedCurrencyB(
                    getOperatingProfit(rowA) - getOperatingProfit(rowB)
                  )}
                </div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-5">
                <div className="text-xs font-medium text-slate-500">
                  Net Income / Loss ({selectedYear})
                </div>
                <div className="mt-2 flex items-baseline justify-between gap-2">
                  <span className="font-mono text-lg font-bold text-[#0B192C] tabular-nums">
                    A: {formatCurrencyB(getNetIncome(rowA))}
                  </span>
                  <span className="font-mono text-lg font-bold text-[#0284C7] tabular-nums">
                    B: {formatCurrencyB(getNetIncome(rowB))}
                  </span>
                </div>
                <div className="mt-2 text-[11px] font-mono text-slate-500 tabular-nums">
                  Spread (A − B):{' '}
                  {formatSignedCurrencyB(getNetIncome(rowA) - getNetIncome(rowB))}
                </div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-5">
                <div className="text-xs font-medium text-slate-500">
                  Free Cash Flow ({selectedYear})
                </div>
                <div className="mt-2 flex items-baseline justify-between gap-2">
                  <span className="font-mono text-lg font-bold text-[#0B192C] tabular-nums">
                    A: {formatCurrencyB(getFreeCashFlow(rowA))}
                  </span>
                  <span className="font-mono text-lg font-bold text-[#0284C7] tabular-nums">
                    B: {formatCurrencyB(getFreeCashFlow(rowB))}
                  </span>
                </div>
                <div className="mt-2 text-[11px] font-mono text-slate-500 tabular-nums">
                  OCF − CapEx · Illustrative Sample
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="rounded-xl border border-slate-200 bg-white p-5">
                <div className="text-xs font-medium text-slate-500">
                  Operating Revenue ({selectedYear})
                </div>
                <div className="mt-2 font-mono text-2xl font-bold text-[#0B192C] tabular-nums">
                  {formatCurrencyB(singleRow.operatingRevenueUsdB)}
                </div>
                <div className="mt-2 text-[11px] text-slate-500">
                  Reported top-line illustrative revenue
                </div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-5">
                <div className="text-xs font-medium text-slate-500">
                  Operating Profit ({selectedYear})
                </div>
                <div className="mt-2 font-mono text-2xl font-bold text-[#0B192C] tabular-nums">
                  {formatCurrencyB(getOperatingProfit(singleRow))}
                </div>
                <div className="mt-2 font-mono text-[11px] text-slate-500 tabular-nums">
                  Margin: {formatRatioValue(getOperatingMarginPct(singleRow), '%')}
                </div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-5">
                <div className="text-xs font-medium text-slate-500">
                  Net Income / Loss ({selectedYear})
                </div>
                <div className="mt-2 font-mono text-2xl font-bold text-[#0B192C] tabular-nums">
                  {formatCurrencyB(getNetIncome(singleRow))}
                </div>
                <div className="mt-2 font-mono text-[11px] text-slate-500 tabular-nums">
                  Pre-Tax: {formatCurrencyB(getPreTaxIncome(singleRow))}
                </div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-5">
                <div className="text-xs font-medium text-slate-500">
                  Free Cash Flow ({selectedYear})
                </div>
                <div className="mt-2 font-mono text-2xl font-bold text-[#0B192C] tabular-nums">
                  {formatCurrencyB(getFreeCashFlow(singleRow))}
                </div>
                <div className="mt-2 font-mono text-[11px] text-slate-500 tabular-nums">
                  OCF {formatCurrencyB(singleRow.operatingCashFlowUsdB ?? null)} − CapEx{' '}
                  {formatCurrencyB(singleRow.capitalExpendituresUsdB ?? null)}
                </div>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Report Visualizations */}
      <section className="print-avoid-break grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h3 className="font-display text-sm font-semibold text-[#0B192C]">
            5-Year Revenue &amp; Operating Profit ($B)
          </h3>
          <p className="mt-0.5 text-xs text-slate-500">
            FY 2020 – FY 2024 · Illustrative Sample Data
          </p>
          <div className="mt-4 h-[260px] w-full">
            <Bar
              key={`rep-bar-${reportScope}`}
              data={barChartData}
              options={barChartOptions}
            />
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h3 className="font-display text-sm font-semibold text-[#0B192C]">
            5-Year Profitability Margins (%)
          </h3>
          <p className="mt-0.5 text-xs text-slate-500">
            FY 2020 – FY 2024 · Illustrative Sample Data
          </p>
          <div className="mt-4 h-[260px] w-full">
            <Line
              key={`rep-line-${reportScope}`}
              data={marginLineData}
              options={lineChartOptions}
            />
          </div>
        </div>
      </section>

      {/* 5-Year Financial Performance Summary Table */}
      <section className="print-avoid-break rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-200 p-5">
          <h2 className="font-display text-base font-semibold text-[#0B192C]">
            Five-Year Financial Performance Summary ($B)
          </h2>
          <p className="mt-0.5 text-xs text-slate-500">
            Reconciled values computed dynamically from illustrative carrier datasets (FY 2020 –
            FY 2024)
          </p>
        </div>

        <div className="overflow-x-auto">
          {reportScope === 'compare' ? (
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-5 py-3 font-semibold">Fiscal Year</th>
                  <th className="px-3 py-3 text-right font-semibold text-[#0B192C]">
                    Rev A
                  </th>
                  <th className="px-3 py-3 text-right font-semibold text-[#0284C7]">
                    Rev B
                  </th>
                  <th className="px-3 py-3 text-right font-semibold text-[#0B192C]">
                    EBIT A
                  </th>
                  <th className="px-3 py-3 text-right font-semibold text-[#0284C7]">
                    EBIT B
                  </th>
                  <th className="px-3 py-3 text-right font-semibold text-[#0B192C]">
                    Net Inc A
                  </th>
                  <th className="px-3 py-3 text-right font-semibold text-[#0284C7]">
                    Net Inc B
                  </th>
                  <th className="px-3 py-3 text-right font-semibold text-[#0B192C]">
                    FCF A
                  </th>
                  <th className="px-5 py-3 text-right font-semibold text-[#0284C7]">
                    FCF B
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {fiscalYears.map((yr, idx) => {
                  const rA = carrierA.annualSeries[idx];
                  const rB = carrierB.annualSeries[idx];
                  return (
                    <tr
                      key={yr}
                      className={yr === selectedYear ? 'bg-sky-50/40 font-semibold' : ''}
                    >
                      <td className="px-5 py-3 font-mono text-[#0B192C] whitespace-nowrap">
                        {yr}
                      </td>
                      <td className="px-3 py-3 text-right font-mono tabular-nums text-[#0B192C] whitespace-nowrap">
                        {formatCurrencyB(rA.operatingRevenueUsdB)}
                      </td>
                      <td className="px-3 py-3 text-right font-mono tabular-nums text-[#0284C7] whitespace-nowrap">
                        {formatCurrencyB(rB.operatingRevenueUsdB)}
                      </td>
                      <td className="px-3 py-3 text-right font-mono tabular-nums text-[#0B192C] whitespace-nowrap">
                        {formatCurrencyB(getOperatingProfit(rA))}
                      </td>
                      <td className="px-3 py-3 text-right font-mono tabular-nums text-[#0284C7] whitespace-nowrap">
                        {formatCurrencyB(getOperatingProfit(rB))}
                      </td>
                      <td className="px-3 py-3 text-right font-mono tabular-nums text-[#0B192C] whitespace-nowrap">
                        {formatCurrencyB(getNetIncome(rA))}
                      </td>
                      <td className="px-3 py-3 text-right font-mono tabular-nums text-[#0284C7] whitespace-nowrap">
                        {formatCurrencyB(getNetIncome(rB))}
                      </td>
                      <td className="px-3 py-3 text-right font-mono tabular-nums text-[#0B192C] whitespace-nowrap">
                        {formatCurrencyB(getFreeCashFlow(rA))}
                      </td>
                      <td className="px-5 py-3 text-right font-mono tabular-nums text-[#0284C7] whitespace-nowrap">
                        {formatCurrencyB(getFreeCashFlow(rB))}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-5 py-3 font-semibold">Fiscal Year</th>
                  <th className="px-3 py-3 text-right font-semibold">Revenue</th>
                  <th className="px-3 py-3 text-right font-semibold">OpEx</th>
                  <th className="px-3 py-3 text-right font-semibold">Op. Profit</th>
                  <th className="px-3 py-3 text-right font-semibold">Net Income</th>
                  <th className="px-3 py-3 text-right font-semibold">Free Cash Flow</th>
                  <th className="px-3 py-3 text-right font-semibold">Total Assets</th>
                  <th className="px-3 py-3 text-right font-semibold">Debt</th>
                  <th className="px-5 py-3 text-right font-semibold">Equity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {activeSingleCarrier.annualSeries.map((r) => (
                  <tr
                    key={r.fiscalYear}
                    className={
                      r.fiscalYear === selectedYear ? 'bg-sky-50/40 font-semibold' : ''
                    }
                  >
                    <td className="px-5 py-3 font-mono text-[#0B192C] whitespace-nowrap">
                      {r.fiscalYear}
                    </td>
                    <td className="px-3 py-3 text-right font-mono tabular-nums text-[#0B192C] whitespace-nowrap">
                      {formatCurrencyB(r.operatingRevenueUsdB)}
                    </td>
                    <td className="px-3 py-3 text-right font-mono tabular-nums text-slate-600 whitespace-nowrap">
                      {formatCurrencyB(r.operatingExpensesUsdB)}
                    </td>
                    <td className="px-3 py-3 text-right font-mono tabular-nums text-[#0B192C] whitespace-nowrap">
                      {formatCurrencyB(getOperatingProfit(r))}
                    </td>
                    <td className="px-3 py-3 text-right font-mono tabular-nums text-[#0B192C] whitespace-nowrap">
                      {formatCurrencyB(getNetIncome(r))}
                    </td>
                    <td className="px-3 py-3 text-right font-mono tabular-nums text-[#0B192C] whitespace-nowrap">
                      {formatCurrencyB(getFreeCashFlow(r))}
                    </td>
                    <td className="px-3 py-3 text-right font-mono tabular-nums text-slate-600 whitespace-nowrap">
                      {formatCurrencyB(r.totalAssetsUsdB)}
                    </td>
                    <td className="px-3 py-3 text-right font-mono tabular-nums text-slate-600 whitespace-nowrap">
                      {formatCurrencyB(r.totalInterestBearingDebtUsdB ?? null)}
                    </td>
                    <td className="px-5 py-3 text-right font-mono tabular-nums text-[#0B192C] whitespace-nowrap">
                      {formatCurrencyB(r.shareholdersEquityUsdB)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

      {/* Profitability, Liquidity, Leverage & Cash Flow Indicators + Formula Traceability */}
      <section className="rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-200 p-5">
          <h2 className="font-display text-base font-semibold text-[#0B192C]">
            Financial Indicators &amp; Formula Traceability Schedule · {selectedYear}
          </h2>
          <p className="mt-0.5 text-xs text-slate-500">
            Covers Profitability, Liquidity, Leverage &amp; Solvency, and Cash Flow Efficiency
            using the shared Financial Ratios Engine with full numerator/denominator
            traceability.
          </p>
        </div>

        <div className="overflow-x-auto">
          {reportScope === 'compare' ? (
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-5 py-3 font-semibold">Category</th>
                  <th className="px-4 py-3 font-semibold">Indicator</th>
                  <th className="px-4 py-3 text-right font-semibold text-[#0B192C]">
                    Carrier A
                  </th>
                  <th className="px-4 py-3 text-right font-semibold text-[#0284C7]">
                    Carrier B
                  </th>
                  <th className="px-4 py-3 text-right font-semibold">Spread (A − B)</th>
                  <th className="px-4 py-3 font-semibold">Formula &amp; Source</th>
                  <th className="px-5 py-3 font-semibold">Inputs / N/A Rationale</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {RATIO_CATALOG.map((meta, idx) => {
                  const evA = ratioEvaluationsA[idx];
                  const evB = ratioEvaluationsB[idx];
                  const catLabel =
                    RATIO_CATEGORY_LABELS.find((c) => c.id === meta.category)?.label ??
                    meta.category;
                  return (
                    <tr key={meta.id} className="hover:bg-slate-50/60 align-top">
                      <td className="px-5 py-3 text-slate-500 whitespace-nowrap">
                        {catLabel}
                      </td>
                      <td className="px-4 py-3 font-semibold text-[#0B192C] whitespace-nowrap">
                        {meta.name}
                      </td>
                      <td
                        className={`px-4 py-3 text-right font-mono tabular-nums whitespace-nowrap ${
                          evA.status === 'valid' ? 'text-[#0B192C]' : 'text-amber-700'
                        }`}
                      >
                        {evA.formattedValue}
                      </td>
                      <td
                        className={`px-4 py-3 text-right font-mono tabular-nums whitespace-nowrap ${
                          evB.status === 'valid' ? 'text-[#0284C7]' : 'text-amber-700'
                        }`}
                      >
                        {evB.formattedValue}
                      </td>
                      <td className="px-4 py-3 text-right font-mono tabular-nums text-slate-700 whitespace-nowrap">
                        {formatRatioSpread(evA, evB)}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        <div className="font-mono text-[11px] text-[#0B192C]">
                          {meta.formula}
                        </div>
                        <div className="mt-0.5 text-[11px] text-slate-400">
                          {meta.sourceStatement}
                        </div>
                      </td>
                      <td className="px-5 py-3 text-[11px] text-slate-600">
                        {evA.status === 'valid' ? (
                          <div className="space-y-0.5 font-mono tabular-nums">
                            <div>
                              A: {evA.numeratorValueText} ÷ {evA.denominatorValueText}
                            </div>
                            <div>
                              B: {evB.numeratorValueText} ÷ {evB.denominatorValueText}
                            </div>
                          </div>
                        ) : (
                          <span className="text-amber-700">
                            {evA.statusReason ?? 'Missing required inputs'}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-5 py-3 font-semibold">Category</th>
                  <th className="px-4 py-3 font-semibold">Indicator</th>
                  <th className="px-4 py-3 text-right font-semibold">Result</th>
                  <th className="px-4 py-3 font-semibold">Formula</th>
                  <th className="px-4 py-3 font-semibold">Numerator &amp; Denominator</th>
                  <th className="px-5 py-3 font-semibold">Source Statement</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {activeRatioEvals.map((ev) => {
                  const catLabel =
                    RATIO_CATEGORY_LABELS.find((c) => c.id === ev.category)?.label ??
                    ev.category;
                  return (
                    <tr key={ev.id} className="hover:bg-slate-50/60 align-top">
                      <td className="px-5 py-3 text-slate-500 whitespace-nowrap">
                        {catLabel}
                      </td>
                      <td className="px-4 py-3 font-semibold text-[#0B192C] whitespace-nowrap">
                        {ev.name}
                      </td>
                      <td
                        className={`px-4 py-3 text-right font-mono font-semibold tabular-nums whitespace-nowrap ${
                          ev.status === 'valid' ? 'text-[#0B192C]' : 'text-amber-700'
                        }`}
                      >
                        {ev.formattedValue}
                      </td>
                      <td className="px-4 py-3 font-mono text-[11px] text-slate-700">
                        {ev.formula}
                      </td>
                      <td className="px-4 py-3 text-[11px] text-slate-600">
                        {ev.status === 'valid' ? (
                          <div className="space-y-0.5">
                            <div>
                              {ev.numeratorLabel}:{' '}
                              <span className="font-mono text-[#0B192C] tabular-nums">
                                {ev.numeratorValueText}
                              </span>
                            </div>
                            <div>
                              {ev.denominatorLabel}:{' '}
                              <span className="font-mono text-[#0B192C] tabular-nums">
                                {ev.denominatorValueText}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <span className="text-amber-700">
                            {ev.statusReason ?? 'Missing required inputs'}
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-slate-500 whitespace-nowrap">
                        {ev.sourceStatement}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  );
};
