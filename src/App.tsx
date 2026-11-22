import { useMemo, useState } from 'react';
import { DashboardPage } from './components/dashboard/DashboardPage';
import { MethodologyModal } from './components/layout/MethodologyModal';
import { Sidebar } from './components/layout/Sidebar';
import { TopHeader } from './components/layout/TopHeader';
import { ModuleScaffoldPage } from './components/pages/ModuleScaffoldPage';
import { FinancialAnalysisPage } from './components/pages/FinancialAnalysisPage';
import { FinancialRatiosPage } from './components/pages/FinancialRatiosPage';
import { CompanyComparisonPage } from './components/pages/CompanyComparisonPage';
import { CompaniesPage } from './components/pages/CompaniesPage';
import { LearningCenterPage } from './components/pages/LearningCenterPage';
import { NAVIGATION_ITEMS } from './data/illustrativeData';
import { PageId } from './types/analytics';

export default function App() {
  const [activePage, setActivePage] = useState<PageId>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [methodologyOpen, setMethodologyOpen] = useState<boolean>(false);

  const activeNavItem = useMemo(
    () =>
      NAVIGATION_ITEMS.find((item) => item.id === activePage) ?? NAVIGATION_ITEMS[0],
    [activePage]
  );

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
          {activePage === 'dashboard' ? (
            <DashboardPage
              onNavigate={setActivePage}
              onOpenMethodology={() => setMethodologyOpen(true)}
            />
          ) : activePage === 'companies' ? (
            <CompaniesPage
              onReturnToDashboard={() => setActivePage('dashboard')}
              onOpenMethodology={() => setMethodologyOpen(true)}
            />
          ) : activePage === 'financial-analysis' ? (
            <FinancialAnalysisPage
              onReturnToDashboard={() => setActivePage('dashboard')}
              onOpenMethodology={() => setMethodologyOpen(true)}
            />
          ) : activePage === 'company-comparison' ? (
            <CompanyComparisonPage
              onReturnToDashboard={() => setActivePage('dashboard')}
              onOpenMethodology={() => setMethodologyOpen(true)}
            />
          ) : activePage === 'financial-ratios' ? (
            <FinancialRatiosPage
              onReturnToDashboard={() => setActivePage('dashboard')}
              onOpenMethodology={() => setMethodologyOpen(true)}
            />
          ) : activePage === 'learning-center' ? (
            <LearningCenterPage
              onReturnToDashboard={() => setActivePage('dashboard')}
              onOpenMethodology={() => setMethodologyOpen(true)}
            />
          ) : (
            <ModuleScaffoldPage
              pageId={activePage}
              onReturnToDashboard={() => setActivePage('dashboard')}
            />
          )}
        </main>

        <footer className="border-t border-slate-200 bg-white px-4 py-4 text-xs text-slate-500 sm:px-6 lg:px-8">
          <div className="mx-auto flex max-w-[1440px] flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <span>
              AIRLYTICS · University Accounting Information Systems & Business Analytics Project
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
