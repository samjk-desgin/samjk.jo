import React from 'react';
import {
  BarChart3,
  BookOpen,
  Building2,
  Calculator,
  FileSpreadsheet,
  GitCompare,
  LayoutDashboard,
  X,
} from 'lucide-react';
import { NAVIGATION_ITEMS } from '../../data/illustrativeData';
import { PageId } from '../../types/analytics';

interface SidebarProps {
  activePage: PageId;
  onNavigate: (page: PageId) => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

const PAGE_ICONS: Record<PageId, React.ComponentType<{ className?: string }>> = {
  dashboard: LayoutDashboard,
  companies: Building2,
  'financial-analysis': FileSpreadsheet,
  'company-comparison': GitCompare,
  'financial-ratios': Calculator,
  'learning-center': BookOpen,
  reports: BarChart3,
};

export const Sidebar: React.FC<SidebarProps> = ({
  activePage,
  onNavigate,
  mobileOpen,
  onCloseMobile,
}) => {
  const handleSelect = (id: PageId) => {
    onNavigate(id);
    onCloseMobile();
  };

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/50 lg:hidden"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[264px] flex-col bg-[#0B192C] text-slate-100 border-r border-[#162944] transition-transform duration-200 ease-out lg:static lg:translate-x-0 print:hidden ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-label="Primary Navigation"
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between px-5 border-b border-[#162944]">
          <button
            type="button"
            onClick={() => handleSelect('dashboard')}
            className="flex items-center gap-3 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 rounded-md"
          >
            {/* Aviation Financial Vector Emblem */}
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#132844] border border-[#224069]">
              <svg
                viewBox="0 0 28 28"
                className="h-5 w-5"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <rect x="4" y="16" width="3.5" height="8" rx="0.75" fill="#64748B" />
                <rect x="10" y="12" width="3.5" height="12" rx="0.75" fill="#94A3B8" />
                <rect x="16" y="8" width="3.5" height="16" rx="0.75" fill="#E2E8F0" />
                <path
                  d="M4 13.5L13 8.5L23.5 4.5L19.5 10.5L13.5 11.5L4 13.5Z"
                  fill="#38BDF8"
                />
              </svg>
            </span>
            <span className="font-display text-lg font-bold tracking-tight text-white whitespace-nowrap">
              AIRLYTICS
            </span>
          </button>

          <button
            type="button"
            onClick={onCloseMobile}
            className="flex h-9 w-9 items-center justify-center rounded-md text-slate-400 hover:bg-[#132844] hover:text-white lg:hidden"
            aria-label="Close navigation menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Section */}
        <div className="flex-1 overflow-y-auto px-3 py-5">
          <p className="px-3 pb-2 text-[11px] font-medium tracking-wider text-slate-400">
            Analytics Workspace
          </p>
          <nav className="space-y-1">
            {NAVIGATION_ITEMS.map((item) => {
              const Icon = PAGE_ICONS[item.id];
              const isActive = activePage === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelect(item.id)}
                  className={`group flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 ${
                    isActive
                      ? 'bg-[#173052] text-white'
                      : 'text-slate-300 hover:bg-[#11223A] hover:text-white'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <span className="flex items-center gap-3 min-w-0">
                    <Icon
                      className={`h-4 w-4 shrink-0 ${
                        isActive ? 'text-sky-400' : 'text-slate-400 group-hover:text-slate-200'
                      }`}
                    />
                    <span className="truncate whitespace-nowrap">{item.label}</span>
                  </span>
                  {item.stageStatus === 'Planned' && (
                    <span className="ml-2 shrink-0 text-[11px] text-slate-400">
                      Planned
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Institutional Project Footer */}
        <div className="border-t border-[#162944] px-5 py-4 text-xs text-slate-400 space-y-1">
          <p className="font-medium text-slate-200">AIS &amp; Business Analytics</p>
          <p className="leading-relaxed text-slate-400">
            Stage 2: Interactive Financial Analysis &amp; Benchmarking — Illustrative Data Mode
          </p>
        </div>
      </aside>
    </>
  );
};
