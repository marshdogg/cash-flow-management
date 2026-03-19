# Implementation Brief: Dashboard Flow
## Generated from: PRD-Dashboard-Flow.md (Update 5) + Design-Spec-Dashboard-Flow.md
## Date: February 28, 2026
## Status: 🟢 Ready for Build

---

### Changelog

| Date | Version | Changes |
|------|---------|---------|
| 2026-03-01 | V2 | Added Label & Constant Cross-Reference table (PRD ↔ Code), Toast System Architecture, Integration Wiring Plan (Mock → Hook), Edge Value Handling Strategy, Metric Formula Execution Location |
| 2026-02-28 | V1 | Initial brief generated from PRD Update 5 + Design Spec |

---

## 1. Technical Summary

The Dashboard is a **read-heavy, client-interactive aggregation page** built with Next.js 14 App Router. The page shell (sidebar, header, tabs) renders as a Server Component. Each tab's data-dependent content is a Client Component boundary using SWR for fetching and revalidation. This splits naturally: the layout is static and SEO-irrelevant (auth-gated), while all data is user-specific, franchise-scoped, and needs client-side refresh capabilities (auto-refresh, period switching, tab switching).

The most complex part is the **task completion flow** — optimistic UI with a 3-second undo window, API failure revert, debounced checkbox, and auto-refresh suppression during the undo window. This requires careful state coordination between the task list, the auto-refresh timer, and the SWR cache.

Existing patterns to reuse: the sidebar/layout is shared across all flows (build once, reuse everywhere). Toast notifications, error banners, and empty states follow shared patterns. The dashboard introduces new component patterns (KpiCard, FunnelMini, DashboardTaskItem) that are dashboard-specific but follow the shadcn/ui extension convention.

## 2. Architecture Decisions

### Decision 1: Page rendering — Server Component shell + Client Component data zones
**Context:** Dashboard requires auth-gated, franchise-scoped data with client-side interactivity (tabs, periods, auto-refresh, task completion).
**Decision:** App Router page as Server Component for layout. Three Client Component boundaries: `<OverviewTab />`, `<SalesTab />`, `<ProfitabilityTab />`, each managing their own SWR fetches.
**Options:**
- A: Full Client Component page — Simple but loses Server Component benefits for shell, sends more JS.
- B: Server Component shell + Client islands — Sidebar, header, tabs render server-side. Only data zones are Client Components. Less JS, faster initial paint.
**Decision:** Option B.
**Impact:** Page file at `src/app/dashboard/page.tsx` is a Server Component. Tab content lives in `src/components/dashboard/` as Client Components. Sidebar is a shared Server Component at `src/components/layout/AppSidebar.tsx`.

### Decision 2: Data fetching — SWR with per-section cache keys
**Context:** Dashboard fetches from multiple API endpoints (projects, funnel, customer care, tasks, technicians). Period changes refetch all data. Tab switches may not need to refetch if data is cached.
**Decision:** One SWR hook per data section, keyed by `[endpoint, franchise_id, period]`. SWR's `dedupingInterval` prevents redundant requests. `refreshInterval` set to 300000ms (5 min) for auto-refresh.
**Options:**
- A: Single monolithic dashboard API endpoint — One fetch, one cache key. Simple but couples all data; partial failure means total failure.
- B: Per-section SWR hooks — Independent fetching per section. Enables partial failure handling, independent loading states, and granular caching.
**Decision:** Option B.
**Impact:** Multiple SWR hooks in each tab component. Each hook manages its own loading/error state. Custom `useDashboardData(section, period)` hook wraps SWR with shared config.

### Decision 3: Period switching — AbortController + SWR mutate
**Context:** Rapid period switching creates race conditions with in-flight requests.
**Decision:** Each period change calls `mutate()` on all active SWR hooks with the new period key. SWR's built-in deduplication handles the rest — if a new request starts while an old one is in-flight, SWR only applies the latest. Additionally, use AbortController in the fetcher to cancel in-flight requests on period change.
**Impact:** Custom SWR fetcher wraps `fetch()` with AbortController. Period state lives in a URL search param synced via `useSearchParams()`.

### Decision 4: Task completion — Optimistic update with undo window
**Context:** Task checkbox triggers optimistic UI, 3-second undo window, API PATCH, and potential revert on failure.
**Decision:** Use SWR's `optimisticData` + `rollbackOnError` for the initial update. Manage the 3-second undo window with local component state (`completingTaskIds` Map with timestamps). After 3 seconds, fire the actual PATCH. If PATCH fails, rollback via SWR and show error toast.
**Options:**
- A: Fire PATCH immediately, revert on failure — Simpler but undo requires a second PATCH to reopen.
- B: Delay PATCH until undo window expires — UI is optimistic immediately, but API call only fires after 3 seconds. Undo is free (just cancel the pending PATCH). Failure handling is cleaner.
**Decision:** Option B — Delay PATCH until undo window expires.
**Impact:** `useTaskCompletion` custom hook manages: optimistic SWR update → 3-second timer → PATCH on expiry → rollback on failure. Checkbox debounce (500ms) is handled in the hook.

### Decision 5: Auto-refresh — SWR refreshInterval + Page Visibility API
**Context:** Dashboard auto-refreshes every 5 minutes while active. Must pause when tab is hidden, suppress task items in undo window.
**Decision:** SWR's `refreshInterval: 300000` handles the 5-minute cycle. `refreshWhenHidden: false` pauses when tab is hidden. Custom `onSuccess` callback in the tasks SWR hook filters out tasks currently in the undo window (maintained in a `completingTaskIds` ref).
**Impact:** No custom setInterval needed — SWR handles it natively. Page Visibility is handled by SWR's `refreshWhenHidden` option.

### Decision 6: URL state — Tab and period in search params
**Context:** Tab and period must be bookmarkable and support back button navigation.
**Decision:** Use `useSearchParams()` + `useRouter().push()` for tab and period state. Each change pushes to browser history (enables back button between tab states). Invalid params fall back to defaults (`overview` / `month`).
**Impact:** No React state for tab/period — URL is the source of truth. `DashboardPage` reads params server-side for initial render hint, client components read via `useSearchParams()`.

### Decision 7: Role-based tab visibility — Server-side auth check
**Context:** Profitability tab hidden for Estimator and PM roles. Must not be bypassable via URL.
**Decision:** User role comes from the auth session (server-side). Pass `allowedTabs` as a prop from the Server Component page to the client tab bar. API endpoints for profitability data also check role server-side (defense in depth).
**Impact:** `page.tsx` reads session, computes `allowedTabs`, passes to `<DashboardTabs allowedTabs={['overview', 'sales', 'profitability']} />`. Profitability API endpoint returns 403 for unauthorized roles.

### Decision 8: Franchise context — Session-scoped, server-enforced
**Context:** All data is franchise-scoped. FOMs can switch franchises.
**Decision:** `franchise_id` comes from the auth session middleware. Regular users have a fixed franchise. FOMs have a `viewing_franchise_id` session variable set by the portfolio switcher. All API routes read `franchise_id` from session — never from query params. FOM context is detected by comparing `session.user.franchise_id !== session.viewing_franchise_id`.
**Impact:** All API route handlers use `getFranchiseId(session)` helper. Dashboard components receive `isFomContext: boolean` prop to hide My Tasks.

### Decision 9: Timezone — Server returns UTC, client converts
**Context:** All date calculations use franchise timezone. Franchise timezone stored in Settings.
**Decision:** API responses include dates in UTC (ISO 8601). Dashboard client fetches the franchise timezone once (from Settings API or embedded in session) and uses `date-fns-tz` for all display conversions. "Today" is computed client-side in the franchise timezone.
**Impact:** Add `date-fns-tz` dependency. `useFranchiseTimezone()` hook provides timezone string. All date formatting uses `formatInTimeZone()`.

## 3. Data Model

### Entities

| Entity | Key Fields | Source | Notes |
|--------|-----------|--------|-------|
| DashboardOverview | revenue, grossProfit, closeRate, callbackRate, focus items, quickStats | Aggregation API | Computed from Projects, Funnel, Customer Care |
| DashboardSales | pipelineStages[], salesMetrics, estimatorPerformance[] | Aggregation API | Computed from Funnel, Technicians |
| DashboardProfitability | revenueKpi, gpKpi, marginKpi, laborOverage, plSummary, collections | Aggregation API | Computed from Projects, Customers |
| DashboardTask | id, title, type, dueDate, dueTime, isOverdue, recordType, recordId, recordName, status | Tasks API | Filtered: assigned_to=current_user, status=open, due_date<=today |
| FranchiseSettings | timezone, kpiTargets{}, alertThresholds{}, plPercentages{} | Settings API | Cached heavily — changes rarely |

### Data Flow

**On initial load:**
1. Server Component reads session → extracts `franchise_id`, `user_role`, `viewing_franchise_id`
2. Passes `allowedTabs`, `isFomContext`, `franchiseId` to client components
3. Client components mount → SWR fetches fire for the active tab's sections (parallelized)
4. Settings/timezone fetched once and cached (SWR `revalidateOnFocus: false`)

**On period change:**
1. URL search param updated → triggers re-render
2. SWR cache keys change (include period) → new fetches fire
3. Previous period data shown dimmed until new data arrives
4. AbortController cancels any in-flight requests from the previous period

**On tab switch:**
1. URL search param updated → new tab content renders
2. If SWR cache has data for this tab+period, it renders immediately (stale-while-revalidate)
3. If no cache, loading skeletons shown while fetching

**On task completion:**
1. Optimistic update in SWR cache (task marked as completing)
2. 3-second timer starts
3. If user clicks again within 3s → undo (cancel timer, revert optimistic update)
4. After 3s → PATCH /api/tasks/{id} fires
5. On success → task slides out, SWR cache updated
6. On failure → rollback optimistic update, show error toast
7. On 404 → remove task from cache, show info toast

**On auto-refresh (every 5 min):**
1. SWR refetches all active hooks silently (no loading states)
2. Tasks in undo window excluded from refresh update (ref check)
3. If 401/403 → session expired banner shown
4. If other error → silent failure, stale data warning appears after 15 min

### API Shape (Recommended)

```typescript
// GET /api/dashboard/overview?period=month&franchise_id=(from session)
interface OverviewResponse {
  kpis: {
    revenue: KpiData;
    grossProfit: KpiData;
    closeRate: KpiData;
    callbackRate: KpiData;
  };
  focus: {
    qualCallsNeeded: FocusItem;
    estimatesScheduled: FocusItem;
    followUpsDue: FocusItem;
    projectsInProgress: FocusItem;
    casesNeedingAttention: FocusItem;
  };
  quickStats: {
    completedJobs: StatData;
    inPipeline: StatData;
    collected: StatData;
    outstanding: StatData;
  };
}

// GET /api/dashboard/sales?period=month
interface SalesResponse {
  pipeline: PipelineStage[];
  metrics: {
    closeRate: StatData;
    avgEstimateValue: StatData;
    pipelineValue: StatData;
    cancellationRate: StatData;
  };
  estimators: EstimatorPerformance[]; // max 5, sorted by close rate desc
}

// GET /api/dashboard/profitability?period=month
interface ProfitabilityResponse {
  kpis: {
    revenue: KpiData;
    grossProfit: KpiData;
    gpMargin: KpiData;
    laborOverage: KpiData;
  };
  plSummary: PLLine[];
  collections: {
    invoiced: StatData;
    collected: StatData;
    outstanding: StatData;
    avgDaysToPay: StatData;
  };
}

// GET /api/tasks?assigned_to=me&status=open&due_date_lte=today&limit=6&sort=due_date:asc
interface TasksResponse {
  data: DashboardTask[];
  meta: { total: number; hasMore: boolean };
}

// PATCH /api/tasks/{id}
interface TaskUpdateRequest {
  status: 'completed';
}

// Shared types
interface KpiData {
  value: number;
  formattedValue: string;
  trend: { direction: 'up' | 'down' | 'flat' | 'new'; percentage: number | null };
  target: { value: number; achievement: number } | null; // null = no target configured
  alert: boolean; // true if threshold exceeded
}

interface FocusItem {
  count: number;
  detail: string; // e.g., "3 estimators assigned"
  style: 'standard' | 'urgent' | 'warning';
  destinationUrl: string;
}

interface StatData {
  value: number;
  formattedValue: string;
  subtitle: string; // e.g., "vs. last month"
  style: 'standard' | 'success' | 'alert';
  destinationUrl: string;
}

interface PipelineStage {
  name: string;
  count: number;
  trend: { direction: 'up' | 'down' | 'flat'; percentage: number };
  destinationUrl: string;
}

interface EstimatorPerformance {
  id: string;
  name: string;
  avatarColor: string;
  estimateCount: number;
  closeRate: number;
  closeRateStyle: 'success' | 'warning' | 'danger';
  profileUrl: string;
}

interface PLLine {
  label: string;
  amount: number;
  formattedAmount: string;
  style: 'standard' | 'subtotal' | 'total';
}

interface DashboardTask {
  id: string;
  title: string;
  type: 'call' | 'email' | 'todo' | 'followup';
  dueDate: string; // ISO 8601 UTC
  dueTime: string | null;
  isOverdue: boolean;
  daysOverdue: number;
  recordType: string | null;
  recordId: string | null;
  recordName: string | null;
  recordUrl: string | null; // null if record deleted
}
```

## 4. Component Architecture

### File Structure

```
src/
  app/
    dashboard/
      page.tsx                    # Server Component — layout, auth, props
      loading.tsx                 # Next.js loading UI (skeleton page)
  components/
    dashboard/
      DashboardTabs.tsx           # Client — tab bar + URL state
      PeriodSelector.tsx          # Client — period buttons + URL state
      DashboardHeader.tsx         # Client — title, subtitle, refresh, last update
      OverviewTab.tsx             # Client — overview data container
      SalesTab.tsx                # Client — sales data container
      ProfitabilityTab.tsx        # Client — profitability data container
      KpiCard.tsx                 # Client — value + trend + target + progress
      KpiGrid.tsx                 # Client — 4-column responsive grid of KpiCards
      TrendBadge.tsx              # Client — ↑/↓/New indicator
      FocusSection.tsx            # Client — operational focus items + tasks
      FocusItem.tsx               # Client — single focus item row
      TaskList.tsx                # Client — My Tasks container with undo logic
      DashboardTaskItem.tsx       # Client — single task row with checkbox
      TaskCheckbox.tsx            # Client — circular checkbox with animations
      QuickStats.tsx              # Client — 2x2 stat grid
      StatCard.tsx                # Client — single stat card
      FunnelMini.tsx              # Client — horizontal/vertical pipeline
      FunnelStage.tsx             # Client — single stage in funnel
      EstimatorPerformance.tsx    # Client — team rows section
      PLSummary.tsx               # Client — P&L line items
      CollectionsGrid.tsx         # Client — collections stats
      RefreshButton.tsx           # Client — multi-state refresh
      StaleBadge.tsx              # Client — amber dot for stale data
    layout/
      AppSidebar.tsx              # Server — shared sidebar
      MobileNavToggle.tsx         # Client — hamburger button
      SidebarOverlay.tsx          # Client — mobile overlay
    shared/
      AlertBanner.tsx             # Client — error/session-expired banners
      EmptyState.tsx              # Client — message + CTA pattern
      SkeletonCard.tsx            # Client — loading skeleton
      SkeletonRow.tsx             # Client — loading skeleton row
  hooks/
    useDashboardData.ts           # SWR wrapper with shared config
    useTaskCompletion.ts          # Optimistic update + undo + PATCH
    useFranchiseTimezone.ts       # Timezone from settings
    useAutoRefresh.ts             # SWR refreshInterval + visibility
    usePeriod.ts                  # URL param read/write for period
    useActiveTab.ts               # URL param read/write for tab
  lib/
    dashboard-api.ts              # API fetchers with AbortController
    date-utils.ts                 # Timezone-aware date formatting
    cn.ts                         # Conditional class utility (existing)
  types/
    dashboard.ts                  # All TypeScript interfaces above
```

### Rendering Strategy

| Component/Page | Strategy | Rationale |
|---------------|----------|-----------|
| `dashboard/page.tsx` | Server Component | Reads session, computes auth props, renders shell |
| `AppSidebar` | Server Component | Static nav, no client interactivity needed |
| `DashboardTabs` | Client Component | URL state + tab switching |
| `PeriodSelector` | Client Component | URL state + period switching |
| `DashboardHeader` | Client Component | Refresh button state, last update timer |
| `OverviewTab` | Client Component | SWR data fetching, auto-refresh |
| `SalesTab` | Client Component | SWR data fetching |
| `ProfitabilityTab` | Client Component | SWR data fetching |
| `KpiCard` | Client Component | Click handlers, hover states |
| `TaskList` | Client Component | Undo state, optimistic updates |
| `DashboardTaskItem` | Client Component | Checkbox interaction, animations |
| All other dashboard components | Client Component | Interactive, data-dependent |

### State Management

| State | Scope | Mechanism | Notes |
|-------|-------|-----------|-------|
| Active tab | URL | `useSearchParams` | Source of truth in URL |
| Active period | URL | `useSearchParams` | Source of truth in URL |
| Dashboard data (per section) | Component | SWR cache | Keyed by [endpoint, franchise, period] |
| Tasks data | Component | SWR cache | Separate from dashboard sections |
| Completing task IDs | Component | `useRef<Map>` | Map of taskId → timestamp, not in React state to avoid re-renders |
| Refresh button state | Component | `useState` | default/loading/success/error |
| Last update time | Component | `useState` | Updated on successful fetch |
| Session expired | Component | `useState` | Set on 401/403 from any fetch |
| Franchise timezone | SWR | `useFranchiseTimezone` | Fetched once, cached, rarely revalidated |
| User role / FOM context | Props | Server → Client | Passed from page.tsx |

### Shared Components to Reuse

| Component | Location | Usage |
|-----------|----------|-------|
| `AppSidebar` | `src/components/layout/` | Shared across all flows — build once here |
| `Toast` (shadcn) | `src/components/ui/toast` | Success/error/warning/info notifications |
| `Tabs` (shadcn) | `src/components/ui/tabs` | Dashboard tab bar (custom styled) |
| `ToggleGroup` (shadcn) | `src/components/ui/toggle-group` | Period selector |
| `Progress` (shadcn) | `src/components/ui/progress` | KPI progress bars (extend for overflow) |
| `Badge` (shadcn) | `src/components/ui/badge` | Task type badges (extend variants) |
| `Skeleton` (shadcn) | `src/components/ui/skeleton` | Loading states |
| `Tooltip` (shadcn) | `src/components/ui/tooltip` | Stale data, truncated text, KPI empty tooltips |
| `cn()` | `src/lib/utils` | Conditional Tailwind classes |

## 5. Performance Considerations

| Risk | Scenario | Mitigation |
|------|----------|-----------|
| Multiple API calls on load | Overview tab fetches overview + tasks simultaneously | Parallelize with Promise.all in the fetcher, or let SWR handle concurrent requests natively |
| Rapid period switching | 4 clicks in 2 seconds = 4 data fetches per section | AbortController cancels previous request. SWR deduplication. Only latest response applied. |
| Auto-refresh + user interaction | Refresh fires while user is clicking checkboxes | SWR `onSuccess` filters tasks in undo window. No loading states during auto-refresh. |
| Large task list | User has 50+ overdue tasks | API limits to 6 tasks (server-side). Client never receives unbounded list. |
| Large estimator list | Franchise has 10+ estimators | API returns max 5 sorted by close rate. Client never receives unbounded list. |
| Tab content not visible | User on Overview tab — Sales and Profitability data not needed | Only active tab's SWR hooks are mounted. Inactive tabs don't fetch until switched to. SWR cache persists across tab switches. |
| Bundle size | Dashboard-specific components | Dynamic import for `ProfitabilityTab` (only loaded if role has access). KpiCard, FunnelMini are small. |
| Progress bar overflow | >100% visual overflow | CSS `overflow: visible` on progress container. Max visual cap at 150% to prevent extreme layouts. |

## 6. Integration Points

### Upstream Dependencies

| Dependency | Need | Status | Mock Strategy |
|-----------|------|--------|---------------|
| Projects API | Revenue, GP, P&L data | Not built (greenfield) | JSON fixtures with realistic franchise data |
| Funnel API | Pipeline stages, close rate | Not built | JSON fixtures with 5-stage funnel |
| Customer Care API | Callback rate, cases count | Not built | JSON fixtures |
| Tasks API | User's tasks, PATCH completion | Not built | JSON fixtures + MSW for PATCH |
| Technicians API | Estimator performance | Not built | JSON fixtures with 3-5 estimators |
| Customers API | Collections data | Not built | JSON fixtures |
| Settings API | Targets, thresholds, timezone, P&L percentages | Not built | JSON fixtures with defaults |
| Auth/Session | user_id, franchise_id, role, viewing_franchise_id | Not built | Mock session provider |

**Mock strategy:** Use MSW (Mock Service Worker) for development. Create `/src/mocks/dashboard-fixtures.ts` with realistic data for all API responses. This allows full UI development before backend APIs exist.

### Downstream Consumers

| Consumer | Need | Notes |
|----------|------|-------|
| Funnel Flow | Filter URL params (`?filter=qual-call-needed`, `?stage=won`, etc.) | Dashboard links must match Funnel's URL param support |
| Projects Flow | Filter URL params (`?status=completed`, `?view=profitability`) | Dashboard links must match |
| Customer Care Flow | Filter URL params (`?filter=urgent`) | Dashboard links must match |
| Customers Flow | Filter URL params (`?filter=collected`, `?filter=outstanding`) | Dashboard links must match |
| Calendar Flow | View URL param (`?view=day`) | Dashboard links must match |
| Tasks Flow | Filter URL params (`?filter=overdue`, `?filter=due-today`) | Dashboard links must match |

### Cross-Module Filter Dependencies
All destination URLs in the navigation map (PRD §20) depend on destination flows accepting specific URL filter params. **Build as standard `<Link>` components.** If a destination flow hasn't implemented the filter yet, the link still navigates to the base page — acceptable degradation.

## 7. Risk Register

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| Backend APIs not ready | High (greenfield) | Blocks data integration | MSW mocks for all endpoints. Build UI fully against mocks. Swap to real APIs when available. |
| Task completion race conditions | Medium | UX confusion | Debounce, undo window, AbortController, SWR optimistic updates. Well-tested in hooks. |
| Timezone inconsistency | Medium | Wrong "today" calculations | Single `useFranchiseTimezone` hook. All date logic goes through `date-utils.ts`. |
| Cross-module link breakage | High (greenfield) | Broken navigation | Links use standard hrefs. Destination flows may not exist yet. Graceful degradation to base page. |
| Session expiry during use | Low | Stale UI, failed actions | 401/403 detection on all fetchers. Session expired banner. |
| SWR cache staleness | Low | User sees outdated data | 5-min auto-refresh. Stale data badge after 15 min. Manual refresh always available. |

## 8. Cody Squad Guidance

### Cody-UI
Build all visual components from the Design Spec token inventory. Use Tailwind classes mapped to design tokens. Start with `KpiCard`, `StatCard`, `FocusItem`, `DashboardTaskItem` — these are the core building blocks. All components accept data as props (no internal fetching). Ensure every component handles: default, hover, focus, loading (skeleton), empty ("—"), and error states.

### Cody-Logic
Build custom hooks: `useDashboardData`, `useTaskCompletion`, `usePeriod`, `useActiveTab`, `useFranchiseTimezone`. The task completion hook is the most complex — manage undo window with a `Map<string, number>` ref tracking taskId → expiry timestamp. Use `setTimeout` for delayed PATCH, `clearTimeout` on undo. Debounce checkbox with 500ms guard.

### Cody-Integration
Set up SWR provider with shared config: `dedupingInterval: 2000`, `revalidateOnFocus: true`, `refreshWhenHidden: false`. Build API fetchers in `dashboard-api.ts` with AbortController support. Set up MSW mocks for all endpoints. Wire up `PATCH /api/tasks/{id}` with error handling (revert on failure, remove on 404).

### Cody-Resilience
Implement all error states from PRD §14: full failure banner, partial failure per-section, task API failure, session expired. Implement stale data badge (check `lastUpdateTime` against 15-min threshold). Handle invalid URL params (fallback to defaults). Handle race conditions on period switch (AbortController). Test: what happens if two tabs are open and both complete the same task?

### Cody-A11y
Implement ARIA: `role="tablist"/"tab"/"tabpanel"` on dashboard tabs, `aria-selected` state, arrow key navigation. Add `aria-live="polite"` to toast container. Add `aria-label` on KPI cards with formatted value description. Add skip-to-content link. Ensure all focus rings are visible (2px solid `#8BC34A`). Test with screen reader. Heading hierarchy: `<h1>` page title, `<h2>` section titles.

### Cody-Observability
Implement all 14 tracking events from PRD §18. Use a shared `track(event, properties)` utility. Key events to verify: `dashboard_viewed` on load, `dashboard_task_completed` on checkbox, `dashboard_error` on any fetch failure. Include `franchise_id` and `user_role` in all events.

## 9. Testing Guidance for Tess

- **Async data loading:** All dashboard content loads via SWR. Tests must wait for loading states to resolve. Use `waitFor` or `findBy` queries, never `getBy` for data-dependent content.
- **Task completion timing:** The 3-second undo window is real time. Tests may need to use `jest.useFakeTimers()` to advance through the undo window without waiting.
- **Period switching:** Test that rapid period switches don't result in stale data. Verify only the last period's data is displayed.
- **Role-based rendering:** Test with different user roles (FP, Estimator, PM, FOM). Verify Profitability tab is hidden/shown correctly. Verify My Tasks is hidden in FOM context.
- **Error states:** Mock API failures to test all 4 error states (full, partial, task, session expired).
- **URL params:** Test deep linking with `?tab=sales&period=week`. Test invalid params fall back to defaults.
- **Auto-refresh:** Test that SWR refetches after interval. Test that refresh pauses when tab is hidden.
- **Responsive:** Test at all 3 breakpoints. Verify sidebar toggle, KPI grid columns, funnel orientation.
- **Accessibility:** Test keyboard navigation through all tabs, KPI cards, focus items, task checkboxes. Verify ARIA attributes update correctly on tab switch.

## Label & Constant Cross-Reference (PRD ↔ Code)

| PRD Text (§ reference) | Code Constant/Label | File | Status |
|------------------------|-------------------|------|--------|
| "Progress bar caps at 100% fill width" (§8.2) | `PROGRESS_BAR_MAX_VISUAL = 150` | `src/constants/dashboard.ts:42` | ❌ MISMATCH — must change to 100 |
| "overflow-visible" on progress bar container (§8.2) | `overflow-visible` class | `src/components/dashboard/KpiCard.tsx:71` | ❌ MISMATCH — must change to overflow-hidden |
| "5 minutes" auto-refresh (§9.7) | `AUTO_REFRESH_INTERVAL = 300_000` | `src/constants/dashboard.ts:19` | ✅ Match |
| "15 minutes" stale threshold (§16) | `STALE_DATA_THRESHOLD = 900_000` | `src/constants/dashboard.ts:20` | ✅ Match |
| "3 seconds" undo window (§9.5) | `UNDO_WINDOW_MS = 3_000` | `src/constants/dashboard.ts:21` | ✅ Match |
| "500ms" debounce (§9.5) | `CHECKBOX_DEBOUNCE_MS = 500` | `src/constants/dashboard.ts:22` | ✅ Match |
| "2 seconds" success revert (§9.3) | `REFRESH_SUCCESS_REVERT_MS = 2_000` | `src/constants/dashboard.ts:23` | ✅ Match |
| "6 tasks" max display (§8.2) | `MAX_TASKS_DISPLAYED = 6` | `src/constants/dashboard.ts:40` | ✅ Match |
| "5 estimator rows" max (§8.3) | `MAX_ESTIMATORS_DISPLAYED = 5` | `src/constants/dashboard.ts:41` | ✅ Match |

### Toast System Architecture

**Component Structure:**
- `ToastProvider` wraps `RootLayout` children in `src/app/layout.tsx`
- `useToast` hook provides `showToast(type, message)` to any component
- Internal state managed via React Context + useReducer
- Toast container renders via portal at bottom-right of viewport

**Implementation:**
- New file: `src/components/shared/ToastProvider.tsx`
  - ToastContext (React.createContext)
  - ToastProvider (wraps children, manages toast queue)
  - Toast component (renders individual toast with animation)
  - ToastContainer (positioned fixed, bottom-right)
- New file: `src/hooks/useToast.ts`
  - useToast() returns { showToast, dismissToast }
  - showToast(type: 'success' | 'error' | 'warning' | 'info', message: string)

**Integration Points:**
- Task completion error → error toast
- Refresh success → success toast
- Refresh failure → error toast
- Session expiry → warning toast (in addition to banner)
- Role access denied on auto-refresh → info toast
- Period change → info toast "Loading [period] data..."

**Accessibility:**
- Container: aria-live="polite", role="status"
- Each toast: role="status"
- Dismiss button: aria-label="Dismiss notification"

### Integration Wiring Plan (Mock → Hook)

Replace all direct mock imports in components with SWR hook data flows.

| Current Import | File | Replacement |
|---------------|------|-------------|
| `mockOverview` | `DashboardShell.tsx:21-25` | `useDashboardData({ key: 'overview', period, fetcher: fetchOverview })` |
| `mockSales` | `DashboardShell.tsx:21-25` | `useDashboardData({ key: 'sales', period, fetcher: fetchSales })` |
| `mockProfitability` | `DashboardShell.tsx:21-25` | `useDashboardData({ key: 'profitability', period, fetcher: fetchProfitability })` |
| `mockTasks` | `DashboardShell.tsx:21-25` | `useDashboardData({ key: 'tasks', period, fetcher: fetchTasks })` |
| `mockFranchiseTimezone` | `useFranchiseTimezone.ts:3` | `useSWR('/api/franchise/timezone', fetcher)` |
| `mockSession` | `page.tsx:5` | Server-side session from auth middleware (not SWR — server component) |

### Edge Value Handling Strategy

All data transformation must include null guards:
- API responses: `value: number | null`, `formattedValue: string` (em dash for null)
- Components receive typed data with `| null` union
- Null coalescing pattern: `data?.value ?? null`
- Display fallback: `formattedValue || "—"`
- Conditional rendering: hide trend/progress when value is null

### Metric Formula Execution

All metric calculations execute SERVER-SIDE in API routes:
- `/api/dashboard/overview` — Revenue, GP, Close Rate, Callback Rate
- `/api/dashboard/sales` — Close Rate, Avg Estimate, Pipeline Value, Cancellation Rate
- `/api/dashboard/profitability` — Revenue, GP, GP Margin, Labor Overage, Collection Rate, Avg Days to Pay

Division-by-zero is caught server-side. API returns `null` for value and `"—"` for formattedValue.
Client NEVER performs metric calculations — only displays pre-formatted values.
