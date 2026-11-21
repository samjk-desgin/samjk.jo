import React, { useEffect, useState } from 'react';
import { ArrowLeft, CheckCircle2, Database, Layers } from 'lucide-react';
import { PAGE_BLUEPRINTS } from '../../data/illustrativeData';
import { PageId } from '../../types/analytics';

interface ModuleScaffoldPageProps {
  pageId: Exclude<PageId, 'dashboard'>;
  onReturnToDashboard: () => void;
}

export const ModuleScaffoldPage: React.FC<ModuleScaffoldPageProps> = ({
  pageId,
  onReturnToDashboard,
}) => {
  const blueprint = PAGE_BLUEPRINTS[pageId];
  const [activePreviewTab, setActivePreviewTab] = useState<string>(blueprint.previewTabs[0]);

  useEffect(() => {
    setActivePreviewTab(blueprint.previewTabs[0]);
  }, [blueprint]);

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb Action + Page Heading */}
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <button
            type="button"
            onClick={onReturnToDashboard}
            className="mb-3 inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-[#0B192C] transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Stage 1 Dashboard</span>
          </button>
          <h1 className="font-display text-2xl font-bold tracking-tight text-[#0B192C] sm:text-3xl">
            {blueprint.title}
          </h1>
          <p className="mt-1 text-sm text-slate-600">{blueprint.subtitle}</p>
        </div>

        <div className="text-xs text-slate-500">
          <span>Module Status: Structural Blueprint</span>
          <span className="mx-2" aria-hidden="true">
            ·
          </span>
          <span>Target: Stage 2+ Implementation</span>
        </div>
      </section>

      {/* Purpose & AIS Curriculum Alignment */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <article className="rounded-xl border border-slate-200 bg-white p-6 lg:col-span-7">
          <h2 className="font-display text-base font-semibold text-[#0B192C]">
            Page Purpose & Analytical Role
          </h2>
          <p className="mt-2.5 text-sm leading-relaxed text-slate-700">
            {blueprint.purpose}
          </p>

          <div className="mt-5 border-t border-slate-100 pt-4">
            <h3 className="font-display text-xs font-semibold text-slate-500">
              Accounting Information Systems Focus
            </h3>
            <p className="mt-1.5 text-sm leading-relaxed text-slate-700">
              {blueprint.aisFocus}
            </p>
          </div>
        </article>

        <article className="rounded-xl border border-slate-200 bg-white p-6 lg:col-span-5">
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4 text-[#1E3A5F]" />
            <h2 className="font-display text-base font-semibold text-[#0B192C]">
              Required Official Data Inputs
            </h2>
          </div>
          <p className="mt-1.5 text-xs text-slate-500">
            No fabricated numbers are populated here prior to official annual report ingestion.
          </p>
          <ul className="mt-4 space-y-2.5">
            {blueprint.requiredOfficialInputs.map((input) => (
              <li
                key={input}
                className="flex items-start gap-2.5 text-xs leading-relaxed text-slate-700"
              >
                <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#1E3A5F]" />
                <span>{input}</span>
              </li>
            ))}
          </ul>
        </article>
      </section>

      {/* Interactive Planned Tab Structure Preview */}
      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="flex flex-col gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-[#1E3A5F]" />
            <h2 className="font-display text-base font-semibold text-[#0B192C]">
              Planned Workspace Sections & View Tabs
            </h2>
          </div>

          <div className="inline-flex flex-wrap items-center gap-1 rounded-lg bg-slate-100 p-1">
            {blueprint.previewTabs.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActivePreviewTab(tab)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
                  activePreviewTab === tab
                    ? 'bg-white text-[#0B192C] shadow-sm'
                    : 'text-slate-600 hover:text-[#0B192C]'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
          {blueprint.plannedComponents.map((comp) => (
            <div
              key={comp.name}
              className="rounded-lg border border-slate-200 bg-slate-50/70 p-4"
            >
              <h3 className="font-display text-sm font-semibold text-[#0B192C]">
                {comp.name}
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-600">
                {comp.description}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-5 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-5 py-6 text-center">
          <p className="font-display text-sm font-semibold text-[#0B192C]">
            Active Preview Tab: {activePreviewTab}
          </p>
          <p className="mx-auto mt-1.5 max-w-xl text-xs leading-relaxed text-slate-600">
            This module is intentionally scoped as a structural placeholder in Stage 1. Once we
            define the MySQL relational schema and ingest official airline annual reports, this
            canvas will render live verified tables and Chart.js comparisons for{' '}
            <span className="font-medium text-[#0B192C]">{activePreviewTab}</span>.
          </p>
        </div>
      </section>
    </div>
  );
};
