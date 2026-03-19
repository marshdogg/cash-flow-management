import type {
  HealthStatus,
  TransactionFrequency,
  TransactionType,
  TransactionCategory,
  FixedCostStatus,
  ARAPStatus,
  RevenueCategory,
  RevenueItemStatus,
} from "@/types/cash-flow";

// ============================================
// §6.4 Health Thresholds (PRD)
// ============================================

export const HEALTH_CRITICAL_THRESHOLD = 4.0;
export const HEALTH_CAUTION_THRESHOLD = 8.0;

export const HEALTH_LABELS: Record<HealthStatus, string> = {
  critical: "Critical",
  caution: "Caution",
  healthy: "Healthy",
  not_available: "Not Available",
};

export const HEALTH_COLORS: Record<HealthStatus, string> = {
  critical: "text-danger-600",
  caution: "text-warning-500",
  healthy: "text-success-600",
  not_available: "text-neutral-400",
};

export const HEALTH_BG_COLORS: Record<HealthStatus, string> = {
  critical: "bg-danger-50",
  caution: "bg-warning-50",
  healthy: "bg-success-50",
  not_available: "bg-neutral-50",
};

export const HEALTH_GAUGE_COLORS: Record<HealthStatus, string> = {
  critical: "#dc2626",
  caution: "#f59e0b",
  healthy: "#16a34a",
  not_available: "#a3a3a3",
};

// ============================================
// §6.2 Frequency Normalization (PRD)
// ============================================

export const FREQUENCY_WEEKLY_DIVISORS: Record<TransactionFrequency, number> = {
  weekly: 1,
  biweekly: 2,
  semimonthly: 2.165, // twice per month ≈ monthly/2
  monthly: 4.33,
  quarterly: 13,
  annually: 52,
};

export const FREQUENCY_LABELS: Record<TransactionFrequency, string> = {
  weekly: "Weekly",
  biweekly: "Bi-weekly",
  semimonthly: "Semi-monthly",
  monthly: "Monthly",
  quarterly: "Quarterly",
  annually: "Annually",
};

export const FREQUENCY_OPTIONS: {
  value: TransactionFrequency;
  label: string;
}[] = [
  { value: "weekly", label: "Weekly" },
  { value: "biweekly", label: "Bi-weekly" },
  { value: "semimonthly", label: "Semi-monthly" },
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
  { value: "annually", label: "Annually" },
];

export const FREQUENCY_EMOJI_LABELS: Record<TransactionFrequency, string> = {
  weekly: "📅 Weekly",
  biweekly: "🔁 Bi-weekly",
  semimonthly: "📅 Semi-monthly",
  monthly: "📅 Monthly",
  quarterly: "📆 Quarterly",
  annually: "📅 Annually",
};

export const COMING_UP_DAYS = 7;
export const SOON_PILL_DAYS = 14;

// ============================================
// Transaction Type Labels
// ============================================

export const TRANSACTION_TYPE_LABELS: Record<TransactionType, string> = {
  income: "Income",
  expense: "Expense",
};

export const TRANSACTION_TYPE_COLORS: Record<TransactionType, string> = {
  income: "text-success-600",
  expense: "text-danger-600",
};

export const TRANSACTION_TYPE_BG: Record<TransactionType, string> = {
  income: "bg-success-50",
  expense: "bg-danger-50",
};

// ============================================
// Category Icons
// ============================================

export const CATEGORY_ICONS: Record<TransactionCategory, string> = {
  rent: "🏢",
  royalty: "🏷",
  vehicle: "🚗",
  insurance: "🛡",
  draw: "💸",
  subscription: "💻",
  loan: "🏦",
  supplies: "🖌",
  other: "📋",
};

// ============================================
// Transaction Categories (v2)
// ============================================

export const CATEGORY_LABELS: Record<TransactionCategory, string> = {
  rent: "Rent",
  royalty: "Royalty",
  vehicle: "Vehicle",
  insurance: "Insurance",
  draw: "Owner's Draw",
  subscription: "Subscription",
  loan: "Loan",
  supplies: "Supplies",
  other: "Other",
};

export const CATEGORY_COLORS: Record<TransactionCategory, { bg: string; text: string }> = {
  rent: { bg: "bg-blue-100", text: "text-blue-800" },
  royalty: { bg: "bg-pink-100", text: "text-pink-800" },
  vehicle: { bg: "bg-indigo-100", text: "text-indigo-800" },
  insurance: { bg: "bg-amber-100", text: "text-amber-800" },
  draw: { bg: "bg-success-50", text: "text-success-600" },
  subscription: { bg: "bg-purple-100", text: "text-purple-800" },
  loan: { bg: "bg-orange-100", text: "text-orange-800" },
  supplies: { bg: "bg-teal-100", text: "text-teal-800" },
  other: { bg: "bg-neutral-100", text: "text-neutral-600" },
};

export const CATEGORY_OPTIONS: { value: TransactionCategory; label: string }[] = [
  { value: "rent", label: "Rent" },
  { value: "loan", label: "Loan" },
  { value: "royalty", label: "Royalty" },
  { value: "insurance", label: "Insurance" },
  { value: "subscription", label: "Subscription" },
  { value: "supplies", label: "Supplies" },
  { value: "vehicle", label: "Vehicle" },
  { value: "draw", label: "Owner's Draw" },
  { value: "other", label: "Other" },
];

// ============================================
// Fixed Cost Status (v2)
// ============================================

export const FIXED_COST_STATUS_OPTIONS: { value: FixedCostStatus; label: string }[] = [
  { value: "paid", label: "✅ Paid" },
  { value: "skipped", label: "Skipped" },
  { value: "adjusted", label: "Adjusted" },
];

// ============================================
// AR/AP Status (v2)
// ============================================

export const ARAP_STATUS_LABELS: Record<ARAPStatus, string> = {
  pending: "Pending",
  partial: "Partial",
  paid: "Paid",
  overdue: "Overdue",
};

export const ARAP_STATUS_COLORS: Record<ARAPStatus, { bg: string; text: string }> = {
  pending: { bg: "bg-amber-100", text: "text-amber-800" },
  partial: { bg: "bg-blue-100", text: "text-blue-800" },
  paid: { bg: "bg-success-50", text: "text-success-600" },
  overdue: { bg: "bg-danger-50", text: "text-danger-600" },
};

// ============================================
// Day of Month Options (v2)
// ============================================

export const DAY_OF_MONTH_OPTIONS = [
  { value: 1, label: "1st" },
  { value: 5, label: "5th" },
  { value: 10, label: "10th" },
  { value: 15, label: "15th" },
  { value: 20, label: "20th" },
  { value: 25, label: "25th" },
  { value: 28, label: "28th" },
  { value: 0, label: "Last day of month" },
];

// ============================================
// COGS Defaults (v2)
// ============================================

export const DEFAULT_LABOR_PCT = 35;
export const DEFAULT_MATERIALS_PCT = 10;
export const DEFAULT_CC_FEE_PCT = 3.0;
export const DEFAULT_BUFFER = 5000;
export const DEFAULT_CASH_SPLIT_PCT = 30; // 30% cash/cheque, 70% credit card

// ============================================
// §6.5 Projection (PRD)
// ============================================

export const PROJECTION_WEEKS = 13;
export const PROJECTION_CONFIDENCE_BAND = 0.1;

export const BAR_CHART_WEEKS = 12;
export const BAR_CHART_MONTHS = 3;
export const DEFAULT_MIN_BALANCE_THRESHOLD = 5000;

// ============================================
// §6.3 Runway Display (PRD)
// ============================================

export const RUNWAY_CAP = 999.9;
export const RUNWAY_INFINITY_SYMBOL = "∞";

// ============================================
// Wizard Steps (v3 — Revenue Projection Model)
// ============================================

export const WIZARD_STEPS = [
  { number: 1, name: "Welcome", label: "Welcome" },
  { number: 2, name: "BankBalance", label: "Bank Balance" },
  { number: 3, name: "RecurringExpenses", label: "Recurring" },
  { number: 4, name: "OneOffExpenses", label: "One-Off" },
  { number: 5, name: "Revenue", label: "Revenue" },
  { number: 6, name: "Summary", label: "Summary" },
] as const;

export const WIZARD_TOTAL_STEPS = 6;
export const WEEK_SELECTOR_PAST_WEEKS = 4;
export const WIZARD_STATE_KEY = "cash-flow-ritual-state-v3";
export const WIZARD_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

// Revenue Rate Defaults
export const DEFAULT_AR_COLLECTION_RATE = 85;
export const DEFAULT_SALES_CANCELLATION_RATE = 15;
export const DEFAULT_PROPOSALS_CLOSE_RATE = 40;

// Revenue Week Options
export const REVENUE_WEEK_OPTIONS = [
  { value: "w0", label: "This week" },
  { value: "w1", label: "Next week" },
  { value: "w2", label: "Week 3" },
  { value: "w3", label: "Week 4" },
  { value: "w4", label: "Week 5" },
  { value: "w5", label: "Week 6" },
  { value: "w6", label: "Week 7+" },
] as const;

// Revenue Segment Colors
export const REVENUE_SEGMENT_COLORS = {
  bank: "#3d6b14",
  ar: "#5e9422",
  sales: "#8BC34A",
  proposals: "#b5d96e",
} as const;

// ============================================
// Input Validation (PRD §14)
// ============================================

export const MAX_BALANCE_AMOUNT = 999_999_999.99;
export const MAX_TRANSACTION_AMOUNT = 9_999_999.99;
export const MAX_TRANSACTION_NAME_LENGTH = 100;
export const MAX_ONE_OFF_DESCRIPTION_LENGTH = 200;

// ============================================
// Table Configuration
// ============================================

export const DEFAULT_PAGE_SIZE = 50;

// ============================================
// SWR Configuration
// ============================================

export const CASH_FLOW_REFRESH_INTERVAL = 300_000; // 5 minutes
export const CASH_FLOW_DEDUPING_INTERVAL = 5_000;

// ============================================
// History
// ============================================

export const MAX_HISTORY_WEEKS = 78; // 18 months
export const DASHBOARD_HISTORY_LIMIT = 6;

// ============================================
// Empty State Messages
// ============================================

export const EMPTY_STATE_MESSAGES = {
  dashboard: {
    title: "Welcome to Cash Flow Guide",
    description:
      "Complete your first ritual to see your cash position, health status, and projections.",
  },
  recurring: {
    title: "No recurring transactions yet",
    description: "Add your first one to get started.",
  },
  revenueItems: {
    title: "No revenue items yet",
    description: "Complete a weekly ritual to populate revenue items.",
  },
  widget: {
    title: "Not Available",
    description: "Complete your first ritual",
  },
  noDataTcp: "Complete your first ritual to see your cash position",
  noDataProjection: "Complete your first ritual to see projections",
  noDataHealth: "Complete your first ritual",
  fomNoFranchises: "No franchises assigned. Contact your administrator.",
};

// ============================================
// Toast Messages
// ============================================

export const TOAST_MESSAGES = {
  transactionCreated: "Transaction added",
  transactionUpdated: "Transaction updated",
  transactionDeleted: "Transaction deleted",
  bulkPaused: (n: number) =>
    `${n} transaction${n !== 1 ? "s" : ""} paused`,
  bulkResumed: (n: number) =>
    `${n} transaction${n !== 1 ? "s" : ""} resumed`,
  bulkDeleted: (n: number) =>
    `${n} transaction${n !== 1 ? "s" : ""} deleted`,
  ritualCompleted:
    "Ritual completed! Your dashboard has been updated.",
  ritualSaveError:
    "Unable to save your ritual. Your progress has been saved locally.",
  sessionExpired:
    "Your session has expired. Please refresh the page.",
  loadError:
    "Unable to load data. Check your connection and try again.",
  fomRedirect:
    "The ritual is only available to Franchise Partners.",
  transactionCrudError: (action: string) =>
    `Unable to ${action} transaction. Please try again.`,
};

// ============================================
// Confirmation Dialog Messages
// ============================================

export const CONFIRM_MESSAGES = {
  deleteTransaction: (name: string) => ({
    title: `Delete ${name}?`,
    description:
      "This transaction will be permanently removed and will no longer appear in your projections.",
  }),
  bulkDelete: (n: number) => ({
    title: `Delete ${n} transaction${n !== 1 ? "s" : ""}?`,
    description: "This cannot be undone.",
  }),
  abandonRitual: {
    title: "Leave ritual?",
    description: "Your progress will be saved for 24 hours.",
  },
};

// ============================================
// Validation Messages
// ============================================

export const VALIDATION_MESSAGES = {
  balanceRequired: "Enter a valid dollar amount",
  transactionNameRequired: "Payee name is required (max 100 characters)",
  transactionAmountRequired: "Enter a positive dollar amount",
  frequencyRequired: "Select a frequency",
  startDateRequired: "Enter a valid date",
  categoryRequired: "Select a category",
  dayOfMonthRequired: "Select a day of month",
  oneOffAmountRequired: "Enter a non-zero dollar amount",
  oneOffDescriptionRequired: "Description is required",
  workCompletedRequired: "Enter work completed amount",
  collectionsRequired: "Enter collections amount",
};

// ============================================
// Routes
// ============================================

export const CASH_FLOW_ROUTES = {
  dashboard: "/cash-flow/dashboard",
  ritual: "/cash-flow/ritual",
  recurring: "/cash-flow/recurring",
  revenueItems: "/cash-flow/revenue-items",
} as const;

export const CASH_FLOW_API_ROUTES = {
  dashboard: "/api/cash-flow/dashboard",
  recurring: "/api/cash-flow/recurring",
  ritual: "/api/cash-flow/ritual",
  balance: "/api/cash-flow/balance",
  widget: "/api/cash-flow/widget",
  ar: "/api/cash-flow/ar",
  ap: "/api/cash-flow/ap",
  revenueItems: "/api/cash-flow/revenue-items",
  settings: "/api/cash-flow/settings",
} as const;

// ============================================
// Revenue Item Constants
// ============================================

export const REVENUE_CATEGORY_LABELS: Record<RevenueCategory, string> = {
  ar: "Accounts Receivable",
  sales: "Sales / Estimate",
  proposal: "Proposal",
};

export const REVENUE_CATEGORY_ICONS: Record<RevenueCategory, string> = {
  ar: "💵",
  sales: "🗒",
  proposal: "📄",
};

export const REVENUE_CATEGORY_COLORS: Record<
  RevenueCategory,
  { bg: string; border: string; text: string; dotColor: string; iconBg: string }
> = {
  ar: {
    bg: "#e8f5e0",
    border: "#c5e49a",
    text: "#3d6b14",
    dotColor: "#5e9422",
    iconBg: "#e8f5e0",
  },
  sales: {
    bg: "#f1f8e9",
    border: "#b8e07a",
    text: "#6a9e32",
    dotColor: "#8BC34A",
    iconBg: "#f1f8e9",
  },
  proposal: {
    bg: "#f4fce8",
    border: "#d4edaa",
    text: "#5a7d20",
    dotColor: "#b5d96e",
    iconBg: "#f4fce8",
  },
};

export const REVENUE_STATUS_LABELS: Record<RevenueItemStatus, string> = {
  open: "Open",
  collected: "Collected",
  cancelled: "Cancelled",
  lost: "Lost",
};

export const REVENUE_STATUS_COLORS: Record<
  RevenueItemStatus,
  { bg: string; border: string; text: string; dot: string }
> = {
  open: { bg: "#eff6ff", border: "#bfdbfe", text: "#1d4ed8", dot: "#3b82f6" },
  collected: { bg: "#f1f8e9", border: "#c5e49a", text: "#6a9e32", dot: "#8BC34A" },
  cancelled: { bg: "#f3f4f6", border: "#e5e7eb", text: "#6b7280", dot: "#d1d5db" },
  lost: { bg: "#fef2f2", border: "#fecaca", text: "#b91c1c", dot: "#ef4444" },
};
