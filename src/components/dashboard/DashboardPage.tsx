import React, { useMemo, useState } from 'react';
import {
  ArcElement,
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
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { ArrowRight, Info, Search } from 'lucide-react';
import { ILLUSTRATIVE_CARRIERS, NAVIGATION_ITEMS } from '../../data/illustrativeData';
import { AnnualFinancialRow, PageId } from '../../types/analytics';
import {
  formatCurrencyB,
  formatSignedCurrencyB,
  getCurrentRatio,
  getDebtToEquityRatio,
  getFreeCashFlow,
  getNetIncome,
  getOperatingMarginPct,
  getOperatingProfit,
  getPreTaxIncome,
} from '../../utils/accounting';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface DashboardPageProps {
  onNavigate: (page: PageId) => void;
  onOpenMethodology: () => void;
}

type CarrierScope = 'carrier-a' | 'carrier-b' | 'compare';
type TrajectoryMetric = 'revenue-profit' | 'margin' | 'fcf';

const COST_COLORS = [
  '#0B192C',
  '#1E40AF',
  '#0284C7',
  '#475569',
  '#94A3B8',
  '#CBD5E1',
];

function formatRevenueYoY(
  current: AnnualFinancialRow,
  prev: AnnualFinancialRow | null
): string {
  if (!prev) return 'Baseline year · No prior period';
  const absDiff = current.operatingRevenueUsdB - prev.operatingRevenueUsdB;
  const absStr = formatSignedCurrencyB(absDiff);
  if (prev.operatingRevenueUsdB <= 0) {
    return `${absStr} vs ${prev.fiscalYear}`;
  }
  const pctDiff = (absDiff / Math.abs(prev.operatingRevenueUsdB)) * 100;
  const pctSign = pctDiff > 0 ? '+' : '';
  return `${absStr} (${pctSign}${pctDiff.toFixed(1)}%) vs ${prev.fiscalYear}`;
}

function formatMarginYoY(
  currentMargin: number | null,
  prevMargin: number | null,
  prevYearLabel: string | null
): string {
  if (currentMargin === null) return 'Insufficient revenue input';
  if (!prevYearLabel || prevMargin === null) return 'Baseline year · No prior period';
  const ppDiff = currentMargin - prevMargin;
  const sign = ppDiff > 0 ? '+' : '';
  return `${sign}${ppDiff.toFixed(1)} pp vs ${prevYearLabel}`;
}

function formatDebtToEquityYoY(
  currentRatio: number | null,
  prevRatio: number | null,
  prevYearLabel: string | null
): string {
  if (currentRatio === null) return 'Underlying debt or equity unsupported';
  if (!prevYearLabel || prevRatio === null) return 'Baseline year · No prior period';
  const diff = currentRatio - prevRatio;
  const sign = diff > 0 ? '+' : '';
  return `${sign}${diff.toFixed(2)}x vs ${prevYearLabel}`;
}

function formatFcfYoY(
  currentFcf: number | null,
  prevFcf: number | null,
  prevYearLabel: string | null
): string {
  if (currentFcf === null) return 'Missing OCF or CapEx input';
  if (!prevYearLabel || prevFcf === null) return 'Baseline year · No prior period';
  const diff = currentFcf - prevFcf;
  return `${formatSignedCurrencyB(diff)} vs ${prevYearLabel}`;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onNavigate,
  onOpenMethodology,
}) => {
  const [carrierScope, setCarrierScope] = useState<CarrierScope>('carrier-a');
  const [selectedYear, setSelectedYear] = useState<string>('FY 2024');
  const [trajectoryMetric, setTrajectoryMetric] =
    useState<TrajectoryMetric>('revenue-profit');
  const [tableFilter, setTableFilter] = useState<string>('');

  const carrierA = ILLUSTRATIVE_CARRIERS[0];
  const carrierB = ILLUSTRATIVE_CARRIERS[1];

  const activeCarrier = useMemo(() => {
    return carrierScope === 'carrier-b' ? carrierB : carrierA;
  }, [carrierScope, carrierA, carrierB]);

  const fiscalYears = useMemo(
    () => carrierA.annualSeries.map((row) => row.fiscalYear),
    [carrierA]
  );

  const selectedYearIndex = useMemo(() => {
    const idx = fiscalYears.indexOf(selectedYear);
    return idx >= 0 ? idx : fiscalYears.length - 1;
  }, [fiscalYears, selectedYear]);

  const currentRow = activeCarrier.annualSeries[selectedYearIndex];
  const previousRow =
    selectedYearIndex > 0 ? activeCarrier.annualSeries[selectedYearIndex - 1] : null;

  const compareRowA = carrierA.annualSeries[selectedYearIndex];
  const comparePrevA =
    selectedYearIndex > 0 ? carrierA.annualSeries[selectedYearIndex - 1] : null;
  const compareRowB = carrierB.annualSeries[selectedYearIndex];
  const comparePrevB =
    selectedYearIndex > 0 ? carrierB.annualSeries[selectedYearIndex - 1] : null;

  // Derived KPI metrics for single-carrier mode
  const currentOpProfit = getOperatingProfit(currentRow);
  const currentMargin = getOperatingMarginPct(currentRow);
  const prevMargin = previousRow ? getOperatingMarginPct(previousRow) : null;

  const currentDeRatio = getDebtToEquityRatio(currentRow);
  const prevDeRatio = previousRow ? getDebtToEquityRatio(previousRow) : null;

  const currentFcf = getFreeCashFlow(currentRow);
  const prevFcf = previousRow ? getFreeCashFlow(previousRow) : null;

  // Derived KPI metrics for comparison mode
  const compareMarginA = getOperatingMarginPct(compareRowA);
  const compareMarginB = getOperatingMarginPct(compareRowB);
  const compareDeA = getDebtToEquityRatio(compareRowA);
  const compareDeB = getDebtToEquityRatio(compareRowB);
  const compareFcfA = getFreeCashFlow(compareRowA);
  const compareFcfB = getFreeCashFlow(compareRowB);

  // Chart 1: 5-Year Trajectory Data (computed dynamically from underlying series)
  const trajectoryData = useMemo(() => {
    if (carrierScope === 'compare') {
      if (trajectoryMetric === 'revenue-profit') {
        return {
          labels: fiscalYears,
          datasets: [
            {
              label: 'Carrier A Revenue ($B · Illustrative)',
              data: carrierA.annualSeries.map((r) => r.operatingRevenueUsdB),
              backgroundColor: '#0B192C',
              borderRadius: 4,
            },
            {
              label: 'Carrier B Revenue ($B · Illustrative)',
              data: carrierB.annualSeries.map((r) => r.operatingRevenueUsdB),
              backgroundColor: '#0284C7',
              borderRadius: 4,
            },
            {
              label: 'Carrier A Operating Profit ($B · Illustrative)',
              data: carrierA.annualSeries.map((r) => getOperatingProfit(r)),
              backgroundColor: '#475569',
              borderRadius: 4,
            },
            {
              label: 'Carrier B Operating Profit ($B · Illustrative)',
              data: carrierB.annualSeries.map((r) => getOperatingProfit(r)),
              backgroundColor: '#38BDF8',
              borderRadius: 4,
            },
          ],
        };
      }
      if (trajectoryMetric === 'margin') {
        return {
          labels: fiscalYears,
          datasets: [
            {
              label: 'Carrier A Operating Margin (% · Illustrative)',
              data: carrierA.annualSeries.map((r) => {
                const m = getOperatingMarginPct(r);
                return m !== null ? Number(m.toFixed(1)) : 0;
              }),
              borderColor: '#0B192C',
              backgroundColor: 'rgba(11, 25, 44, 0.08)',
              tension: 0.25,
              fill: false,
              pointRadius: 4,
              pointBackgroundColor: '#0B192C',
            },
            {
              label: 'Carrier B Operating Margin (% · Illustrative)',
              data: carrierB.annualSeries.map((r) => {
                const m = getOperatingMarginPct(r);
                return m !== null ? Number(m.toFixed(1)) : 0;
              }),
              borderColor: '#0284C7',
              backgroundColor: 'rgba(2, 132, 199, 0.08)',
              tension: 0.25,
              fill: false,
              pointRadius: 4,
              pointBackgroundColor: '#0284C7',
            },
          ],
        };
      }
      return {
        labels: fiscalYears,
        datasets: [
          {
            label: 'Carrier A Free Cash Flow ($B · Illustrative)',
            data: carrierA.annualSeries.map((r) => getFreeCashFlow(r) ?? 0),
            backgroundColor: '#0B192C',
            borderRadius: 4,
          },
          {
            label: 'Carrier B Free Cash Flow ($B · Illustrative)',
            data: carrierB.annualSeries.map((r) => getFreeCashFlow(r) ?? 0),
            backgroundColor: '#0284C7',
            borderRadius: 4,
          },
        ],
      };
    }

    // Single carrier view
    if (trajectoryMetric === 'revenue-profit') {
      return {
        labels: fiscalYears,
        datasets: [
          {
            label: 'Operating Revenue ($B · Illustrative)',
            data: activeCarrier.annualSeries.map((r) => r.operatingRevenueUsdB),
            backgroundColor: '#0B192C',
            borderRadius: 4,
          },
          {
            label: 'Operating Profit / Loss ($B · Illustrative)',
            data: activeCarrier.annualSeries.map((r) => getOperatingProfit(r)),
            backgroundColor: '#0284C7',
            borderRadius: 4,
          },
        ],
      };
    }

    if (trajectoryMetric === 'margin') {
      return {
        labels: fiscalYears,
        datasets: [
          {
            label: 'Operating Margin (% · Illustrative)',
            data: activeCarrier.annualSeries.map((r) => {
              const m = getOperatingMarginPct(r);
              return m !== null ? Number(m.toFixed(1)) : 0;
            }),
            borderColor: '#0B192C',
            backgroundColor: 'rgba(2, 132, 199, 0.1)',
            tension: 0.25,
            fill: true,
            pointRadius: 4,
            pointBackgroundColor: '#0B192C',
          },
        ],
      };
    }

    return {
      labels: fiscalYears,
      datasets: [
        {
          label: 'Free Cash Flow ($B · Illustrative)',
          data: activeCarrier.annualSeries.map((r) => getFreeCashFlow(r) ?? 0),
          backgroundColor: activeCarrier.annualSeries.map((r) =>
            (getFreeCashFlow(r) ?? 0) >= 0 ? '#0B192C' : '#94A3B8'
          ),
          borderRadius: 4,
        },
      ],
    };
  }, [carrierScope, trajectoryMetric, fiscalYears, carrierA, carrierB, activeCarrier]);

  const barChartOptions: ChartOptions<'bar'> = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            boxWidth: 12,
            usePointStyle: false,
            color: '#334155',
            font: { family: 'DM Sans, sans-serif', size: 12 },
          },
        },
        tooltip: {
          backgroundColor: '#0B192C',
          titleFont: { family: 'Plus Jakarta Sans, sans-serif', size: 12 },
          bodyFont: { family: 'IBM Plex Mono, monospace', size: 12 },
          padding: 10,
        },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: {
            color: '#475569',
            font: { family: 'IBM Plex Mono, monospace', size: 11 },
          },
        },
        y: {
          grid: { color: 'rgba(148, 163, 184, 0.22)' },
          ticks: {
            color: '#475569',
            font: { family: 'IBM Plex Mono, monospace', size: 11 },
            callback: (val) => `$${val}B`,
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
          position: 'bottom',
          labels: {
            boxWidth: 12,
            color: '#334155',
            font: { family: 'DM Sans, sans-serif', size: 12 },
          },
        },
        tooltip: {
          backgroundColor: '#0B192C',
          titleFont: { family: 'Plus Jakarta Sans, sans-serif', size: 12 },
          bodyFont: { family: 'IBM Plex Mono, monospace', size: 12 },
          padding: 10,
          callbacks: {
            label: (ctx) => `${ctx.dataset.label}: ${ctx.parsed.y}%`,
          },
        },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: {
            color: '#475569',
            font: { family: 'IBM Plex Mono, monospace', size: 11 },
          },
        },
        y: {
          grid: { color: 'rgba(148, 163, 184, 0.22)' },
          ticks: {
            color: '#475569',
            font: { family: 'IBM Plex Mono, monospace', size: 11 },
            callback: (val) => `${val}%`,
          },
        },
      },
    }),
    []
  );

  // Chart 2: Cost Structure Breakdown (Single carrier Doughnut or Compare A vs B grouped horizontal Bar)
  const costChartData = useMemo(() => {
    const targetCarrier = carrierScope === 'carrier-b' ? carrierB : carrierA;
    return {
      labels: targetCarrier.costStructurePct.map((item) => item.category),
      datasets: [
        {
          data: targetCarrier.costStructurePct.map((item) => item.sharePct),
          backgroundColor: COST_COLORS,
          borderColor: '#FFFFFF',
          borderWidth: 2,
        },
      ],
    };
  }, [carrierScope, carrierA, carrierB]);

  const compareCostChartData = useMemo(
    () => ({
      labels: carrierA.costStructurePct.map((item) =>
        item.category.replace('Salaries, Wages & Benefits', 'Labor & Benefits')
      ),
      datasets: [
        {
          label: 'Carrier A (% · Illustrative)',
          data: carrierA.costStructurePct.map((item) => item.sharePct),
          backgroundColor: '#0B192C',
          borderRadius: 3,
        },
        {
          label: 'Carrier B (% · Illustrative)',
          data: carrierB.costStructurePct.map((item) => item.sharePct),
          backgroundColor: '#0284C7',
          borderRadius: 3,
        },
      ],
    }),
    [carrierA, carrierB]
  );

  const compareCostOptions: ChartOptions<'bar'> = useMemo(
    () => ({
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            boxWidth: 10,
            color: '#334155',
            font: { family: 'DM Sans, sans-serif', size: 11 },
          },
        },
        tooltip: {
          backgroundColor: '#0B192C',
          bodyFont: { family: 'IBM Plex Mono, monospace', size: 11 },
          callbacks: {
            label: (ctx) => `${ctx.dataset.label}: ${ctx.parsed.x}%`,
          },
        },
      },
      scales: {
        x: {
          grid: { color: 'rgba(148, 163, 184, 0.22)' },
          ticks: {
            color: '#475569',
            font: { family: 'IBM Plex Mono, monospace', size: 10 },
            callback: (val) => `${val}%`,
          },
        },
        y: {
          grid: { display: false },
          ticks: {
            color: '#334155',
            font: { family: 'DM Sans, sans-serif', size: 10 },
          },
        },
      },
    }),
    []
  );

  const doughnutOptions: ChartOptions<'doughnut'> = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      cutout: '64%',
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#0B192C',
          bodyFont: { family: 'IBM Plex Mono, monospace', size: 12 },
          callbacks: {
            label: (ctx) => `${ctx.label}: ${ctx.parsed}% (Illustrative)`,
          },
        },
      },
    }),
    []
  );

  // Table rows for 5-year reconciled financial summary (independent of KPI Focus Year)
  const buildCarrierRowValues = (
    extractor: (row: AnnualFinancialRow) => string
  ): { a: string[]; b: string[] } => ({
    a: carrierA.annualSeries.map(extractor),
    b: carrierB.annualSeries.map(extractor),
  });

  const summaryRows = useMemo(() => {
    const formatMarginCell = (r: AnnualFinancialRow) => {
      const m = getOperatingMarginPct(r);
      return m !== null ? `${m.toFixed(1)}%` : 'N/A';
    };
    const formatDeCell = (r: AnnualFinancialRow) => {
      const de = getDebtToEquityRatio(r);
      return de !== null ? `${de.toFixed(2)}x` : 'N/A';
    };
    const formatCrCell = (r: AnnualFinancialRow) => {
      const cr = getCurrentRatio(r);
      return cr !== null ? `${cr.toFixed(2)}x` : 'N/A';
    };

    const allRows: {
      label: string;
      formulaNote?: string;
      isCoreComparison?: boolean;
      carrierAValues: string[];
      carrierBValues: string[];
    }[] = [
      {
        label: 'Operating Revenue ($B)',
        isCoreComparison: true,
        ...(() => {
          const v = buildCarrierRowValues((r) => formatCurrencyB(r.operatingRevenueUsdB));
          return { carrierAValues: v.a, carrierBValues: v.b };
        })(),
      },
      {
        label: 'Operating Expenses ($B)',
        isCoreComparison: true,
        ...(() => {
          const v = buildCarrierRowValues((r) => formatCurrencyB(r.operatingExpensesUsdB));
          return { carrierAValues: v.a, carrierBValues: v.b };
        })(),
      },
      {
        label: 'Operating Profit / Loss ($B)',
        formulaNote: 'Operating Revenue − Operating Expenses',
        isCoreComparison: true,
        ...(() => {
          const v = buildCarrierRowValues((r) => formatCurrencyB(getOperatingProfit(r)));
          return { carrierAValues: v.a, carrierBValues: v.b };
        })(),
      },
      {
        label: 'Operating Margin (%)',
        formulaNote: 'Operating Profit ÷ Operating Revenue × 100',
        isCoreComparison: true,
        ...(() => {
          const v = buildCarrierRowValues(formatMarginCell);
          return { carrierAValues: v.a, carrierBValues: v.b };
        })(),
      },
      {
        label: 'Non-Operating Income / (Expense), Net ($B)',
        ...(() => {
          const v = buildCarrierRowValues((r) => formatCurrencyB(r.nonOperatingNetUsdB));
          return { carrierAValues: v.a, carrierBValues: v.b };
        })(),
      },
      {
        label: 'Finance Costs ($B)',
        ...(() => {
          const v = buildCarrierRowValues((r) => formatCurrencyB(r.financeCostsUsdB));
          return { carrierAValues: v.a, carrierBValues: v.b };
        })(),
      },
      {
        label: 'Pre-Tax Income / Loss ($B)',
        formulaNote: 'Operating Profit + Non-Operating Net − Finance Costs',
        ...(() => {
          const v = buildCarrierRowValues((r) => formatCurrencyB(getPreTaxIncome(r)));
          return { carrierAValues: v.a, carrierBValues: v.b };
        })(),
      },
      {
        label: 'Income Tax Expense / (Benefit) ($B)',
        ...(() => {
          const v = buildCarrierRowValues((r) => formatCurrencyB(r.incomeTaxExpenseUsdB));
          return { carrierAValues: v.a, carrierBValues: v.b };
        })(),
      },
      {
        label: 'Net Income / Loss ($B)',
        formulaNote: 'Pre-Tax Income − Income Tax Expense / (Benefit)',
        ...(() => {
          const v = buildCarrierRowValues((r) => formatCurrencyB(getNetIncome(r)));
          return { carrierAValues: v.a, carrierBValues: v.b };
        })(),
      },
      {
        label: 'Current Assets ($B)',
        ...(() => {
          const v = buildCarrierRowValues((r) =>
            formatCurrencyB(r.currentAssetsUsdB ?? null)
          );
          return { carrierAValues: v.a, carrierBValues: v.b };
        })(),
      },
      {
        label: 'Total Assets ($B)',
        ...(() => {
          const v = buildCarrierRowValues((r) => formatCurrencyB(r.totalAssetsUsdB));
          return { carrierAValues: v.a, carrierBValues: v.b };
        })(),
      },
      {
        label: 'Current Liabilities ($B)',
        ...(() => {
          const v = buildCarrierRowValues((r) =>
            formatCurrencyB(r.currentLiabilitiesUsdB ?? null)
          );
          return { carrierAValues: v.a, carrierBValues: v.b };
        })(),
      },
      {
        label: 'Total Liabilities ($B)',
        ...(() => {
          const v = buildCarrierRowValues((r) => formatCurrencyB(r.totalLiabilitiesUsdB));
          return { carrierAValues: v.a, carrierBValues: v.b };
        })(),
      },
      {
        label: 'Total Interest-Bearing Debt ($B)',
        ...(() => {
          const v = buildCarrierRowValues((r) =>
            formatCurrencyB(r.totalInterestBearingDebtUsdB ?? null)
          );
          return { carrierAValues: v.a, carrierBValues: v.b };
        })(),
      },
      {
        label: "Shareholders' Equity ($B)",
        ...(() => {
          const v = buildCarrierRowValues((r) =>
            formatCurrencyB(r.shareholdersEquityUsdB)
          );
          return { carrierAValues: v.a, carrierBValues: v.b };
        })(),
      },
      {
        label: 'Operating Cash Flow ($B)',
        ...(() => {
          const v = buildCarrierRowValues((r) =>
            formatCurrencyB(r.operatingCashFlowUsdB ?? null)
          );
          return { carrierAValues: v.a, carrierBValues: v.b };
        })(),
      },
      {
        label: 'Capital Expenditures ($B)',
        ...(() => {
          const v = buildCarrierRowValues((r) =>
            formatCurrencyB(r.capitalExpendituresUsdB ?? null)
          );
          return { carrierAValues: v.a, carrierBValues: v.b };
        })(),
      },
      {
        label: 'Free Cash Flow ($B)',
        formulaNote: 'Operating Cash Flow − Capital Expenditures',
        ...(() => {
          const v = buildCarrierRowValues((r) => formatCurrencyB(getFreeCashFlow(r)));
          return { carrierAValues: v.a, carrierBValues: v.b };
        })(),
      },
      {
        label: 'Debt-to-Equity Ratio (x)',
        formulaNote: "Total Interest-Bearing Debt ÷ Shareholders' Equity",
        ...(() => {
          const v = buildCarrierRowValues(formatDeCell);
          return { carrierAValues: v.a, carrierBValues: v.b };
        })(),
      },
      {
        label: 'Current Ratio (x)',
        formulaNote: 'Current Assets ÷ Current Liabilities',
        ...(() => {
          const v = buildCarrierRowValues(formatCrCell);
          return { carrierAValues: v.a, carrierBValues: v.b };
        })(),
      },
    ];

    if (!tableFilter.trim()) return allRows;
    const q = tableFilter.toLowerCase();
    return allRows.filter(
      (r) =>
        r.label.toLowerCase().includes(q) ||
        (r.formulaNote && r.formulaNote.toLowerCase().includes(q))
    );
  }, [carrierA, carrierB, tableFilter]);

  const costItems = (carrierScope === 'carrier-b' ? carrierB : carrierA).costStructurePct;

  const upcomingModules = NAVIGATION_ITEMS.filter((item) => item.id !== 'dashboard');

  return (
    <div className="space-y-6">
      {/* Page Title & Illustrative Data Notice */}
      <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-medium text-slate-500">
            Stage 1 Foundation · Executive Financial Overview
          </p>
          <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-[#0B192C] sm:text-3xl">
            Airline Financial Performance Dashboard
          </h1>
        </div>

        <div className="text-xs text-slate-500 flex flex-wrap items-center gap-2">
          <span>5-Year Analytical Horizon</span>
          <span aria-hidden="true">·</span>
          <span className="font-mono">FY 2020 – FY 2024</span>
          <span aria-hidden="true">·</span>
          <span>Illustrative Layout Mode</span>
        </div>
      </section>

      {/* Transparent Illustrative Data Notice (Clean hairline border, no border-l-4) */}
      <section
        aria-label="Illustrative Data Disclaimer"
        className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="flex items-start gap-3">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-[#1E3A5F]" />
          <div className="text-xs leading-relaxed text-slate-600">
            <span className="font-semibold text-[#0B192C]">
              Illustrative Sample Figures Only:
            </span>{' '}
            All numbers displayed below are reconciled placeholder sample figures used to verify
            accounting formulas, layout geometry, and Chart.js visualizations. Actual airline
            analysis will use verified annual reports and published financial statements in
            subsequent stages.
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

      {/* Interactive Scope & Fiscal Period Toolbar */}
      <section
        aria-label="Dashboard Scope Controls"
        className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 xl:flex-row xl:items-center xl:justify-between"
      >
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-1 text-xs font-medium text-slate-500">Dataset Scope:</span>
          <div className="inline-flex flex-wrap items-center gap-1 rounded-lg bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => setCarrierScope('carrier-a')}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
                carrierScope === 'carrier-a'
                  ? 'bg-white text-[#0B192C] shadow-sm'
                  : 'text-slate-600 hover:text-[#0B192C]'
              }`}
            >
              Carrier A (Legacy)
            </button>
            <button
              type="button"
              onClick={() => setCarrierScope('carrier-b')}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
                carrierScope === 'carrier-b'
                  ? 'bg-white text-[#0B192C] shadow-sm'
                  : 'text-slate-600 hover:text-[#0B192C]'
              }`}
            >
              Carrier B (Low-Cost)
            </button>
            <button
              type="button"
              onClick={() => setCarrierScope('compare')}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
                carrierScope === 'compare'
                  ? 'bg-white text-[#0B192C] shadow-sm'
                  : 'text-slate-600 hover:text-[#0B192C]'
              }`}
            >
              Compare A vs. B
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-1 text-xs font-medium text-slate-500">KPI Focus Year:</span>
          <div className="inline-flex flex-wrap items-center gap-1 rounded-lg bg-slate-100 p-1">
            {fiscalYears.map((yr) => (
              <button
                key={yr}
                type="button"
                onClick={() => setSelectedYear(yr)}
                className={`rounded-md px-2.5 py-1.5 font-mono text-xs font-medium transition-colors whitespace-nowrap ${
                  selectedYear === yr
                    ? 'bg-[#0B192C] text-white'
                    : 'text-slate-600 hover:text-[#0B192C]'
                }`}
              >
                {yr}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 4-Column KPI Summary Strip */}
      <section
        aria-label="Key Financial Indicators"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        {/* KPI 1: Operating Revenue */}
        <article className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5">
          <div>
            <p className="text-xs font-medium text-slate-500">
              Operating Revenue · {selectedYear}
            </p>
            {carrierScope === 'compare' ? (
              <div className="mt-2 space-y-2">
                <div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs text-slate-600">Carrier A</span>
                    <span className="font-mono text-xl font-semibold text-[#0B192C] tabular-nums">
                      {formatCurrencyB(compareRowA.operatingRevenueUsdB)}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 tabular-nums text-right">
                    {formatRevenueYoY(compareRowA, comparePrevA)}
                  </p>
                </div>
                <div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs text-slate-600">Carrier B</span>
                    <span className="font-mono text-xl font-semibold text-[#0284C7] tabular-nums">
                      {formatCurrencyB(compareRowB.operatingRevenueUsdB)}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 tabular-nums text-right">
                    {formatRevenueYoY(compareRowB, comparePrevB)}
                  </p>
                </div>
              </div>
            ) : (
              <>
                <p className="mt-2 font-mono text-3xl font-semibold tracking-tight text-[#0B192C] tabular-nums">
                  {formatCurrencyB(currentRow.operatingRevenueUsdB)}
                </p>
                <p className="mt-2 text-xs text-slate-600 tabular-nums">
                  {formatRevenueYoY(currentRow, previousRow)}
                </p>
                <p className="mt-1 text-[11px] text-slate-400 tabular-nums">
                  Reported top-line operating revenue
                </p>
              </>
            )}
          </div>
          <p className="mt-3 border-t border-slate-100 pt-2 text-[11px] text-slate-400">
            Illustrative Sample Data
          </p>
        </article>

        {/* KPI 2: Operating Margin */}
        <article className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5">
          <div>
            <p className="text-xs font-medium text-slate-500">
              Operating Margin · {selectedYear}
            </p>
            {carrierScope === 'compare' ? (
              <div className="mt-2 space-y-2">
                <div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs text-slate-600">Carrier A</span>
                    <span className="font-mono text-xl font-semibold text-[#0B192C] tabular-nums">
                      {compareMarginA !== null ? `${compareMarginA.toFixed(1)}%` : 'N/A'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 tabular-nums text-right">
                    {formatMarginYoY(
                      compareMarginA,
                      comparePrevA ? getOperatingMarginPct(comparePrevA) : null,
                      comparePrevA ? comparePrevA.fiscalYear : null
                    )}
                  </p>
                </div>
                <div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs text-slate-600">Carrier B</span>
                    <span className="font-mono text-xl font-semibold text-[#0284C7] tabular-nums">
                      {compareMarginB !== null ? `${compareMarginB.toFixed(1)}%` : 'N/A'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 tabular-nums text-right">
                    {formatMarginYoY(
                      compareMarginB,
                      comparePrevB ? getOperatingMarginPct(comparePrevB) : null,
                      comparePrevB ? comparePrevB.fiscalYear : null
                    )}
                  </p>
                </div>
              </div>
            ) : (
              <>
                <p
                  className={`mt-2 font-mono text-3xl font-semibold tracking-tight tabular-nums ${
                    currentMargin === null
                      ? 'text-slate-400'
                      : currentMargin >= 0
                      ? 'text-[#0B192C]'
                      : 'text-[#DC2626]'
                  }`}
                >
                  {currentMargin !== null ? `${currentMargin.toFixed(1)}%` : 'N/A'}
                </p>
                <p className="mt-2 text-xs text-slate-600 tabular-nums">
                  {formatMarginYoY(
                    currentMargin,
                    prevMargin,
                    previousRow ? previousRow.fiscalYear : null
                  )}
                </p>
                <p className="mt-1 text-[11px] text-slate-400 font-mono tabular-nums">
                  Op. Profit ÷ Revenue ({formatCurrencyB(currentOpProfit)} ÷{' '}
                  {formatCurrencyB(currentRow.operatingRevenueUsdB)})
                </p>
              </>
            )}
          </div>
          <p className="mt-3 border-t border-slate-100 pt-2 text-[11px] text-slate-400">
            Formula: Operating Profit ÷ Operating Revenue × 100 · Illustrative
          </p>
        </article>

        {/* KPI 3: Debt-to-Equity Ratio (Total Interest-Bearing Debt / Shareholders' Equity) */}
        <article className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5">
          <div>
            <p className="text-xs font-medium text-slate-500">
              Debt-to-Equity Ratio · {selectedYear}
            </p>
            {carrierScope === 'compare' ? (
              <div className="mt-2 space-y-2">
                <div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs text-slate-600">Carrier A</span>
                    <span className="font-mono text-xl font-semibold text-[#0B192C] tabular-nums">
                      {compareDeA !== null ? `${compareDeA.toFixed(2)}x` : 'N/A'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-mono tabular-nums text-right">
                    {formatCurrencyB(compareRowA.totalInterestBearingDebtUsdB ?? null)} ÷{' '}
                    {formatCurrencyB(compareRowA.shareholdersEquityUsdB)}
                  </p>
                </div>
                <div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs text-slate-600">Carrier B</span>
                    <span className="font-mono text-xl font-semibold text-[#0284C7] tabular-nums">
                      {compareDeB !== null ? `${compareDeB.toFixed(2)}x` : 'N/A'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-mono tabular-nums text-right">
                    {formatCurrencyB(compareRowB.totalInterestBearingDebtUsdB ?? null)} ÷{' '}
                    {formatCurrencyB(compareRowB.shareholdersEquityUsdB)}
                  </p>
                </div>
              </div>
            ) : (
              <>
                <p className="mt-2 font-mono text-3xl font-semibold tracking-tight text-[#0B192C] tabular-nums">
                  {currentDeRatio !== null ? `${currentDeRatio.toFixed(2)}x` : 'N/A'}
                </p>
                <p className="mt-2 text-xs text-slate-600 tabular-nums">
                  {formatDebtToEquityYoY(
                    currentDeRatio,
                    prevDeRatio,
                    previousRow ? previousRow.fiscalYear : null
                  )}
                </p>
                <p className="mt-1 text-[11px] text-slate-400 font-mono tabular-nums">
                  {currentDeRatio !== null
                    ? `Debt ${formatCurrencyB(
                        currentRow.totalInterestBearingDebtUsdB ?? null
                      )} ÷ Equity ${formatCurrencyB(currentRow.shareholdersEquityUsdB)}`
                    : 'Requires Total Debt & positive Equity'}
                </p>
              </>
            )}
          </div>
          <p className="mt-3 border-t border-slate-100 pt-2 text-[11px] text-slate-400">
            Total Interest-Bearing Debt ÷ Shareholders&apos; Equity · Illustrative
          </p>
        </article>

        {/* KPI 4: Free Cash Flow (Operating Cash Flow - Capital Expenditures) */}
        <article className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5">
          <div>
            <p className="text-xs font-medium text-slate-500">
              Free Cash Flow · {selectedYear}
            </p>
            {carrierScope === 'compare' ? (
              <div className="mt-2 space-y-2">
                <div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs text-slate-600">Carrier A</span>
                    <span className="font-mono text-xl font-semibold text-[#0B192C] tabular-nums">
                      {formatCurrencyB(compareFcfA)}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-mono tabular-nums text-right">
                    {compareFcfA !== null
                      ? `OCF ${formatCurrencyB(
                          compareRowA.operatingCashFlowUsdB ?? null
                        )} − CapEx ${formatCurrencyB(
                          compareRowA.capitalExpendituresUsdB ?? null
                        )}`
                      : 'Inputs missing'}
                  </p>
                </div>
                <div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs text-slate-600">Carrier B</span>
                    <span className="font-mono text-xl font-semibold text-[#0284C7] tabular-nums">
                      {formatCurrencyB(compareFcfB)}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-mono tabular-nums text-right">
                    {compareFcfB !== null
                      ? `OCF ${formatCurrencyB(
                          compareRowB.operatingCashFlowUsdB ?? null
                        )} − CapEx ${formatCurrencyB(
                          compareRowB.capitalExpendituresUsdB ?? null
                        )}`
                      : 'Inputs missing'}
                  </p>
                </div>
              </div>
            ) : (
              <>
                <p
                  className={`mt-2 font-mono text-3xl font-semibold tracking-tight tabular-nums ${
                    currentFcf === null
                      ? 'text-slate-400'
                      : currentFcf >= 0
                      ? 'text-[#0B192C]'
                      : 'text-[#DC2626]'
                  }`}
                >
                  {formatCurrencyB(currentFcf)}
                </p>
                <p className="mt-2 text-xs text-slate-600 tabular-nums">
                  {formatFcfYoY(
                    currentFcf,
                    prevFcf,
                    previousRow ? previousRow.fiscalYear : null
                  )}
                </p>
                <p className="mt-1 text-[11px] text-slate-400 font-mono tabular-nums">
                  {currentFcf !== null
                    ? `OCF ${formatCurrencyB(
                        currentRow.operatingCashFlowUsdB ?? null
                      )} − CapEx ${formatCurrencyB(
                        currentRow.capitalExpendituresUsdB ?? null
                      )}`
                    : 'Requires OCF & CapEx inputs'}
                </p>
              </>
            )}
          </div>
          <p className="mt-3 border-t border-slate-100 pt-2 text-[11px] text-slate-400">
            Operating Cash Flow − Capital Expenditures · Illustrative
          </p>
        </article>
      </section>

      {/* Primary Chart.js Analytics Grid */}
      <section className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        {/* Left: 5-Year Trajectory Chart (7 cols) */}
        <article className="flex flex-col rounded-xl border border-slate-200 bg-white p-5 xl:col-span-7">
          <div className="flex flex-col gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-display text-base font-semibold text-[#0B192C]">
                5-Year Financial Performance Trajectory
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {carrierScope === 'compare'
                  ? 'Carrier A vs. Carrier B · Illustrative Multi-Year Chart.js Series'
                  : `${activeCarrier.name} · Chart.js Interactive View`}
              </p>
            </div>

            <div className="inline-flex items-center gap-1 rounded-lg bg-slate-100 p-1 self-start">
              <button
                type="button"
                onClick={() => setTrajectoryMetric('revenue-profit')}
                className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors whitespace-nowrap ${
                  trajectoryMetric === 'revenue-profit'
                    ? 'bg-white text-[#0B192C] shadow-sm'
                    : 'text-slate-600 hover:text-[#0B192C]'
                }`}
              >
                Revenue & Profit
              </button>
              <button
                type="button"
                onClick={() => setTrajectoryMetric('margin')}
                className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors whitespace-nowrap ${
                  trajectoryMetric === 'margin'
                    ? 'bg-white text-[#0B192C] shadow-sm'
                    : 'text-slate-600 hover:text-[#0B192C]'
                }`}
              >
                Margin %
              </button>
              <button
                type="button"
                onClick={() => setTrajectoryMetric('fcf')}
                className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors whitespace-nowrap ${
                  trajectoryMetric === 'fcf'
                    ? 'bg-white text-[#0B192C] shadow-sm'
                    : 'text-slate-600 hover:text-[#0B192C]'
                }`}
              >
                Cash Flow
              </button>
            </div>
          </div>

          <div className="mt-5 h-[310px] w-full">
            {trajectoryMetric === 'margin' ? (
              <Line
                key={`traj-line-${carrierScope}`}
                data={trajectoryData}
                options={lineChartOptions}
              />
            ) : (
              <Bar
                key={`traj-bar-${carrierScope}-${trajectoryMetric}`}
                data={trajectoryData}
                options={barChartOptions}
              />
            )}
          </div>
        </article>

        {/* Right: Aviation Operating Cost Structure (5 cols) */}
        <article className="flex flex-col rounded-xl border border-slate-200 bg-white p-5 xl:col-span-5">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="font-display text-base font-semibold text-[#0B192C]">
              Operating Cost Structure (Illustrative %)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {carrierScope === 'compare'
                ? 'Carrier A vs. Carrier B · Cost Share Comparison'
                : carrierScope === 'carrier-b'
                ? 'Carrier B · Low-Cost Point-to-Point Archetype'
                : 'Carrier A · Full-Service Network Archetype'}
            </p>
          </div>

          {carrierScope === 'compare' ? (
            <div className="mt-5 flex flex-1 flex-col justify-between gap-4">
              <div className="h-[220px] w-full">
                <Bar
                  key="cost-bar-compare"
                  data={compareCostChartData}
                  options={compareCostOptions}
                />
              </div>
              <div className="border-t border-slate-100 pt-3">
                <div className="grid grid-cols-12 pb-1.5 text-[11px] font-semibold text-slate-500">
                  <span className="col-span-8">Cost Category</span>
                  <span className="col-span-2 text-right font-mono text-[#0B192C]">A</span>
                  <span className="col-span-2 text-right font-mono text-[#0284C7]">B</span>
                </div>
                <div className="space-y-1">
                  {carrierA.costStructurePct.map((item, idx) => (
                    <div
                      key={item.category}
                      className="grid grid-cols-12 items-center text-xs"
                    >
                      <span className="col-span-8 truncate text-slate-700">
                        {item.category}
                      </span>
                      <span className="col-span-2 text-right font-mono text-[#0B192C] tabular-nums">
                        {item.sharePct.toFixed(1)}%
                      </span>
                      <span className="col-span-2 text-right font-mono text-[#0284C7] tabular-nums">
                        {carrierB.costStructurePct[idx].sharePct.toFixed(1)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-5 grid flex-1 grid-cols-1 items-center gap-5 sm:grid-cols-12">
              <div className="relative h-[220px] sm:col-span-5">
                <Doughnut
                  key={`cost-doughnut-${carrierScope}`}
                  data={costChartData}
                  options={doughnutOptions}
                />
              </div>

              <div className="space-y-2.5 sm:col-span-7">
                {costItems.map((item, idx) => (
                  <div
                    key={item.category}
                    className="flex items-center justify-between border-b border-slate-100 pb-1.5 text-xs last:border-b-0"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="h-2.5 w-2.5 shrink-0 rounded-xs"
                        style={{ backgroundColor: COST_COLORS[idx % COST_COLORS.length] }}
                        aria-hidden="true"
                      />
                      <span className="truncate text-slate-700">{item.category}</span>
                    </div>
                    <span className="ml-3 shrink-0 font-mono font-medium text-[#0B192C] tabular-nums">
                      {item.sharePct.toFixed(1)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </article>
      </section>

      {/* 5-Year Illustrative Financial Summary / Side-by-Side Comparison Table */}
      <section className="rounded-xl border border-slate-200 bg-white">
        <div className="flex flex-col gap-3 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-display text-base font-semibold text-[#0B192C]">
              {carrierScope === 'compare'
                ? '5-Year Side-by-Side Comparison: Carrier A vs. Carrier B'
                : '5-Year Illustrative Financial Summary & Reconciliation'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {carrierScope === 'compare'
                ? 'All five fiscal years (FY 2020 – FY 2024) · Reconciled illustrative figures side by side'
                : `${
                    carrierScope === 'carrier-b' ? carrierB.name : carrierA.name
                  } · All five fiscal years (FY 2020 – FY 2024) · Illustrative Sample Data`}
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={tableFilter}
              onChange={(e) => setTableFilter(e.target.value)}
              placeholder="Filter financial line items..."
              aria-label="Filter financial line items"
              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-8 pr-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-[#0B192C] focus:bg-white focus:outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          {carrierScope === 'compare' ? (
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 bg-slate-50 text-slate-600">
                <tr>
                  <th
                    rowSpan={2}
                    className="px-5 py-3 font-semibold align-bottom border-r border-slate-200"
                  >
                    Line Item / Indicator
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
                {summaryRows.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="px-5 py-8 text-center text-slate-500">
                      No financial line items match &quot;{tableFilter}&quot;.
                    </td>
                  </tr>
                ) : (
                  summaryRows.map((row) => (
                    <tr
                      key={row.label}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        row.isCoreComparison ? 'bg-slate-50/40' : ''
                      }`}
                    >
                      <td className="px-5 py-2.5 text-slate-800 border-r border-slate-100">
                        <div className="font-medium whitespace-nowrap">{row.label}</div>
                        {row.formulaNote && (
                          <div className="mt-0.5 font-mono text-[11px] text-slate-400">
                            {row.formulaNote}
                          </div>
                        )}
                      </td>
                      {fiscalYears.map((yr, idx) => (
                        <React.Fragment key={`${row.label}-${yr}`}>
                          <td className="px-2.5 py-2.5 text-right font-mono tabular-nums whitespace-nowrap align-top text-[#0B192C]">
                            {row.carrierAValues[idx]}
                          </td>
                          <td className="px-2.5 py-2.5 text-right font-mono tabular-nums whitespace-nowrap align-top text-[#0284C7] border-r border-slate-100 last:border-r-0">
                            {row.carrierBValues[idx]}
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
                  <th className="px-5 py-3 font-semibold">Line Item / Indicator</th>
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
                {summaryRows.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-8 text-center text-slate-500">
                      No financial line items match &quot;{tableFilter}&quot;.
                    </td>
                  </tr>
                ) : (
                  summaryRows.map((row) => {
                    const values =
                      carrierScope === 'carrier-b'
                        ? row.carrierBValues
                        : row.carrierAValues;
                    return (
                      <tr
                        key={row.label}
                        className="hover:bg-slate-50/80 transition-colors"
                      >
                        <td className="px-5 py-2.5 text-slate-800">
                          <div className="font-medium whitespace-nowrap">{row.label}</div>
                          {row.formulaNote && (
                            <div className="mt-0.5 font-mono text-[11px] text-slate-400">
                              {row.formulaNote}
                            </div>
                          )}
                        </td>
                        {values.map((val, idx) => (
                          <td
                            key={`${row.label}-${fiscalYears[idx]}`}
                            className="px-4 py-2.5 text-right font-mono tabular-nums whitespace-nowrap align-top text-slate-600"
                          >
                            {val}
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
      </section>

      {/* Platform Website Structure Quick Directory */}
      <section aria-label="Planned Platform Modules" className="space-y-3">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
          <h2 className="font-display text-base font-semibold text-[#0B192C]">
            Platform Architecture Directory
          </h2>
          <p className="text-xs text-slate-500">
            Click any module to inspect its planned purpose, components, and official data inputs
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {upcomingModules.map((mod) => (
            <button
              key={mod.id}
              type="button"
              onClick={() => onNavigate(mod.id)}
              className="group flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 text-left hover:border-[#1E3A5F] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0B192C]"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-display text-sm font-semibold text-[#0B192C]">
                    {mod.label}
                  </h3>
                  <span className="text-[11px] font-medium text-slate-400">
                    {mod.stageStatus}
                  </span>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-slate-600">
                  {mod.shortDescription}
                </p>
              </div>
              <div className="mt-4 flex items-center gap-1.5 text-xs font-medium text-[#1E3A5F] group-hover:text-[#0B192C]">
                <span>Inspect Module Blueprint</span>
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </div>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
};
