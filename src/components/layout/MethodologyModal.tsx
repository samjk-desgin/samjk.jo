import React from 'react';
import { X } from 'lucide-react';

interface MethodologyModalProps {
  open: boolean;
  onClose: () => void;
}

export const MethodologyModal: React.FC<MethodologyModalProps> = ({ open, onClose }) => {
  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="methodology-modal-title"
    >
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h2
              id="methodology-modal-title"
              className="font-display text-lg font-semibold text-[#0B192C]"
            >
              AIRLYTICS Development Methodology & Data Policy
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Accounting Information Systems · Step-by-Step Build Documentation
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900"
            aria-label="Close methodology dialog"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-6 p-6 text-sm leading-relaxed text-slate-700">
          <section className="space-y-2">
            <h3 className="font-display text-sm font-semibold text-[#0B192C]">
              1. Strict Data Integrity Rule (Illustrative vs. Official)
            </h3>
            <p>
              Every numerical figure currently rendered in the Stage 1 Dashboard is strictly{' '}
              <strong className="font-semibold text-slate-900">
                illustrative placeholder data
              </strong>{' '}
              used to validate chart axes, tabular alignment, and layout responsiveness. No real
              airline’s audited results are fabricated or implied.
            </p>
            <p>
              In subsequent development stages, official figures will be extracted directly from
              published annual reports (Form 10-K / IFRS Consolidated Financial Statements) across
              five consecutive fiscal years.
            </p>
          </section>

          <section className="space-y-2 border-t border-slate-200 pt-5">
            <h3 className="font-display text-sm font-semibold text-[#0B192C]">
              2. Target Technical Architecture & Current Preview
            </h3>
            <div className="overflow-hidden rounded-lg border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-2.5 font-semibold">Layer</th>
                    <th className="px-4 py-2.5 font-semibold">Proposed AIS Stack</th>
                    <th className="px-4 py-2.5 font-semibold">Stage 1 Interactive Preview</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  <tr>
                    <td className="px-4 py-2.5 font-medium text-slate-900">Presentation</td>
                    <td className="px-4 py-2.5">HTML, CSS, JavaScript</td>
                    <td className="px-4 py-2.5">React, TypeScript & Tailwind CSS</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2.5 font-medium text-slate-900">Visualizations</td>
                    <td className="px-4 py-2.5">Chart.js</td>
                    <td className="px-4 py-2.5">Chart.js (via react-chartjs-2)</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2.5 font-medium text-slate-900">Backend & Logic</td>
                    <td className="px-4 py-2.5">Python (Ratio Engine & ETL)</td>
                    <td className="px-4 py-2.5">Planned for Stage 2+ API integration</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2.5 font-medium text-slate-900">Database</td>
                    <td className="px-4 py-2.5">MySQL (Relational Schema)</td>
                    <td className="px-4 py-2.5">Planned for Stage 2+ statement storage</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="space-y-2 border-t border-slate-200 pt-5">
            <h3 className="font-display text-sm font-semibold text-[#0B192C]">
              3. Planned Incremental Build Roadmap
            </h3>
            <ol className="list-decimal pl-5 space-y-1.5 text-slate-700">
              <li>
                <strong className="font-medium text-slate-900">Stage 1 (Current):</strong> Website
                navigation structure across all 7 modules and initial Dashboard layout with Chart.js.
              </li>
              <li>
                <strong className="font-medium text-slate-900">Stage 2:</strong> Relational schema
                design for airlines, fiscal periods, and normalized financial statement line items.
              </li>
              <li>
                <strong className="font-medium text-slate-900">Stage 3:</strong> Official annual
                report data ingestion for two selected airlines and Python ratio computation.
              </li>
              <li>
                <strong className="font-medium text-slate-900">Stage 4:</strong> Interactive
                Company Comparison, Learning Center modules, and exportable analytical Reports.
              </li>
            </ol>
          </section>
        </div>

        <div className="flex justify-end border-t border-slate-200 bg-slate-50 px-6 py-3.5">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-[#0B192C] px-4 py-2 text-xs font-medium text-white hover:bg-[#132844] transition-colors"
          >
            Close Documentation
          </button>
        </div>
      </div>
    </div>
  );
};
