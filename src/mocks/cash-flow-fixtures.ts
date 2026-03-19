import type {
  CashFlowSession,
  RecurringTransaction,
  BankBalance,
  WeeklySnapshot,
  CashFlowDashboardResponse,
  RecurringTransactionsResponse,
  CompleteRitualResponse,
  CashFlowWidgetResponse,
  CashFlowBalanceResponse,
  AccountReceivable,
  AccountPayable,
  RevenueItem,
  RevenueItemsResponse,
} from "@/types/cash-flow";

// ============================================
// Mock Session
// ============================================

export const mockCashFlowSession: CashFlowSession = {
  userId: "usr_001",
  franchiseId: "fr_toronto_east",
  role: "franchise_partner",
  userName: "Sarah Chen",
  franchiseName: "WOW 1 DAY PAINTING — Toronto East",
};

export const mockFomSession: CashFlowSession = {
  userId: "usr_fom_001",
  franchiseId: "fr_corporate",
  role: "fom",
  userName: "Michael Torres",
  franchiseName: "Corporate",
  assignedFranchises: [
    { id: "fr_toronto_east", name: "WOW 1 DAY PAINTING — Toronto East" },
    { id: "fr_toronto_west", name: "WOW 1 DAY PAINTING — Toronto West" },
    { id: "fr_vancouver", name: "WOW 1 DAY PAINTING — Vancouver" },
  ],
};

// ============================================
// Mock Bank Balance
// ============================================

export const mockBankBalance: BankBalance = {
  id: "bal_001",
  franchiseId: "fr_toronto_east",
  amount: 45000,
  recordedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  recordedBy: "usr_001",
};

// ============================================
// Mock Recurring Transactions (v3 — income + expenses)
// ============================================

export const mockRecurringTransactions: RecurringTransaction[] = [
  {
    id: "txn_001",
    franchiseId: "fr_toronto_east",
    name: "Holiday Bonus Fund",
    description: "Annual staff bonus allocation",
    type: "expense",
    amount: 6000,
    frequency: "annually",
    category: "other",
    dayOfMonth: 30,
    startDate: "2025-01-01",
    nextOccurrence: "2026-11-30T10:00:00Z",
    status: "paused",
    createdAt: "2025-01-01T10:00:00Z",
    updatedAt: "2025-06-01T10:00:00Z",
  },
  {
    id: "txn_002",
    franchiseId: "fr_toronto_east",
    name: "Crew Payroll",
    description: "Bi-weekly direct deposit",
    type: "expense",
    amount: 6500,
    frequency: "biweekly",
    category: "other",
    dayOfMonth: 10,
    startDate: "2025-01-10",
    nextOccurrence: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
    status: "active",
    createdAt: "2025-01-10T10:00:00Z",
    updatedAt: "2025-01-10T10:00:00Z",
  },
  {
    id: "txn_003",
    franchiseId: "fr_toronto_east",
    name: "Marketing Budget",
    description: "Google Ads & local marketing",
    type: "expense",
    amount: 1500,
    frequency: "monthly",
    category: "other",
    dayOfMonth: 12,
    startDate: "2025-02-01",
    nextOccurrence: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString(),
    status: "active",
    createdAt: "2025-02-01T10:00:00Z",
    updatedAt: "2025-02-01T10:00:00Z",
  },
  {
    id: "txn_004",
    franchiseId: "fr_toronto_east",
    name: "Commercial Contracts",
    description: "Monthly retainer — Maple Group",
    type: "income",
    amount: 8000,
    frequency: "monthly",
    category: "other",
    dayOfMonth: 14,
    startDate: "2025-01-01",
    nextOccurrence: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    status: "active",
    createdAt: "2025-01-01T10:00:00Z",
    updatedAt: "2025-01-01T10:00:00Z",
  },
  {
    id: "txn_005",
    franchiseId: "fr_toronto_east",
    name: "Vehicle Leases",
    description: "3 vans · renewing Mar 16",
    type: "expense",
    amount: 2400,
    frequency: "monthly",
    category: "vehicle",
    dayOfMonth: 16,
    startDate: "2025-01-15",
    nextOccurrence: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString(),
    status: "active",
    createdAt: "2025-01-15T10:00:00Z",
    updatedAt: "2025-01-15T10:00:00Z",
  },
  {
    id: "txn_006",
    franchiseId: "fr_toronto_east",
    name: "Office Rent",
    description: "Commercial unit — 142 Bloor St",
    type: "expense",
    amount: 3200,
    frequency: "monthly",
    category: "rent",
    dayOfMonth: 19,
    startDate: "2025-01-01",
    nextOccurrence: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
    status: "active",
    createdAt: "2025-01-01T10:00:00Z",
    updatedAt: "2025-01-01T10:00:00Z",
  },
  {
    id: "txn_007",
    franchiseId: "fr_toronto_east",
    name: "Insurance Premium",
    description: "General liability + fleet",
    type: "expense",
    amount: 4800,
    frequency: "quarterly",
    category: "insurance",
    dayOfMonth: 18,
    startDate: "2025-01-01",
    nextOccurrence: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
    status: "active",
    createdAt: "2025-01-01T10:00:00Z",
    updatedAt: "2025-01-01T10:00:00Z",
  },
];

// ============================================
// Mock AR / AP
// ============================================

export const mockAccountsReceivable: AccountReceivable[] = [
  {
    id: "ar_001",
    franchiseId: "fr_toronto_east",
    customerName: "GreenTree Condos",
    amount: 12500,
    invoiceDate: "2026-02-18",
    status: "pending",
    createdAt: "2026-02-18T10:00:00Z",
    updatedAt: "2026-02-18T10:00:00Z",
  },
  {
    id: "ar_002",
    franchiseId: "fr_toronto_east",
    customerName: "Maple Realty",
    amount: 4200,
    invoiceDate: "2026-02-10",
    status: "overdue",
    createdAt: "2026-02-10T10:00:00Z",
    updatedAt: "2026-02-25T10:00:00Z",
  },
];

export const mockAccountsPayable: AccountPayable[] = [
  {
    id: "ap_001",
    franchiseId: "fr_toronto_east",
    vendorName: "Sherwin-Williams",
    totalAmount: 3800,
    remainingAmount: 3800,
    dueDate: "2026-03-10",
    status: "pending",
    createdAt: "2026-02-20T10:00:00Z",
    updatedAt: "2026-02-20T10:00:00Z",
  },
  {
    id: "ap_002",
    franchiseId: "fr_toronto_east",
    vendorName: "PPG Industries",
    totalAmount: 1200,
    remainingAmount: 600,
    dueDate: "2026-03-05",
    status: "partial",
    createdAt: "2026-02-15T10:00:00Z",
    updatedAt: "2026-03-01T10:00:00Z",
  },
  {
    id: "ap_003",
    franchiseId: "fr_toronto_east",
    vendorName: "Home Hardware",
    totalAmount: 450,
    remainingAmount: 450,
    dueDate: "2026-02-28",
    status: "overdue",
    createdAt: "2026-02-10T10:00:00Z",
    updatedAt: "2026-03-02T10:00:00Z",
  },
];

// ============================================
// Mock Snapshot (v3 — Revenue Projection model)
// ============================================

export const mockLatestSnapshot: WeeklySnapshot = {
  id: "snap_012",
  franchiseId: "fr_toronto_east",
  bankBalance: 93500,
  tcp: 85995,
  netWeeklyCashFlow: -7505,
  weeksOfRunway: 7.5,
  healthStatus: "healthy",
  completedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  completedBy: "usr_001",
  openingBalance: 93500,
  totalCollections: 15640,
  totalFixedCosts: 21025,
  totalOneTimeCosts: 2120,
  endingBalance: 85995,
  weekStart: "2026-02-23",
  weekEnd: "2026-03-01",
};

// ============================================
// Mock API Responses
// ============================================

const mockPeriods = [
  { label: "Wk 1",  bank:  8200, ar:  4800, sales:  7600, proposals:  4000, expense: 16400, current: true },
  { label: "Wk 2",  bank:  5500, ar:  3200, sales:  6200, proposals:  3300, expense: 14800 },
  { label: "Wk 3",  bank:  6000, ar:  4500, sales:  7000, proposals:  4000, expense: 17200 },
  { label: "Wk 4",  bank:  9000, ar:  5500, sales:  8500, proposals:  5000, expense: 19500 },
  { label: "Wk 5",  bank:  3500, ar:  2500, sales:  3800, proposals:  2200, expense: 18500 },
  { label: "Wk 6",  bank: 10000, ar:  6500, sales:  9500, proposals:  6000, expense: 21000 },
  { label: "Wk 7",  bank:  5800, ar:  4000, sales:  5800, proposals:  3400, expense: 16500 },
  { label: "Wk 8",  bank:  7000, ar:  4500, sales:  6500, proposals:  4000, expense: 20000 },
  { label: "Wk 9",  bank:  3000, ar:  2500, sales:  3200, proposals:  2300, expense: 22000 },
  { label: "Wk 10", bank:  8500, ar:  5000, sales:  7500, proposals:  5000, expense: 17000 },
  { label: "Wk 11", bank: 10000, ar:  6000, sales:  9000, proposals:  6000, expense: 20000 },
  { label: "Wk 12", bank:  4200, ar:  3000, sales:  4200, proposals:  2600, expense: 18000 },
].map((d) => ({ ...d, revenue: d.bank + d.ar + d.sales + d.proposals }));

const MOCK_OPENING = 93500;
const mockTotalRevenue = mockPeriods.reduce((s, p) => s + p.revenue, 0);
const mockTotalExpense = mockPeriods.reduce((s, p) => s + p.expense, 0);

export const mockDashboardResponse: CashFlowDashboardResponse = {
  franchiseName: "WOW 1 DAY PAINTING — Toronto East",
  openingBalance: MOCK_OPENING,
  periods: mockPeriods,
  threshold: 5000,
  summary: {
    totalRevenue: mockTotalRevenue,
    totalExpense: mockTotalExpense,
    projectedBalance: MOCK_OPENING + mockTotalRevenue - mockTotalExpense,
  },
};

export const mockRecurringTransactionsResponse: RecurringTransactionsResponse = {
  transactions: mockRecurringTransactions,
  meta: {
    total: mockRecurringTransactions.length,
    activeCount: mockRecurringTransactions.filter((t) => t.status === "active").length,
    totalMonthlyRecurring: mockRecurringTransactions
      .filter((t) => t.status === "active")
      .reduce((sum, t) => sum + t.amount, 0),
    incomeCount: mockRecurringTransactions.filter((t) => t.type === "income").length,
    expenseCount: mockRecurringTransactions.filter((t) => t.type === "expense").length,
  },
};

export const mockCompleteRitualResponse: CompleteRitualResponse = {
  snapshot: mockLatestSnapshot,
  message: "Ritual completed successfully",
};

export const mockWidgetResponse: CashFlowWidgetResponse = {
  tcp: {
    value: 48500,
    formattedValue: "$48,500.00",
  },
  health: {
    status: "caution",
    label: "Caution",
  },
  lastReviewed: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
};

export const mockBalanceResponse: CashFlowBalanceResponse = {
  current: mockBankBalance,
  history: [
    { amount: 45000, recordedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
    { amount: 42000, recordedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString() },
    { amount: 38500, recordedAt: new Date(Date.now() - 17 * 24 * 60 * 60 * 1000).toISOString() },
    { amount: 41200, recordedAt: new Date(Date.now() - 24 * 24 * 60 * 60 * 1000).toISOString() },
  ],
};

// ============================================
// Empty State Mocks (for first-time user)
// ============================================

export const mockEmptyDashboardResponse: CashFlowDashboardResponse = {
  franchiseName: "",
  openingBalance: 0,
  periods: [],
  threshold: 5000,
  summary: { totalRevenue: 0, totalExpense: 0, projectedBalance: 0 },
};

export const mockEmptyWidgetResponse: CashFlowWidgetResponse = {
  tcp: {
    value: null,
    formattedValue: "—",
  },
  health: {
    status: "not_available",
    label: "Not Available",
  },
  lastReviewed: null,
};

// ============================================
// Mock Revenue Items
// ============================================

const now = new Date();
const thisWeekStart = new Date(now);
thisWeekStart.setDate(now.getDate() - now.getDay() + 1); // Monday
const fmt = (d: Date) => d.toISOString().split("T")[0];
const addDays = (d: Date, n: number) => { const r = new Date(d); r.setDate(r.getDate() + n); return r; };

export const mockRevenueItems: RevenueItem[] = [
  // AR items
  {
    id: "rev_001",
    franchiseId: "fr_toronto_east",
    note: "Henderson project",
    category: "ar",
    grossAmount: 8400,
    adjustedAmount: 7140,
    adjustmentRate: 85,
    week: "w0",
    expectedDate: fmt(thisWeekStart),
    status: "open",
    ritualDate: fmt(addDays(thisWeekStart, 0)),
    createdAt: "2026-03-03T10:00:00Z",
    updatedAt: "2026-03-03T10:00:00Z",
  },
  {
    id: "rev_002",
    franchiseId: "fr_toronto_east",
    note: "Martinez invoice",
    category: "ar",
    grossAmount: 6200,
    adjustedAmount: 5270,
    adjustmentRate: 85,
    week: "w0",
    expectedDate: fmt(addDays(thisWeekStart, -7)),
    status: "open",
    ritualDate: "2026-02-25",
    createdAt: "2026-02-25T10:00:00Z",
    updatedAt: "2026-02-25T10:00:00Z",
  },
  {
    id: "rev_003",
    franchiseId: "fr_toronto_east",
    note: "Oakwood Condo deposit",
    category: "ar",
    grossAmount: 3800,
    adjustedAmount: 3230,
    adjustmentRate: 85,
    week: "w2",
    expectedDate: fmt(addDays(thisWeekStart, 14)),
    status: "open",
    ritualDate: fmt(addDays(thisWeekStart, 0)),
    createdAt: "2026-03-03T10:00:00Z",
    updatedAt: "2026-03-03T10:00:00Z",
  },
  {
    id: "rev_004",
    franchiseId: "fr_toronto_east",
    note: "Chen exterior job",
    category: "ar",
    grossAmount: 7200,
    adjustedAmount: 7200,
    adjustmentRate: 100,
    week: "w0",
    expectedDate: "2026-02-25",
    status: "collected",
    ritualDate: "2026-02-18",
    collectedDate: "2026-02-28",
    createdAt: "2026-02-18T10:00:00Z",
    updatedAt: "2026-02-28T10:00:00Z",
  },
  // Sales items
  {
    id: "rev_005",
    franchiseId: "fr_toronto_east",
    note: "Joe's estimate — Riverdale",
    category: "sales",
    grossAmount: 12000,
    adjustedAmount: 10200,
    adjustmentRate: 85,
    week: "w0",
    expectedDate: fmt(thisWeekStart),
    status: "open",
    ritualDate: fmt(addDays(thisWeekStart, 0)),
    createdAt: "2026-03-03T10:00:00Z",
    updatedAt: "2026-03-03T10:00:00Z",
  },
  {
    id: "rev_006",
    franchiseId: "fr_toronto_east",
    note: "Sarah K. — exterior repaint",
    category: "sales",
    grossAmount: 9500,
    adjustedAmount: 8075,
    adjustmentRate: 85,
    week: "w1",
    expectedDate: fmt(addDays(thisWeekStart, 7)),
    status: "open",
    ritualDate: fmt(addDays(thisWeekStart, 0)),
    createdAt: "2026-03-03T10:00:00Z",
    updatedAt: "2026-03-03T10:00:00Z",
  },
  {
    id: "rev_007",
    franchiseId: "fr_toronto_east",
    note: "Liu — interior full repaint",
    category: "sales",
    grossAmount: 8400,
    adjustedAmount: 7140,
    adjustmentRate: 85,
    week: "w0",
    expectedDate: fmt(addDays(thisWeekStart, -7)),
    status: "open",
    ritualDate: "2026-02-25",
    createdAt: "2026-02-25T10:00:00Z",
    updatedAt: "2026-02-25T10:00:00Z",
  },
  {
    id: "rev_008",
    franchiseId: "fr_toronto_east",
    note: "Nguyen — kitchen cabinets",
    category: "sales",
    grossAmount: 4200,
    adjustedAmount: 0,
    adjustmentRate: 0,
    week: "w0",
    expectedDate: "2026-02-25",
    status: "cancelled",
    ritualDate: "2026-02-18",
    createdAt: "2026-02-18T10:00:00Z",
    updatedAt: "2026-02-22T10:00:00Z",
  },
  // Proposal items
  {
    id: "rev_009",
    franchiseId: "fr_toronto_east",
    note: "Thompson — full interior",
    category: "proposal",
    grossAmount: 22000,
    adjustedAmount: 8800,
    adjustmentRate: 40,
    week: "w1",
    expectedDate: fmt(addDays(thisWeekStart, 7)),
    status: "open",
    ritualDate: fmt(addDays(thisWeekStart, 0)),
    createdAt: "2026-03-03T10:00:00Z",
    updatedAt: "2026-03-03T10:00:00Z",
  },
  {
    id: "rev_010",
    franchiseId: "fr_toronto_east",
    note: "Patel — condo complex",
    category: "proposal",
    grossAmount: 45000,
    adjustedAmount: 18000,
    adjustmentRate: 40,
    week: "w3",
    expectedDate: fmt(addDays(thisWeekStart, 21)),
    status: "open",
    ritualDate: fmt(addDays(thisWeekStart, 0)),
    createdAt: "2026-03-03T10:00:00Z",
    updatedAt: "2026-03-03T10:00:00Z",
  },
  {
    id: "rev_011",
    franchiseId: "fr_toronto_east",
    note: "Morrison — heritage restoration",
    category: "proposal",
    grossAmount: 31000,
    adjustedAmount: 12400,
    adjustmentRate: 40,
    week: "w5",
    expectedDate: fmt(addDays(thisWeekStart, 35)),
    status: "open",
    ritualDate: fmt(addDays(thisWeekStart, 0)),
    createdAt: "2026-03-03T10:00:00Z",
    updatedAt: "2026-03-03T10:00:00Z",
  },
  {
    id: "rev_012",
    franchiseId: "fr_toronto_east",
    note: "Villa — stucco exterior",
    category: "proposal",
    grossAmount: 9100,
    adjustedAmount: 0,
    adjustmentRate: 0,
    week: "w0",
    expectedDate: "2026-02-25",
    status: "lost",
    ritualDate: "2026-02-18",
    createdAt: "2026-02-18T10:00:00Z",
    updatedAt: "2026-02-26T10:00:00Z",
  },
];

export const mockRevenueItemsResponse: RevenueItemsResponse = {
  items: mockRevenueItems,
  meta: {
    total: mockRevenueItems.length,
    arCount: mockRevenueItems.filter((i) => i.category === "ar").length,
    salesCount: mockRevenueItems.filter((i) => i.category === "sales").length,
    proposalCount: mockRevenueItems.filter((i) => i.category === "proposal").length,
    openCount: mockRevenueItems.filter((i) => i.status === "open").length,
    collectedCount: mockRevenueItems.filter((i) => i.status === "collected").length,
    totalGross: mockRevenueItems.filter((i) => i.status === "open").reduce((s, i) => s + i.grossAmount, 0),
    totalAdjusted: mockRevenueItems.filter((i) => i.status === "open").reduce((s, i) => s + i.adjustedAmount, 0),
  },
};
