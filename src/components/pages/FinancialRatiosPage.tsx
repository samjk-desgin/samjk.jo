import React, { useMemo, useState } from 'react';
import {
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
import { Line } from 'react-chartjs-2';
import { AlertCircle, ArrowLeft, Calculator, Info } from 'lucide-react';
import { ILLUSTRATIVE_CARRIERS } from '../../data/illustrativeData';
import { RatioCategory, RatioId } from '../../types/analytics';
import {
  evaluateCategoryRatios,
  evaluateRatio,
  formatRatioValue,
  RATIO_CATALOG,
  RATIO_CATEGORY_LABELS,
} from '../../utils/accounting';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface FinancialRatiosPageProps {
  onReturnToDashboard: () => void;
  onOpenMethodology: () => void;
}

type CarrierId = 'carrier-a' | 'carrier-b';
type ChartCarrierMode = 'active' | 'compare';

function formatDeltaText(
  currentVal: number | null,
  prevVal: number | null,
  unit: '%' | 'x' | 'times',
  prevYearLabel: string | null
): string {
  if (!prevYearLabel) {
    return 'Baseline year · No prior fiscal period in dataset';
  }
  if (currentVal === null || prevVal === null) {
    return `YoY change unavailable vs ${prevYearLabel}`;
  }
  const diff = currentVal - prevVal;
  const sign = diff > 0 ? '+' : '';
  if (unit === '%') {
    return `${sign}${diff.toFixed(1)} pp vs ${prevYearLabel}`;
  }
  if (unit === 'times') {
    return `${sign}${diff.toFixed(2)} times vs ${prevYearLabel}`;
  }
  return `${sign}${diff.toFixed(2)}x vs ${prevYearLabel}`;
}

export const FinancialRatiosPage: React.FC<FinancialRatiosPageProps> = ({
  onReturnToDashboard,
  onOpenMethodology,
}) => {
  const [selectedCarrierId, setSelectedCarrierId] = useState<CarrierId>('carrier-a');
  const [selectedYear, setSelectedYear] = useState<string>('FY 2024');
  const [activeCategory, setActiveCategory] = useState<RatioCategory>('profitability');
  const [selectedRatioId, setSelectedRatioId] = useState<RatioId>('operating-margin');
  const [chartCarrierMode, setChartCarrierMode] = useState<ChartCarrierMode>('active');

  const carrierA = ILLUSTRATIVE_CARRIERS[0];
  const carrierB = ILLUSTRATIVE_CARRIERS[1];

  const activeCarrier = selectedCarrierId === 'carrier-b' ? carrierB : carrierA;

  const fiscalYears = useMemo(
    () => carrierA.annualSeries.map((row) => row.fiscalYear),
    [carrierA]
  );

  const selectedYearIndex = useMemo(() => {
    const idx = fiscalYears.indexOf(selectedYear);
    return idx >= 0 ? idx : fiscalYears.length - 1;
  }, [fiscalYears, selectedYear]);

  const categoryEvaluations = useMemo(
    () =>
      evaluateCategoryRatios(
        activeCategory,
        activeCarrier.annualSeries,
        selectedYearIndex
      ),
    [activeCategory, activeCarrier, selectedYearIndex]
  );

  const selectedEvaluation = useMemo(
    () =>
      evaluateRatio(
        selectedRatioId,
        activeCarrier.annualSeries,
        selectedYearIndex
      ),
    [selectedRatioId, activeCarrier, selectedYearIndex]
  );

  const priorEvaluation = useMemo(
    () =>
      selectedYearIndex > 0
        ? evaluateRatio(
            selectedRatioId,
            activeCarrier.annualSeries,
            selectedYearIndex - 1
          )
        : null,
    [selectedRatioId, activeCarrier, selectedYearIndex]
  );

  const seriesEvaluationsA = useMemo(
    () =>
      carrierA.annualSeries.map((_, idx) =>
        evaluateRatio(selectedRatioId, carrierA.annualSeries, idx)
      ),
    [selectedRatioId, carrierA]
  );

  const seriesEvaluationsB = useMemo(
    () =>
      carrierB.annualSeries.map((_, idx) =>
        evaluateRatio(selectedRatioId, carrierB.annualSeries, idx)
      ),
    [selectedRatioId, carrierB]
  );

  const activeSeriesEvaluations =
    selectedCarrierId === 'carrier-b' ? seriesEvaluationsB : seriesEvaluationsA;

  const hasAnyChartData = useMemo(() => {
    if (chartCarrierMode === 'compare') {
      return (
        seriesEvaluationsA.some((ev) => ev.value !== null) ||
        seriesEvaluationsB.some((ev) => ev.value !== null)
      );
    }
    return activeSeriesEvaluations.some((ev) => ev.value !== null);
  }, [chartCarrierMode, seriesEvaluationsA, seriesEvaluationsB, activeSeriesEvaluations]);

  const handleCategoryChange = (category: RatioCategory) => {
    setActiveCategory(category);
    const firstInCategory = RATIO_CATALOG.find((item) => item.category === category);
    if (firstInCategory) {
      setSelectedRatioId(firstInCategory.id);
    }
  };

  const handleRatioSelectFromDropdown = (ratioId: RatioId) => {
    const meta = RATIO_CATALOG.find((item) => item.id === ratioId);
    if (meta && meta.category !== activeCategory) {
      setActiveCategory(meta.category);
    }
    setSelectedRatioId(ratioId);
  };

  const chartData = useMemo(() => {
    if (chartCarrierMode === 'compare') {
      return {
        labels: fiscalYears,
        datasets: [
          {
            label: `${carrierA.name} (${selectedEvaluation.unit})`,
            data: seriesEvaluationsA.map((ev) =>
              ev.value !== null ? Number(ev.value.toFixed(2)) : null
            ),
            borderColor: '#0B192C',
            backgroundColor: 'rgba(11, 25, 44, 0.08)',
            tension: 0.25,
            fill: false,
            spanGaps: false,
            pointRadius: 4,
            pointHoverRadius: 6,
            pointBackgroundColor: '#0B192C',
          },
          {
            label: `${carrierB.name} (${selectedEvaluation.unit})`,
            data: seriesEvaluationsB.map((ev) =>
              ev.value !== null ? Number(ev.value.toFixed(2)) : null
            ),
            borderColor: '#0284C7',
            backgroundColor: 'rgba(2, 132, 199, 0.08)',
            tension: 0.25,
            fill: false,
            spanGaps: false,
            pointRadius: 4,
            pointHoverRadius: 6,
            pointBackgroundColor: '#0284C7',
          },
        ],
      };
    }

    const lineColor = selectedCarrierId === 'carrier-b' ? '#0284C7' : '#0B192C';
    const fillColor =
      selectedCarrierId === 'carrier-b'
        ? 'rgba(2, 132, 199, 0.08)'
        : 'rgba(11, 25, 44, 0.08)';

    return {
      labels: fiscalYears,
      datasets: [
        {
          label: `${activeCarrier.name} (${selectedEvaluation.unit})`,
          data: activeSeriesEvaluations.map((ev) =>
            ev.value !== null ? Number(ev.value.toFixed(2)) : null
          ),
          borderColor: lineColor,
          backgroundColor: fillColor,
          tension: 0.25,
          fill: true,
          spanGaps: false,
          pointRadius: 4,
          pointHoverRadius: 6,
          pointBackgroundColor: lineColor,
        },
      ],
    };
  }, [
    chartCarrierMode,
    fiscalYears,
    carrierA.name,
    carrierB.name,
    selectedEvaluation.unit,
    seriesEvaluationsA,
    seriesEvaluationsB,
    selectedCarrierId,
    activeCarrier.name,
    activeSeriesEvaluations,
  ]);

  const chartOptions: ChartOptions<'line'> = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false,
      },
      plugins: {
        legend: {
          position: 'top',
          align: 'end',
          labels: {
            boxWidth: 10,
            usePointStyle: true,
            pointStyle: 'circle',
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
            label: (ctx) => {
              const raw = ctx.parsed.y;
              if (raw === null || raw === undefined || !Number.isFinite(raw)) {
                return `${ctx.dataset.label}: N/A`;
              }
              return `${ctx.dataset.label}: ${formatRatioValue(
                raw,
                selectedEvaluation.unit
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
              selectedEvaluation.unit === '%'
                ? 'Percentage (%)'
                : selectedEvaluation.unit === 'times'
                ? 'Coverage Multiple (times)'
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
            callback: (val) => {
              const num = Number(val);
              if (!Number.isFinite(num)) return String(val);
              if (selectedEvaluation.unit === '%') return `${num.toFixed(1)}%`;
              if (selectedEvaluation.unit === 'times') return `${num.toFixed(1)}x`;
              return `${num.toFixed(2)}x`;
            },
          },
        },
      },
    }),
    [selectedEvaluation.unit]
  );

  const deltaText = formatDeltaText(
    selectedEvaluation.value,
    priorEvaluation?.value ?? null,
    selectedEvaluation.unit,
    priorEvaluation?.fiscalYear ?? null
  );

  const activeCategoryLabel =
    RATIO_CATEGORY_LABELS.find((c) => c.id === activeCategory)?.label ?? 'Profitability';

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
            Financial Ratios Engine
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Evaluate profitability, liquidity, leverage, and cash flow efficiency with transparent
            numerator, denominator, and average-balance traceability.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
          <span>{activeCarrier.name}</span>
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
            All ratio values are computed dynamically from the Stage 1 illustrative carrier
            statements. Ratios lacking required Stage 1 inputs (such as Inventory, Cash &amp;
            Equivalents, EBITDA, or FY 2019 opening balances) are explicitly shown as N/A.
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
        aria-label="Financial Ratios Controls"
        className="space-y-4 rounded-xl border border-slate-200 bg-white p-5"
      >
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          {/* Company Selector */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-1 text-xs font-medium text-slate-500">Company:</span>
            <div className="inline-flex flex-wrap items-center gap-1 rounded-lg bg-slate-100 p-1">
              <button
                type="button"
                onClick={() => setSelectedCarrierId('carrier-a')}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
                  selectedCarrierId === 'carrier-a'
                    ? 'bg-white text-[#0B192C] shadow-sm'
                    : 'text-slate-600 hover:text-[#0B192C]'
                }`}
              >
                Carrier A
              </button>
              <button
                type="button"
                onClick={() => setSelectedCarrierId('carrier-b')}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
                  selectedCarrierId === 'carrier-b'
                    ? 'bg-white text-[#0B192C] shadow-sm'
                    : 'text-slate-600 hover:text-[#0B192C]'
                }`}
              >
                Carrier B
              </button>
            </div>
          </div>

          {/* Fiscal Year Selector */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-1 text-xs font-medium text-slate-500">Fiscal Year:</span>
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
        </div>

        {/* Category Tabs */}
        <div className="flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-1 text-xs font-medium text-slate-500">Category:</span>
            <div
              role="tablist"
              aria-label="Financial Ratio Categories"
              className="inline-flex flex-wrap items-center gap-1 rounded-lg bg-slate-100 p-1"
            >
              {RATIO_CATEGORY_LABELS.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  role="tab"
                  aria-selected={activeCategory === cat.id}
                  onClick={() => handleCategoryChange(cat.id)}
                  className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
                    activeCategory === cat.id
                      ? 'bg-[#0B192C] text-white'
                      : 'text-slate-600 hover:text-[#0B192C]'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          <span className="text-xs text-slate-500">
            Select any ratio card or table row to inspect formula inputs &amp; 5-year trend
          </span>
        </div>
      </section>

      {/* Ratio Category Cards */}
      <section aria-label={`${activeCategoryLabel} Ratios`}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {categoryEvaluations.map((ev) => {
            const isSelected = ev.id === selectedRatioId;
            return (
              <button
                key={ev.id}
                type="button"
                onClick={() => setSelectedRatioId(ev.id)}
                className={`flex flex-col justify-between rounded-xl border p-5 text-left transition-all ${
                  isSelected
                    ? 'border-[#0284C7] bg-white ring-1 ring-[#0284C7]'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-semibold text-[#0B192C]">{ev.name}</span>
                    <span className="font-mono text-[11px] text-slate-400 whitespace-nowrap">
                      {ev.fiscalYear}
                    </span>
                  </div>

                  <div className="mt-3 font-mono text-2xl font-bold tracking-tight text-[#0B192C] tabular-nums">
                    {ev.formattedValue}
                  </div>

                  <div className="mt-2 font-mono text-[11px] text-slate-500">
                    {ev.formula}
                  </div>
                </div>

                <div className="mt-4 border-t border-slate-100 pt-3 text-[11px] leading-relaxed">
                  {ev.status === 'valid' ? (
                    <span className="text-slate-600">
                      <span className="font-mono text-[#0B192C] tabular-nums">
                        {ev.numeratorValueText}
                      </span>{' '}
                      ÷{' '}
                      <span className="font-mono text-[#0B192C] tabular-nums">
                        {ev.denominatorValueText}
                      </span>
                    </span>
                  ) : (
                    <span className="text-amber-700">
                      {ev.statusReason ?? 'Required underlying financial input is unavailable.'}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Formula & Sensitivity Inspector + 5-Year Trend Chart */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left: Formula & Sensitivity Inspector */}
        <div className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 lg:col-span-5">
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                  <Calculator className="h-3.5 w-3.5 text-[#0284C7]" />
                  <span>Formula &amp; Sensitivity Inspector</span>
                </div>
                <h2 className="mt-1 font-display text-lg font-bold text-[#0B192C]">
                  {selectedEvaluation.name}
                </h2>
              </div>

              <div className="text-right">
                <div className="font-mono text-2xl font-bold text-[#0B192C] tabular-nums">
                  {selectedEvaluation.formattedValue}
                </div>
                <div className="mt-0.5 text-[11px] text-slate-500">
                  {selectedEvaluation.status === 'valid'
                    ? `Computed · Unit: ${selectedEvaluation.unit}`
                    : selectedEvaluation.status === 'invalid-denominator'
                    ? 'Invalid Denominator'
                    : 'Unavailable Data'}
                </div>
              </div>
            </div>

            {selectedEvaluation.status !== 'valid' && selectedEvaluation.statusReason && (
              <div className="flex items-start gap-2.5 rounded-lg border border-amber-200 bg-amber-50/70 p-3 text-xs leading-relaxed text-amber-900">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
                <span>{selectedEvaluation.statusReason}</span>
              </div>
            )}

            <dl className="space-y-3 text-xs">
              <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-3">
                <dt className="font-medium text-slate-500">Mathematical Formula</dt>
                <dd className="mt-1 font-mono text-xs font-semibold text-[#0B192C]">
                  {selectedEvaluation.formula}
                </dd>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-lg border border-slate-200 bg-white p-3">
                  <dt className="text-slate-500">Numerator</dt>
                  <dd className="mt-1 font-medium text-[#0B192C]">
                    {selectedEvaluation.numeratorLabel}
                  </dd>
                  <dd className="mt-1 font-mono text-sm font-semibold text-[#0B192C] tabular-nums">
                    {selectedEvaluation.numeratorValueText}
                  </dd>
                </div>

                <div className="rounded-lg border border-slate-200 bg-white p-3">
                  <dt className="text-slate-500">Denominator</dt>
                  <dd className="mt-1 font-medium text-[#0B192C]">
                    {selectedEvaluation.denominatorLabel}
                  </dd>
                  <dd className="mt-1 font-mono text-sm font-semibold text-[#0B192C] tabular-nums">
                    {selectedEvaluation.denominatorValueText}
                  </dd>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-lg border border-slate-100 bg-slate-50/50 p-3">
                  <dt className="text-slate-500">Source Statement</dt>
                  <dd className="mt-1 font-medium text-[#0B192C]">
                    {selectedEvaluation.sourceStatement}
                  </dd>
                </div>

                <div className="rounded-lg border border-slate-100 bg-slate-50/50 p-3">
                  <dt className="text-slate-500">Period &amp; YoY Sensitivity</dt>
                  <dd className="mt-1 font-mono font-medium text-[#0B192C]">
                    {selectedEvaluation.fiscalYear}
                  </dd>
                  <dd className="mt-0.5 font-mono text-[11px] text-slate-600 tabular-nums">
                    {deltaText}
                  </dd>
                </div>
              </div>
            </dl>

            <div className="border-t border-slate-100 pt-3">
              <div className="text-xs font-semibold text-[#0B192C]">
                Academic Interpretation
              </div>
              <p className="mt-1 text-xs leading-relaxed text-slate-600">
                {selectedEvaluation.interpretation}
              </p>
            </div>
          </div>

          {selectedEvaluation.usesAverageBalance && (
            <div className="mt-4 border-t border-slate-100 pt-3 text-[11px] text-slate-500">
              Average Balance Rule: Uses (Beginning + Ending) ÷ 2 from consecutive fiscal
              years. FY 2020 is marked N/A because FY 2019 opening balances are absent.
            </div>
          )}
        </div>

        {/* Right: 5-Year Trend Chart */}
        <div className="flex flex-col rounded-xl border border-slate-200 bg-white p-5 lg:col-span-7">
          <div className="flex flex-col gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-display text-base font-semibold text-[#0B192C]">
                5-Year Ratio Trajectory · {selectedEvaluation.name}
              </h2>
              <p className="mt-0.5 text-xs text-slate-500">
                FY 2020 – FY 2024 · Unit: {selectedEvaluation.unit} · Illustrative Sample Data
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <label htmlFor="ratio-chart-select" className="sr-only">
                Select ratio to chart
              </label>
              <select
                id="ratio-chart-select"
                value={selectedRatioId}
                onChange={(e) => handleRatioSelectFromDropdown(e.target.value as RatioId)}
                className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-[#0B192C] focus:border-[#0B192C] focus:bg-white focus:outline-none"
              >
                {RATIO_CATEGORY_LABELS.map((cat) => (
                  <optgroup key={cat.id} label={cat.label}>
                    {RATIO_CATALOG.filter((r) => r.category === cat.id).map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name} ({r.unit})
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>

              <div className="inline-flex items-center gap-1 rounded-lg bg-slate-100 p-1">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCarrierId('carrier-a');
                    setChartCarrierMode('active');
                  }}
                  className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors whitespace-nowrap ${
                    chartCarrierMode === 'active' && selectedCarrierId === 'carrier-a'
                      ? 'bg-white text-[#0B192C] shadow-sm'
                      : 'text-slate-600 hover:text-[#0B192C]'
                  }`}
                >
                  Carrier A
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCarrierId('carrier-b');
                    setChartCarrierMode('active');
                  }}
                  className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors whitespace-nowrap ${
                    chartCarrierMode === 'active' && selectedCarrierId === 'carrier-b'
                      ? 'bg-white text-[#0B192C] shadow-sm'
                      : 'text-slate-600 hover:text-[#0B192C]'
                  }`}
                >
                  Carrier B
                </button>
                <button
                  type="button"
                  onClick={() => setChartCarrierMode('compare')}
                  className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors whitespace-nowrap ${
                    chartCarrierMode === 'compare'
                      ? 'bg-white text-[#0B192C] shadow-sm'
                      : 'text-slate-600 hover:text-[#0B192C]'
                  }`}
                >
                  Compare A vs B
                </button>
              </div>
            </div>
          </div>

          <div className="mt-4 flex-1">
            {hasAnyChartData ? (
              <div className="h-[300px] w-full">
                <Line
                  key={`${selectedRatioId}-${chartCarrierMode}-${selectedCarrierId}`}
                  data={chartData}
                  options={chartOptions}
                />
              </div>
            ) : (
              <div className="flex h-[300px] flex-col items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50/60 p-6 text-center">
                <AlertCircle className="h-6 w-6 text-amber-600" />
                <div className="mt-2 text-sm font-semibold text-[#0B192C]">
                  Trend Chart Unavailable for {selectedEvaluation.name}
                </div>
                <p className="mt-1 max-w-md text-xs leading-relaxed text-slate-600">
                  {selectedEvaluation.statusReason ??
                    'Required statement inputs for this ratio are not present in the Stage 1 illustrative dataset.'}
                </p>
              </div>
            )}
          </div>

          {selectedEvaluation.usesAverageBalance && hasAnyChartData && (
            <div className="mt-3 border-t border-slate-100 pt-2.5 text-[11px] text-slate-500">
              Note: FY 2020 is omitted on the chart (N/A) because beginning FY 2019 balance
              sheet inputs are not available to compute average balances.
            </div>
          )}
        </div>
      </section>

      {/* 5-Year Category Ratios Summary Table */}
      <section className="rounded-xl border border-slate-200 bg-white">
        <div className="flex flex-col gap-2 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-display text-base font-semibold text-[#0B192C]">
              {activeCategoryLabel} Matrix · {activeCarrier.name}
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Five-year calculated ratio table across FY 2020 – FY 2024 · Click any row to load
              it into the Formula Inspector and Chart
            </p>
          </div>
          <div className="text-xs text-slate-500">
            Selected Period:{' '}
            <span className="font-mono font-semibold text-[#0B192C]">{selectedYear}</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50 text-slate-600">
              <tr>
                <th className="px-5 py-3 font-semibold">Ratio</th>
                <th className="px-4 py-3 font-semibold">Formula</th>
                <th className="px-3 py-3 text-center font-semibold">Unit</th>
                {fiscalYears.map((yr) => (
                  <th
                    key={yr}
                    className={`px-4 py-3 text-right font-mono font-semibold whitespace-nowrap ${
                      yr === selectedYear ? 'text-[#0284C7] bg-slate-100/70' : ''
                    }`}
                  >
                    {yr}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {RATIO_CATALOG.filter((item) => item.category === activeCategory).map((meta) => {
                const isRowSelected = meta.id === selectedRatioId;
                const rowEvaluations = activeCarrier.annualSeries.map((_, idx) =>
                  evaluateRatio(meta.id, activeCarrier.annualSeries, idx)
                );
                return (
                  <tr
                    key={meta.id}
                    onClick={() => setSelectedRatioId(meta.id)}
                    className={`cursor-pointer transition-colors ${
                      isRowSelected ? 'bg-sky-50/50' : 'hover:bg-slate-50/80'
                    }`}
                  >
                    <td className="px-5 py-3 font-medium text-[#0B192C] whitespace-nowrap">
                      {meta.name}
                    </td>
                    <td className="px-4 py-3 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                      {meta.formula}
                    </td>
                    <td className="px-3 py-3 text-center font-mono text-slate-500 whitespace-nowrap">
                      {meta.unit}
                    </td>
                    {rowEvaluations.map((ev) => (
                      <td
                        key={`${meta.id}-${ev.fiscalYear}`}
                        className={`px-4 py-3 text-right font-mono tabular-nums whitespace-nowrap ${
                          ev.fiscalYear === selectedYear ? 'bg-slate-50/90 font-semibold' : ''
                        } ${
                          ev.status === 'valid' ? 'text-[#0B192C]' : 'text-amber-700'
                        }`}
                        title={ev.statusReason}
                      >
                        {ev.formattedValue}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
