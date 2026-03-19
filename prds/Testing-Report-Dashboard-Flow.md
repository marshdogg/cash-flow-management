# Testing Report: Dashboard Flow
## Generated from: PRD-Dashboard-Flow.md (Update 5) + Implementation-Brief-Dashboard-Flow.md
## Test Suite: dashboard
## Total Test Scenarios: 128
## Status: 🔴 ALL RED (pre-implementation)

## How to Run Tests

| Command | Description |
|---------|-------------|
| `run_tests` | Run entire suite |
| `run_tests --suite dashboard` | Run dashboard suite |
| `run_tests --flow [name]` | Run specific user flow |
| `run_tests --tag smoke` | Run smoke tests (core happy paths) |
| `run_tests --tag regression` | Run full regression |
| `run_tests --tag a11y` | Run accessibility tests only |
| `run_tests --tag responsive` | Run responsive layout tests only |
| `run_tests --tag edge-case` | Run edge case scenarios only |
| `run_tests --verbose` | Detailed failure output |
| `run_tests --summary` | Pass/fail counts only |

---

## Test Coverage Summary

### Flow 1: Page Load & Layout
**What it validates:** Dashboard loads with correct layout, sidebar, header, tabs, and period selector for the authenticated user.
**Scenarios:** 12 · **Tags:** smoke, regression

| # | Scenario | Expected Behavior | Priority |
|---|----------|-------------------|----------|
| 1.1 | Dashboard loads with default tab and period | Overview tab is active, "This Month" period is selected, header shows "Dashboard" title with current month and franchise name | P0 |
| 1.2 | Sidebar shows all navigation items | All 11 nav items displayed with correct icons, Dashboard item is active (highlighted), Tasks item shows overdue badge count | P0 |
| 1.3 | Header shows last update timestamp | "Last update: [time]" displays near the refresh button, time is in the franchise's timezone | P1 |
| 1.4 | Refresh button shows default state | Button displays "↻ Refresh" with green outline styling | P1 |
| 1.5 | Period selector shows 4 options | "Today", "This Week", "This Month", "YTD" buttons displayed, "This Month" is active (white bg with shadow) | P0 |
| 1.6 | Franchise name in subtitle | Header subtitle shows "[Period] · [Franchise Name]" format | P1 |
| 1.7 | Long franchise name truncated | If franchise name exceeds available width, it truncates with ellipsis; full name shown in tooltip | P2 |
| 1.8 | Loading skeletons shown during data fetch | KPI cards show gray animated skeleton placeholders; focus items show skeleton rows; period selector is disabled | P1 |
| 1.9 | Sidebar Settings link navigates correctly | Clicking Settings navigates to franchise settings page | P2 |
| 1.10 | PaintScout link shows external indicator | PaintScout nav item shows ↗ icon and opens external URL | P2 |
| 1.11 | User info displayed in sidebar footer | User avatar, name, and role shown at bottom of sidebar | P2 |
| 1.12 | Franchise selector shown in sidebar footer | Current franchise name displayed with ability to identify active franchise | P2 |

---

### Flow 2: Tab Switching
**What it validates:** Users can switch between Overview, Sales, and Profitability tabs. Correct content loads for each tab.
**Scenarios:** 10 · **Tags:** smoke, regression

| # | Scenario | Expected Behavior | Priority |
|---|----------|-------------------|----------|
| 2.1 | Click Sales tab | Sales tab becomes active (green underline), Sales content displays (pipeline, metrics, estimator performance), URL updates to ?tab=sales | P0 |
| 2.2 | Click Profitability tab (authorized role) | Profitability tab becomes active, profitability content displays (KPIs, P&L, collections), URL updates to ?tab=profitability | P0 |
| 2.3 | Click Overview tab to return | Overview tab becomes active, overview content displays, URL updates to ?tab=overview | P0 |
| 2.4 | Tab switch preserves period selection | Switch from Overview (This Month) to Sales — Sales tab shows "This Month" data, period selector stays on "This Month" | P1 |
| 2.5 | Deep link with ?tab=sales | Loading page with ?tab=sales in URL opens Sales tab directly | P1 |
| 2.6 | Deep link with ?tab=profitability&period=week | Opens Profitability tab with "This Week" period selected | P1 |
| 2.7 | Invalid ?tab param falls back to overview | Loading ?tab=invalid opens Overview tab, no error shown | P1 |
| 2.8 | Back button navigates between tabs | After switching Overview → Sales → Profitability, pressing back returns to Sales, then Overview | P1 |
| 2.9 | Profitability tab hidden for Estimator role | Logged in as Estimator, only Overview and Sales tabs are rendered (Profitability tab is not visible at all) | P0 |
| 2.10 | Profitability tab hidden for PM role | Logged in as PM, only Overview and Sales tabs are rendered | P0 |

---

### Flow 3: Period Selector
**What it validates:** Period changes update all dashboard data and the header subtitle.
**Scenarios:** 8 · **Tags:** smoke, regression

| # | Scenario | Expected Behavior | Priority |
|---|----------|-------------------|----------|
| 3.1 | Select "Today" period | "Today" button becomes active, header subtitle shows today's date (e.g., "February 28, 2026"), data refreshes for today | P0 |
| 3.2 | Select "This Week" period | "This Week" active, subtitle shows week range (e.g., "Feb 24-28, 2026"), week starts Monday | P0 |
| 3.3 | Select "YTD" period | "YTD" active, subtitle shows "2026 Year to Date" | P1 |
| 3.4 | Deep link with ?period=week | Page loads with "This Week" selected | P1 |
| 3.5 | Invalid ?period param falls back to month | Loading ?period=invalid defaults to "This Month", no error shown | P1 |
| 3.6 | Period change shows loading state | Data sections show loading overlay while fetching new period data | P1 |
| 3.7 | Rapid period switching shows only latest data | Click Today, then immediately Week, then Month — dashboard shows "This Month" data only, no stale data from Today or Week | P1 |
| 3.8 | Period change updates URL | After selecting "Today", URL includes ?period=today | P2 |

---

### Flow 4: Overview Tab — KPI Cards
**What it validates:** Four KPI cards display correct data with targets, trends, and progress bars.
**Scenarios:** 10 · **Tags:** smoke, regression

| # | Scenario | Expected Behavior | Priority |
|---|----------|-------------------|----------|
| 4.1 | Revenue MTD card displays with highlight style | Green gradient background, shows dollar amount, trend arrow, target progress bar, achievement percentage | P0 |
| 4.2 | Callback Rate card shows alert style when over threshold | Red gradient background, red border, percentage displayed in red | P0 |
| 4.3 | KPI card shows trend up indicator | Green ↑ arrow with percentage (e.g., "↑ 12%") positioned top-right | P1 |
| 4.4 | KPI card shows trend down indicator | Red ↓ arrow with percentage (e.g., "↓ 5%") positioned top-right | P1 |
| 4.5 | KPI card with no prior period data shows "↑ New" | When prior period value is $0 and current is positive, trend shows "↑ New" instead of percentage | P2 |
| 4.6 | KPI card with $0 both periods hides trend | When both current and prior period are $0, trend indicator is not displayed | P2 |
| 4.7 | Progress bar overflow when >100% | Revenue exceeds target — progress bar extends visually past the track, label shows actual percentage (e.g., "120%") in green | P1 |
| 4.8 | KPI card with no configured target | Progress bar and target line are hidden; value and trend still display; "Set target →" link shown for FP/Admin roles | P1 |
| 4.9 | Clicking Revenue KPI card navigates to Projects | Click Revenue MTD card → navigates to projects list filtered by completed status | P0 |
| 4.10 | Clicking Callback Rate KPI navigates to Customer Care | Click Callback Rate card → navigates to customer care kanban | P1 |

---

### Flow 5: Overview Tab — Today's Focus
**What it validates:** Operational focus items and task list display correctly with proper styling and navigation.
**Scenarios:** 12 · **Tags:** smoke, regression

| # | Scenario | Expected Behavior | Priority |
|---|----------|-------------------|----------|
| 5.1 | Focus section shows operational items | All 5 focus items displayed: Qualification Call Needed, Estimates Scheduled, Follow-ups Due, Projects In Progress, Cases Needing Attention | P0 |
| 5.2 | Urgent items show red styling | Qualification Call Needed (when count > 0) and Cases Needing Attention (when SLA at risk) show red background and border | P1 |
| 5.3 | Warning items show amber styling | Follow-ups Due shows amber styling when count > 3 | P1 |
| 5.4 | Clicking focus item navigates to correct page | Click "Estimates Scheduled" → navigates to calendar day view | P0 |
| 5.5 | My Tasks section shows overdue and due-today tasks | Tasks displayed below operational focus with "☑️ My Tasks" divider, ordered: overdue first (oldest), then due today (earliest time) | P0 |
| 5.6 | Task item shows correct elements | Each task shows: checkbox, type icon, title, type badge, due label, record link (if linked) | P0 |
| 5.7 | Overdue task has red left border | Task that is past due date shows 3px red left border and red "X days overdue" label | P1 |
| 5.8 | Due today task has amber left border | Task due today shows 3px amber left border and amber "Due today · [time]" label | P1 |
| 5.9 | Maximum 6 tasks displayed | When user has more than 6 overdue/due-today tasks, only 6 show with "View all X tasks →" link | P1 |
| 5.10 | "All Tasks →" link navigates to tasks list | Click "All Tasks →" in section header → navigates to tasks list page | P1 |
| 5.11 | Task title truncates at 2 lines | Long task title truncates with ellipsis after 2 lines; full title shown on hover | P2 |
| 5.12 | Task with deleted record shows plain text | If task's linked record was deleted, record name displays as plain text (not a clickable link) | P2 |

---

### Flow 6: Task Completion
**What it validates:** Users can complete tasks via checkbox with optimistic UI, undo window, and proper API integration.
**Scenarios:** 10 · **Tags:** smoke, regression, edge-case

| # | Scenario | Expected Behavior | Priority |
|---|----------|-------------------|----------|
| 6.1 | Click checkbox completes task | Checkbox fills green with checkmark, title shows strikethrough, row dims to 0.5 opacity | P0 |
| 6.2 | Task slides out after 3 seconds | After the 3-second undo window, the completed task slides out of the list with animation | P0 |
| 6.3 | Undo within 3 seconds | Click checkbox to complete, then click again within 3 seconds — task reverts to original state (unchecked, no strikethrough) | P0 |
| 6.4 | Checkbox click does not navigate | Clicking the checkbox does not navigate away from the dashboard (event.stopPropagation) | P1 |
| 6.5 | Double-click is debounced | Rapidly clicking checkbox twice results in only one state change (complete), not complete→undo | P1 |
| 6.6 | API failure within undo window reverts checkbox | If the completion API fails during the 3-second window, checkbox auto-reverts to unchecked with error toast | P0 |
| 6.7 | API failure after slide-out shows error toast | If API fails after task has slid out, error toast appears: "Unable to complete task" | P1 |
| 6.8 | Task deleted by another user (404) | Completing a task that was deleted returns 404 — task removed from list with info toast: "This task is no longer available" | P1 |
| 6.9 | Completed task not replaced immediately | After a task slides out, no new task slides in to replace it. List updates on next refresh. | P2 |
| 6.10 | Keyboard: Space toggles checkbox | Focusing a task checkbox and pressing Space toggles the completion state | P1 |

---

### Flow 7: Overview Tab — Quick Stats
**What it validates:** Quick Stats 2×2 grid shows correct data with proper styling and navigation.
**Scenarios:** 4 · **Tags:** regression

| # | Scenario | Expected Behavior | Priority |
|---|----------|-------------------|----------|
| 7.1 | Four stat cards displayed | Completed Jobs (green), In Pipeline (standard), Collected (standard), Outstanding (red) — each with value and subtitle | P1 |
| 7.2 | Click Completed Jobs navigates to projects | Navigates to projects list filtered by completed | P1 |
| 7.3 | Click Outstanding navigates to customers | Navigates to customers list filtered by outstanding | P1 |
| 7.4 | Click In Pipeline navigates to funnel | Navigates to funnel view | P2 |

---

### Flow 8: Sales Tab
**What it validates:** Sales pipeline funnel, metrics, and estimator performance display correctly.
**Scenarios:** 8 · **Tags:** smoke, regression

| # | Scenario | Expected Behavior | Priority |
|---|----------|-------------------|----------|
| 8.1 | Sales pipeline shows 5 stages | New Deals, Scheduled, Sent, Won, Booked — each with count and trend indicator, arrow connectors between stages | P0 |
| 8.2 | Click funnel stage navigates to filtered funnel | Click "Won" stage → navigates to funnel filtered by stage=won | P1 |
| 8.3 | Sales metrics show 4 cards | Close Rate, Avg Estimate Value, Pipeline Value, Cancellation Rate in 2×2 grid | P1 |
| 8.4 | Estimator Performance shows team rows | Each row shows avatar, name, estimate count, close rate (color-coded), sorted by close rate descending | P0 |
| 8.5 | Max 5 estimator rows displayed | When franchise has > 5 estimators, only top 5 shown with "View All X Estimators →" link | P1 |
| 8.6 | Click estimator row navigates to profile | Clicking a row navigates to that estimator's profile page | P1 |
| 8.7 | "View Funnel →" link navigates correctly | Click section header link → navigates to funnel page | P2 |
| 8.8 | Estimator name truncated at 24 chars | Long estimator name shows ellipsis after 24 characters | P2 |

---

### Flow 9: Profitability Tab
**What it validates:** Profitability KPIs, P&L summary, and collections display correctly.
**Scenarios:** 6 · **Tags:** regression

| # | Scenario | Expected Behavior | Priority |
|---|----------|-------------------|----------|
| 9.1 | Four profitability KPI cards displayed | Revenue (highlight), Gross Profit, GP Margin, Labor Overage (alert if high) | P0 |
| 9.2 | P&L Summary shows all line items | Total Revenue, Labor Costs, Materials, Sundry (%), Gross Profit (bold), Royalties (%), Adjusted GP (bold) | P0 |
| 9.3 | P&L percentages from franchise settings | Sundry and Royalties labels show franchise-configured percentages (not hardcoded 2%/11%) | P1 |
| 9.4 | Collections grid shows 4 metrics | Invoiced, Collected (green), Outstanding (red), Avg Days to Pay | P1 |
| 9.5 | Click Outstanding navigates to customers | Navigates to customers list filtered by outstanding | P1 |
| 9.6 | "View Details →" link navigates to projects profitability | Click section header link → navigates to projects profitability view | P2 |

---

### Flow 10: Refresh & Auto-Refresh
**What it validates:** Manual refresh and auto-refresh work correctly with proper state transitions.
**Scenarios:** 8 · **Tags:** regression

| # | Scenario | Expected Behavior | Priority |
|---|----------|-------------------|----------|
| 10.1 | Click Refresh button | Button shows spinner + "Refreshing..." (disabled), then "✓ Updated" (green) for 2 seconds, then returns to default. Timestamp updates. | P0 |
| 10.2 | Refresh failure shows error state | On API error, button shows "⚠ Failed · Retry" (red outline), stays until clicked again | P1 |
| 10.3 | Toast on successful refresh | Success toast notification appears after refresh completes | P1 |
| 10.4 | Auto-refresh fires every 5 minutes | After 5 minutes, data silently refreshes. No loading indicators shown. Timestamp updates. | P1 |
| 10.5 | Auto-refresh pauses when tab hidden | Switch to another browser tab for > 5 minutes, return — refresh fires immediately on return | P2 |
| 10.6 | Auto-refresh suppresses tasks in undo window | If a task is in the 3-second undo window when auto-refresh fires, that task's state is not overwritten | P1 |
| 10.7 | Stale data badge appears after 15 minutes | If last update is > 15 minutes ago, amber dot badge appears next to timestamp with tooltip | P1 |
| 10.8 | Keyboard: Enter/Space triggers refresh | Focusing refresh button and pressing Enter or Space triggers refresh | P2 |

---

### Flow 11: FOM Context
**What it validates:** Operations users viewing another franchise's dashboard see correct read-only view.
**Scenarios:** 4 · **Tags:** regression, edge-case

| # | Scenario | Expected Behavior | Priority |
|---|----------|-------------------|----------|
| 11.1 | FOM views franchise dashboard | All KPIs, focus items, and stats display for the selected franchise | P0 |
| 11.2 | My Tasks hidden in FOM context | When FOM is viewing another franchise, the "☑️ My Tasks" section is not displayed | P0 |
| 11.3 | Operational focus items visible to FOM | Focus items (qual calls, estimates, follow-ups, projects, cases) still display as read-only | P1 |
| 11.4 | FOM sees all three tabs (including Profitability) | Operations role has access to Overview, Sales, and Profitability tabs | P1 |

---

## Edge Cases & Error States

| # | Scenario | Trigger Condition | Expected Behavior |
|---|----------|-------------------|-------------------|
| E1 | Full API failure | All dashboard API endpoints return 500 | Error banner: "Unable to load dashboard data" with Retry button. Previous data (if any) dimmed. |
| E2 | Partial API failure | Tasks API fails but others succeed | My Tasks shows "Unable to load tasks" with Retry link. All other sections display normally. |
| E3 | Section-level failure | Estimator performance endpoint fails | Estimator section shows inline error. Other Sales tab sections display normally. |
| E4 | Session expired | Auto-refresh returns 401 | Banner: "Your session has expired. Please refresh the page to continue." All controls non-functional. |
| E5 | Empty overview — no data for period | New franchise, "Today" selected, no activity | KPIs show "—", focus shows "Nothing scheduled for today" with "View Calendar →", tasks show "No tasks due today" |
| E6 | Empty sales — no pipeline | No deals exist for the period | Pipeline shows "No pipeline activity this period" with "View Funnel →", metrics show "—" |
| E7 | Empty profitability — no jobs | No completed jobs for the period | KPIs show "—", P&L shows "No completed jobs this period" with "View Projects →" |
| E8 | Empty estimators | Franchise has no estimators | "No estimates completed this period" with "View Technicians →" CTA |
| E9 | First-time user | New franchise, no historical data | Welcome message "Welcome to your Dashboard", onboarding checklist, KPIs show "—" with explanatory tooltips |
| E10 | Profitability tab URL for Estimator | Estimator navigates to ?tab=profitability | Silently redirected to Overview tab. No error shown. |
| E11 | Negative KPI value | Revenue is negative (refunds exceed income) | Value displayed in red with parentheses: "($1,234)" |
| E12 | Task linked to deleted record | Task record_name exists but recordUrl is null | Record name shown as plain text, no link behavior |

---

## Responsive Breakpoints

| Breakpoint | Width | Key Behavioral Changes |
|------------|-------|------------------------|
| Desktop | >1024px | Full sidebar visible (240px), 4-column KPI grid, 2-column dashboard grid, task items full width |
| Tablet | 768–1024px | Sidebar hidden (hamburger menu), 2-column KPI grid, single-column dashboard grid, task items unchanged |
| Mobile | <768px | Sidebar hidden (hamburger menu), single-column KPI grid, single-column grid, period selector full-width, funnel vertical, task meta wraps |

### Responsive Test Scenarios (6)

| # | Scenario | Expected Behavior | Priority |
|---|----------|-------------------|----------|
| R1 | Mobile: sidebar toggle | Hamburger button visible top-left, tapping opens sidebar sliding from left with overlay | P0 |
| R2 | Mobile: close sidebar on navigation | Clicking a nav item closes the sidebar and navigates | P1 |
| R3 | Mobile: KPI grid single column | KPI cards stack vertically in single column | P1 |
| R4 | Mobile: funnel vertical layout | Pipeline stages stack vertically with ↓ arrows instead of → | P1 |
| R5 | Tablet: 2-column KPI grid | KPI cards display in 2×2 grid | P2 |
| R6 | Mobile: touch target minimum 44px | All interactive elements (buttons, checkboxes, cards, links) have minimum 44×44px tap area | P1 |

---

## Accessibility Test Scenarios (10)

| # | Scenario | Expected Behavior | Priority |
|---|----------|-------------------|----------|
| A1 | Tab navigation with arrow keys | Left/Right arrow keys navigate between dashboard tabs | P0 |
| A2 | Enter/Space activates focused tab | Pressing Enter or Space on a focused tab switches to it | P0 |
| A3 | KPI cards keyboard accessible | Tab key focuses KPI cards, Enter/Space navigates to destination | P1 |
| A4 | Focus ring visible on all interactive elements | 2px solid green outline visible when any interactive element is focused via keyboard | P1 |
| A5 | ARIA roles on tabs | Tab bar has role="tablist", tabs have role="tab" with aria-selected, panels have role="tabpanel" | P1 |
| A6 | Screen reader: KPI card labels | KPI cards have descriptive aria-label (e.g., "Revenue MTD: $148,240, 99% of target") | P1 |
| A7 | Screen reader: toast announcements | Toast container has aria-live="polite" — new toasts are announced | P2 |
| A8 | Skip to main content link | First focusable element is a "Skip to main content" link, visible on focus | P2 |
| A9 | Heading hierarchy | Page has h1 for title, h2 for section titles — proper heading hierarchy | P2 |
| A10 | Task checkbox keyboard accessible | Tab focuses checkbox, Space toggles completion | P1 |

---

## Acceptance Criteria Traceability

| PRD Section | Criterion | Test Scenario(s) |
|-------------|-----------|-------------------|
| §6.1 | Page title "Dashboard" | Flow 1, #1.1 |
| §6.1 | Subtitle with period and franchise | Flow 1, #1.6, #1.7 |
| §6.1 | Last update timestamp | Flow 1, #1.3 |
| §6.1 | Refresh button | Flow 10, #10.1, #10.2 |
| §6.1 | Three dashboard tabs | Flow 2, #2.1–2.3 |
| §6.1 | Tab visibility by role | Flow 2, #2.9, #2.10 |
| §6.1 | Period selector with 4 options | Flow 3, #3.1–3.3 |
| §6.2 | Top KPIs (4 cards) | Flow 4, #4.1–4.10 |
| §6.2 | KPI trend indicators | Flow 4, #4.3–4.6 |
| §6.2 | KPI progress bar with overflow | Flow 4, #4.7 |
| §6.2 | KPI no target fallback | Flow 4, #4.8 |
| §6.2 | Today's Focus operational items | Flow 5, #5.1–5.4 |
| §6.2 | My Tasks sub-section | Flow 5, #5.5–5.12 |
| §6.2 | Task checkbox behavior | Flow 6, #6.1–6.10 |
| §6.2 | FOM: My Tasks hidden | Flow 11, #11.2 |
| §6.2 | Quick Stats section | Flow 7, #7.1–7.4 |
| §6.3 | Sales Pipeline | Flow 8, #8.1–8.2, #8.7 |
| §6.3 | Sales Metrics | Flow 8, #8.3 |
| §6.3 | Estimator Performance | Flow 8, #8.4–8.6, #8.8 |
| §6.3 | Max 5 estimators | Flow 8, #8.5 |
| §6.4 | Profitability KPIs | Flow 9, #9.1 |
| §6.4 | P&L Summary | Flow 9, #9.2–9.3 |
| §6.4 | Collections grid | Flow 9, #9.4–9.5 |
| §7.1 | Tab switching + URL update | Flow 2, #2.1–2.8 |
| §7.1 | Back button between tabs | Flow 2, #2.8 |
| §7.2 | Period switching + URL update | Flow 3, #3.1–3.8 |
| §7.2 | Week starts Monday | Flow 3, #3.2 |
| §7.2 | Rapid period switching | Flow 3, #3.7 |
| §7.3 | Refresh button states | Flow 10, #10.1–10.3 |
| §7.5 | Task completion optimistic UI | Flow 6, #6.1–6.3 |
| §7.5 | Task checkbox debounce | Flow 6, #6.5 |
| §7.5 | Task API failure revert | Flow 6, #6.6–6.8 |
| §7.6 | Mobile sidebar toggle | R1, R2 |
| §7.7 | Auto-refresh every 5 min | Flow 10, #10.4–10.6 |
| §7.7 | Auto-refresh pause on hidden tab | Flow 10, #10.5 |
| §7.7 | Session expired on auto-refresh | E4 |
| §9 | Desktop layout | R5 (implied by all desktop tests) |
| §9 | Tablet layout | R5 |
| §9 | Mobile layout | R1, R3, R4, R6 |
| §11 | Keyboard accessibility | A1–A5, A8–A10 |
| §12 | Loading skeletons | Flow 1, #1.8 |
| §12 | Section loading overlay | Flow 3, #3.6 |
| §13 | Empty states per section | E5–E9 |
| §14 | Full API failure | E1 |
| §14 | Partial failure | E2, E3 |
| §14 | Session expired | E4 |
| §14 | Stale data warning | Flow 10, #10.7 |
| §15 | URL params deep link | Flow 2, #2.5–2.7; Flow 3, #3.4–3.5 |
| §15 | Invalid URL params fallback | Flow 2, #2.7; Flow 3, #3.5; E10 |
| §18 | Tracking events | Covered implicitly — tracking events fire for all user actions tested above |
| §6.2 | KPI null/negative value handling | TC-112, TC-113 |
| §6.2 | Progress bar edge values | TC-114, TC-115, TC-126, TC-127, TC-128 |
| §6.3 | Close Rate division by zero | TC-099 |
| §6.3 | Funnel stage null count | TC-116 |
| §6.3 | Estimator 0% close rate | TC-118 |
| §6.4 | GP Margin division by zero | TC-101 |
| §6.4 | Collection Rate division by zero | TC-102 |
| §6.4 | Avg Days to Pay division by zero | TC-103 |
| §6.4 | P&L null amount | TC-117 |
| §6.2–6.4 | Cross-tab metric consistency | TC-100, TC-104 |
| §7 | Estimator Profitability tab removed from DOM | TC-105 |
| §7 | PM Profitability tab removed from DOM | TC-106 |
| §7 | FOM My Tasks hidden | TC-107 |
| §7 | FOM task checkboxes hidden | TC-108 |
| §7 | "Set target" link role gating | TC-109 |
| §7, §15 | Unauthorized deep link redirect | TC-110 |
| §7 | Mid-session role change handling | TC-111 |
| §14 | Toast rendering and positioning | TC-119 |
| §14 | Toast auto-dismiss timing | TC-120 |
| §14 | Toast manual dismiss | TC-121 |
| §14 | Toast stacking | TC-122 |
| §14, §11 | Toast accessibility | TC-123 |
| §14 | Error toast on task failure | TC-124 |
| §14 | Error toast on refresh failure | TC-125 |

---

## V2 Rebuild — New Test Scenarios

### Metric Definitions (§6)
**What it validates:** Metric formulas handle division-by-zero, null denominators, and cross-tab consistency.
**Scenarios:** 6 · **Tags:** regression, edge-case

| # | ID | Title | PRD Ref | Priority | Type | Steps | Expected Result | Edge Case Ref |
|---|-----|-------|---------|----------|------|-------|-----------------|---------------|
| 1 | TC-099 | Close Rate "—" when denominator is 0 | §6.3 | P0 | unit | 1. Set estimates_presented = 0 for the period. 2. Render Close Rate metric card. | Close Rate displays "—" instead of NaN, Infinity, or 0%. Tooltip reads "No estimates presented this period." | Division by zero |
| 2 | TC-100 | Revenue MTD formula matches SUM of completed projects | §6.2, §6.4 | P0 | integration | 1. Seed 5 completed projects with known revenue values. 2. Load Overview tab. 3. Load Profitability tab. | Revenue MTD value on Overview equals SUM of all completed-project revenues. Profitability Revenue matches. | — |
| 3 | TC-101 | GP Margin "—" when Revenue is $0 | §6.4 | P1 | unit | 1. Set total revenue = $0 for the period. 2. Render GP Margin metric card. | GP Margin displays "—" instead of NaN or Infinity. Tooltip reads "No revenue this period." | Division by zero |
| 4 | TC-102 | Collection Rate "—" when no invoices exist | §6.4 | P1 | unit | 1. Set invoiced amount = $0 (no invoices). 2. Render Collection Rate metric. | Collection Rate displays "—". Tooltip reads "No invoices this period." | Division by zero |
| 5 | TC-103 | Avg Days to Pay "—" when no paid invoices | §6.4 | P1 | unit | 1. Set paid invoices count = 0. 2. Render Avg Days to Pay metric. | Avg Days to Pay displays "—". Tooltip reads "No paid invoices this period." | Division by zero |
| 6 | TC-104 | All 8 metric formulas consistent across tabs | §6.2, §6.3, §6.4 | P0 | integration | 1. Seed known dataset. 2. Load Overview tab, capture KPI values. 3. Switch to Sales tab, capture metrics. 4. Switch to Profitability tab, capture metrics. | Revenue, Close Rate, GP Margin, and shared metrics display identical values on every tab where they appear. | Cross-tab consistency |

---

### Role-Based Access (§7)
**What it validates:** Tab visibility, DOM removal, FOM context restrictions, and mid-session role enforcement.
**Scenarios:** 7 · **Tags:** smoke, regression, edge-case

| # | ID | Title | PRD Ref | Priority | Type | Steps | Expected Result | Edge Case Ref |
|---|-----|-------|---------|----------|------|-------|-----------------|---------------|
| 1 | TC-105 | Estimator cannot see Profitability tab | §7, §6.1 | P0 | e2e | 1. Log in as Estimator role. 2. Navigate to Dashboard. 3. Inspect DOM for Profitability tab element. | Profitability tab is not rendered in the DOM (not just hidden via CSS). Only Overview and Sales tabs exist. | — |
| 2 | TC-106 | PM cannot see Profitability tab | §7, §6.1 | P0 | e2e | 1. Log in as PM role. 2. Navigate to Dashboard. 3. Inspect DOM for Profitability tab element. | Profitability tab is not rendered in the DOM. Only Overview and Sales tabs exist. | — |
| 3 | TC-107 | FOM viewing franchise — My Tasks hidden | §7, §6.2 | P0 | e2e | 1. Log in as FOM. 2. Select a franchise to view. 3. Navigate to Dashboard Overview tab. | "My Tasks" section is not rendered. Operational focus items remain visible. | FOM context |
| 4 | TC-108 | FOM viewing franchise — task checkboxes hidden | §7, §6.2 | P1 | e2e | 1. Log in as FOM. 2. Select a franchise to view. 3. Navigate to Dashboard Overview tab. | No task checkboxes are rendered anywhere on the page. Focus items are read-only (no interactive controls). | FOM context |
| 5 | TC-109 | "Set target" link visible only to FP and Admin | §7, §6.2 | P1 | e2e | 1. Log in as Estimator — check KPI card with no target. 2. Log in as FP — check same KPI card. 3. Log in as Admin — check same KPI card. | "Set target →" link is hidden for Estimator and PM. Visible for FP and Admin roles. | Role-gated UI element |
| 6 | TC-110 | URL ?tab=profitability redirects Estimator to Overview | §7, §15 | P0 | e2e | 1. Log in as Estimator. 2. Navigate directly to /dashboard?tab=profitability. | Page loads with Overview tab active. URL updates to ?tab=overview. No error message displayed. | Unauthorized deep link |
| 7 | TC-111 | Role transition mid-session: 403 on auto-refresh | §7 | P1 | integration | 1. Log in as FP (Profitability visible). 2. Admin downgrades user to Estimator mid-session. 3. Auto-refresh fires and returns 403 for profitability data. | User is redirected to Overview tab. Info toast displays: "Your access has been updated." Profitability tab removed from DOM. | Mid-session role change |

---

### Edge Value Behaviors
**What it validates:** KPI cards, progress bars, funnel stages, and P&L rows handle null, negative, zero, and overflow values gracefully.
**Scenarios:** 7 · **Tags:** regression, edge-case

| # | ID | Title | PRD Ref | Priority | Type | Steps | Expected Result | Edge Case Ref |
|---|-----|-------|---------|----------|------|-------|-----------------|---------------|
| 1 | TC-112 | KPI card "—" when value is null | §6.2, §13 | P0 | unit | 1. Set KPI value = null. 2. Render KPI card component. | Card displays "—" as the primary value. Trend indicator and progress bar are hidden. "Set target →" link still renders for FP/Admin if target is also missing. | Null value |
| 2 | TC-113 | KPI card negative value in red with parentheses | §6.2 | P1 | unit | 1. Set Revenue MTD = -1234. 2. Render KPI card component. | Value displays as "($1,234)" in red text. Trend arrow still computes based on prior period comparison. | Negative value |
| 3 | TC-114 | Progress bar caps at 100% width when achievement is 125% | §6.2 | P1 | unit | 1. Set target = $100,000, current = $125,000. 2. Render KPI card with progress bar. | Progress bar fill width is capped at 100% of the track. Label displays "125%" in green text. Bar does not overflow its container. | Overflow >100% |
| 4 | TC-115 | Progress bar 0% when achievement is 0 | §6.2, §13 | P1 | unit | 1. Set target = $100,000, current = $0. 2. Render KPI card with progress bar. | Progress bar shows an empty track (0% fill). Label displays "0%". Track background is visible. | Zero achievement |
| 5 | TC-116 | Funnel stage "—" when count is null | §6.3 | P1 | unit | 1. Set pipeline stage count = null. 2. Render funnel stage component. | Stage displays "—" instead of 0 or blank. Trend indicator is hidden. Stage is still clickable for navigation. | Null count |
| 6 | TC-117 | P&L row "—" for null amount | §6.4 | P1 | unit | 1. Set P&L line item amount = null. 2. Render P&L summary row. | Row displays "—" in the amount column. Percentage column (if applicable) also displays "—". Row is not hidden. | Null amount |
| 7 | TC-118 | Estimator close rate 0% in danger red | §6.3 | P2 | unit | 1. Set estimator close_rate = 0. 2. Render estimator performance row. | Close rate displays "0%" styled in danger red (same style as rates below threshold). Row is still clickable for navigation. | Zero rate |

---

### Toast Notifications
**What it validates:** ToastProvider integration, auto-dismiss timing, manual dismiss, stacking, accessibility, and error-triggered toasts.
**Scenarios:** 7 · **Tags:** regression, a11y

| # | ID | Title | PRD Ref | Priority | Type | Steps | Expected Result | Edge Case Ref |
|---|-----|-------|---------|----------|------|-------|-----------------|---------------|
| 1 | TC-119 | ToastProvider renders and toasts appear bottom-right | §14 | P0 | integration | 1. Trigger a toast notification (e.g., successful refresh). 2. Observe toast position. | Toast renders inside ToastProvider container. Toast appears fixed to bottom-right of viewport with 16px margin from edges. | — |
| 2 | TC-120 | Toast auto-dismisses after 4 seconds | §14 | P1 | unit | 1. Trigger a toast. 2. Wait 4 seconds without interacting. | Toast fades out and is removed from DOM after 4 seconds. No residual elements remain. | Timing |
| 3 | TC-121 | Toast manual dismiss via close button | §14 | P1 | unit | 1. Trigger a toast. 2. Click the × (close) button on the toast before 4 seconds. | Toast immediately fades out and is removed from DOM. Auto-dismiss timer is cleared. | — |
| 4 | TC-122 | Multiple toasts stack vertically | §14 | P1 | integration | 1. Trigger 3 toasts in rapid succession. 2. Observe layout. | Toasts stack vertically with 8px gap between them. Newest toast appears at the bottom. Older toasts shift up. Each has an independent dismiss timer. | Multiple toasts |
| 5 | TC-123 | Toast accessibility: aria-live and role | §14, §11 | P1 | unit | 1. Render ToastProvider. 2. Trigger a toast. 3. Inspect DOM attributes. | Toast container has aria-live="polite". Each toast has role="status". Screen reader announces toast content when it appears. | a11y |
| 6 | TC-124 | Task completion error triggers error toast | §14, §7.5 | P0 | integration | 1. Click task checkbox. 2. Mock API to return 500. 3. Wait for undo window to expire. | Error toast appears with message "Unable to complete task". Toast has error styling (red accent). Task reverts to unchecked state. | API failure |
| 7 | TC-125 | Refresh failure triggers error toast | §14, §7.3 | P1 | integration | 1. Click Refresh button. 2. Mock API to return 500. | Error toast appears with message "Unable to refresh dashboard data". Refresh button shows "⚠ Failed · Retry" state. | API failure |

---

### Progress Bar Specific
**What it validates:** Progress bar constants, overflow containment, and 100% fill boundary.
**Scenarios:** 3 · **Tags:** regression, edge-case

| # | ID | Title | PRD Ref | Priority | Type | Steps | Expected Result | Edge Case Ref |
|---|-----|-------|---------|----------|------|-------|-----------------|---------------|
| 1 | TC-126 | PROGRESS_BAR_MAX_VISUAL constant equals 100 | §6.2 | P1 | unit | 1. Import PROGRESS_BAR_MAX_VISUAL from constants. 2. Assert value. | PROGRESS_BAR_MAX_VISUAL === 100. Progress bar width calculation uses Math.min(percentage, PROGRESS_BAR_MAX_VISUAL). | Constant validation |
| 2 | TC-127 | Progress bar container has overflow-hidden | §6.2 | P1 | unit | 1. Render KPI card with progress bar. 2. Inspect progress bar container CSS. | Container element has overflow: hidden (not overflow: visible). Fill element cannot render outside container bounds. | CSS containment |
| 3 | TC-128 | Progress bar at exactly 100% fills track completely | §6.2 | P1 | unit | 1. Set target = $100,000, current = $100,000. 2. Render KPI card with progress bar. | Progress bar fill width is exactly 100% of track. No gap between fill and track edge. Label displays "100%" in green. | Boundary: exact 100% |

---

## Notes for the Coding Agent

- All 128 tests are currently RED. Your job is to make them GREEN.
- Run `run_tests --summary` frequently during development.
- When a test fails, the error message describes what SHOULD happen — cross-reference the PRD.
- Do NOT access or read test files. CLI commands only.
- Max 3 retries per failing test before escalating.
- **Start with smoke tests** (`run_tests --tag smoke`) — these cover the critical happy paths.
- **Async data:** All dashboard content loads asynchronously. Tests will wait for loading to complete. If your component never exits loading state, the test will timeout with a descriptive message.
- **Task completion timing:** Tests involving the 3-second undo window use controlled timing. Ensure your undo window is exactly 3 seconds (not approximate).
- **Role-based tests:** Tests run with different user sessions. Ensure your role-based tab visibility reads from the auth context, not hardcoded values.
- **Mock APIs:** Tests use mock API responses. Ensure your components handle the response shapes defined in the Implementation Brief.
