import React, { useMemo, useState } from 'react';
import { DashboardPage } from './components/dashboard/DashboardPage';
import { MethodologyModal } from './components/layout/MethodologyModal';
import { Sidebar } from './components/layout/Sidebar';
import { TopHeader } from './components/layout/TopHeader';
import { FinancialAnalysisPage } from './components/pages/FinancialAnalysisPage';
import { FinancialRatiosPage } from './components/pages/FinancialRatiosPage';
import { CompanyComparisonPage } from './components/pages/CompanyComparisonPage';
import { CompaniesPage } from './components/pages/CompaniesPage';
import { LearningCenterPage } from './components/pages/LearningCenterPage';
import { ReportsPage } from './components/pages/ReportsPage';
import { NAVIGATION_ITEMS } from './data/illustrativeData';
import { PageId } from './types/analytics';

interface RoutedPageProps {
  onNavigate: (page: PageId) => void;
  onReturnToDashboard: () => void;
  onOpenMethodology: () => void;
}

const PAGE_COMPONENTS: Record<PageId, React.ComponentType<RoutedPageProps>> = {
  dashboard: ({ onNavigate, onOpenMethodology }) => (
    <DashboardPage onNavigate={onNavigate} onOpenMethodology={onOpenMethodology} />
  ),
  companies: ({ onReturnToDashboard, onOpenMethodology }) => (
    <CompaniesPage
      onReturnToDashboard={onReturnToDashboard}
      onOpenMethodology={onOpenMethodology}
    />
  ),
  'financial-analysis': ({ onReturnToDashboard, onOpenMethodology }) => (
    <FinancialAnalysisPage
      onReturnToDashboard={onReturnToDashboard}
      onOpenMethodology={onOpenMethodology}
    />
  ),
  'company-comparison': ({ onReturnToDashboard, onOpenMethodology }) => (
    <CompanyComparisonPage
      onReturnToDashboard={onReturnToDashboard}
      onOpenMethodology={onOpenMethodology}
    />
  ),
  'financial-ratios': ({ onReturnToDashboard, onOpenMethodology }) => (
    <FinancialRatiosPage
      onReturnToDashboard={onReturnToDashboard}
      onOpenMethodology={onOpenMethodology}
    />
  ),
  'learning-center': ({ onReturnToDashboard, onOpenMethodology }) => (
    <LearningCenterPage
      onReturnToDashboard={onReturnToDashboard}
      onOpenMethodology={onOpenMethodology}
    />
  ),
  reports: ({ onReturnToDashboard, onOpenMethodology }) => (
    <ReportsPage
      onReturnToDashboard={onReturnToDashboard}
      onOpenMethodology={onOpenMethodology}
    />
  ),
};

export default function App() {
  const [activePage, setActivePage] = useState<PageId>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [methodologyOpen, setMethodologyOpen] = useState<boolean>(false);

  const activeNavItem = useMemo(
    () =>
      NAVIGATION_ITEMS.find((item) => item.id === activePage) ?? NAVIGATION_ITEMS[0],
    [activePage]
  );

  const ActivePageComponent = PAGE_COMPONENTS[activePage];

  return (
    <div className="flex min-h-screen bg-[#F4F6F9] text-[#0F172A]">
      <Sidebar
        activePage={activePage}
        onNavigate={setActivePage}
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <TopHeader
          activePage={activePage}
          pageTitle={activeNavItem.label}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          onOpenMethodology={() => setMethodologyOpen(true)}
        />

        <main className="mx-auto w-full max-w-[1440px] flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <ActivePageComponent
            onNavigate={setActivePage}
            onReturnToDashboard={() => setActivePage('dashboard')}
            onOpenMethodology={() => setMethodologyOpen(true)}
          />
        </main>

        <footer className="border-t border-slate-200 bg-white px-4 py-4 text-xs text-slate-500 sm:px-6 lg:px-8 print:hidden">
          <div className="mx-auto flex max-w-[1440px] flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <span>
              Avantra · Numbers with altitude · University Accounting Information Systems &amp; Business Analytics Project
            </span>
            <span>
              Stage 2: Interactive Financial Analysis &amp; Benchmarking — Illustrative Data Mode
            </span>
          </div>
        </footer>
      </div>

      <MethodologyModal
        open={methodologyOpen}
        onClose={() => setMethodologyOpen(false)}
      />
    </div>
  );
}
