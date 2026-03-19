// ============================================
// Cash Flow Guide — Type Definitions (v2)
// ============================================

export type TransactionType = "income" | "expense";

export type TransactionFrequency =
  | "weekly"
  | "biweekly"
  | "semimonthly"
  | "monthly"
  | "quarterly"
  | "annually";

export type TransactionStatus = "active" | "paused";

export type TransactionCategory =
  | "rent"
  | "royalty"
  | "vehicle"
  | "insurance"
  | "draw"
  | "subscription"
  | "loan"
  | "supplies"
  | "other";

export type HealthStatus = "critical" | "caution" | "healthy" | "not_available";

export type CashFlowUserRole = "franchise_partner" | "fom";

export type FixedCostStatus = "paid" | "skipped" | "adjusted";

export type ARAPStatus = "pending" | "partial" | "paid" | "overdue";

// ============================================
// Entities
// ============================================

export interface BankBalance {
  id: string;
  franchiseId: string;
  amount: number;
  recordedAt: string;
  recordedBy: string;
}

export interface RecurringTransaction {
  id: string;
  franchiseId: string;
  name: string;
  type: TransactionType;
  amount: number;
  frequency: TransactionFrequency;
  startDate: string;
  nextOccurrence: string;
  status: TransactionStatus;
  createdAt: string;
  updatedAt: string;
  // v2 fields
  description?: string;
  category?: TransactionCategory;
  dayOfMonth?: number;
  secondDayOfMonth?: number;
  endDate?: string;
  notes?: string;
}

export interface WeeklySnapshot {
  id: string;
  franchiseId: string;
  bankBalance: number;
  tcp: number;
  netWeeklyCashFlow: number;
  weeksOfRunway: number | null;
  healthStatus: HealthStatus;
  completedAt: string;
  completedBy: string;
  // v2 P&L fields
  openingBalance?: number;
  workCompleted?: number;
  cashChequeCollections?: number;
  creditCardCollections?: number;
  creditCardFeePct?: number;
  totalCollections?: number;
  laborPct?: number;
  laborCalculated?: number;
  laborActual?: number;
  materialsPct?: number;
  materialsCalculated?: number;
  materialsActual?: number;
  otherVariableCosts?: number;
  totalVariableCogs?: number;
  totalFixedCosts?: number;
  totalOneTimeCosts?: number;
  endingBalance?: number;
  weekStart?: string;
  weekEnd?: string;
}

export interface AccountReceivable {
  id: string;
  franchiseId: string;
  customerName: string;
  amount: number;
  invoiceDate: string | null;
  status: ARAPStatus;
  createdAt: string;
  updatedAt: string;
}

export interface AccountPayable {
  id: string;
  franchiseId: string;
  vendorName: string;
  totalAmount: number;
  remainingAmount: number;
  dueDate: string | null;
  status: ARAPStatus;
  createdAt: string;
  updatedAt: string;
}

export interface RitualFixedCostEntry {
  id: string;
  snapshotId: string;
  transactionId: string | null;
  payee: string;
  amount: number;
  status: FixedCostStatus;
  adjustedAmount: number | null;
  createdAt: string;
}

export interface RitualOneTimeCost {
  id: string;
  snapshotId: string;
  description: string;
  amount: number;
  category: string | null;
  costDate: string | null;
  createdAt: string;
}

// ============================================
// API Response Types
// ============================================

export interface ChartPeriod {
  label: string;
  bank: number;
  ar: number;
  sales: number;
  proposals: number;
  revenue: number;
  expense: number;
  current?: boolean;
}

export interface CashFlowDashboardResponse {
  franchiseName: string;
  openingBalance: number;
  periods: ChartPeriod[];
  threshold: number;
  summary: {
    totalRevenue: number;
    totalExpense: number;
    projectedBalance: number;
  };
}

// Keep old ProjectionWeek for backward compat (used by calculations.ts)
export interface ProjectionWeek {
  week: number;
  projected: number;
  upperBound: number;
  lowerBound: number;
}

// Keep CashFlowPeriod and CashFlowBreakdown (used by calculations.ts)
export interface CashFlowPeriod {
  index: number;
  label: string;
  startDate: string;
  income: number;
  expense: number;
  net: number;
  runningBalance: number;
  isProjected: boolean;
}

export interface CashFlowBreakdown {
  openingBalance: number;
  weeks: CashFlowPeriod[];
  months: CashFlowPeriod[];
  totals: {
    income: number;
    expense: number;
    projectedBalance: number;
  };
}

// ============================================
// Recurring Transactions Response
// ============================================

export interface RecurringTransactionsResponse {
  transactions: RecurringTransaction[];
  meta: {
    total: number;
    activeCount: number;
    totalMonthlyRecurring: number;
    incomeCount: number;
    expenseCount: number;
  };
}

export interface CreateTransactionRequest {
  name: string;
  type?: TransactionType;
  amount: number;
  frequency: TransactionFrequency;
  startDate: string;
  description?: string;
  category?: TransactionCategory;
  dayOfMonth?: number;
  secondDayOfMonth?: number;
  endDate?: string;
  notes?: string;
}

export interface UpdateTransactionRequest {
  name?: string;
  amount?: number;
  frequency?: TransactionFrequency;
  startDate?: string;
  status?: TransactionStatus;
  description?: string;
  category?: TransactionCategory;
  dayOfMonth?: number;
  secondDayOfMonth?: number;
  endDate?: string;
  notes?: string;
}

// ============================================
// Ritual Request / Response
// ============================================

export interface CompleteRitualRequest {
  franchiseId: string;
  completedBy: string;
  weekStart: string;
  weekEnd: string;
  // Step 2: Bank Balance
  bankBalance: number;
  accountsPayable: number;
  // Step 3: Recurring Expenses
  recurringExpenses: Array<{
    transactionId: string;
    name: string;
    amount: number;
    checked: boolean;
  }>;
  // Step 4: One-Off Expenses
  oneOffExpenses: Array<{
    description: string;
    amount: number;
    makeRecurring: boolean;
  }>;
  // Step 5: Revenue
  arItems: Array<{ note: string; amount: number; week: RevenueWeek }>;
  arCollectionRate: number;
  salesItems: Array<{ note: string; amount: number; week: RevenueWeek }>;
  salesCancellationRate: number;
  proposalItems: Array<{ note: string; amount: number; week: RevenueWeek }>;
  proposalsCloseRate: number;
}

export interface CompleteRitualResponse {
  snapshot: WeeklySnapshot;
  message: string;
}

// ============================================
// Widget Response
// ============================================

export interface CashFlowWidgetResponse {
  tcp: {
    value: number | null;
    formattedValue: string;
  };
  health: {
    status: HealthStatus;
    label: string;
  };
  lastReviewed: string | null;
}

export interface CashFlowBalanceResponse {
  current: BankBalance | null;
  history: Array<{
    amount: number;
    recordedAt: string;
  }>;
}

// ============================================
// Wizard State (v3 — Revenue Projection Model)
// ============================================

export type RevenueWeek = "w0" | "w1" | "w2" | "w3" | "w4" | "w5" | "w6";

export interface RevenueLineItem {
  id: string;
  note: string;
  amount: number;
  week: RevenueWeek;
}

export interface WizardRecurringExpense {
  transactionId: string;
  name: string;
  icon: string;
  meta: string;
  amount: number;
  checked: boolean;
}

export interface WizardOneOffExpense {
  id: string;
  description: string;
  icon: string;
  amount: number;
  checked: boolean;
  makeRecurring: boolean;
}

export interface RitualWelcomeData {
  suggestedBalance: number | null;
  lastRitualDate: string | null;
  currentCashPosition: number | null;
  previousCashPosition: number | null;
  recurringExpenseChanges: number;
  oneOffExpensesFlagged: number;
}

export interface RitualWizardState {
  currentStep: number; // 1-6
  // Step 2: Bank Balance
  bankBalance: number | null;
  accountsPayable: number | null;
  // Step 3: Recurring Expenses
  recurringExpenses: WizardRecurringExpense[];
  // Step 4: One-Off Expenses
  oneOffExpenses: WizardOneOffExpense[];
  // Step 5: Revenue
  arItems: RevenueLineItem[];
  arCollectionRate: number;
  salesItems: RevenueLineItem[];
  salesCancellationRate: number;
  proposalItems: RevenueLineItem[];
  proposalsCloseRate: number;
  // Meta
  startedAt: string;
  expiresAt: string;
}

// ============================================
// Session
// ============================================

export interface CashFlowSession {
  userId: string;
  franchiseId: string;
  role: CashFlowUserRole;
  userName: string;
  franchiseName: string;
  assignedFranchises?: AssignedFranchise[];
}

export interface AssignedFranchise {
  id: string;
  name: string;
}

// ============================================
// Table State
// ============================================

export type SortField =
  | "name"
  | "type"
  | "amount"
  | "frequency"
  | "nextOccurrence"
  | "status";

export type SortDirection = "asc" | "desc";

export interface TableSort {
  field: SortField;
  direction: SortDirection;
}

export type StatusFilter = "all" | "active" | "paused";

export type TypeFilter = "all" | "income" | "expense";

export type BulkAction = "pause" | "resume" | "delete";

// ============================================
// Revenue Items
// ============================================

export type RevenueCategory = "ar" | "sales" | "proposal";

export type RevenueItemStatus = "open" | "collected" | "cancelled" | "lost";

export interface RevenueItem {
  id: string;
  franchiseId: string;
  note: string;
  category: RevenueCategory;
  grossAmount: number;
  adjustedAmount: number;
  adjustmentRate: number;
  week: RevenueWeek;
  expectedDate: string;
  status: RevenueItemStatus;
  ritualDate: string;
  snapshotId?: string;
  collectedDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RevenueItemsResponse {
  items: RevenueItem[];
  meta: {
    total: number;
    arCount: number;
    salesCount: number;
    proposalCount: number;
    openCount: number;
    collectedCount: number;
    totalGross: number;
    totalAdjusted: number;
  };
}

export type RevenueItemSortField =
  | "note"
  | "category"
  | "grossAmount"
  | "adjustedAmount"
  | "expectedDate"
  | "status";

export interface UpdateRevenueItemRequest {
  status?: RevenueItemStatus;
  note?: string;
  grossAmount?: number;
  expectedDate?: string;
  week?: RevenueWeek;
}

export type RevenueBulkAction = "collect" | "delete";
