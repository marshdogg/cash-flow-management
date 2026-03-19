import type { TabId, PeriodId } from "@/types/dashboard";

export const TABS: { id: TabId; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "sales", label: "Sales" },
  { id: "profitability", label: "Profitability" },
];

export const PERIODS: { id: PeriodId; label: string }[] = [
  { id: "today", label: "Today" },
  { id: "week", label: "This Week" },
  { id: "month", label: "This Month" },
  { id: "ytd", label: "YTD" },
];

export const DEFAULT_TAB: TabId = "overview";
export const DEFAULT_PERIOD: PeriodId = "month";

export const AUTO_REFRESH_INTERVAL = 300_000; // 5 minutes
export const STALE_DATA_THRESHOLD = 900_000; // 15 minutes
export const UNDO_WINDOW_MS = 3_000;
export const CHECKBOX_DEBOUNCE_MS = 500;
export const REFRESH_SUCCESS_REVERT_MS = 2_000;
export const MIN_LOADING_DISPLAY_MS = 200;

export const TASK_TYPE_CONFIG = {
  call: { label: "Call", bgColor: "bg-blue-100", textColor: "text-blue-700" },
  email: { label: "Email", bgColor: "bg-purple-100", textColor: "text-purple-700" },
  todo: { label: "To-Do", bgColor: "bg-gray-100", textColor: "text-gray-700" },
  followup: { label: "Follow-Up", bgColor: "bg-warning-100", textColor: "text-yellow-700" },
} as const;

export const PROFITABILITY_ALLOWED_ROLES = [
  "franchise_partner",
  "ops_manager",
  "fom",
  "admin",
] as const;

export const MAX_TASKS_DISPLAYED = 6;
export const MAX_ESTIMATORS_DISPLAYED = 5;
export const PROGRESS_BAR_MAX_VISUAL = 100; // cap at 100% — bar never extends beyond track
