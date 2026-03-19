# Implementation Brief — Cash Flow Guide

| Field | Value |
|-------|-------|
| **Author** | Ian (Implementation Agent V2) |
| **Version** | 1.0 |
| **Date** | 2026-03-01 |
| **PRD** | `prds/PRD-Cash-Flow-Guide.md` |
| **Design Spec** | `prds/Design-Spec-Cash-Flow-Guide.md` |

---

## §1 Technical Summary

The Cash Flow Guide is a greenfield standalone feature built within the existing Next.js 14 App Router codebase. It introduces three new page routes (`/cash-flow/dashboard`, `/cash-flow/ritual`, `/cash-flow/recurring`), six API routes under `/api/cash-flow/`, and a `CashFlowWidget` embeddable component. The feature is entirely self-contained — no dependencies on existing Dashboard entities or APIs.

The architecture follows the established patterns: Server Components for page shells with role-based access checks, Client Components for interactive data zones, SWR for server state management, and the `apiSuccess<T>()`/`apiError()`/`isMockMode()` pattern for API routes. The primary complexity lies in the financial calculation engine (TCP, runway, projections), the 5-step wizard with session persistence, and the CRUD table with bulk actions.

A new dependency is introduced: **Recharts** for the Projection Chart (line chart with confidence band area fills). All other dependencies are already in the project.

---

## §2 Architecture Decisions

### Decision 1: Page Rendering Strategy

| Field | Value |
|-------|-------|
| **Context** | Cash Flow Guide has 3 pages with different auth requirements. Dashboard and Recurring are viewable by FP + FOM; Ritual is FP-only. |
| **Decision** | Server Component page shells handle session/role checks. Client Components handle data fetching and interactivity. |
| **Option A** | Full client-side rendering with useEffect auth checks |
| **Option B** | Server Component shells with `getSession()` + role-based conditional rendering ✅ |
| **Rationale** | Matches existing Dashboard pattern. Server-side auth prevents flash of unauthorized content. Role checks happen before any HTML is sent. |
| **Impact** | Page files are Server Components importing Client Component shells. |

### Decision 2: Data Fetching

| Field | Value |
|-------|-------|
| **Context** | Dashboard needs real-time data, Recurring needs CRUD mutations, Ritual needs form state. |
| **Decision** | SWR for Dashboard and Recurring server state. `useReducer` + `sessionStorage` for Ritual wizard state. |
| **Option A** | SWR for everything including wizard state |
| **Option B** | SWR for server state, local state for wizard ✅ |
| **Rationale** | Wizard state is ephemeral (not persisted to server until completion). SWR's cache/revalidation model doesn't fit wizard semantics. sessionStorage survives page refreshes for resume. |
| **Impact** | `useCashFlowDashboard()` and `useRecurringTransactions()` use SWR. `useRitualWizard()` uses `useReducer` + sessionStorage. |

### Decision 3: Calculation Engine Location

| Field | Value |
|-------|-------|
| **Context** | TCP, Net Cash Flow, Runway, Health, and Projections need to be calculated from raw data. |
| **Decision** | Pure TypeScript functions in `src/lib/cash-flow/calculations.ts`. Called by both API routes (for server-side rendering) and client hooks (for real-time updates in wizard). |
| **Option A** | Calculate in API routes only, return computed values |
| **Option B** | Shared pure functions importable by both server and client ✅ |
| **Rationale** | The wizard needs to show real-time TCP/health updates as the user enters data (Step 5 Summary). Duplicating logic in API and client is error-prone. Pure functions with no side effects are safely shareable. |
| **Impact** | `calculations.ts` exports pure functions. No `"use client"` directive needed. |

### Decision 4: Chart Library

| Field | Value |
|-------|-------|
| **Context** | Projection chart needs a line with confidence band (shaded area between two bounds). |
| **Decision** | Recharts — React-native charting library with Area + Line composition. |
| **Option A** | Recharts ✅ |
| **Option B** | Chart.js with react-chartjs-2 |
| **Option C** | Visx (low-level D3-based) |
| **Rationale** | Recharts is declarative React, supports composable Area + Line for confidence bands, has good TypeScript support, is well-maintained. Chart.js requires imperative canvas API. Visx is too low-level for this use case. |
| **Impact** | New dependency: `recharts ^2.12.0`. Only used in `ProjectionChart.tsx`. |

### Decision 5: Wizard State Persistence

| Field | Value |
|-------|-------|
| **Context** | PRD requires wizard state to persist for 24 hours if user abandons mid-flow. |
| **Decision** | `sessionStorage` with a TTL timestamp. On resume, check TTL; if expired, start fresh. |
| **Option A** | sessionStorage with TTL ✅ |
| **Option B** | Server-side draft storage via API |
| **Rationale** | Wizard data is not saved to server until completion. Server-side drafts add complexity (draft cleanup, auth, API route) for a feature that just needs to survive tab refreshes. sessionStorage is simpler and sufficient. |
| **Impact** | `useRitualWizard` hook manages serialization/deserialization. Key: `cash-flow-ritual-state`. |

### Decision 6: Recurring Transaction Table

| Field | Value |
|-------|-------|
| **Context** | Table needs sort, filter, bulk actions, inline status toggles, and modal CRUD. |
| **Decision** | Custom table component using Tailwind + Radix primitives. No full data-grid library. |
| **Option A** | TanStack Table (headless) |
| **Option B** | Custom Tailwind table ✅ |
| **Rationale** | The table is simple (6 columns, ~50 rows typical, no virtual scrolling needed). TanStack Table adds bundle size for features we don't use. Custom table matches existing codebase patterns and gives full control over mobile responsive behavior. |
| **Impact** | `TransactionTable.tsx` with local sort/filter state. `TransactionForm.tsx` as modal. |

### Decision 7: Role-Based Access Enforcement

| Field | Value |
|-------|-------|
| **Context** | FOM has read-only access. FP has full CRUD. Ritual is FP-only. |
| **Decision** | Server-side role check in page shells + client-side `RoleGate` component for conditional UI rendering. API routes also enforce role checks. |
| **Option A** | Client-side only role checks |
| **Option B** | Triple enforcement: server page → client RoleGate → API route ✅ |
| **Rationale** | Defense in depth. Server page prevents rendering unauthorized UI. RoleGate hides action buttons for FOM. API route rejects unauthorized mutations as final guard. |
| **Impact** | `RoleGate` component accepts `allowedRoles` prop. Ritual page redirects FOM at server level. |

### Decision 8: Franchise Picker (FOM)

| Field | Value |
|-------|-------|
| **Context** | FOM needs to switch between assigned franchises. Selection must persist across page navigation. |
| **Decision** | URL query parameter `?franchise=fr_id` synced via custom hook. |
| **Option A** | React context / global state |
| **Option B** | URL query parameter ✅ |
| **Rationale** | URL params enable deep-linking, browser back/forward, and shareable URLs. Matches existing `usePeriod` and `useActiveTab` patterns. No extra state management needed. |
| **Impact** | `useFranchisePicker` hook reads/writes `franchise` search param. Default: first assigned franchise. |

### Decision 9: API Route Structure

| Field | Value |
|-------|-------|
| **Context** | Need CRUD for transactions, read for dashboard data, write for ritual completion, read for widget. |
| **Decision** | RESTful routes under `/api/cash-flow/` with consistent `apiSuccess`/`apiError` envelope. |
| **Routes** | `dashboard` (GET), `recurring` (GET, POST), `recurring/[id]` (GET, PATCH, DELETE), `ritual` (POST), `balance` (GET), `widget` (GET) |
| **Impact** | 6 route files. All use `isMockMode()` for development. |

---

## §3 Data Model

### Entities

| Entity | Fields | Source | Notes |
|--------|--------|--------|-------|
| **Franchise** | `id`, `name`, `ownerId`, `fomIds[]`, `timezone` | Session context | Not stored in Cash Flow — read from auth |
| **BankBalance** | `id`, `franchiseId`, `amount`, `recordedAt`, `recordedBy` | Ritual Wizard Step 2 | Latest balance used for TCP |
| **RecurringTransaction** | `id`, `franchiseId`, `name`, `type` (income\|expense), `amount`, `frequency`, `startDate`, `nextOccurrence`, `status` (active\|paused), `createdAt`, `updatedAt` | Recurring Transactions page | Amount always positive; type determines sign |
| **OneOffTransaction** | `id`, `franchiseId`, `snapshotId`, `description`, `amount`, `type` (income\|expense), `createdAt` | Ritual Wizard Step 4 | Linked to a specific snapshot |
| **WeeklySnapshot** | `id`, `franchiseId`, `bankBalance`, `tcp`, `netWeeklyCashFlow`, `weeksOfRunway`, `healthStatus`, `completedAt`, `completedBy` | Ritual completion | Immutable once created |
| **RitualCompletion** | `id`, `franchiseId`, `snapshotId`, `startedAt`, `completedAt`, `stepsCompleted` | Ritual completion tracking | Links to snapshot |

### Data Flow

1. **Dashboard Load:** `GET /api/cash-flow/dashboard?franchise=fr_id` → Returns latest snapshot + computed metrics from current recurring transactions + latest bank balance
2. **Ritual Start:** Client reads sessionStorage for draft state. If none/expired, initializes fresh wizard state.
3. **Ritual Step 2:** User enters bank balance. Stored in wizard state (not sent to server yet).
4. **Ritual Step 3:** Client fetches `GET /api/cash-flow/recurring?franchise=fr_id` to display current transactions for review.
5. **Ritual Step 5:** Client computes TCP, health, projections using `calculations.ts` with wizard state data. Displays preview.
6. **Ritual Complete:** `POST /api/cash-flow/ritual` with `{ bankBalance, oneOffTransactions[], franchiseId }`. Server creates BankBalance + OneOffTransaction records + WeeklySnapshot.
7. **Transaction CRUD:** `POST/PATCH/DELETE /api/cash-flow/recurring/[id]`. SWR cache invalidated on mutation.
8. **Widget:** `GET /api/cash-flow/widget?franchise=fr_id` → Returns TCP, health status, last reviewed date.

### API Shape (TypeScript Interfaces)

```typescript
// ============================================
// Types: src/types/cash-flow.ts
// ============================================

export type TransactionType = "income" | "expense";
export type TransactionFrequency = "weekly" | "biweekly" | "monthly" | "quarterly" | "annually";
export type TransactionStatus = "active" | "paused";
export type HealthStatus = "critical" | "caution" | "healthy" | "not_available";
export type UserRole = "franchise_partner" | "fom";

export interface BankBalance {
  id: string;
  franchiseId: string;
  amount: number;
  recordedAt: string; // ISO 8601
  recordedBy: string;
}

export interface RecurringTransaction {
  id: string;
  franchiseId: string;
  name: string;
  type: TransactionType;
  amount: number; // always positive
  frequency: TransactionFrequency;
  startDate: string; // ISO 8601 date
  nextOccurrence: string; // ISO 8601 date
  status: TransactionStatus;
  createdAt: string;
  updatedAt: string;
}

export interface OneOffTransaction {
  id: string;
  franchiseId: string;
  snapshotId: string;
  description: string;
  amount: number;
  type: TransactionType;
  createdAt: string;
}

export interface WeeklySnapshot {
  id: string;
  franchiseId: string;
  bankBalance: number;
  tcp: number;
  netWeeklyCashFlow: number;
  weeksOfRunway: number | null; // null = infinity
  healthStatus: HealthStatus;
  completedAt: string;
  completedBy: string;
}

// ============================================
// API Response Types
// ============================================

export interface CashFlowDashboardResponse {
  tcp: {
    value: number | null;
    formattedValue: string;
    bankBalance: number | null;
    pendingInflows: number;
    pendingOutflows: number;
  };
  health: {
    status: HealthStatus;
    weeksOfRunway: number | null;
    formattedRunway: string;
  };
  netWeeklyCashFlow: {
    value: number;
    formattedValue: string;
  };
  projection: {
    weeks: Array<{
      week: number;
      projected: number;
      upperBound: number;
      lowerBound: number;
    }>;
  } | null;
  lastRitual: {
    completedAt: string | null;
    daysSince: number | null;
  };
}

export interface RecurringTransactionsResponse {
  transactions: RecurringTransaction[];
  meta: {
    total: number;
    incomeCount: number;
    expenseCount: number;
  };
}

export interface CreateTransactionRequest {
  name: string;
  type: TransactionType;
  amount: number;
  frequency: TransactionFrequency;
  startDate: string;
}

export interface UpdateTransactionRequest {
  name?: string;
  type?: TransactionType;
  amount?: number;
  frequency?: TransactionFrequency;
  startDate?: string;
  status?: TransactionStatus;
}

export interface CompleteRitualRequest {
  bankBalance: number;
  oneOffTransactions: Array<{
    description: string;
    amount: number;
    type: TransactionType;
  }>;
}

export interface CompleteRitualResponse {
  snapshot: WeeklySnapshot;
  message: string;
}

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
// Wizard State
// ============================================

export interface RitualWizardState {
  currentStep: number; // 1-5
  bankBalance: number | null;
  reviewedTransactionIds: string[];
  oneOffTransactions: Array<{
    id: string; // client-generated UUID
    description: string;
    amount: number;
    type: TransactionType;
  }>;
  startedAt: string; // ISO 8601
  expiresAt: string; // ISO 8601 (startedAt + 24h)
}
```

---

## §4 Component Architecture

### Rendering Strategy

| Component | Rendering | Reason |
|-----------|-----------|--------|
| `/cash-flow/dashboard/page.tsx` | Server | Session check, role-based props |
| `CashFlowDashboardShell` | Client | SWR data fetching, interactivity |
| `CashPositionCard` | Client | Receives data via props |
| `HealthGauge` | Client | Animated gauge, ARIA live |
| `ProjectionChart` | Client | Recharts (client-only) |
| `QuickActions` | Client | Navigation buttons, role-gated |
| `/cash-flow/ritual/page.tsx` | Server | FP-only guard, redirect FOM |
| `RitualWizard` | Client | Multi-step form, local state |
| `StepIndicator` | Client | Step navigation UI |
| Step 1-5 components | Client | Form inputs, data display |
| `/cash-flow/recurring/page.tsx` | Server | Session check |
| `RecurringTransactionsShell` | Client | SWR + CRUD mutations |
| `TransactionTable` | Client | Sort, filter, selection |
| `TransactionForm` | Client | Modal form, validation |
| `BulkActionBar` | Client | Conditional on selection |
| `CashFlowWidget` | Client | SWR data, compact display |

### State Management

| State | Manager | Scope |
|-------|---------|-------|
| Dashboard data | SWR (`useCashFlowDashboard`) | Dashboard page |
| Recurring transactions | SWR (`useRecurringTransactions`) | Recurring page + Ritual Step 3 |
| Wizard step state | `useReducer` (`useRitualWizard`) | Ritual page, persisted to sessionStorage |
| Selected franchise (FOM) | URL param (`useFranchisePicker`) | All pages |
| Table sort/filter | `useState` (local) | Recurring page |
| Selected rows | `useState` (local) | Recurring page |
| Modal open/close | `useState` (local) | Recurring page |
| Toast messages | `ToastContext` (existing) | Global |

### Shared Components (Reused from Existing)

| Component | Source | Usage |
|-----------|--------|-------|
| `ToastProvider` | `@/components/shared/ToastProvider` | Layout wrapper |
| `ErrorBoundary` | `@/components/shared/ErrorBoundary` | Per-section error handling |
| `cn()` | `@/lib/cn` | Conditional class names |
| `apiSuccess<T>()` / `apiError()` | `@/lib/api-response` | API routes |
| `isMockMode()` | `@/lib/api-response` | API routes |

### New Shared Components

| Component | Purpose |
|-----------|---------|
| `RoleGate` | Conditionally renders children based on user role. Props: `allowedRoles: UserRole[]`, `fallback?: ReactNode` |
| `EmptyState` | Consistent empty state display. Props: `icon`, `title`, `description`, `actionLabel?`, `onAction?` |
| `SkeletonCard` | Loading placeholder card. Props: `lines?: number`, `hasChart?: boolean` |
| `MetricCard` | Reusable metric display. Props: `label`, `value`, `formattedValue`, `subtitle?`, `valueColor?` |
| `ConfirmDialog` | Confirmation modal. Props: `title`, `description`, `confirmLabel`, `onConfirm`, `onCancel`, `destructive?` |

---

## §5 Custom Hooks

### `useCashFlowDashboard(franchiseId: string)`

```typescript
// Returns dashboard data via SWR
// Fetches: GET /api/cash-flow/dashboard?franchise={franchiseId}
// Returns: { data, error, isLoading, mutate }
// Auto-refreshes every 5 minutes
// Abort-on-unmount via AbortController
```

### `useRecurringTransactions(franchiseId: string)`

```typescript
// Returns transaction list + CRUD mutation functions
// Fetches: GET /api/cash-flow/recurring?franchise={franchiseId}
// Returns: { transactions, meta, isLoading, error, createTransaction, updateTransaction, deleteTransaction, bulkAction }
// Mutations call SWR mutate() for optimistic updates
```

### `useRitualWizard()`

```typescript
// Returns wizard state + navigation functions
// State managed via useReducer
// Persists to sessionStorage on every state change
// Returns: { state, goToStep, setBankBalance, toggleTransaction, addOneOff, removeOneOff, completeRitual, abandonRitual, isResuming }
// completeRitual() calls POST /api/cash-flow/ritual
```

### `useHealthStatus(tcp: number | null, weeklyExpenses: number)`

```typescript
// Pure computation hook (no API calls)
// Returns: { status: HealthStatus, weeksOfRunway: number | null, label: string, color: string }
// Handles: null TCP, zero expenses, negative TCP
```

### `useFranchisePicker(assignedFranchises: Franchise[])`

```typescript
// URL-synced franchise selection for FOM
// Reads/writes ?franchise= search param
// Returns: { selectedFranchise, setSelectedFranchise, franchises }
// Default: first franchise alphabetically
```

---

## §6 File Structure

```
src/
├── app/
│   ├── cash-flow/
│   │   ├── dashboard/
│   │   │   └── page.tsx                    # Server: session → CashFlowDashboardShell
│   │   ├── ritual/
│   │   │   └── page.tsx                    # Server: FP-only guard → RitualWizard
│   │   ├── recurring/
│   │   │   └── page.tsx                    # Server: session → RecurringTransactionsShell
│   │   └── layout.tsx                      # Cash Flow nav + ToastProvider
│   └── api/
│       └── cash-flow/
│           ├── dashboard/
│           │   └── route.ts                # GET dashboard data
│           ├── recurring/
│           │   ├── route.ts                # GET list, POST create
│           │   └── [id]/
│           │       └── route.ts            # GET one, PATCH update, DELETE
│           ├── ritual/
│           │   └── route.ts                # POST complete ritual
│           ├── balance/
│           │   └── route.ts                # GET balance history
│           └── widget/
│               └── route.ts                # GET widget data
├── components/
│   ├── cash-flow/
│   │   ├── dashboard/
│   │   │   ├── CashFlowDashboardShell.tsx  # Client shell with SWR
│   │   │   ├── CashPositionCard.tsx        # Hero TCP card
│   │   │   ├── HealthGauge.tsx             # Arc gauge with status
│   │   │   ├── MetricCards.tsx             # Net flow + runway cards
│   │   │   ├── ProjectionChart.tsx         # Recharts 13-week line
│   │   │   └── QuickActions.tsx            # Action button strip
│   │   ├── ritual/
│   │   │   ├── RitualWizard.tsx            # Wizard container
│   │   │   ├── StepIndicator.tsx           # Step progress bar
│   │   │   ├── WelcomeStep.tsx             # Step 1
│   │   │   ├── BankBalanceStep.tsx         # Step 2
│   │   │   ├── ReviewRecurringStep.tsx     # Step 3
│   │   │   ├── OneOffItemsStep.tsx         # Step 4
│   │   │   └── SummaryStep.tsx             # Step 5
│   │   ├── recurring/
│   │   │   ├── RecurringTransactionsShell.tsx  # Client shell
│   │   │   ├── TransactionTable.tsx        # Data table
│   │   │   ├── TransactionForm.tsx         # Add/edit modal
│   │   │   ├── FilterBar.tsx              # Type + status filters
│   │   │   └── BulkActionBar.tsx          # Bulk action controls
│   │   ├── widget/
│   │   │   └── CashFlowWidget.tsx         # Compact widget card
│   │   └── shared/
│   │       ├── RoleGate.tsx               # Role-based rendering
│   │       ├── EmptyState.tsx             # Empty state display
│   │       ├── SkeletonCard.tsx           # Loading skeleton
│   │       ├── MetricCard.tsx             # Reusable metric
│   │       ├── ConfirmDialog.tsx          # Confirmation modal
│   │       └── CashFlowNav.tsx            # Sidebar navigation
│   └── shared/                            # Existing shared (ToastProvider, ErrorBoundary)
├── hooks/
│   ├── useCashFlowDashboard.ts
│   ├── useRecurringTransactions.ts
│   ├── useRitualWizard.ts
│   ├── useHealthStatus.ts
│   └── useFranchisePicker.ts
├── lib/
│   ├── cash-flow/
│   │   ├── calculations.ts               # Pure calc functions
│   │   ├── format-utils.ts               # formatMetricValue, formatCurrency
│   │   └── cash-flow-api.ts              # apiFetch wrapper for cash flow
│   ├── api-response.ts                    # Existing
│   ├── cn.ts                              # Existing
│   └── analytics.ts                       # Existing (extend with cash flow events)
├── constants/
│   └── cash-flow.ts                       # All labels, thresholds, config
├── types/
│   └── cash-flow.ts                       # All type definitions
└── mocks/
    └── cash-flow-fixtures.ts              # Mock data for all API routes
```

**Estimated file count: 55-65 files**

---

## §7 Constants Cross-Reference

All constants must match PRD text exactly.

```typescript
// src/constants/cash-flow.ts

// §6.4 Health Thresholds
export const HEALTH_CRITICAL_THRESHOLD = 4.0; // weeks
export const HEALTH_CAUTION_THRESHOLD = 8.0; // weeks

// §6.4 Health Labels
export const HEALTH_LABELS: Record<HealthStatus, string> = {
  critical: "Critical",
  caution: "Caution",
  healthy: "Healthy",
  not_available: "Not Available",
};

// §6.4 Health Colors (Tailwind classes)
export const HEALTH_COLORS: Record<HealthStatus, string> = {
  critical: "text-danger-600",
  caution: "text-warning-500",
  healthy: "text-success-600",
  not_available: "text-neutral-400",
};

// §6.2 Frequency Normalization (to weekly)
export const FREQUENCY_WEEKLY_DIVISORS: Record<TransactionFrequency, number> = {
  weekly: 1,
  biweekly: 2,
  monthly: 4.33,
  quarterly: 13,
  annually: 52,
};

// §6.5 Projection
export const PROJECTION_WEEKS = 13;
export const PROJECTION_CONFIDENCE_BAND = 0.10; // ±10%

// §6.3 Runway display
export const RUNWAY_CAP = 999.9;
export const RUNWAY_INFINITY_SYMBOL = "∞";

// Frequency Labels
export const FREQUENCY_LABELS: Record<TransactionFrequency, string> = {
  weekly: "Weekly",
  biweekly: "Bi-weekly",
  monthly: "Monthly",
  quarterly: "Quarterly",
  annually: "Annually",
};

// Transaction Type Labels
export const TRANSACTION_TYPE_LABELS: Record<TransactionType, string> = {
  income: "Income",
  expense: "Expense",
};

// Wizard Steps
export const WIZARD_STEPS = [
  { number: 1, name: "Welcome", label: "Welcome" },
  { number: 2, name: "BankBalance", label: "Bank Balance" },
  { number: 3, name: "ReviewRecurring", label: "Review Recurring" },
  { number: 4, name: "OneOffItems", label: "One-Off Items" },
  { number: 5, name: "Summary", label: "Summary" },
] as const;

// Wizard State
export const WIZARD_STATE_KEY = "cash-flow-ritual-state";
export const WIZARD_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

// Input Validation
export const MAX_BALANCE_AMOUNT = 999_999_999.99;
export const MAX_TRANSACTION_AMOUNT = 9_999_999.99;
export const MAX_TRANSACTION_NAME_LENGTH = 100;
export const MAX_ONE_OFF_DESCRIPTION_LENGTH = 200;

// Table
export const DEFAULT_PAGE_SIZE = 50;

// SWR Config
export const CASH_FLOW_SWR_CONFIG = {
  dedupingInterval: 5000,
  revalidateOnFocus: true,
  errorRetryCount: 3,
};

// History
export const MAX_HISTORY_WEEKS = 78; // 18 months

// Empty State Messages
export const EMPTY_STATE_MESSAGES = {
  dashboard: {
    title: "Welcome to Cash Flow Guide",
    description: "Complete your first ritual to see your cash position, health status, and projections.",
  },
  recurring: {
    title: "No recurring transactions yet",
    description: "Add your first one to get started.",
  },
  widget: {
    title: "Not Available",
    description: "Complete your first ritual",
  },
};

// Toast Messages
export const TOAST_MESSAGES = {
  transactionCreated: "Transaction added",
  transactionUpdated: "Transaction updated",
  transactionDeleted: "Transaction deleted",
  bulkPaused: (n: number) => `${n} transaction${n !== 1 ? "s" : ""} paused`,
  bulkResumed: (n: number) => `${n} transaction${n !== 1 ? "s" : ""} resumed`,
  bulkDeleted: (n: number) => `${n} transaction${n !== 1 ? "s" : ""} deleted`,
  ritualCompleted: "Ritual completed! Your dashboard has been updated.",
  ritualSaveError: "Unable to save your ritual. Your progress has been saved locally.",
  sessionExpired: "Your session has expired. Please refresh the page.",
  loadError: "Unable to load data. Check your connection and try again.",
  fomRedirect: "The ritual is only available to Franchise Partners.",
};
```

---

## §8 Performance Considerations

| Risk | Scenario | Mitigation |
|------|----------|------------|
| Large transaction list | FP has 200+ recurring transactions | Client-side pagination (50/page). No virtual scrolling needed per PRD Q12 target (<500ms for 200). |
| Chart rendering | 13 data points + confidence bands | Recharts handles efficiently. Lazy-load chart component with `next/dynamic`. |
| Wizard form re-renders | Each keystroke in balance input | Debounce input (300ms) before persisting to sessionStorage. Use `useDeferredValue` for Summary computations. |
| SWR over-fetching | FOM switching franchises rapidly | `dedupingInterval: 5000` prevents duplicate requests. AbortController cancels in-flight requests on franchise switch. |
| Bundle size | Recharts adds ~50KB gzipped | Tree-shake: import only `LineChart`, `Line`, `Area`, `XAxis`, `YAxis`, `Tooltip`, `ResponsiveContainer`. Dynamic import for chart component. |

---

## §9 Mandatory Checks (Cody Build Phase)

1. **No direct mock imports in components.** All data flows through hooks → API routes → mocks.
2. **API response envelope verified.** Every route returns `apiSuccess<T>()` or `apiError()`.
3. **Constants cross-referenced.** Every label/threshold in components matches `constants/cash-flow.ts`.
4. **Role checks at 3 layers:** Server page → RoleGate component → API route.
5. **Null coalescing for every metric.** TCP, runway, net flow — all handle `null` with `"—"` display.
6. **Division-by-zero guarded.** Runway calculation checks for zero expenses before dividing.
7. **sessionStorage TTL enforced.** Wizard checks expiry timestamp on resume.
8. **Toast wired for all CRUD operations.** Create, update, delete, bulk actions, errors.
9. **`npm run build` passes.** No TypeScript errors, no unused imports.
10. **`npm run lint` passes.** ESLint clean.
