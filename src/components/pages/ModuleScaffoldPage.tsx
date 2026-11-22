import React from 'react';
import { ArrowLeft, Info } from 'lucide-react';
import { PAGE_BLUEPRINTS } from '../../data/illustrativeData';
import { PageId } from '../../types/analytics';

interface ModuleScaffoldPageProps {
  pageId: PageId;
  onReturnToDashboard: () => void;
}

export const ModuleScaffoldPage: React.FC<ModuleScaffoldPageProps> = ({
  pageId,
  onReturnToDashboard,
}) => {
  if (pageId === 'dashboard') {
    return null;
  }

  const blueprint = PAGE_BLUEPRINTS[pageId];

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <button
            type="button"
            onClick={onReturnToDashboard}
            className="mb-3 inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 transition-colors hover:text-[#0B192C]"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Dashboard</span>
          </button>
          <h1 className="font-display text-2xl font-bold tracking-tight text-[#0B192C] sm:text-3xl">
            {blueprint.title}
          </h1>
          <p className="mt-1 text-sm text-slate-600">{blueprint.subtitle}</p>
        </div>
      </section>

      <section className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-[#1E3A5F]" />
        <div className="text-xs leading-relaxed text-slate-600">
          <span className="font-semibold text-[#0B192C]">Module Blueprint:</span>{' '}
          {blueprint.purpose}
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="font-display text-base font-semibold text-[#0B192C]">
          AIS Analytical Scope
        </h2>
        <p className="mt-1 text-xs leading-relaxed text-slate-600">{blueprint.aisFocus}</p>

        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
          {blueprint.plannedComponents.map((comp) => (
            <div
              key={comp.name}
              className="rounded-lg border border-slate-200 bg-slate-50/70 p-4"
            >
              <div className="font-display text-sm font-semibold text-[#0B192C]">
                {comp.name}
              </div>
              <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
                {comp.description}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
