import React, { useMemo, useState } from 'react';
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  Clock,
  Database,
  FileText,
  Info,
  MinusCircle,
  Plane,
} from 'lucide-react';
import { ILLUSTRATIVE_CARRIERS } from '../../data/illustrativeData';

interface CompaniesPageProps {
  onReturnToDashboard: () => void;
  onOpenMethodology: () => void;
}

type CompaniesTabId = 'entity-profiles' | 'filing-registry' | 'fleet-network';
type CarrierId = 'carrier-a' | 'carrier-b';
type SourceStatus =
  | 'Pending'
  | 'Verified'
  | 'Not Available'
  | 'Illustrative Data Loaded — Official Verification Pending';

interface ProfileMetadataRow {
  label: string;
  value: string;
  status: SourceStatus;
}

interface OperationalDisclosureField {
  field: string;
  value: string;
  unit: string;
  requiredDisclosure: string;
  status: SourceStatus;
}

const WORKSPACE_TABS: { id: CompaniesTabId; label: string }[] = [
  { id: 'entity-profiles', label: 'Entity Profiles' },
  { id: 'filing-registry', label: 'Filing Registry' },
  { id: 'fleet-network', label: 'Fleet & Network Context' },
];

const AIS_DATA_DOMAINS: {
  domain: string;
  tableHint: string;
  currentState: string;
  status: SourceStatus;
}[] = [
  {
    domain: 'Entity Master Data',
    tableHint: 'dim_airline_entity',
    currentState: 'Illustrative entity archetypes active; legal identifiers pending',
    status: 'Pending',
  },
  {
    domain: 'Financial Statements',
    tableHint: 'fact_financial_statement',
    currentState: 'Illustrative FY 2020 – FY 2024 series loaded (not audited or verified)',
    status: 'Illustrative Data Loaded — Official Verification Pending',
  },
  {
    domain: 'Official Filing Sources',
    tableHint: 'dim_filing_registry',
    currentState: 'Annual Reports / Form 10-K & audit opinions not yet attached',
    status: 'Pending',
  },
  {
    domain: 'Operational Statistics',
    tableHint: 'fact_operational_capacity',
    currentState: 'Fleet, hubs, ASM, RPM, and Load Factor awaiting disclosure',
    status: 'Not Available',
  },
];

const OPERATIONAL_FIELDS: OperationalDisclosureField[] = [
  {
    field: 'Fleet Size',
    value: 'N/A',
    unit: 'Aircraft Count',
    requiredDisclosure: 'Year-end operating fleet schedule (Annual Report / Fleet Note)',
    status: 'Not Available',
  },
  {
    field: 'Aircraft Types',
    value: 'N/A',
    unit: 'Family / Model Mix',
    requiredDisclosure: 'Narrow-body, wide-body, and regional fleet breakdown',
    status: 'Not Available',
  },
  {
    field: 'Number of Hubs',
    value: 'N/A',
    unit: 'Count',
    requiredDisclosure: 'Primary hub & focus-city airport disclosures',
    status: 'Not Available',
  },
  {
    field: 'Main Operating Regions',
    value: 'N/A',
    unit: 'Geographic Segments',
    requiredDisclosure: 'Segment revenue & route geography note (ASC 280 / IFRS 8)',
    status: 'Not Available',
  },
  {
    field: 'Route Network',
    value: 'N/A',
    unit: 'Destinations / Routes',
    requiredDisclosure: 'Verified network destinations and stage-length profile',
    status: 'Not Available',
  },
  {
    field: 'Available Seat Miles (ASM)',
    value: 'N/A',
    unit: 'Capacity (Millions)',
    requiredDisclosure: 'Operating statistics table in Form 10-K Item 7 / Annual Report',
    status: 'Not Available',
  },
  {
    field: 'Revenue Passenger Miles (RPM)',
    value: 'N/A',
    unit: 'Traffic (Millions)',
    requiredDisclosure: 'Operating statistics table in Form 10-K Item 7 / Annual Report',
    status: 'Not Available',
  },
  {
    field: 'Passenger Load Factor',
    value: 'N/A',
    unit: 'RPM ÷ ASM (%)',
    requiredDisclosure: 'Derived only when verified RPM and ASM inputs are available',
    status: 'Not Available',
  },
];

function StatusIndicator({ status }: { status: SourceStatus }) {
  if (status === 'Verified') {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 whitespace-nowrap">
        <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
        <span>Verified</span>
      </span>
    );
  }
  if (status === 'Illustrative Data Loaded — Official Verification Pending') {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-[#0284C7]">
        <Info className="h-3.5 w-3.5 shrink-0" />
        <span>Illustrative Data Loaded — Official Verification Pending</span>
      </span>
    );
  }
  if (status === 'Pending') {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 whitespace-nowrap">
        <Clock className="h-3.5 w-3.5 shrink-0" />
        <span>Pending</span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 whitespace-nowrap">
      <MinusCircle className="h-3.5 w-3.5 shrink-0" />
      <span>Not Available</span>
    </span>
  );
}

function getProfileMetadataRows(): ProfileMetadataRow[] {
  return [
    { label: 'Legal Company Name', value: 'Pending Official Data', status: 'Pending' },
    { label: 'Ticker Symbol', value: 'Not Available', status: 'Not Available' },
    { label: 'Stock Exchange', value: 'Not Available', status: 'Not Available' },
    { label: 'Headquarters', value: 'Pending Official Data', status: 'Pending' },
    { label: 'Reporting Currency', value: 'Pending Official Data', status: 'Pending' },
    {
      label: 'Accounting Framework (IFRS / US GAAP)',
      value: 'Pending Official Data',
      status: 'Pending',
    },
    { label: 'Fiscal Year-End', value: 'Pending Official Data', status: 'Pending' },
  ];
}

export const CompaniesPage: React.FC<CompaniesPageProps> = ({
  onReturnToDashboard,
  onOpenMethodology,
}) => {
  const [activeTab, setActiveTab] = useState<CompaniesTabId>('entity-profiles');
  const [selectedCarrierId, setSelectedCarrierId] = useState<CarrierId>('carrier-a');
  const [selectedFilingYear, setSelectedFilingYear] = useState<string>('FY 2024');

  const carrierA = ILLUSTRATIVE_CARRIERS[0];
  const carrierB = ILLUSTRATIVE_CARRIERS[1];

  const activeCarrier = selectedCarrierId === 'carrier-b' ? carrierB : carrierA;

  const fiscalYears = useMemo(
    () => activeCarrier.annualSeries.map((r) => r.fiscalYear),
    [activeCarrier]
  );

  const metadataRows = useMemo(() => getProfileMetadataRows(), []);

  const carrierCardsConfig = useMemo(
    () => [
      {
        id: 'carrier-a' as CarrierId,
        shortTitle: 'Carrier A',
        fullTitle: carrierA.name,
        businessModel: 'Full-Service Network Model',
        archetypeDetail: carrierA.businessModel,
        entityClassification: 'Illustrative Airline',
        financialDataset: 'FY 2020 – FY 2024',
      },
      {
        id: 'carrier-b' as CarrierId,
        shortTitle: 'Carrier B',
        fullTitle: carrierB.name,
        businessModel: 'Low-Cost Point-to-Point Model',
        archetypeDetail: carrierB.businessModel,
        entityClassification: 'Illustrative Airline',
        financialDataset: 'FY 2020 – FY 2024',
      },
    ],
    [carrierA.name, carrierA.businessModel, carrierB.name, carrierB.businessModel]
  );

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
            Airline Entity Profiles &amp; Filing Registry
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Manage entity master classifications, five-year filing source verification status,
            and operational network context separately from audited financial statements.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
          <span>2 Illustrative Entities</span>
          <span aria-hidden="true">·</span>
          <span className="font-mono">FY 2020 – FY 2024</span>
          <span aria-hidden="true">·</span>
          <span>Illustrative Sample Data</span>
        </div>
      </section>

      {/* Mandatory Data Integrity Disclaimer */}
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
            Carrier A and Carrier B are illustrative airline archetypes. Corporate legal
            identifiers, official Form 10-K / IFRS annual reports, audit opinions, and fleet
            statistics remain marked as Pending Official Data or Not Available until verified
            source filings are selected.
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

      {/* AIS Data Domain Governance Strip */}
      <section
        aria-label="AIS Data Governance Domains"
        className="rounded-xl border border-slate-200 bg-white p-5"
      >
        <div className="flex flex-col gap-2 border-b border-slate-100 pb-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4 text-[#0284C7]" />
            <h2 className="font-display text-sm font-semibold text-[#0B192C]">
              AIS Data Separation &amp; Source Verification Status
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
            <StatusIndicator status="Verified" />
            <StatusIndicator status="Pending" />
            <StatusIndicator status="Not Available" />
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {AIS_DATA_DOMAINS.map((item) => (
            <div
              key={item.domain}
              className="flex flex-col justify-between rounded-lg border border-slate-200 bg-slate-50/60 p-3.5"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-[#0B192C]">{item.domain}</span>
                  <StatusIndicator status={item.status} />
                </div>
                <p className="mt-1.5 text-[11px] leading-relaxed text-slate-600">
                  {item.currentState}
                </p>
              </div>
              <div className="mt-2.5 border-t border-slate-200/70 pt-2 font-mono text-[11px] text-slate-500">
                Relational Entity: {item.tableHint}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Workspace Controls: Tabs + Company Selector */}
      <section
        aria-label="Companies Module Controls"
        className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-5 lg:flex-row lg:items-center lg:justify-between"
      >
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-1 text-xs font-medium text-slate-500">Workspace View:</span>
          <div
            role="tablist"
            aria-label="Companies Workspace Tabs"
            className="inline-flex flex-wrap items-center gap-1 rounded-lg bg-slate-100 p-1"
          >
            {WORKSPACE_TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={activeTab === tab.id}
                onClick={() => setActiveTab(tab.id)}
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
          <span className="mr-1 text-xs font-medium text-slate-500">Active Company:</span>
          <div className="inline-flex items-center gap-1 rounded-lg bg-slate-100 p-1">
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
      </section>

      {/* TAB A: Entity Profiles */}
      {activeTab === 'entity-profiles' && (
        <section aria-label="Entity Profiles" className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {carrierCardsConfig.map((card) => {
            const isSelected = card.id === selectedCarrierId;
            return (
              <article
                key={card.id}
                className={`rounded-xl border bg-white p-6 transition-all ${
                  isSelected ? 'border-[#0284C7] ring-1 ring-[#0284C7]' : 'border-slate-200'
                }`}
              >
                <div className="flex flex-col gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-[#0284C7]" />
                      <h2 className="font-display text-lg font-bold text-[#0B192C]">
                        {card.shortTitle}
                      </h2>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">{card.fullTitle}</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedCarrierId(card.id)}
                    className={`shrink-0 self-start rounded-lg px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
                      isSelected
                        ? 'bg-[#0B192C] text-white'
                        : 'border border-slate-200 bg-slate-50 text-[#0B192C] hover:bg-slate-100'
                    }`}
                  >
                    {isSelected ? 'Selected Entity' : `Inspect ${card.shortTitle}`}
                  </button>
                </div>

                {/* Illustrative Classification Block */}
                <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50/70 p-4">
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="font-semibold text-[#0B192C]">
                      Illustrative Classification
                    </span>
                    <span className="text-[11px] text-slate-500">Stage 1 Sample Scope</span>
                  </div>
                  <dl className="mt-3 grid grid-cols-1 gap-3 text-xs sm:grid-cols-3">
                    <div>
                      <dt className="text-slate-500">Business Model</dt>
                      <dd className="mt-0.5 font-semibold text-[#0B192C]">
                        {card.businessModel}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-slate-500">Entity Classification</dt>
                      <dd className="mt-0.5 font-semibold text-[#0B192C]">
                        {card.entityClassification}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-slate-500">Financial Dataset</dt>
                      <dd className="mt-0.5 font-mono font-semibold text-[#0B192C]">
                        {card.financialDataset}
                      </dd>
                    </div>
                  </dl>
                  <p className="mt-2.5 text-[11px] text-slate-500">
                    Archetype Notes: {card.archetypeDetail}
                  </p>
                </div>

                {/* Corporate Master Metadata Table */}
                <div className="mt-5">
                  <div className="flex items-center justify-between gap-2 pb-2">
                    <h3 className="font-display text-xs font-semibold text-[#0B192C]">
                      Verified Corporate Master Metadata
                    </h3>
                    <span className="text-[11px] text-slate-500">
                      Unverified fields await official filings
                    </span>
                  </div>
                  <div className="divide-y divide-slate-100 rounded-lg border border-slate-200">
                    {metadataRows.map((row) => (
                      <div
                        key={`${card.id}-${row.label}`}
                        className="flex flex-col gap-1 px-4 py-2.5 text-xs sm:flex-row sm:items-center sm:justify-between"
                      >
                        <span className="font-medium text-slate-700">{row.label}</span>
                        <div className="flex items-center gap-3 sm:text-right">
                          <span className="font-mono text-slate-600">{row.value}</span>
                          <StatusIndicator status={row.status} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      )}

      {/* TAB B: Filing Registry */}
      {activeTab === 'filing-registry' && (
        <section aria-label="Five-Year Filing Registry" className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white">
            <div className="flex flex-col gap-3 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-[#0284C7]" />
                  <h2 className="font-display text-base font-semibold text-[#0B192C]">
                    Five-Year Official Filing Registry · {activeCarrier.name}
                  </h2>
                </div>
                <p className="mt-0.5 text-xs text-slate-500">
                  Tracks annual report source documents, accounting frameworks, and audit
                  verification for FY 2020 – FY 2024. Official filings have not yet been
                  selected or ingested.
                </p>
              </div>
              <div className="text-xs text-slate-500 whitespace-nowrap">
                Illustrative Entity:{' '}
                <span className="font-semibold text-[#0B192C]">
                  {selectedCarrierId === 'carrier-b' ? 'Carrier B' : 'Carrier A'}
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-200 bg-slate-50 text-slate-600">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Fiscal Year</th>
                    <th className="px-4 py-3 font-semibold">Annual Report / Form 10-K</th>
                    <th className="px-4 py-3 font-semibold">Publication Date</th>
                    <th className="px-4 py-3 font-semibold">Reporting Currency</th>
                    <th className="px-4 py-3 font-semibold">Accounting Framework</th>
                    <th className="px-4 py-3 font-semibold">Auditor&apos;s Opinion</th>
                    <th className="px-5 py-3 font-semibold">Source Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {fiscalYears.map((yr) => {
                    const isFocused = yr === selectedFilingYear;
                    return (
                      <tr
                        key={yr}
                        onClick={() => setSelectedFilingYear(yr)}
                        className={`cursor-pointer transition-colors ${
                          isFocused ? 'bg-sky-50/50' : 'hover:bg-slate-50/80'
                        }`}
                      >
                        <td className="px-5 py-3 font-mono font-semibold text-[#0B192C] whitespace-nowrap">
                          {yr}
                        </td>
                        <td className="px-4 py-3 text-amber-800 whitespace-nowrap">
                          Pending Official Source
                        </td>
                        <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                          Pending Official Data
                        </td>
                        <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                          Pending Official Data
                        </td>
                        <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                          Pending Official Data
                        </td>
                        <td className="px-4 py-3 text-amber-800 whitespace-nowrap">
                          Pending Official Source
                        </td>
                        <td className="px-5 py-3 whitespace-nowrap">
                          <StatusIndicator status="Pending" />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="border-t border-slate-100 bg-slate-50/60 px-5 py-3 text-[11px] text-slate-500">
              Relational Registry Key ({selectedCarrierId}, {selectedFilingYear}): Awaiting
              official source selection before populating filing links, audit opinions, or
              verified accounting standards.
            </div>
          </div>
        </section>
      )}

      {/* TAB C: Fleet & Network Context */}
      {activeTab === 'fleet-network' && (
        <section aria-label="Fleet and Network Context" className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="flex flex-col gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Plane className="h-4 w-4 text-[#0284C7]" />
                  <h2 className="font-display text-base font-semibold text-[#0B192C]">
                    Operational Fleet &amp; Network Context · {activeCarrier.name}
                  </h2>
                </div>
                <p className="mt-0.5 text-xs text-slate-500">
                  Operational and capacity context is stored separately from audited GAAP / IFRS
                  financial statements and remains N/A until verified operational disclosures are
                  provided.
                </p>
              </div>
              <StatusIndicator status="Not Available" />
            </div>

            <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50/70 p-4 text-xs">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <span className="font-semibold text-[#0B192C]">
                  Illustrative Operating Archetype (Not Audited Operational Data):
                </span>
                <span className="font-medium text-slate-700">
                  {activeCarrier.businessModel}
                </span>
              </div>
            </div>

            <div className="mt-5 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-200 bg-slate-50 text-slate-600">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Operational Field</th>
                    <th className="px-4 py-3 font-semibold">Reported Value</th>
                    <th className="px-4 py-3 font-semibold">Expected Unit</th>
                    <th className="px-4 py-3 font-semibold">Required Official Disclosure</th>
                    <th className="px-4 py-3 font-semibold">Source Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {OPERATIONAL_FIELDS.map((item) => (
                    <tr key={item.field} className="hover:bg-slate-50/60">
                      <td className="px-4 py-3 font-medium text-[#0B192C] whitespace-nowrap">
                        {item.field}
                      </td>
                      <td className="px-4 py-3 font-mono font-semibold text-amber-700 whitespace-nowrap">
                        {item.value}
                      </td>
                      <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                        {item.unit}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {item.requiredDisclosure}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <StatusIndicator status={item.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};
