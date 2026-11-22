import React from 'react';
import { BookMarked, Menu } from 'lucide-react';
import { PageId } from '../../types/analytics';

interface TopHeaderProps {
  activePage: PageId;
  pageTitle: string;
  onOpenMobileMenu: () => void;
  onOpenMethodology: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  activePage,
  pageTitle,
  onOpenMobileMenu,
  onOpenMethodology,
}) => {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-slate-200 bg-white px-4 sm:px-6 lg:px-8 print:hidden">
      {/* Left Zone: Mobile menu trigger + Contextual Breadcrumb */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 lg:hidden"
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm min-w-0">
          <span className="font-display font-semibold text-[#0B192C] whitespace-nowrap shrink-0">
            AIRLYTICS
          </span>
          <span className="text-slate-300 shrink-0" aria-hidden="true">
            /
          </span>
          <span className="font-medium text-slate-600 truncate">
            {pageTitle}
          </span>
          <span className="hidden md:inline text-slate-300 shrink-0" aria-hidden="true">
            ·
          </span>
          <span className="hidden md:inline text-xs text-slate-500 whitespace-nowrap shrink-0">
            {activePage === 'learning-center'
              ? 'Educational Reference'
              : 'Illustrative Data Mode'}
          </span>
        </nav>
      </div>

      {/* Right Zone: Single Primary Action */}
      <div className="flex items-center shrink-0">
        <button
          type="button"
          onClick={onOpenMethodology}
          className="inline-flex items-center gap-2 rounded-lg bg-[#0B192C] px-4 py-2 text-xs font-medium text-white hover:bg-[#132844] transition-colors whitespace-nowrap shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0B192C] focus-visible:ring-offset-2"
        >
          <BookMarked className="h-3.5 w-3.5" />
          <span>Methodology & Stack</span>
        </button>
      </div>
    </header>
  );
};
