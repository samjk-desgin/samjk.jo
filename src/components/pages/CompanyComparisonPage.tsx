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
import { AlertCircle, ArrowLeft, GitCompare, Info } from 'lucide-react';
import { ILLUSTRATIVE_CARRIERS } from '../../data/illustrativeData';
import { AnnualFinancialRow } from '../../types/analytics';
import {
  evaluateRatio,
  formatCurrencyB,
  formatRatioValue,
  formatSignedCurrencyB,
  getFreeCashFlow,
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

interface CompanyComparisonPageProps {
  onReturnToDashboard: () => void;
  onOpenMethodology: () => void;
}

type ComparisonTabId = 'profitability' | 'capital-leverage' | 'cost-efficiency';
type SeriesScope = 'compare' | 'carrier-a' | 'carrier-b';
type SpreadDirection = 'a-minus-b' | 'b-minus-a';
type MetricKind = 'amount' | 'percentage' | 'ratio';

interface ComparisonMetricDef {
  id: string;
  tab: ComparisonTabId;
  label: string;
  kind: MetricKind;
  unitLabel: '$B' | '%' | 'x';
  formula: string;
  sourceStatement: string;
  getValue: (series: AnnualFinancialRow[], yearIndex: number) => number | null;
}

const COMPARISON_TABS: { id: ComparisonTabId; label: string }[] = [
  { id: 'profitability', label: 'Profitability Spread' },
  { id: 'capital-leverage', label: 'Capital & Leverage' },
  { id: 'cost-efficiency', label: 'Cost Efficiency' },
];

const COMPARISON_METRICS: ComparisonMetricDef[] = [
  // A. Profitability Spread
  {
    id: 'operating-revenue',
    tab: 'profitability',
    label: 'Operating Revenue ($B)',
    kind: 'amount',
    unitLabel: '$B',
    formula: 'Reported Operating Revenue',
    sourceStatement: 'Income Statement',
    getValue: (series, idx) => series[idx].operatingRevenueUsdB,
  },
  {
    id: 'revenue-growth',
    tab: 'profitability',
    label: 'Revenue Growth (%)',
    kind: 'percentage',
    unitLabel: '%',
    formula: '(Current Revenue − Prior Revenue) ÷ |Prior Revenue| × 100',
    sourceStatement: 'Income Statement (YoY)',
    getValue: (series, idx) => {
      if (idx === 0) return null;
      const curr = series[idx].operatingRevenueUsdB;
      const prev = series[idx - 1].operatingRevenueUsdB;
      if (!Number.isFinite(curr) || !Number.isFinite(prev) || prev <= 0) {
        return null;
      }
      return ((curr - prev) / Math.abs(prev)) * 100;
    },
  },
  {
    id: 'operating-margin',
    tab: 'profitability',
    label: 'Operating Margin (%)',
    kind: 'percentage',
    unitLabel: '%',
    formula: 'Operating Profit ÷ Operating Revenue × 100',
    sourceStatement: 'Income Statement',
    getValue: (series, idx) => evaluateRatio('operating-margin', series, idx).value,
  },
  {
    id: 'net-profit-margin',
    tab: 'profitability',
    label: 'Net Profit Margin (%)',
    kind: 'percentage',
    unitLabel: '%',
    formula: 'Net Income ÷ Operating Revenue × 100',
    sourceStatement: 'Income Statement',
    getValue: (series, idx) => evaluateRatio('net-profit-margin', series, idx).value,
  },

  // B. Capital & Leverage
  {
    id: 'total-assets',
    tab: 'capital-leverage',
    label: 'Total Assets ($B)',
    kind: 'amount',
    unitLabel: '$B',
    formula: 'Reported Total Assets',
    sourceStatement: 'Balance Sheet',
    getValue: (series, idx) => series[idx].totalAssetsUsdB,
  },
  {
    id: 'interest-bearing-debt',
    tab: 'capital-leverage',
    label: 'Total Interest-Bearing Debt ($B)',
    kind: 'amount',
    unitLabel: '$B',
    formula: 'Reported Total Interest-Bearing Debt',
    sourceStatement: 'Balance Sheet',
    getValue: (series, idx) => series[idx].totalInterestBearingDebtUsdB ?? null,
  },
  {
    id: 'shareholders-equity',
    tab: 'capital-leverage',
    label: "Shareholders' Equity ($B)",
    kind: 'amount',
    unitLabel: '$B',
    formula: "Reported Shareholders' Equity",
    sourceStatement: 'Balance Sheet',
    getValue: (series, idx) => series[idx].shareholdersEquityUsdB,
  },
  {
    id: 'debt-to-equity',
    tab: 'capital-leverage',
    label: 'Debt-to-Equity Ratio (x)',
    kind: 'ratio',
    unitLabel: 'x',
    formula: "Total Interest-Bearing Debt ÷ Shareholders' Equity",
    sourceStatement: 'Balance Sheet',
    getValue: (series, idx) => evaluateRatio('debt-to-equity', series, idx).value,
  },
  {
    id: 'debt-to-assets',
    tab: 'capital-leverage',
    label: 'Debt-to-Assets Ratio (x)',
    kind: 'ratio',
    unitLabel: 'x',
    formula: 'Total Interest-Bearing Debt ÷ Total Assets',
    sourceStatement: 'Balance Sheet',
    getValue: (series, idx) => evaluateRatio('debt-to-assets', series, idx).value,
  },
  {
    id: 'current-ratio',
    tab: 'capital-leverage',
    label: 'Current Ratio (x)',
    kind: 'ratio',
    unitLabel: 'x',
    formula: 'Current Assets ÷ Current Liabilities',
    sourceStatement: 'Balance Sheet',
    getValue: (series, idx) => evaluateRatio('current-ratio', series, idx).value,
  },

  // C. Cost Efficiency
  {
    id: 'operating-expenses',
    tab: 'cost-efficiency',
    label: 'Operating Expenses ($B)',
    kind: 'amount',
    unitLabel: '$B',
    formula: 'Reported Operating Expenses',
    sourceStatement: 'Income Statement',
    getValue: (series, idx) => series[idx].operatingExpensesUsdB,
  },
  {
    id: 'opex-pct-revenue',
    tab: 'cost-efficiency',
    label: 'Operating Expenses as % of Revenue',
    kind: 'percentage',
    unitLabel: '%',
    formula: 'Operating Expenses ÷ Operating Revenue × 100',
    sourceStatement: 'Income Statement',
    getValue: (series, idx) => {
      const row = series[idx];
      if (!Number.isFinite(row.operatingRevenueUsdB) || row.operatingRevenueUsdB <= 0) {
        return null;
      }
      return (row.operatingExpensesUsdB / row.operatingRevenueUsdB) * 100;
    },
  },
  {
    id: 'free-cash-flow',
    tab: 'cost-efficiency',
    label: 'Free Cash Flow ($B)',
    kind: 'amount',
    unitLabel: '$B',
    formula: 'Operating Cash Flow − Capital Expenditures',
    sourceStatement: 'Cash Flow Statement',
    getValue: (series, idx) => getFreeCashFlow(series[idx]),
  },
  {
    id: 'fcf-margin',
    tab: 'cost-efficiency',
    label: 'Free Cash Flow Margin (%)',
    kind: 'percentage',
    unitLabel: '%',
    formula: 'Free Cash Flow ÷ Operating Revenue × 100',
    sourceStatement: 'Cash Flow & Income Statements',
    getValue: (series, idx) => evaluateRatio('fcf-margin', series, idx).value,
  },
];

const UNAVAILABLE_AVIATION_BENCHMARKS = [
  {
    metric: 'ROIC (Return on Invested Capital)',
    reason:
      'Requires verified Invested Capital schedule, effective tax rate adjustments for NOPAT, and lease-adjusted debt disclosures.',
  },
  {
    metric: 'CASM (Cost per Available Seat Mile)',
    reason:
      'Requires operational capacity denominator (Available Seat Miles / ASMs) from carrier operating statistics.',
  },
  {
    metric: 'RASM (Revenue per Available Seat Mile)',
    reason:
      'Requires Available Seat Miles (ASMs) and unit passenger/cargo yield disclosures.',
  },
  {
    metric: 'Passenger Load Factor & PRASM',
    reason:
      'Requires Revenue Passenger Miles (RPMs), passenger revenue split, and capacity metrics.',
  },
];

function formatMetricValue(val: number | null, kind: MetricKind): string {
  if (val === null || !Number.isFinite(val)) return 'N/A';
  if (kind === 'amount') return formatCurrencyB(val);
  if (kind === 'percentage') return formatRatioValue(val, '%');
  return formatRatioValue(val, 'x');
}

function formatAbsoluteSpread(
  valA: number | null,
  valB: number | null,
  kind: MetricKind,
  direction: SpreadDirection
): string {
  if (valA === null || valB === null || !Number.isFinite(valA) || !Number.isFinite(valB)) {
    return 'N/A';
  }
  const diff = direction === 'a-minus-b' ? valA - valB : valB - valA;
  if (kind === 'amount') {
    return formatSignedCurrencyB(diff);
  }
  const sign = diff > 0 ? '+' : '';
  if (kind === 'percentage') {
    return `${sign}${diff.toFixed(1)} pp`;
  }
  return `${sign}${diff.toFixed(2)}x`;
}

function formatSecondarySpread(
  valA: number | null,
  valB: number | null,
  kind: MetricKind,
  direction: SpreadDirection
): string {
  if (valA === null || valB === null || !Number.isFinite(valA) || !Number.isFinite(valB)) {
    return 'N/A';
  }

  // For percentage-based metrics, strictly express spread in percentage points (pp) / bps,
  // never as a percentage growth rate.
  if (kind === 'percentage') {
    const ppDiff = direction === 'a-minus-b' ? valA - valB : valB - valA;
    const sign = ppDiff > 0 ? '+' : '';
    const bps = Math.round(ppDiff * 100);
    return `${sign}${ppDiff.toFixed(1)} pp (${sign}${bps} bps)`;
  }

  const base = direction === 'a-minus-b' ? valB : valA;
  const diff = direction === 'a-minus-b' ? valA - valB : valB - valA;

  if (!Number.isFinite(base) || base <= 0) {
    return 'N/A (Non-positive base)';
  }

  const relPct = (diff / base) * 100;
  if (!Number.isFinite(relPct)) return 'N/A';
  const sign = relPct > 0 ? '+' : '';
  return `${sign}${relPct.toFixed(1)}%`;
}

export const CompanyComparisonPage: React.FC<CompanyComparisonPageProps> = ({
  onReturnToDashboard,
  onOpenMethodology,
}) => {
  const [activeTab, setActiveTab] = useState<ComparisonTabId>('profitability');
  const [selectedMetricId, setSelectedMetricId] = useState<string>('operating-revenue');
  const [seriesScope, setSeriesScope] = useState<SeriesScope>('compare');
  const [spreadDirection, setSpreadDirection] = useState<SpreadDirection>('a-minus-b');
  const [focusYear, setFocusYear] = useState<string>('FY 2024');

  const carrierA = ILLUSTRATIVE_CARRIERS[0];
  const carrierB = ILLUSTRATIVE_CARRIERS[1];

  const fiscalYears = useMemo(
    () => carrierA.annualSeries.map((r) => r.fiscalYear),
    [carrierA]
  );

  const focusYearIndex = useMemo(() => {
    const idx = fiscalYears.indexOf(focusYear);
    return idx >= 0 ? idx : fiscalYears.length - 1;
  }, [fiscalYears, focusYear]);

  const tabMetrics = useMemo(
    () => COMPARISON_METRICS.filter((m) => m.tab === activeTab),
    [activeTab]
  );

  const selectedMetric = useMemo(
    () =>
      COMPARISON_METRICS.find((m) => m.id === selectedMetricId) ??
      tabMetrics[0] ??
      COMPARISON_METRICS[0],
    [selectedMetricId, tabMetrics]
  );

  const handleTabChange = (tab: ComparisonTabId) => {
    setActiveTab(tab);
    const first = COMPARISON_METRICS.find((m) => m.tab === tab);
    if (first) {
      setSelectedMetricId(first.id);
    }
  };

  const handleMetricSelect = (metricId: string) => {
    const found = COMPARISON_METRICS.find((m) => m.id === metricId);
    if (found && found.tab !== activeTab) {
      setActiveTab(found.tab);
    }
    setSelectedMetricId(metricId);
  };

  const comparisonRows = useMemo(
    () =>
      fiscalYears.map((yr, idx) => {
        const valA = selectedMetric.getValue(carrierA.annualSeries, idx);
        const valB = selectedMetric.getValue(carrierB.annualSeries, idx);
        return {
          fiscalYear: yr,
          valA,
          valB,
          formattedA: formatMetricValue(valA, selectedMetric.kind),
          formattedB: formatMetricValue(valB, selectedMetric.kind),
          absSpread: formatAbsoluteSpread(
            valA,
            valB,
            selectedMetric.kind,
            spreadDirection
          ),
          secondarySpread: formatSecondarySpread(
            valA,
            valB,
            selectedMetric.kind,
            spreadDirection
          ),
        };
      }),
    [fiscalYears, selectedMetric, carrierA.annualSeries, carrierB.annualSeries, spreadDirection]
  );

  const chartDatasets = useMemo(() => {
    const roundVal = (v: number | null) =>
      v !== null && Number.isFinite(v) ? Number(v.toFixed(2)) : null;

    const isBar = selectedMetric.kind === 'amount';
    const dataA = comparisonRows.map((r) => roundVal(r.valA));
    const dataB = comparisonRows.map((r) => roundVal(r.valB));

    const dsA = isBar
      ? {
          label: `${carrierA.name} (${selectedMetric.unitLabel})`,
          data: dataA,
          backgroundColor: '#0B192C',
          borderRadius: 4,
        }
      : {
          label: `${carrierA.name} (${selectedMetric.unitLabel})`,
          data: dataA,
          borderColor: '#0B192C',
          backgroundColor: 'rgba(11, 25, 44, 0.08)',
          tension: 0.25,
          fill: false,
          spanGaps: false,
          pointRadius: 4,
          pointHoverRadius: 6,
          pointBackgroundColor: '#0B192C',
        };

    const dsB = isBar
      ? {
          label: `${carrierB.name} (${selectedMetric.unitLabel})`,
          data: dataB,
          backgroundColor: '#0284C7',
          borderRadius: 4,
        }
      : {
          label: `${carrierB.name} (${selectedMetric.unitLabel})`,
          data: dataB,
          borderColor: '#0284C7',
          backgroundColor: 'rgba(2, 132, 199, 0.08)',
          tension: 0.25,
          fill: false,
          spanGaps: false,
          pointRadius: 4,
          pointHoverRadius: 6,
          pointBackgroundColor: '#0284C7',
        };

    if (seriesScope === 'carrier-a') return { labels: fiscalYears, datasets: [dsA] };
    if (seriesScope === 'carrier-b') return { labels: fiscalYears, datasets: [dsB] };
    return { labels: fiscalYears, datasets: [dsA, dsB] };
  }, [selectedMetric, comparisonRows, carrierA.name, carrierB.name, seriesScope, fiscalYears]);

  const commonAxisAndTooltip = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index' as const,
        intersect: false,
      },
      plugins: {
        legend: {
          position: 'top' as const,
          align: 'end' as const,
          labels: {
            boxWidth: 10,
            usePointStyle: true,
            pointStyle: 'circle' as const,
            color: '#334155',
            font: {
              family: 'DM Sans, system-ui, sans-serif',
              size: 12,
            },
          },
        },
        tooltip: {
          backgroundColor: '#0B192C',
          titleFont: {
            family: 'Plus Jakarta Sans, system-ui, sans-serif',
            size: 12,
          },
          bodyFont: {
            family: 'IBM Plex Mono, monospace',
            size: 12,
          },
          padding: 10,
          callbacks: {
            label: (ctx: { dataset: { label?: string }; parsed: { y: number | null } }) => {
              const raw = ctx.parsed.y;
              if (raw === null || raw === undefined || !Number.isFinite(raw)) {
                return `${ctx.dataset.label ?? 'Series'}: N/A`;
              }
              return `${ctx.dataset.label ?? 'Series'}: ${formatMetricValue(
                raw,
                selectedMetric.kind
              )}`;
            },
          },
        },
      },
      scales: {
        x: {
          grid: {
            display: false,
          },
          ticks: {
            color: '#475569',
            font: {
              family: 'IBM Plex Mono, monospace',
              size: 11,
            },
          },
        },
        y: {
          grid: {
            color: '#E2E8F0',
          },
          title: {
            display: true,
            text:
              selectedMetric.kind === 'amount'
                ? 'USD Billions ($B)'
                : selectedMetric.kind === 'percentage'
                ? 'Percentage (%)'
                : 'Ratio Multiple (x)',
            color: '#64748B',
            font: {
              family: 'DM Sans, system-ui, sans-serif',
              size: 11,
            },
          },
          ticks: {
            color: '#475569',
            font: {
              family: 'IBM Plex Mono, monospace',
              size: 11,
            },
            callback: (val: string | number) => {
              const num = Number(val);
              if (!Number.isFinite(num)) return String(val);
              if (selectedMetric.kind === 'amount') return `$${num.toFixed(1)}B`;
              if (selectedMetric.kind === 'percentage') return `${num.toFixed(1)}%`;
              return `${num.toFixed(2)}x`;
            },
          },
        },
      },
    }),
    [selectedMetric.kind]
  );

  const spreadBasisLabel = spreadDirection === 'a-minus-b' ? 'A − B' : 'B − A';
  const activeTabLabel =
    COMPARISON_TABS.find((t) => t.id === activeTab)?.label ?? 'Profitability Spread';

  return (
    <div className="space-y-6">
      {/* Page Header */}
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
            Company Comparison &amp; Benchmarking
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Side-by-side five-year financial benchmarking between Carrier A and Carrier B
            across profitability spreads, capital leverage, and cost efficiency.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
          <span>Carrier A vs. Carrier B</span>
          <span aria-hidden="true">·</span>
          <span className="font-mono">FY 2020 – FY 2024</span>
          <span aria-hidden="true">·</span>
          <span>Illustrative Sample Data</span>
        </div>
      </section>

      {/* Required Illustrative Data Disclaimer */}
      <section
        aria-label="Illustrative Data Disclaimer"
        className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="flex items-start gap-3">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-[#1E3A5F]" />
          <div className="text-xs leading-relaxed text-slate-600">
            <span className="font-semibold text-[#0B192C]">
              Illustrative Sample Data — Not Official Financial Results.
            </span>{' '}
            All spreads and variances are computed dynamically from the Stage 1 illustrative
            carrier datasets. Aviation operating metrics (ROIC, CASM, RASM) remain N/A until
            official operating capacity and invested-capital disclosures are available.
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

      {/* Interactive Benchmarking Controls */}
      <section
        aria-label="Company Comparison Controls"
        className="space-y-4 rounded-xl border border-slate-200 bg-white p-5"
      >
        {/* Row 1: Comparison Tabs + Focus Year */}
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-1 text-xs font-medium text-slate-500">Benchmark Tab:</span>
            <div
              role="tablist"
              aria-label="Company Comparison Categories"
              className="inline-flex flex-wrap items-center gap-1 rounded-lg bg-slate-100 p-1"
            >
              {COMPARISON_TABS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={activeTab === tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
                    activeTab === tab.id
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
            <span className="mr-1 text-xs font-medium text-slate-500">Snapshot Year:</span>
            <div className="inline-flex flex-wrap items-center gap-1 rounded-lg bg-slate-100 p-1">
              {fiscalYears.map((yr) => (
                <button
                  key={yr}
                  type="button"
                  onClick={() => setFocusYear(yr)}
                  className={`rounded-md px-2.5 py-1.5 font-mono text-xs font-medium transition-colors whitespace-nowrap ${
                    focusYear === yr
                      ? 'bg-white text-[#0B192C] shadow-sm'
                      : 'text-slate-600 hover:text-[#0B192C]'
                  }`}
                >
                  {yr}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Row 2: Company Series Selector + Spread Basis + Metric Selector */}
        <div className="flex flex-col gap-4 border-t border-slate-100 pt-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-medium text-slate-500">Company View:</span>
              <div className="inline-flex items-center gap-1 rounded-lg bg-slate-100 p-1">
                <button
                  type="button"
                  onClick={() => setSeriesScope('compare')}
                  className={`rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
                    seriesScope === 'compare'
                      ? 'bg-white text-[#0B192C] shadow-sm'
                      : 'text-slate-600 hover:text-[#0B192C]'
                  }`}
                >
                  Compare A vs B
                </button>
                <button
                  type="button"
                  onClick={() => setSeriesScope('carrier-a')}
                  className={`rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
                    seriesScope === 'carrier-a'
                      ? 'bg-white text-[#0B192C] shadow-sm'
                      : 'text-slate-600 hover:text-[#0B192C]'
                  }`}
                >
                  Carrier A
                </button>
                <button
                  type="button"
                  onClick={() => setSeriesScope('carrier-b')}
                  className={`rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
                    seriesScope === 'carrier-b'
                      ? 'bg-white text-[#0B192C] shadow-sm'
                      : 'text-slate-600 hover:text-[#0B192C]'
                  }`}
                >
                  Carrier B
                </button>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-medium text-slate-500">Spread Basis:</span>
              <div className="inline-flex items-center gap-1 rounded-lg bg-slate-100 p-1">
                <button
                  type="button"
                  onClick={() => setSpreadDirection('a-minus-b')}
                  className={`rounded-md px-2.5 py-1.5 font-mono text-xs font-medium transition-colors whitespace-nowrap ${
                    spreadDirection === 'a-minus-b'
                      ? 'bg-white text-[#0B192C] shadow-sm'
                      : 'text-slate-600 hover:text-[#0B192C]'
                  }`}
                >
                  A − B
                </button>
                <button
                  type="button"
                  onClick={() => setSpreadDirection('b-minus-a')}
                  className={`rounded-md px-2.5 py-1.5 font-mono text-xs font-medium transition-colors whitespace-nowrap ${
                    spreadDirection === 'b-minus-a'
                      ? 'bg-white text-[#0B192C] shadow-sm'
                      : 'text-slate-600 hover:text-[#0B192C]'
                  }`}
                >
                  B − A
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <label
              htmlFor="comparison-metric-select"
              className="text-xs font-medium text-slate-500 whitespace-nowrap"
            >
              Active Metric:
            </label>
            <select
              id="comparison-metric-select"
              value={selectedMetric.id}
              onChange={(e) => handleMetricSelect(e.target.value)}
              className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-[#0B192C] focus:border-[#0B192C] focus:bg-white focus:outline-none"
            >
              {COMPARISON_TABS.map((tab) => (
                <optgroup key={tab.id} label={tab.label}>
                  {COMPARISON_METRICS.filter((m) => m.tab === tab.id).map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.label}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Active Tab Snapshot Cards */}
      <section aria-label={`${activeTabLabel} Snapshot Cards`}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {tabMetrics.map((metric) => {
            const valA = metric.getValue(carrierA.annualSeries, focusYearIndex);
            const valB = metric.getValue(carrierB.annualSeries, focusYearIndex);
            const spread = formatAbsoluteSpread(valA, valB, metric.kind, spreadDirection);
            const isSelected = metric.id === selectedMetric.id;

            return (
              <button
                key={metric.id}
                type="button"
                onClick={() => setSelectedMetricId(metric.id)}
                className={`flex flex-col justify-between rounded-xl border p-5 text-left transition-all ${
                  isSelected
                    ? 'border-[#0284C7] bg-white ring-1 ring-[#0284C7]'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-semibold text-[#0B192C]">
                      {metric.label}
                    </span>
                    <span className="font-mono text-[11px] text-slate-400 whitespace-nowrap">
                      {focusYear}
                    </span>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <div>
                      <div className="text-[11px] text-slate-500">Carrier A</div>
                      <div className="mt-0.5 font-mono text-lg font-bold text-[#0B192C] tabular-nums">
                        {formatMetricValue(valA, metric.kind)}
                      </div>
                    </div>
                    <div>
                      <div className="text-[11px] text-slate-500">Carrier B</div>
                      <div className="mt-0.5 font-mono text-lg font-bold text-[#0284C7] tabular-nums">
                        {formatMetricValue(valB, metric.kind)}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 border-t border-slate-100 pt-3 flex items-center justify-between gap-2 text-[11px]">
                  <span className="text-slate-500">
                    Spread ({spreadBasisLabel}):{' '}
                    <span className="font-mono font-semibold text-[#0B192C] tabular-nums">
                      {spread}
                    </span>
                  </span>
                  <span className="text-slate-400 whitespace-nowrap">
                    {metric.kind === 'amount' ? 'Grouped Bar' : 'Trend Line'}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Chart.js Comparison Visualization */}
      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex flex-col gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <GitCompare className="h-4 w-4 text-[#0284C7]" />
              <h2 className="font-display text-base font-semibold text-[#0B192C]">
                5-Year Benchmark Comparison · {selectedMetric.label}
              </h2>
            </div>
            <p className="mt-0.5 text-xs text-slate-500">
              Formula: <span className="font-mono">{selectedMetric.formula}</span> · Source:{' '}
              {selectedMetric.sourceStatement} · Illustrative Sample Data
            </p>
          </div>

          <div className="text-xs text-slate-500">
            Chart Mode:{' '}
            <span className="font-medium text-[#0B192C]">
              {selectedMetric.kind === 'amount'
                ? 'Grouped Bar ($B)'
                : selectedMetric.kind === 'percentage'
                ? 'Trend Line (%)'
                : 'Trend Line (x)'}
            </span>
          </div>
        </div>

        <div className="mt-4 h-[340px] w-full">
          {selectedMetric.kind === 'amount' ? (
            <Bar
              key={`bar-${selectedMetric.id}-${seriesScope}`}
              data={chartDatasets}
              options={commonAxisAndTooltip as ChartOptions<'bar'>}
            />
          ) : (
            <Line
              key={`line-${selectedMetric.id}-${seriesScope}`}
              data={chartDatasets}
              options={commonAxisAndTooltip as ChartOptions<'line'>}
            />
          )}
        </div>

        {selectedMetric.id === 'revenue-growth' && (
          <div className="mt-3 border-t border-slate-100 pt-2.5 text-[11px] text-slate-500">
            Note: FY 2020 Revenue Growth is N/A and omitted from the line series because FY
            2019 revenue is not included in the Stage 1 dataset.
          </div>
        )}
      </section>

      {/* Five-Year Variance & Spread Matrix */}
      <section className="rounded-xl border border-slate-200 bg-white">
        <div className="flex flex-col gap-2 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-display text-base font-semibold text-[#0B192C]">
              Five-Year Variance &amp; Spread Matrix · {selectedMetric.label}
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              {selectedMetric.kind === 'percentage'
                ? `Spread basis: ${spreadBasisLabel} · Percentage metrics are compared strictly in percentage points (pp) and basis points (bps), not as percentage growth rates.`
                : `Spread basis: ${spreadBasisLabel} · Displaying exact values, absolute difference, and relative percentage difference.`}
            </p>
          </div>
          <div className="text-xs text-slate-500">
            Active Horizon: <span className="font-mono text-[#0B192C]">FY 2020 – FY 2024</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50 text-slate-600">
              <tr>
                <th className="px-5 py-3 font-semibold">Fiscal Year</th>
                <th className="px-4 py-3 text-right font-semibold text-[#0B192C]">
                  Carrier A
                </th>
                <th className="px-4 py-3 text-right font-semibold text-[#0284C7]">
                  Carrier B
                </th>
                <th className="px-4 py-3 text-right font-semibold">
                  Absolute Difference ({spreadBasisLabel})
                </th>
                <th className="px-5 py-3 text-right font-semibold">
                  {selectedMetric.kind === 'percentage'
                    ? `Percentage-Point Spread (${spreadBasisLabel})`
                    : `Relative Difference (${spreadBasisLabel})`}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {comparisonRows.map((row) => (
                <tr
                  key={row.fiscalYear}
                  className={`transition-colors hover:bg-slate-50/80 ${
                    row.fiscalYear === focusYear ? 'bg-sky-50/40' : ''
                  }`}
                >
                  <td className="px-5 py-3 font-mono font-semibold text-[#0B192C] whitespace-nowrap">
                    {row.fiscalYear}
                  </td>
                  <td className="px-4 py-3 text-right font-mono tabular-nums text-[#0B192C] whitespace-nowrap">
                    {row.formattedA}
                  </td>
                  <td className="px-4 py-3 text-right font-mono tabular-nums text-[#0284C7] whitespace-nowrap">
                    {row.formattedB}
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-semibold tabular-nums text-[#0B192C] whitespace-nowrap">
                    {row.absSpread}
                  </td>
                  <td className="px-5 py-3 text-right font-mono tabular-nums text-slate-600 whitespace-nowrap">
                    {row.secondarySpread}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Unavailable Aviation Operating & Capital Return Metrics */}
      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex items-start gap-2.5 border-b border-slate-100 pb-4">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
          <div>
            <h2 className="font-display text-base font-semibold text-[#0B192C]">
              Aviation Operating &amp; Capital Return Benchmarks (N/A in Stage 1)
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              In accordance with accounting data integrity standards, aviation unit metrics and
              ROIC remain N/A until their required underlying inputs are available.
            </p>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-2.5 font-semibold">Benchmark Metric</th>
                <th className="px-4 py-2.5 text-right font-semibold">Carrier A</th>
                <th className="px-4 py-2.5 text-right font-semibold">Carrier B</th>
                <th className="px-4 py-2.5 font-semibold">Missing Source Data Explanation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {UNAVAILABLE_AVIATION_BENCHMARKS.map((item) => (
                <tr key={item.metric}>
                  <td className="px-4 py-3 font-medium text-[#0B192C] whitespace-nowrap">
                    {item.metric}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-amber-700 whitespace-nowrap">
                    N/A
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-amber-700 whitespace-nowrap">
                    N/A
                  </td>
                  <td className="px-4 py-3 text-slate-600">{item.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
