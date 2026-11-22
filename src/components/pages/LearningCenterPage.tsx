import React, { useMemo, useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  BarChart3,
  BookOpen,
  Calculator,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Cpu,
  Database,
  FileSpreadsheet,
  Info,
  Layers,
  Monitor,
  Search,
} from 'lucide-react';

interface LearningCenterPageProps {
  onReturnToDashboard: () => void;
  onOpenMethodology: () => void;
}

type LearningTabId = 'concepts' | 'ratio-guide' | 'ais-architecture';

type RatioGuideCategory =
  | 'all'
  | 'profitability'
  | 'liquidity'
  | 'leverage'
  | 'cash-flow';

interface JournalEntryLine {
  account: string;
  debit?: string;
  credit?: string;
}

interface AccountingConceptItem {
  id: string;
  title: string;
  standardsContext: string;
  definition: string;
  whyItMatters: string;
  exampleCaption: string;
  journalEntries: JournalEntryLine[];
  additionalConceptualNote: string;
  practicalInterpretation: string;
  learnMoreTitle: string;
  learnMorePoints: string[];
}

interface RatioGuideItem {
  id: string;
  name: string;
  category: Exclude<RatioGuideCategory, 'all'>;
  categoryLabel: string;
  isSupportingMetric?: boolean;
  formula: string;
  numerator: string;
  denominator: string;
  definition: string;
  directionalGuidance: string;
  airlineRelevance: string;
  commonMistake: string;
  availabilityNote?: string;
}

interface ArchitectureStage {
  stepNumber: number;
  id: string;
  title: string;
  status: 'Currently Implemented' | 'Planned';
  summary: string;
  components: {
    name: string;
    detail: string;
  }[];
}

const ACCOUNTING_CONCEPTS: AccountingConceptItem[] = [
  {
    id: 'air-traffic-liability',
    title: 'Air Traffic Liability (Deferred Ticket Revenue)',
    standardsContext: 'IFRS 15 / ASC 606 · Revenue from Contracts with Customers',
    definition:
      'Air Traffic Liability (ATL) is a contract liability representing cash received in advance from passengers for tickets and ancillary services where the flight transportation obligation has not yet been performed. Current versus non-current presentation depends on the expected timing of satisfying the transportation obligation, the normal operating cycle, and applicable presentation requirements.',
    whyItMatters:
      'Airlines routinely sell seats weeks or months prior to departure. Collecting cash up front improves near-term cash flow, while creating a substantial deferred revenue liability on the Balance Sheet.',
    exampleCaption:
      'Illustrative Example: Passenger purchases a $1,200 ticket in November for a flight departing in January.',
    journalEntries: [
      { account: '1. At ticket booking (cash collected, service unperformed):' },
      { account: '   Cash & Cash Equivalents', debit: '$1,200' },
      { account: '      Air Traffic Liability (Deferred Revenue)', credit: '$1,200' },
      { account: '2. Upon flight completion (performance obligation satisfied):' },
      { account: '   Air Traffic Liability (Deferred Revenue)', debit: '$1,200' },
      { account: '      Passenger Operating Revenue', credit: '$1,200' },
    ],
    additionalConceptualNote:
      'Current vs. Non-Current Classification & Unused Tickets: While most passenger tickets are expected to be flown or refunded within 12 months (and thus presented as current liabilities), multi-year travel credits or long-dated voucher obligations may require non-current presentation depending on expected settlement timing, the normal operating cycle, and IFRS 15 / ASC 606 / IAS 1 / ASC 210 presentation rules. Refundable tickets remain liabilities until flown or refunded; non-refundable tickets may yield "breakage" revenue only when criteria for remote redemption are met.',
    practicalInterpretation:
      'Because the portion of Air Traffic Liability classified inside Current Liabilities is generally settled by operating scheduled flights rather than paying cash, airlines often operate with Current Ratios lower than non-transport industries without necessarily signaling insolvency.',
    learnMoreTitle: 'Conceptual Nuances: Classification, Breakage, and Codeshares',
    learnMorePoints: [
      'Airport taxes and government passenger fees collected on behalf of authorities are generally excluded from Passenger Revenue and recorded as pass-through payables.',
      'When tickets are interline or codeshare flights operated by partner carriers, the marketing carrier settles interline payables rather than recognizing the full gross fare as its own flight revenue.',
      'Extended travel vouchers or multi-year credits require evaluating expected redemption timing and the carrier’s normal operating cycle before classifying the entire balance as current.',
    ],
  },
  {
    id: 'aircraft-lease-accounting',
    title: 'Aircraft Lease Accounting',
    standardsContext: 'IFRS 16 (Leases) vs. US GAAP ASC 842',
    definition:
      'Both IFRS 16 and US GAAP ASC 842 require lessees to recognize most long-term aircraft leases on the Balance Sheet via a Right-of-Use (ROU) Asset and a corresponding Lease Liability.',
    whyItMatters:
      'Airlines rely heavily on leased narrow-body and wide-body aircraft. Capitalizing aircraft leases significantly increases Total Assets and Total Interest-Bearing Debt / Lease Obligations, directly shaping Debt-to-Equity and Debt-to-Assets ratios.',
    exampleCaption:
      'Illustrative Example (IFRS 16 — Simplified Illustrative Entries): Airline enters a multi-year aircraft lease with a $50.0M present value of fixed lease payments. Option A and Option B below show two distinct interest-accrual policies—Interest Expense is recognized once per period (never twice).',
    journalEntries: [
      { account: '1. Initial recognition at lease commencement:' },
      { account: '   Right-of-Use (ROU) Aircraft Asset', debit: '$50.0M' },
      { account: '      Lease Liability', credit: '$50.0M' },
      { account: '2. Subsequent period — Depreciation (IFRS 16, Simplified Illustrative):' },
      { account: '   Depreciation Expense – ROU Asset', debit: 'Dr.' },
      { account: '      Accumulated Depreciation – ROU Asset', credit: 'Cr.' },
      { account: '3A. Option A — Interest accrued into Lease Liability (Simplified Illustrative):' },
      { account: '   Interest Expense (accrual)', debit: 'Dr.' },
      { account: '      Lease Liability (accrued interest)', credit: 'Cr.' },
      { account: '   Lease Liability (Principal + Accrued Interest paid)', debit: 'Dr.' },
      { account: '      Cash (Total Lease Payment)', credit: 'Cr.' },
      { account: '3B. Option B — Separate Interest Payable / Simultaneous Payment:' },
      { account: '   Interest Expense (if accrued prior to payment)', debit: 'Dr.' },
      { account: '      Interest Payable', credit: 'Cr.' },
      { account: '   Lease Liability (Principal Portion)', debit: 'Dr.' },
      { account: '   Interest Payable (or Interest Expense only if not pre-accrued)', debit: 'Dr.' },
      { account: '      Cash (Total Lease Payment)', credit: 'Cr.' },
    ],
    additionalConceptualNote:
      'IFRS 16 vs. US GAAP (ASC 842) Presentation: IFRS 16 applies a single lessee model where virtually all leases (above short-term/low-value exemptions) split expense into ROU Depreciation (operating) and Interest Expense (finance costs). In Option A, interest accrues directly into the Lease Liability and the cash payment reduces that Lease Liability; in Option B, interest is tracked via Interest Payable (or recognized at simultaneous payment if not previously accrued)—ensuring principal reduces Lease Liability and Interest Expense is never recorded twice. US GAAP ASC 842 retains a dual-model: Finance Leases split depreciation + interest, whereas Operating Leases generally recognize a single straight-line Lease Expense within Operating Expenses.',
    practicalInterpretation:
      'When comparing an IFRS airline against a US GAAP airline, operating profit (EBIT) and interest coverage can differ solely due to lease expense classification—even when fleet economics and cash lease payments are identical.',
    learnMoreTitle: 'Balance Sheet & Ratio Impact Across Standards',
    learnMorePoints: [
      'Under both IFRS 16 and ASC 842, lease liabilities are included when evaluating total debt-like obligations in leverage analysis.',
      'Because IFRS 16 pushes part of lease cost into Finance Costs (below Operating Profit), an IFRS carrier may report slightly higher Operating Margin than an otherwise identical US GAAP carrier with operating leases.',
      'Simplified illustrative entries depend on the lease payment schedule (e.g., payments in arrears vs. advance) and entity accounting policy; actual contracts may also include variable flight-hour charges, return-condition obligations, and extension options.',
    ],
  },
  {
    id: 'aircraft-maintenance-reserves',
    title: 'Aircraft Maintenance Reserves',
    standardsContext: 'IAS 37 / Applicable US GAAP & Lease Contractual Terms',
    definition:
      'Aircraft heavy maintenance involves periodic airframe, engine, and landing-gear overhauls. Accounting distinguishes between reimbursable maintenance reserve deposits (potentially recognized as an asset when recovery criteria are met) and maintenance provisions (recognized only when a present obligation exists and applicable recognition criteria are satisfied).',
    whyItMatters:
      'Major engine shop visits and airframe D-checks cost millions per aircraft. Not every maintenance reserve payment creates an expense or liability; misclassifying recoverable lessor deposits as immediate expenses or automatic provisions can distort operating margins and balance-sheet obligations.',
    exampleCaption:
      'Illustrative Example: Airline remits $2.5M in contractual maintenance reserve deposits to a lessor where recovery/reimbursement criteria upon qualifying maintenance are met.',
    journalEntries: [
      { account: 'Contractual reserve deposit when recovery criteria are met:' },
      { account: '   Maintenance Reserve Deposit (Asset)', debit: '$2.5M' },
      { account: '      Cash', credit: '$2.5M' },
    ],
    additionalConceptualNote:
      'US GAAP & IFRS Contract-Dependent Treatment: Under US GAAP, accounting treatment depends on the nature of the maintenance obligation, specific lease terms, and applicable guidance (rather than a single universal reserve rule). Reimbursable maintenance reserve deposits may be recognized as an asset when recovery criteria are met. Separately, a maintenance provision is recognized only when a qualifying present obligation exists and applicable recognition criteria are satisfied—and must be measured based on the relevant facts rather than automatically matching cash deposits.',
    practicalInterpretation:
      'Paying a $2.5M deposit does not automatically create a separate $2.5M maintenance provision. Analysts should inspect financial statement footnotes to distinguish recoverable lessor deposit assets from accrued end-of-lease return or maintenance provisions, as well as carrier policies for owned aircraft overhauls.',
    learnMoreTitle: 'Reimbursable Reserve Deposits vs. Maintenance Provisions',
    learnMorePoints: [
      'Reimbursable Maintenance Reserve Deposits: Cash remittances to a lessor that are potentially recognized as an asset when contractual reimbursement and recovery criteria are satisfied.',
      'Maintenance Provisions: Liabilities recognized only when a present obligation exists from past aircraft usage or lease return covenants and applicable recognition criteria are met, measured independently based on relevant facts.',
      'Not every maintenance reserve payment creates an expense or liability; non-reimbursable supplemental payments or unrecoverable portions are evaluated separately under lease terms and applicable IFRS or US GAAP guidance.',
    ],
  },
  {
    id: 'loyalty-programs',
    title: 'Loyalty Programs and Deferred Revenue',
    standardsContext: 'IFRS 15 / ASC 606 · Performance Obligations & SSP Allocation',
    definition:
      'Frequent-flyer miles or loyalty points awarded on ticketed flights—or sold to co-branded bank and credit card partners—create a separate performance obligation whose allocated value must be deferred until points are redeemed or expire.',
    whyItMatters:
      'Co-branded loyalty programs are major cash-flow and margin contributors for network airlines. Loyalty deferred revenue often represents one of the largest non-debt liabilities on an airline Balance Sheet.',
    exampleCaption:
      'Illustrative Example: Passenger pays $1,000 for a flight that earns loyalty points with an estimated standalone selling price allocation of $80.',
    journalEntries: [
      { account: '1. Ticket sale allocated between flight obligation and loyalty points:' },
      { account: '   Cash & Cash Equivalents', debit: '$1,000' },
      { account: '      Air Traffic Liability (Flight Obligation)', credit: '$920' },
      { account: '      Loyalty Program Deferred Revenue', credit: '$80' },
      { account: '2. Later redemption of loyalty points for award travel:' },
      { account: '   Loyalty Program Deferred Revenue', debit: '$80' },
      { account: '      Passenger / Loyalty Operating Revenue', credit: '$80' },
    ],
    additionalConceptualNote:
      'Co-Branded Card Sales: When miles are sold to financial institutions, the consideration is typically split between a marketing/brand component (often recognized as miles are delivered) and the travel redemption obligation (deferred until members redeem miles or expected breakage occurs).',
    practicalInterpretation:
      'Rising Loyalty Deferred Revenue alongside steady redemption margins indicates strong customer engagement and advance cash generation, though changes in breakage assumptions can affect period-to-period revenue comparisons.',
    learnMoreTitle: 'Key Loyalty Accounting Drivers',
    learnMorePoints: [
      'Standalone Selling Price (SSP) is estimated from equivalent ticket prices adjusted for expected redemption rates (breakage).',
      'Miles redeemed on partner airlines rather than the carrier’s own metal may require recognizing net commission or settlement payables rather than gross passenger revenue.',
      'Changes in award chart pricing or expiration policies can alter deferred liability balances without immediate cash movement.',
    ],
  },
];

const RATIO_GUIDE_ITEMS: RatioGuideItem[] = [
  {
    id: 'operating-margin',
    name: 'Operating Margin',
    category: 'profitability',
    categoryLabel: 'Profitability',
    formula: 'Operating Profit ÷ Operating Revenue × 100',
    numerator: 'Operating Profit (EBIT = Operating Revenue − Operating Expenses)',
    denominator: 'Operating Revenue',
    definition:
      'Measures the percentage of operating revenue retained as core operating profit after paying fuel, labor, maintenance, depreciation, and airport operating expenses.',
    directionalGuidance:
      'Higher margins indicate stronger core unit economics and cost control; negative margins indicate core operations did not cover operating expenses.',
    airlineRelevance:
      'Isolates airline operational performance from financing structure, interest charges, and tax swings—making it critical when comparing carriers with different debt loads.',
    commonMistake:
      'Assuming Operating Margin equals cash flow margin; non-cash aircraft depreciation reduces Operating Profit without immediate cash outflow.',
  },
  {
    id: 'net-profit-margin',
    name: 'Net Profit Margin',
    category: 'profitability',
    categoryLabel: 'Profitability',
    formula: 'Net Income ÷ Operating Revenue × 100',
    numerator: 'Net Income / Loss',
    denominator: 'Operating Revenue',
    definition:
      'Shows the percentage of total operating revenue remaining as bottom-line net profit after accounting for non-operating items, finance costs, and income taxes.',
    directionalGuidance:
      'Higher values reflect stronger bottom-line conversion; lower or negative values reflect operating deficits, heavy interest burdens, or tax charges.',
    airlineRelevance:
      'Captures the full impact of aircraft debt financing costs, currency/hedging non-operating items, and tax credits or expenses.',
    commonMistake:
      'Treating one-off non-operating gains (such as aircraft sale-leaseback gains or temporary tax benefits) as sustainable recurring profitability.',
  },
  {
    id: 'roa',
    name: 'Return on Assets (ROA)',
    category: 'profitability',
    categoryLabel: 'Profitability',
    formula: 'Net Income ÷ Average Total Assets × 100',
    numerator: 'Net Income / Loss',
    denominator: 'Average Total Assets = (Beginning Total Assets + Ending Total Assets) ÷ 2',
    definition:
      'Evaluates how efficiently a carrier converts its entire balance-sheet asset base—primarily owned aircraft, ROU leased aircraft, and liquidity—into net earnings.',
    directionalGuidance:
      'Higher ROA indicates more productive asset deployment, though unusually high ROA can also reflect an aging, heavily depreciated fleet.',
    airlineRelevance:
      'Aviation is capital-intensive; ROA connects the Income Statement to the size of the fleet and infrastructure required to generate revenue.',
    commonMistake:
      'Dividing full-year Net Income by ending assets alone rather than average beginning and ending assets, or misinterpreting an asset-light lessor strategy as automatically superior.',
    availabilityNote:
      'Average Balance Rule: In Avantra, FY 2020 ROA displays N/A because FY 2019 opening Total Assets are unavailable; ending assets are never substituted silently.',
  },
  {
    id: 'roe',
    name: 'Return on Equity (ROE)',
    category: 'profitability',
    categoryLabel: 'Profitability',
    formula: "Net Income ÷ Average Shareholders' Equity × 100",
    numerator: 'Net Income / Loss',
    denominator: "Average Shareholders' Equity = (Beginning Equity + Ending Equity) ÷ 2",
    definition:
      "Measures net earnings generated per dollar of average shareholders' equity capital over the fiscal period.",
    directionalGuidance:
      'Higher ROE reflects stronger returns to equity holders, but can be artificially inflated by very thin equity or high financial leverage.',
    airlineRelevance:
      'Airlines emerging from downturns often carry depleted equity bases, causing small earnings swings to create sharp volatility in ROE.',
    commonMistake:
      'Assuming a high ROE automatically signals low-risk quality; an airline with tiny Shareholders’ Equity and heavy debt can display an elevated ROE despite high solvency risk.',
    availabilityNote:
      "Average Balance Rule: In Avantra, FY 2020 ROE displays N/A because FY 2019 opening Shareholders' Equity is unavailable.",
  },
  {
    id: 'asset-turnover',
    name: 'Asset Turnover',
    category: 'profitability',
    categoryLabel: 'Profitability',
    formula: 'Operating Revenue ÷ Average Total Assets',
    numerator: 'Operating Revenue',
    denominator: 'Average Total Assets = (Beginning Total Assets + Ending Total Assets) ÷ 2',
    definition:
      'Indicates how many dollars of operating revenue are generated per dollar of average total assets.',
    directionalGuidance:
      'Higher asset turnover implies faster asset utilization; lower turnover implies a heavier asset base per dollar of revenue.',
    airlineRelevance:
      'Tracks fleet and gate productivity—high aircraft utilization and load factors boost revenue generated per dollar of fleet assets.',
    commonMistake:
      'Comparing carriers without checking fleet age or ownership mix; older depreciated fleets shrink the denominator and lift Asset Turnover even without operational improvement.',
    availabilityNote:
      'Average Balance Rule: In Avantra, FY 2020 Asset Turnover displays N/A because FY 2019 opening Total Assets are unavailable.',
  },
  {
    id: 'current-ratio',
    name: 'Current Ratio',
    category: 'liquidity',
    categoryLabel: 'Liquidity',
    formula: 'Current Assets ÷ Current Liabilities',
    numerator: 'Current Assets',
    denominator: 'Current Liabilities',
    definition:
      'Measures short-term liquidity coverage by comparing assets expected to convert to cash within 12 months against obligations due within 12 months.',
    directionalGuidance:
      'Higher ratios indicate a larger short-term buffer; very high ratios may alternatively indicate idle cash not deployed productively.',
    airlineRelevance:
      'Airlines frequently operate near or below 1.0x because advance ticket sales (Air Traffic Liability) sit in Current Liabilities despite being settled by flying rather than cash.',
    commonMistake:
      'Applying a generic 2.0x manufacturing rule of thumb to airlines without recognizing non-cash deferred revenue inside Current Liabilities.',
  },
  {
    id: 'quick-ratio',
    name: 'Quick Ratio',
    category: 'liquidity',
    categoryLabel: 'Liquidity',
    formula: '(Current Assets − Inventory) ÷ Current Liabilities',
    numerator: 'Current Assets − Inventory',
    denominator: 'Current Liabilities',
    definition:
      'Tests strict near-term liquidity coverage after excluding Inventory (such as aircraft spare parts and fuel stock) from Current Assets.',
    directionalGuidance:
      'Higher values suggest greater immediate liquidity from cash and short-term receivables relative to current liabilities.',
    airlineRelevance:
      'Aircraft spare-parts inventory cannot be rapidly liquidated to pay near-term lease or fuel bills, making strict liquidity inspection useful when inventory data is disclosed.',
    commonMistake:
      'Treating missing Inventory disclosures as zero and equating Quick Ratio with Current Ratio.',
    availabilityNote:
      'Unavailable Input Rule: Quick Ratio displays N/A in Avantra whenever Inventory is not present in the dataset.',
  },
  {
    id: 'debt-to-equity',
    name: 'Debt-to-Equity Ratio',
    category: 'leverage',
    categoryLabel: 'Leverage & Solvency',
    formula: "Total Interest-Bearing Debt ÷ Shareholders' Equity",
    numerator: 'Total Interest-Bearing Debt (explicitly defined basis)',
    denominator: "Shareholders' Equity",
    definition:
      "Quantifies financial leverage by comparing interest-bearing debt and capitalized lease obligations against Shareholders' Equity.",
    directionalGuidance:
      'Lower ratios indicate a more conservative equity cushion; higher ratios indicate heavier reliance on debt financing and greater sensitivity to earnings downturns.',
    airlineRelevance:
      'Fleet acquisitions and lease capitalization create structurally higher leverage in aviation than in asset-light sectors.',
    commonMistake:
      'Mixing Total Liabilities (which includes Air Traffic Liability) with Interest-Bearing Debt when comparing across reports, or computing a ratio when Shareholders’ Equity is negative.',
  },
  {
    id: 'debt-to-assets',
    name: 'Debt-to-Assets Ratio',
    category: 'leverage',
    categoryLabel: 'Leverage & Solvency',
    formula: 'Total Interest-Bearing Debt ÷ Total Assets',
    numerator: 'Total Interest-Bearing Debt',
    denominator: 'Total Assets',
    definition:
      'Measures the proportion of a carrier’s total asset base financed by interest-bearing debt and lease obligations.',
    directionalGuidance:
      'Lower values suggest less debt encumbrance across the fleet; higher values indicate a greater share of assets financed through borrowing.',
    airlineRelevance:
      'Remains calculable even when Shareholders’ Equity becomes thin or negative after severe industry shocks.',
    commonMistake:
      'Assuming low Debt-to-Assets means low operating fixed costs; short-term wet leases or variable maintenance commitments may not appear inside debt.',
  },
  {
    id: 'interest-coverage',
    name: 'Interest Coverage Ratio',
    category: 'leverage',
    categoryLabel: 'Leverage & Solvency',
    formula: 'Operating Profit ÷ Finance Costs',
    numerator: 'Operating Profit (EBIT)',
    denominator: 'Finance Costs',
    definition:
      'Indicates how many times current-period Operating Profit covers annual debt and lease finance charges.',
    directionalGuidance:
      'Higher multiples indicate a wider earnings cushion over interest charges; values below 1.0x or negative show operating profits did not cover interest obligations.',
    airlineRelevance:
      'Tests whether day-to-day flight profitability comfortably services the carrier’s aircraft debt and lease interest burden.',
    commonMistake:
      'Assuming positive Interest Coverage guarantees principal repayment capacity; EBIT excludes capital expenditures and scheduled debt principal maturities.',
  },
  {
    id: 'net-debt-to-ebitda',
    name: 'Net Debt / EBITDA',
    category: 'leverage',
    categoryLabel: 'Leverage & Solvency',
    formula: '(Total Interest-Bearing Debt − Cash & Equivalents) ÷ EBITDA',
    numerator: 'Net Debt (Total Interest-Bearing Debt − Cash & Cash Equivalents)',
    denominator: 'EBITDA (Operating Profit + Depreciation & Amortization)',
    definition:
      'Estimates how many years of pre-depreciation operating earnings (EBITDA) would be required to retire net debt after applying unrestricted cash.',
    directionalGuidance:
      'Lower positive multiples indicate lighter net leverage relative to cash earnings; negative or near-zero EBITDA renders the multiple invalid or misleading.',
    airlineRelevance:
      'Widely used by aviation credit analysts to evaluate fleet debt sustainability across carriers with large cash buffers.',
    commonMistake:
      'Forgetting that EBITDA ignores recurring heavy aircraft CapEx required simply to keep a fleet modern and airworthy.',
    availabilityNote:
      'Unavailable Input Rule: Net Debt / EBITDA displays N/A in Avantra unless Cash & Cash Equivalents and EBITDA (requiring D&A disclosures) are available.',
  },
  {
    id: 'free-cash-flow',
    name: 'Free Cash Flow (FCF)',
    category: 'cash-flow',
    categoryLabel: 'Cash Flow Efficiency · Supporting Analytical Metric',
    isSupportingMetric: true,
    formula: 'Operating Cash Flow − Capital Expenditures',
    numerator: 'Operating Cash Flow ($B)',
    denominator: 'Capital Expenditures ($B) · Subtracted (Not a Ratio)',
    definition:
      'A dollar-based cash flow metric (not a financial ratio) measuring net cash generated by core operations after funding capital expenditures such as aircraft deliveries, pre-delivery deposits, and hangar facilities.',
    directionalGuidance:
      'Positive FCF indicates dollar cash available for debt reduction, liquidity reserves, or shareholder returns; negative FCF indicates external financing or cash reserves are needed to fund CapEx.',
    airlineRelevance:
      'Aircraft fleet renewal cycles create lumpy CapEx; FCF shows whether a carrier self-funds its fleet investments and serves as the numerator for Free Cash Flow Margin.',
    commonMistake:
      'Equating temporary negative FCF during a strategic fleet modernization cycle with poor underlying flight profitability, or comparing raw dollar FCF across airlines of vastly different scale without normalizing via FCF Margin.',
    availabilityNote:
      'Supporting Metric Scope: FCF is a dollar-based analytical metric ($B) displayed on the Dashboard and Three-Statement Cash Flow view—not a selectable ratio in the Financial Ratios Engine. For the percentage-based ratio in the engine, use Free Cash Flow Margin.',
  },
  {
    id: 'fcf-margin',
    name: 'Free Cash Flow Margin',
    category: 'cash-flow',
    categoryLabel: 'Cash Flow Efficiency · Financial Ratio (Engine)',
    formula: 'Free Cash Flow ÷ Operating Revenue × 100',
    numerator: 'Free Cash Flow (Operating Cash Flow − Capital Expenditures)',
    denominator: 'Operating Revenue',
    definition:
      'The percentage-based financial ratio in the Avantra Financial Ratios Engine that expresses Free Cash Flow as a percentage of Operating Revenue, normalizing cash generation across carriers of different sizes.',
    directionalGuidance:
      'Higher FCF Margin reflects stronger revenue-to-free-cash conversion after CapEx; negative values indicate cash burn or heavy fleet investment exceeding operating inflows.',
    airlineRelevance:
      'Allows direct cash-efficiency ratio benchmarking between large full-service network carriers and smaller low-cost airlines.',
    commonMistake:
      'Assuming a high FCF Margin caused by deferred aircraft CapEx can persist indefinitely without eventual fleet aging penalties.',
  },
];

const AIS_ARCHITECTURE_STAGES: ArchitectureStage[] = [
  {
    stepNumber: 1,
    id: 'data-sources',
    title: 'Data Sources',
    status: 'Planned',
    summary:
      'Authoritative corporate filings and operating disclosures destined to replace the current illustrative sample dataset.',
    components: [
      {
        name: 'Official Airline Annual Reports & Form 10-K',
        detail:
          'Audited Consolidated Income Statements, Balance Sheets, Cash Flow Statements, and footnote disclosures (IFRS / US GAAP).',
      },
      {
        name: 'Accounting Standards & Disclosures',
        detail:
          'Standard-specific notes for IFRS 16 / ASC 842 leases, Air Traffic Liability, maintenance provisions, and loyalty obligations.',
      },
      {
        name: 'Operational Capacity Data (When Available)',
        detail:
          'Available Seat Miles (ASM), Revenue Passenger Miles (RPM), fleet counts, and load factors for future CASM / RASM benchmarking.',
      },
    ],
  },
  {
    stepNumber: 2,
    id: 'data-storage',
    title: 'Data Storage (Planned Relational MySQL)',
    status: 'Planned',
    summary:
      'Normalized relational database schema designed to separate entity master data, filing provenance, audited line items, and operational statistics.',
    components: [
      {
        name: 'dim_airline_entity',
        detail:
          'Stores airline master identifiers, legal names, ticker/exchange metadata, business model classifications, and reporting currency.',
      },
      {
        name: 'fact_financial_statement',
        detail:
          'Stores normalized annual statement line items keyed by entity_id, fiscal_year, and filing_id without hardcoding derived totals.',
      },
      {
        name: 'dim_filing_registry',
        detail:
          'Tracks annual report sources, publication dates, accounting framework (IFRS / US GAAP), auditor opinions, and verification status.',
      },
      {
        name: 'fact_operational_capacity',
        detail:
          'Stores fleet counts, hubs, ASMs, RPMs, and load factors separately from audited financial statements so missing operational data stays N/A.',
      },
    ],
  },
  {
    stepNumber: 3,
    id: 'data-processing',
    title: 'Data Processing (Planned Python ETL)',
    status: 'Planned',
    summary:
      'Automated extraction, standardization, and accounting validation pipeline before analytical metrics reach the interface.',
    components: [
      {
        name: 'Extraction, Cleaning & Normalization',
        detail:
          'Maps raw airline-specific line items from PDF/XBRL filings into standardized GAAP/IFRS statement templates.',
      },
      {
        name: 'Accounting Identity & Balance Validation',
        detail:
          'Enforces reconciliation checks (e.g., Assets = Liabilities + Equity; Operating Profit → EBT → Net Income) prior to publication.',
      },
      {
        name: 'Missing-Data & Safe-Denominator Guards',
        detail:
          'Flags absent inputs (Inventory, Cash, EBITDA, FY 2019 opening balances) as N/A rather than substituting zeros or ending balances.',
      },
    ],
  },
  {
    stepNumber: 4,
    id: 'financial-analysis',
    title: 'Financial Analysis Engine',
    status: 'Currently Implemented',
    summary:
      'Dynamic client-side TypeScript accounting utilities currently powering Avantra in Illustrative Data Mode.',
    components: [
      {
        name: 'Horizontal & Vertical Analysis',
        detail:
          'Computes YoY % changes and common-size % of Operating Revenue / Total Assets dynamically across the three financial statement views. Cash Flow Statement coverage is currently limited to the available illustrative inputs (Operating Cash Flow, Capital Expenditures, and Free Cash Flow).',
      },
      {
        name: 'Reconciled Financial Ratio Calculations',
        detail:
          'Evaluates profitability, liquidity, leverage, and cash flow efficiency ratios with beginning/ending average balances and zero/negative denominator protection.',
      },
      {
        name: 'Side-by-Side Company Benchmarking',
        detail:
          'Calculates Carrier A vs. Carrier B spreads in USD Billions ($B), multiples (x), and percentage points (pp).',
      },
    ],
  },
  {
    stepNumber: 5,
    id: 'presentation-layer',
    title: 'Presentation Layer',
    status: 'Currently Implemented',
    summary:
      'Interactive institutional web interface presenting financial tables, formula inspectors, and Chart.js visualizations.',
    components: [
      {
        name: 'React + TypeScript + Tailwind CSS UI',
        detail:
          'Responsive multi-page workspace covering Dashboard, Companies, Financial Analysis, Company Comparison, Financial Ratios, Learning Center, and Reports.',
      },
      {
        name: 'Chart.js Visualizations (react-chartjs-2)',
        detail:
          'Interactive grouped bar, line, and doughnut charts with explicit unit formatting and N/A gap handling.',
      },
      {
        name: 'Transparent Traceability & Data Policy',
        detail:
          'Formula tooltips, Formula & Sensitivity Inspector, and clear Illustrative Sample Data disclaimers across every module.',
      },
    ],
  },
];

const TECH_STACK_MATRIX: {
  layer: string;
  technology: string;
  role: string;
  status: 'Currently Implemented' | 'Planned';
}[] = [
  {
    layer: 'Frontend Framework',
    technology: 'React 19 + TypeScript + Tailwind CSS',
    role: 'Interactive institutional UI, workspace tabs, tables, and responsive layout',
    status: 'Currently Implemented',
  },
  {
    layer: 'Data Visualization',
    technology: 'Chart.js (react-chartjs-2)',
    role: 'Grouped bar, trend line, and cost structure doughnut visualizations',
    status: 'Currently Implemented',
  },
  {
    layer: 'Client-Side Ratio Logic',
    technology: 'TypeScript Accounting Utilities (accounting.ts)',
    role: 'Dynamic formulas, average balances, pp spreads, and N/A validation in Illustrative Data Mode',
    status: 'Currently Implemented',
  },
  {
    layer: 'Relational Storage',
    technology: 'MySQL Relational Database',
    role: 'Normalized storage for dim_airline_entity, fact_financial_statement, dim_filing_registry, and fact_operational_capacity',
    status: 'Planned',
  },
  {
    layer: 'ETL & Data Ingestion',
    technology: 'Python ETL & Validation Pipeline',
    role: 'Official annual report extraction, cleaning, normalization, and audit verification',
    status: 'Planned',
  },
];

const RATIO_CATEGORY_FILTERS: { id: RatioGuideCategory; label: string }[] = [
  { id: 'all', label: 'All Categories' },
  { id: 'profitability', label: 'Profitability' },
  { id: 'liquidity', label: 'Liquidity' },
  { id: 'leverage', label: 'Leverage & Solvency' },
  { id: 'cash-flow', label: 'Cash Flow Efficiency' },
];

function StatusLabel({ status }: { status: 'Currently Implemented' | 'Planned' }) {
  if (status === 'Currently Implemented') {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 whitespace-nowrap">
        <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
        <span>Currently Implemented</span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 whitespace-nowrap">
      <Clock className="h-3.5 w-3.5 shrink-0" />
      <span>Planned</span>
    </span>
  );
}

function stageIcon(id: string) {
  switch (id) {
    case 'data-sources':
      return FileSpreadsheet;
    case 'data-storage':
      return Database;
    case 'data-processing':
      return Cpu;
    case 'financial-analysis':
      return Calculator;
    default:
      return Monitor;
  }
}

export const LearningCenterPage: React.FC<LearningCenterPageProps> = ({
  onReturnToDashboard,
  onOpenMethodology,
}) => {
  const [activeTab, setActiveTab] = useState<LearningTabId>('concepts');
  const [conceptQuery, setConceptQuery] = useState<string>('');
  const [expandedConceptIds, setExpandedConceptIds] = useState<Record<string, boolean>>({
    'air-traffic-liability': false,
  });
  const [ratioQuery, setRatioQuery] = useState<string>('');
  const [ratioCategory, setRatioCategory] = useState<RatioGuideCategory>('all');
  const [expandedRatioIds, setExpandedRatioIds] = useState<Record<string, boolean>>({});
  const [selectedStageId, setSelectedStageId] = useState<string>('data-sources');

  const toggleConceptExpand = (id: string) => {
    setExpandedConceptIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleRatioExpand = (id: string) => {
    setExpandedRatioIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredConcepts = useMemo(() => {
    const q = conceptQuery.trim().toLowerCase();
    if (!q) return ACCOUNTING_CONCEPTS;
    return ACCOUNTING_CONCEPTS.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.standardsContext.toLowerCase().includes(q) ||
        c.definition.toLowerCase().includes(q) ||
        c.whyItMatters.toLowerCase().includes(q) ||
        c.practicalInterpretation.toLowerCase().includes(q)
    );
  }, [conceptQuery]);

  const filteredRatios = useMemo(() => {
    const q = ratioQuery.trim().toLowerCase();
    return RATIO_GUIDE_ITEMS.filter((item) => {
      const matchesCategory =
        ratioCategory === 'all' || item.category === ratioCategory;
      if (!matchesCategory) return false;
      if (!q) return true;
      return (
        item.name.toLowerCase().includes(q) ||
        item.formula.toLowerCase().includes(q) ||
        item.definition.toLowerCase().includes(q) ||
        item.airlineRelevance.toLowerCase().includes(q) ||
        item.categoryLabel.toLowerCase().includes(q)
      );
    });
  }, [ratioQuery, ratioCategory]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
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
            Airline Accounting &amp; AIS Learning Center
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Interactive educational reference for airline financial accounting, standardized
            ratio interpretation, and the Avantra Information Systems architecture.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
          <span>University AIS Module</span>
          <span aria-hidden="true">·</span>
          <span>IFRS &amp; US GAAP Foundations</span>
          <span aria-hidden="true">·</span>
          <span>Educational Reference</span>
        </div>
      </section>

      {/* Educational Data Integrity Notice */}
      <section
        aria-label="Educational Module Disclaimer"
        className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="flex items-start gap-3">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-[#1E3A5F]" />
          <div className="text-xs leading-relaxed text-slate-600">
            <span className="font-semibold text-[#0B192C]">
              Educational Reference Notice:
            </span>{' '}
            This Learning Center is a university educational module, not a source of official
            airline financial results. All numerical journal entries are labeled as{' '}
            <span className="font-semibold text-[#0B192C]">Illustrative Example</span>{' '}
            scenarios, and actual accounting treatment depends on specific contractual terms and
            applicable IFRS or US GAAP standards.
          </div>
        </div>
        <button
          type="button"
          onClick={onOpenMethodology}
          className="shrink-0 self-start rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-[#0B192C] transition-colors hover:bg-slate-100 sm:self-center whitespace-nowrap"
        >
          View Data Policy
        </button>
      </section>

      {/* Learning Center Navigation Tabs */}
      <section
        aria-label="Learning Center Navigation"
        className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-5 sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-1 text-xs font-medium text-slate-500">Module Section:</span>
          <div
            role="tablist"
            aria-label="Learning Center Tabs"
            className="inline-flex flex-wrap items-center gap-1 rounded-lg bg-slate-100 p-1"
          >
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'concepts'}
              onClick={() => setActiveTab('concepts')}
              className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
                activeTab === 'concepts'
                  ? 'bg-[#0B192C] text-white'
                  : 'text-slate-600 hover:text-[#0B192C]'
              }`}
            >
              <BookOpen className="h-3.5 w-3.5" />
              <span>Accounting Concepts</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'ratio-guide'}
              onClick={() => setActiveTab('ratio-guide')}
              className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
                activeTab === 'ratio-guide'
                  ? 'bg-[#0B192C] text-white'
                  : 'text-slate-600 hover:text-[#0B192C]'
              }`}
            >
              <BarChart3 className="h-3.5 w-3.5" />
              <span>Ratio Guide</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'ais-architecture'}
              onClick={() => setActiveTab('ais-architecture')}
              className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
                activeTab === 'ais-architecture'
                  ? 'bg-[#0B192C] text-white'
                  : 'text-slate-600 hover:text-[#0B192C]'
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              <span>AIS Architecture</span>
            </button>
          </div>
        </div>

        <div className="text-xs text-slate-500">
          {activeTab === 'concepts'
            ? '4 Airline Accounting Modules'
            : activeTab === 'ratio-guide'
            ? '12 Engine Ratios + 1 Supporting Cash Flow Metric'
            : '5-Stage AIS Pipeline (Current vs. Planned)'}
        </div>
      </section>

      {/* TAB 1: Accounting Concepts */}
      {activeTab === 'concepts' && (
        <section aria-label="Airline Accounting Concepts" className="space-y-5">
          <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-display text-base font-semibold text-[#0B192C]">
                Airline Financial Accounting Concepts
              </h2>
              <p className="mt-0.5 text-xs text-slate-500">
                Introductory accounting mechanics for aviation balance sheets and revenue
                recognition. Simplified journal entries do not represent universal rules.
              </p>
            </div>
            <div className="relative w-full sm:w-80">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={conceptQuery}
                onChange={(e) => setConceptQuery(e.target.value)}
                placeholder="Search concepts, IFRS 16, ASC 842..."
                aria-label="Search accounting concepts"
                className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-8 pr-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-[#0B192C] focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          {filteredConcepts.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-xs text-slate-500">
              No accounting concepts match &quot;{conceptQuery}&quot;.
            </div>
          ) : (
            <div className="space-y-5">
              {filteredConcepts.map((concept) => {
                const isExpanded = Boolean(expandedConceptIds[concept.id]);
                return (
                  <article
                    key={concept.id}
                    className="rounded-xl border border-slate-200 bg-white p-6"
                  >
                    <div className="flex flex-col gap-2 border-b border-slate-100 pb-4 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h3 className="font-display text-lg font-bold text-[#0B192C]">
                          {concept.title}
                        </h3>
                        <p className="mt-0.5 font-mono text-xs text-[#0284C7]">
                          {concept.standardsContext}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => toggleConceptExpand(concept.id)}
                        aria-expanded={isExpanded}
                        className="inline-flex shrink-0 items-center gap-1.5 self-start rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-[#0B192C] transition-colors hover:bg-slate-100 whitespace-nowrap"
                      >
                        <span>{isExpanded ? 'Hide Learn More' : 'Learn More'}</span>
                        {isExpanded ? (
                          <ChevronUp className="h-3.5 w-3.5" />
                        ) : (
                          <ChevronDown className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>

                    <div className="mt-4 grid grid-cols-1 gap-5 lg:grid-cols-12">
                      <div className="space-y-4 lg:col-span-6">
                        <div>
                          <div className="text-xs font-semibold text-[#0B192C]">
                            Concise Definition
                          </div>
                          <p className="mt-1 text-xs leading-relaxed text-slate-700">
                            {concept.definition}
                          </p>
                        </div>

                        <div>
                          <div className="text-xs font-semibold text-[#0B192C]">
                            Why It Matters to Airlines
                          </div>
                          <p className="mt-1 text-xs leading-relaxed text-slate-700">
                            {concept.whyItMatters}
                          </p>
                        </div>

                        <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-3.5">
                          <div className="text-xs font-semibold text-[#0B192C]">
                            Standards &amp; Treatment Context
                          </div>
                          <p className="mt-1 text-xs leading-relaxed text-slate-600">
                            {concept.additionalConceptualNote}
                          </p>
                        </div>

                        <div>
                          <div className="text-xs font-semibold text-[#0B192C]">
                            Practical Interpretation
                          </div>
                          <p className="mt-1 text-xs leading-relaxed text-slate-700">
                            {concept.practicalInterpretation}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col justify-between rounded-lg border border-slate-200 bg-slate-50/60 p-4 lg:col-span-6">
                        <div>
                          <div className="flex items-center justify-between gap-2 border-b border-slate-200 pb-2.5">
                            <span className="text-xs font-semibold text-[#0B192C]">
                              Simplified Accounting Example
                            </span>
                            <span className="font-mono text-[11px] font-semibold text-[#0284C7]">
                              Illustrative Example
                            </span>
                          </div>
                          <p className="mt-2.5 text-xs text-slate-600">
                            {concept.exampleCaption}
                          </p>

                          <div className="mt-3 overflow-x-auto rounded-lg border border-slate-200 bg-white">
                            <table className="w-full text-left text-xs">
                              <thead className="border-b border-slate-200 bg-slate-50 text-slate-600">
                                <tr>
                                  <th className="px-3 py-2 font-semibold">Account / Event</th>
                                  <th className="px-3 py-2 text-right font-semibold">Debit</th>
                                  <th className="px-3 py-2 text-right font-semibold">Credit</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                {concept.journalEntries.map((entry, idx) => {
                                  const isHeader = !entry.debit && !entry.credit;
                                  return (
                                    <tr
                                      key={`${concept.id}-je-${idx}`}
                                      className={isHeader ? 'bg-slate-50/80' : ''}
                                    >
                                      <td
                                        className={`px-3 py-2 whitespace-pre ${
                                          isHeader
                                            ? 'font-semibold text-[#0B192C]'
                                            : 'text-slate-700'
                                        }`}
                                      >
                                        {entry.account}
                                      </td>
                                      <td className="px-3 py-2 text-right font-mono tabular-nums text-[#0B192C]">
                                        {entry.debit ?? ''}
                                      </td>
                                      <td className="px-3 py-2 text-right font-mono tabular-nums text-[#0284C7]">
                                        {entry.credit ?? ''}
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </div>

                        <p className="mt-3 text-[11px] text-slate-500">
                          Illustrative Example only — actual recognition timing and account
                          mapping depend on contract terms and IFRS / US GAAP guidance.
                        </p>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="mt-5 border-t border-slate-200 pt-4">
                        <div className="text-xs font-semibold text-[#0B192C]">
                          Learn More: {concept.learnMoreTitle}
                        </div>
                        <ul className="mt-2 list-disc space-y-1.5 pl-4 text-xs leading-relaxed text-slate-600">
                          {concept.learnMorePoints.map((pt) => (
                            <li key={pt}>{pt}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* TAB 2: Ratio Guide */}
      {activeTab === 'ratio-guide' && (
        <section aria-label="Financial Ratio Reference Guide" className="space-y-5">
          <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-5">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="font-display text-base font-semibold text-[#0B192C]">
                  Avantra Standardized Financial Ratio Guide
                </h2>
                <p className="mt-0.5 text-xs text-slate-500">
                  Matches the exact formulas, average-balance rules, and N/A guards used across
                  the 12 ratios in the Financial Ratios Engine, plus Free Cash Flow as a
                  supporting dollar-based metric.
                </p>
              </div>
              <div className="relative w-full lg:w-72">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={ratioQuery}
                  onChange={(e) => setRatioQuery(e.target.value)}
                  placeholder="Search ratios or formulas..."
                  aria-label="Search financial ratio guide"
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-8 pr-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-[#0B192C] focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3">
              <span className="mr-1 text-xs font-medium text-slate-500">Category:</span>
              <div className="inline-flex flex-wrap items-center gap-1 rounded-lg bg-slate-100 p-1">
                {RATIO_CATEGORY_FILTERS.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setRatioCategory(cat.id)}
                    className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
                      ratioCategory === cat.id
                        ? 'bg-white text-[#0B192C] shadow-sm'
                        : 'text-slate-600 hover:text-[#0B192C]'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-white p-4 text-xs leading-relaxed text-slate-600">
              <div className="font-semibold text-[#0B192C]">
                Average Balances (ROA, ROE, Asset Turnover)
              </div>
              <p className="mt-1">
                Flow numerators (Net Income, Revenue) are divided by (Beginning + Ending) ÷ 2
                balances. FY 2020 evaluates as N/A when FY 2019 opening balances are absent.
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 text-xs leading-relaxed text-slate-600">
              <div className="font-semibold text-[#0B192C]">
                Missing Data Rules (Quick Ratio &amp; Net Debt / EBITDA)
              </div>
              <p className="mt-1">
                Quick Ratio and Net Debt / EBITDA display N/A when Inventory, Cash &amp;
                Equivalents, or EBITDA / D&amp;A inputs are unavailable—never substituted with
                zero.
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 text-xs leading-relaxed text-slate-600">
              <div className="font-semibold text-[#0B192C]">
                Context Over Universal Benchmarks
              </div>
              <p className="mt-1">
                A higher ratio is not automatically better in every situation, and Avantra
                does not invent universal target values. Always interpret ratios alongside
                business model and capital structure.
              </p>
            </div>
          </div>

          {filteredRatios.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-xs text-slate-500">
              No ratios match &quot;{ratioQuery}&quot; in the selected category.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {filteredRatios.map((item) => {
                const isExpanded = Boolean(expandedRatioIds[item.id]);
                return (
                  <article
                    key={item.id}
                    className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
                        <div>
                          <div className="text-[11px] font-medium text-[#0284C7]">
                            {item.categoryLabel}
                          </div>
                          <h3 className="mt-0.5 font-display text-base font-bold text-[#0B192C]">
                            {item.name}
                          </h3>
                        </div>
                        <button
                          type="button"
                          onClick={() => toggleRatioExpand(item.id)}
                          aria-expanded={isExpanded}
                          className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-[#0B192C] transition-colors hover:bg-slate-100 whitespace-nowrap"
                        >
                          <span>{isExpanded ? 'Collapse' : 'Deep Dive'}</span>
                          {isExpanded ? (
                            <ChevronUp className="h-3 w-3" />
                          ) : (
                            <ChevronDown className="h-3 w-3" />
                          )}
                        </button>
                      </div>

                      <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-3">
                        <div className="text-[11px] font-medium text-slate-500">Formula</div>
                        <div className="mt-0.5 font-mono text-xs font-semibold text-[#0B192C]">
                          {item.formula}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-2 text-xs sm:grid-cols-2">
                        <div className="rounded-lg border border-slate-100 bg-slate-50/40 p-2.5">
                          <span className="font-medium text-slate-500">
                            {item.isSupportingMetric ? 'Inflow Component: ' : 'Numerator: '}
                          </span>
                          <span className="text-[#0B192C]">{item.numerator}</span>
                        </div>
                        <div className="rounded-lg border border-slate-100 bg-slate-50/40 p-2.5">
                          <span className="font-medium text-slate-500">
                            {item.isSupportingMetric ? 'Outflow Component: ' : 'Denominator: '}
                          </span>
                          <span className="text-[#0B192C]">{item.denominator}</span>
                        </div>
                      </div>

                      <p className="text-xs leading-relaxed text-slate-700">
                        <span className="font-semibold text-[#0B192C]">Definition: </span>
                        {item.definition}
                      </p>

                      {item.availabilityNote && (
                        <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50/70 p-2.5 text-[11px] leading-relaxed text-amber-900">
                          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-700" />
                          <span>{item.availabilityNote}</span>
                        </div>
                      )}

                      {isExpanded && (
                        <div className="space-y-2.5 border-t border-slate-100 pt-3 text-xs leading-relaxed">
                          <div>
                            <span className="font-semibold text-[#0B192C]">
                              Higher vs. Lower Indication:{' '}
                            </span>
                            <span className="text-slate-600">{item.directionalGuidance}</span>
                          </div>
                          <div>
                            <span className="font-semibold text-[#0B192C]">
                              Why It Matters in Airlines:{' '}
                            </span>
                            <span className="text-slate-600">{item.airlineRelevance}</span>
                          </div>
                          <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-2.5">
                            <span className="font-semibold text-[#0B192C]">
                              Common Interpretation Mistake:{' '}
                            </span>
                            <span className="text-slate-700">{item.commonMistake}</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {!isExpanded && (
                      <div className="mt-3 border-t border-slate-100 pt-2.5 text-[11px] text-slate-500">
                        <span className="font-medium text-[#0B192C]">Airline Relevance: </span>
                        {item.airlineRelevance}
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* TAB 3: AIS Architecture */}
      {activeTab === 'ais-architecture' && (
        <section aria-label="Avantra AIS Architecture" className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="flex flex-col gap-2 border-b border-slate-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-display text-base font-semibold text-[#0B192C]">
                  End-to-End AIS Data Processing Flow
                </h2>
                <p className="mt-0.5 text-xs text-slate-500">
                  Select any pipeline stage to inspect its inputs, relational tables, and
                  explicit implementation status (Currently Implemented vs. Planned).
                </p>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <StatusLabel status="Currently Implemented" />
                <StatusLabel status="Planned" />
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-3 lg:grid-cols-5">
              {AIS_ARCHITECTURE_STAGES.map((stage, idx) => {
                const Icon = stageIcon(stage.id);
                const isSelected = stage.id === selectedStageId;
                return (
                  <div key={stage.id} className="flex items-stretch gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedStageId(stage.id)}
                      className={`flex flex-1 flex-col justify-between rounded-xl border p-4 text-left transition-all ${
                        isSelected
                          ? 'border-[#0284C7] bg-sky-50/30 ring-1 ring-[#0284C7]'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-mono text-xs font-semibold text-slate-400">
                            0{stage.stepNumber}
                          </span>
                          <Icon
                            className={`h-4 w-4 ${
                              isSelected ? 'text-[#0284C7]' : 'text-[#0B192C]'
                            }`}
                          />
                        </div>
                        <div className="mt-2 font-display text-sm font-semibold text-[#0B192C]">
                          {stage.title}
                        </div>
                      </div>
                      <div className="mt-3 border-t border-slate-100 pt-2.5">
                        <StatusLabel status={stage.status} />
                      </div>
                    </button>
                    {idx < AIS_ARCHITECTURE_STAGES.length - 1 && (
                      <div className="hidden items-center justify-center text-slate-300 lg:flex">
                        <ArrowRight className="h-4 w-4 shrink-0" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {AIS_ARCHITECTURE_STAGES.map((stage) => {
              const Icon = stageIcon(stage.id);
              const isSelected = stage.id === selectedStageId;
              return (
                <article
                  key={`detail-${stage.id}`}
                  onClick={() => setSelectedStageId(stage.id)}
                  className={`cursor-pointer rounded-xl border bg-white p-5 transition-all ${
                    isSelected
                      ? 'border-[#0284C7] ring-1 ring-[#0284C7]'
                      : 'border-slate-200 hover:border-slate-300'
                  } ${stage.stepNumber === 5 ? 'lg:col-span-2' : ''}`}
                >
                  <div className="flex flex-col gap-2 border-b border-slate-100 pb-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-[#0284C7]" />
                      <h3 className="font-display text-base font-semibold text-[#0B192C]">
                        Stage {stage.stepNumber}: {stage.title}
                      </h3>
                    </div>
                    <StatusLabel status={stage.status} />
                  </div>

                  <p className="mt-3 text-xs leading-relaxed text-slate-600">
                    {stage.summary}
                  </p>

                  <div
                    className={`mt-4 grid grid-cols-1 gap-3 ${
                      stage.stepNumber === 5 ? 'md:grid-cols-3' : 'sm:grid-cols-2'
                    }`}
                  >
                    {stage.components.map((comp) => (
                      <div
                        key={comp.name}
                        className="rounded-lg border border-slate-200 bg-slate-50/70 p-3"
                      >
                        <div className="font-mono text-xs font-semibold text-[#0B192C]">
                          {comp.name}
                        </div>
                        <p className="mt-1 text-[11px] leading-relaxed text-slate-600">
                          {comp.detail}
                        </p>
                      </div>
                    ))}
                  </div>
                </article>
              );
            })}
          </div>

          <div className="rounded-xl border border-slate-200 bg-white">
            <div className="border-b border-slate-200 p-5">
              <h2 className="font-display text-base font-semibold text-[#0B192C]">
                Technology Stack Status Matrix
              </h2>
              <p className="mt-0.5 text-xs text-slate-500">
                Explicit separation between technologies currently operating in the browser and
                planned backend infrastructure.
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-200 bg-slate-50 text-slate-600">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Layer</th>
                    <th className="px-4 py-3 font-semibold">Technology</th>
                    <th className="px-4 py-3 font-semibold">Architectural Role</th>
                    <th className="px-5 py-3 font-semibold">Implementation Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {TECH_STACK_MATRIX.map((row) => (
                    <tr key={row.layer} className="hover:bg-slate-50/60">
                      <td className="px-5 py-3 font-medium text-[#0B192C] whitespace-nowrap">
                        {row.layer}
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-700 whitespace-nowrap">
                        {row.technology}
                      </td>
                      <td className="px-4 py-3 text-slate-600">{row.role}</td>
                      <td className="px-5 py-3 whitespace-nowrap">
                        <StatusLabel status={row.status} />
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
