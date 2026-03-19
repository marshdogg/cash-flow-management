# PRD — Cash Flow Guide

| Field | Value |
|-------|-------|
| **Author** | Paul (PRD Agent V3) |
| **Version** | 1.0 |
| **Date** | 2026-03-01 |
| **Status** | Draft |
| **Classification** | Greenfield · Major |

---

## §1 Brief Initiative Description

Franchise Partners lack real-time visibility into their cash position. They track bank balances in spreadsheets, forget to account for recurring obligations, and cannot answer the question "How many weeks can I operate before running out of cash?" The Cash Flow Guide is a standalone financial check-in tool that gives Franchise Partners a weekly ritual to update their bank balance, review recurring transactions, and instantly see their true cash position, health status, and 13-week projection — all without connecting to a bank.

---

## §2 Short Description

The Cash Flow Guide provides Franchise Partners with a Dashboard showing True Cash Position, Health Gauge, and Projection Chart; a weekly Ritual Wizard to update balances and review transactions; a Recurring Transactions manager for fixed income/expenses; and a compact Widget for at-a-glance status. Franchise Operations Managers get read-only access across their assigned franchises.

---

## §3 Associated HTML Files

| File | Status | Description |
|------|--------|-------------|
| (none) | — | Greenfield app; no pre-existing mockups |

---

## §4 Description & Business Impact

### Why This Matters

Franchise Partners are business owners managing painting operations with variable revenue and fixed costs. Cash flow surprises — unexpected shortfalls, missed payroll timing, or inability to fund materials — are the #1 operational risk for franchises in their first 3 years. Currently, FPs rely on bank account checks and mental math, leading to reactive rather than proactive cash management.

### Context

This is a standalone application, not part of the WOW OS core dashboard. It introduces a **weekly ritual** concept — a guided 5-step check-in that takes 5-10 minutes every Monday. The ritual encourages financial discipline without requiring bank API integrations, accounting software, or CPA-level knowledge.

### Business Taxonomy

- **Category:** Financial Operations
- **Module:** Cash Flow Guide (standalone)
- **Complexity:** Major (3 pages + widget, 2 roles, wizard, CRUD, calculations)

### Expected Outcomes

1. Franchise Partners know their True Cash Position within 24 hours of their last ritual
2. FPs can answer "How many weeks of runway do I have?" instantly
3. FOMs can identify financially at-risk franchises from their portfolio view
4. Reduction in cash-related emergency escalations to corporate

### Affected Personas

| Persona | Impact |
|---------|--------|
| Franchise Partner (FP) | **Primary user.** Full CRUD access to own franchise data. Performs weekly ritual. |
| Franchise Operations Manager (FOM) | **Secondary user.** Read-only access across assigned franchises with franchise picker. Coaches FPs on cash health. |

---

## §5 Jobs To Be Done

### Franchise Partner (FP)

1. **When** I start my week, **I want to** update my bank balance and review upcoming transactions, **so that** I know my true cash position and can make informed spending decisions.
2. **When** I look at my dashboard, **I want to** see a clear health indicator and runway projection, **so that** I can tell at a glance if I need to take action.
3. **When** I have a new recurring expense (e.g., new vehicle lease), **I want to** add it once and have it automatically factor into my projections, **so that** I don't forget about it.
4. **When** I complete my weekly ritual, **I want to** see my numbers update immediately, **so that** I feel confident the system reflects reality.
5. **When** I'm away from the full app, **I want to** see a compact widget with my TCP and health status, **so that** I can quickly check in.

### Franchise Operations Manager (FOM)

1. **When** I'm reviewing my portfolio, **I want to** see each franchise's cash health status, **so that** I can prioritize coaching for at-risk franchises.
2. **When** I drill into a specific franchise, **I want to** see their dashboard (read-only), **so that** I can prepare for our coaching call.
3. **When** a franchise hasn't completed their ritual recently, **I want to** see when they last reviewed, **so that** I can follow up.

---

## §6 Metric Definitions

### 6.1 True Cash Position (TCP)

| Field | Value |
|-------|-------|
| **Formula** | `Bank Balance + Pending Inflows − Pending Outflows` |
| **Pending Inflows** | Sum of all active recurring transactions where `type = "income"` and `nextOccurrence ≤ today + 7 days` |
| **Pending Outflows** | Sum of all active recurring transactions where `type = "expense"` and `nextOccurrence ≤ today + 7 days` |
| **Display Format** | Currency, 2 decimal places. Prefix `$`. Negative values: `−$1,234.56` (no parentheses). |
| **Null Behavior** | If no bank balance recorded: display `"—"` with subtitle "Complete your first ritual to see your cash position" |
| **Zero Behavior** | Display `$0.00` normally |
| **Negative Behavior** | Display with `text-danger-600` color. Health status automatically "Critical". |
| **Example** | Bank: $45,000 + Inflows: $12,000 − Outflows: $8,500 = **$48,500.00** |

### 6.2 Net Weekly Cash Flow

| Field | Value |
|-------|-------|
| **Formula** | `Weekly Recurring Income − Weekly Recurring Expenses` |
| **Weekly Recurring Income** | Sum of all active recurring transactions where `type = "income"`, normalized to weekly amount |
| **Weekly Recurring Expenses** | Sum of all active recurring transactions where `type = "expense"`, normalized to weekly amount |
| **Frequency Normalization** | Weekly ÷ 1, Bi-weekly ÷ 2 × 1, Monthly ÷ 4.33, Quarterly ÷ 13, Annually ÷ 52 |
| **Display Format** | Currency, 2 decimal places. Positive: `+$1,234.56` (green). Negative: `−$1,234.56` (red). Zero: `$0.00` (neutral). |
| **Division-by-Zero** | Not applicable (no denominator) |
| **Example** | Weekly income $8,000 − Weekly expenses $6,500 = **+$1,500.00** |

### 6.3 Weeks of Runway

| Field | Value |
|-------|-------|
| **Formula** | `TCP ÷ |Weekly Recurring Expenses|` |
| **Display Format** | Number, 1 decimal place, suffix " weeks". |
| **Division-by-Zero** | If weekly expenses = 0: display `"∞"` with tooltip "No recurring expenses recorded" |
| **Negative TCP** | Display `0.0 weeks` (cannot have negative runway) |
| **Cap** | Display actual value up to 999.9. Above that: `"999.9+ weeks"` |
| **Example** | TCP $48,500 ÷ Expenses $6,500/wk = **7.5 weeks** |

### 6.4 Health Status

| Field | Value |
|-------|-------|
| **Formula** | Based on Weeks of Runway thresholds |
| **Critical** | Runway < 4.0 weeks → 🔴 Red, label "Critical" |
| **Caution** | Runway ≥ 4.0 and < 8.0 weeks → 🟡 Yellow, label "Caution" |
| **Healthy** | Runway ≥ 8.0 weeks → 🟢 Green, label "Healthy" |
| **Boundary: exactly 4.0** | "Caution" (≥ 4.0 is Caution, not Critical) |
| **Boundary: exactly 8.0** | "Healthy" (≥ 8.0 is Healthy, not Caution) |
| **No Data** | Gray, label "Not Available", subtitle "Complete your first ritual" |
| **Display** | Gauge arc + color + text label + icon (not color alone per WCAG) |
| **Negative TCP** | "Critical" regardless of calculation |

### 6.5 Projection (13-Week Forecast)

| Field | Value |
|-------|-------|
| **Formula** | `TCP + (Net Weekly Cash Flow × week_number)` for weeks 1-13 |
| **Confidence Bands** | ±10% of Net Weekly Cash Flow applied cumulatively per week |
| **Display Format** | Line chart. X-axis: Week 1-13 labels. Y-axis: Dollar amount. Center line + shaded confidence band. |
| **No Data** | Display empty chart area with message "Complete your first ritual to see projections" |
| **Negative Projection** | Line continues below $0 axis. $0 threshold shown as dashed red line. |
| **All Zero Net Flow** | Flat horizontal line at TCP value. Confidence band collapses to zero width. |

---

## §7 Role-Based Access

### Access Matrix

| Capability | Franchise Partner (FP) | Franchise Operations Manager (FOM) |
|------------|----------------------|-----------------------------------|
| View Dashboard | ✅ Own franchise | ✅ Any assigned franchise (picker) |
| View TCP / Health / Projection | ✅ | ✅ Read-only |
| Complete Ritual Wizard | ✅ | ❌ Hidden |
| Update Bank Balance | ✅ | ❌ Hidden |
| Manage Recurring Transactions | ✅ Full CRUD | 👁️ Read-only (view list, no add/edit/delete) |
| View Widget | ✅ Own franchise | ✅ Selected franchise |
| Franchise Picker | ❌ N/A (single franchise) | ✅ Dropdown of assigned franchises |
| View Ritual History | ✅ Own | ✅ Read-only |
| Export Data | ❌ Non-goal | ❌ Non-goal |

### FOM Franchise Picker Behavior

- Displays as dropdown in page header, replacing franchise name
- Lists all franchises assigned to the FOM, sorted alphabetically
- Default selection: first franchise alphabetically
- Switching franchise reloads all data (Dashboard, Recurring, Widget)
- URL parameter: `?franchise=fr_id` for deep-linking
- If FOM has 0 assigned franchises: show empty state "No franchises assigned. Contact your administrator."

---

## §8 Definition of Done & Acceptance Criteria

### Dashboard Page

- [ ] Hero card displays True Cash Position with correct formatting
- [ ] TCP shows "—" with guidance text when no bank balance exists
- [ ] TCP negative values display in red
- [ ] Health Gauge renders correct color + text label + icon for each threshold
- [ ] Health Gauge exactly 4.0 weeks shows "Caution"
- [ ] Health Gauge exactly 8.0 weeks shows "Healthy"
- [ ] Health Gauge "Not Available" state renders when no data
- [ ] Projection Chart renders 13-week line with confidence bands
- [ ] Projection Chart shows empty state message when no data
- [ ] Projection line crosses below $0 with dashed threshold line
- [ ] Quick Actions strip shows "Start Ritual" and "Manage Transactions" buttons
- [ ] Quick Actions "Start Ritual" navigates to `/cash-flow/ritual`
- [ ] Quick Actions "Manage Transactions" navigates to `/cash-flow/recurring`
- [ ] Net Weekly Cash Flow displays with correct +/- prefix and color
- [ ] Weeks of Runway displays "∞" when expenses are zero
- [ ] Last Ritual date shown with relative time ("3 days ago")
- [ ] FOM sees read-only dashboard (no quick actions to ritual)
- [ ] FOM sees franchise picker in header
- [ ] Loading skeletons display per section while data fetches
- [ ] Error state shows retry button per section

### Ritual Wizard

- [ ] 5-step wizard: Welcome → Bank Balance → Review Recurring → One-Off Items → Summary
- [ ] Step indicator shows current step, completed steps, and remaining steps
- [ ] Step 1 (Welcome): Shows last ritual date, current TCP, and "Let's get started" CTA
- [ ] Step 2 (Bank Balance): Numeric input, pre-filled with last known balance, currency formatting on blur
- [ ] Step 3 (Review Recurring): Lists all recurring transactions with toggle to confirm/skip each
- [ ] Step 4 (One-Off Items): Add/remove one-time income or expenses for the current week
- [ ] Step 5 (Summary): Shows updated TCP, health status, projection chart, and "Complete Ritual" button
- [ ] User can navigate back to any completed step
- [ ] User cannot skip ahead past the current step
- [ ] Abandoning mid-flow: wizard state persists in browser session storage for 24 hours
- [ ] Completing ritual creates a WeeklySnapshot record
- [ ] After completion: redirect to Dashboard with success toast
- [ ] FOM cannot access ritual wizard (route guard redirects to dashboard)

### Recurring Transactions

- [ ] Data table lists all recurring transactions for the franchise
- [ ] Columns: Name, Type (Income/Expense), Amount, Frequency, Next Occurrence, Status (Active/Paused)
- [ ] Sort by any column (default: Next Occurrence ascending)
- [ ] Filter by type (All / Income / Expense) and status (All / Active / Paused)
- [ ] Add button opens modal with form: name, type, amount, frequency, start date
- [ ] Edit button on each row opens pre-filled modal
- [ ] Delete button with confirmation dialog: "Delete [name]? This cannot be undone."
- [ ] Bulk action: select multiple → Pause / Resume / Delete
- [ ] Frequency options: Weekly, Bi-weekly, Monthly, Quarterly, Annually
- [ ] Amount validation: positive numbers only, max 2 decimal places, max $9,999,999.99
- [ ] Name validation: 1-100 characters, no empty strings
- [ ] Empty state: "No recurring transactions yet. Add your first one to get started."
- [ ] FOM sees table in read-only mode (no Add/Edit/Delete/Bulk actions)
- [ ] Toast on CRUD: "Transaction added", "Transaction updated", "Transaction deleted", "[N] transactions [action]"

### Widget

- [ ] Compact card showing: TCP (formatted), Health Status (color + label), Last Reviewed date
- [ ] Clicking widget navigates to `/cash-flow/dashboard`
- [ ] "Not Available" state when no ritual completed
- [ ] FOM sees widget for selected franchise

---

## §9 Responsive Breakpoints

| Breakpoint | Width | Layout Changes |
|------------|-------|----------------|
| Mobile | < 640px | Single column, stacked cards, horizontal scroll on table, burger menu |
| Tablet | 640-1023px | Two-column grid for dashboard cards, table with fewer visible columns |
| Desktop | ≥ 1024px | Full layout, sidebar nav, all table columns visible |

### Specific Responsive Behaviors

- **Projection Chart:** On mobile, reduce to 8-week view with "See full projection" link
- **Transaction Table:** On mobile, hide Frequency and Next Occurrence columns; swipe to reveal actions
- **Ritual Wizard:** Full-width on all breakpoints; step indicator collapses to "Step 2 of 5" text on mobile
- **Health Gauge:** Reduce gauge diameter on mobile; keep text label always visible

---

## §10 Touch Targets & Keyboard

- All interactive elements: minimum 44×44px touch target
- Tab order follows visual reading order (left-to-right, top-to-bottom)
- Wizard: Enter advances to next step (when valid), Escape opens abandon confirmation
- Table: Arrow keys navigate rows (when focused), Enter opens edit modal
- Modal: Focus trapped, Escape closes, Tab cycles through form fields
- Skip-to-content link on every page

---

## §11 Visual Hierarchy

### Typography

| Element | Size | Weight | Usage |
|---------|------|--------|-------|
| TCP Value | 28px | 700 | Hero card primary metric |
| Section Title | 18px | 600 | Card headers |
| Metric Value | 22px | 700 | Secondary metrics (net flow, runway) |
| Body Text | 14px | 400 | Descriptions, table cells |
| Caption | 12px | 400 | Timestamps, subtitles |

### Colors (from Design System)

| Token | Hex | Usage |
|-------|-----|-------|
| `success-600` | #16a34a | Healthy status, positive values |
| `warning-500` | #f59e0b | Caution status |
| `danger-600` | #dc2626 | Critical status, negative values |
| `primary-500` | #8BC34A | CTAs, active states |
| `neutral-50` | #fafafa | Page background |
| `neutral-700` | #404040 | Primary text |

---

## §12 Animation & Timing

| Animation | Duration | Trigger |
|-----------|----------|---------|
| Card skeleton shimmer | 1.5s loop | Data loading |
| Wizard step transition | 300ms ease | Step navigation |
| Modal open/close | 200ms ease | Add/edit transaction |
| Toast appearance | 200ms slide-up | After CRUD action |
| Toast auto-dismiss | 4000ms | After appearance |
| Health Gauge fill | 800ms ease-out | Data load / update |
| Chart line draw | 600ms ease-out | Projection render |

---

## §13 Tracking & Analytics

| Event | Trigger | Properties |
|-------|---------|------------|
| `cash_flow_dashboard_viewed` | Dashboard page load | `franchise_id`, `user_role`, `health_status` |
| `cash_flow_ritual_started` | Wizard Step 1 loaded | `franchise_id`, `days_since_last_ritual` |
| `cash_flow_ritual_step_completed` | Each step advanced | `franchise_id`, `step_number`, `step_name` |
| `cash_flow_ritual_completed` | Final step submitted | `franchise_id`, `tcp_value`, `health_status`, `duration_seconds` |
| `cash_flow_ritual_abandoned` | User exits mid-wizard | `franchise_id`, `abandoned_at_step`, `duration_seconds` |
| `cash_flow_balance_updated` | Bank balance saved | `franchise_id`, `previous_balance`, `new_balance` |
| `cash_flow_transaction_created` | New recurring added | `franchise_id`, `type`, `frequency`, `amount` |
| `cash_flow_transaction_updated` | Recurring edited | `franchise_id`, `transaction_id`, `changed_fields` |
| `cash_flow_transaction_deleted` | Recurring removed | `franchise_id`, `transaction_id` |
| `cash_flow_transaction_bulk_action` | Bulk pause/resume/delete | `franchise_id`, `action`, `count` |
| `cash_flow_widget_clicked` | Widget tapped | `franchise_id`, `health_status` |
| `cash_flow_projection_viewed` | Projection chart in viewport | `franchise_id`, `weeks_of_runway` |
| `cash_flow_franchise_switched` | FOM switches franchise | `from_franchise_id`, `to_franchise_id` |
| `cash_flow_filter_changed` | Table filter/sort changed | `franchise_id`, `filter_type`, `filter_value` |
| `cash_flow_error_shown` | API error displayed | `franchise_id`, `error_type`, `endpoint` |

---

## §14 Error Handling & Validation

### API Errors

| Scenario | User-Facing Message | Toast Type |
|----------|-------------------|------------|
| Network failure | "Unable to load data. Check your connection and try again." | error |
| 401 Unauthorized | "Your session has expired. Please refresh the page." | warning |
| 403 Forbidden | "You don't have permission to view this franchise." | error |
| 404 Not Found | "This franchise could not be found." | error |
| 500 Server Error | "Something went wrong. Please try again." | error |
| Ritual save failure | "Unable to save your ritual. Your progress has been saved locally." | error |
| Transaction CRUD failure | "Unable to [action] transaction. Please try again." | error |

### Input Validation

| Field | Rules | Error Message |
|-------|-------|---------------|
| Bank Balance | Required, numeric, ≥ 0, max $999,999,999.99 | "Enter a valid dollar amount" |
| Transaction Name | Required, 1-100 chars | "Name is required (max 100 characters)" |
| Transaction Amount | Required, numeric, > 0, max $9,999,999.99 | "Enter a positive dollar amount" |
| Transaction Frequency | Required, one of: weekly, biweekly, monthly, quarterly, annually | "Select a frequency" |
| Transaction Start Date | Required, valid date, not before today for new transactions | "Enter a valid future date" |
| One-Off Amount | Required, numeric, ≠ 0, max $9,999,999.99 | "Enter a non-zero dollar amount" |
| One-Off Description | Required, 1-200 chars | "Description is required" |

---

## §15 URL Parameters & Deep Linking

| Route | URL | Parameters |
|-------|-----|-----------|
| Dashboard | `/cash-flow/dashboard` | `?franchise=fr_id` (FOM only) |
| Ritual | `/cash-flow/ritual` | `?step=1-5` (resume support) |
| Recurring | `/cash-flow/recurring` | `?franchise=fr_id` (FOM only), `?type=income|expense`, `?status=active|paused` |
| Widget | (embedded component) | N/A |

### Fallback Behavior

- Invalid `franchise` param: redirect to default franchise with warning toast
- Invalid `step` param: redirect to Step 1
- FP accessing FOM-only params: params ignored silently
- FOM accessing `/cash-flow/ritual`: redirect to `/cash-flow/dashboard` with info toast

---

## §16 API & Data Integration

### Data Sources

All data is user-entered (manual). No bank API integration. No import from external systems.

| Entity | Source | Refresh |
|--------|--------|---------|
| Bank Balance | Manual entry via Ritual Wizard Step 2 | Weekly (ritual) |
| Recurring Transactions | Manual CRUD via Recurring Transactions page | On demand |
| One-Off Transactions | Manual entry via Ritual Wizard Step 4 | Weekly (ritual) |
| Weekly Snapshot | System-generated on ritual completion | Weekly (ritual) |

### Franchise Scoping

All data is franchise-scoped. A Franchise Partner can only see and modify data for their own franchise. A FOM can view (read-only) data for any franchise assigned to them. Data isolation is enforced at the API layer — no client-side filtering.

### Caching Strategy

- SWR with `dedupingInterval: 5000` for dashboard data
- Ritual wizard state: `sessionStorage` with 24-hour TTL
- Recurring transactions: SWR with `revalidateOnFocus: true`
- No offline support (network required)

### History

- Weekly snapshots retained for 18 months (78 weeks)
- Projection chart uses only current data (not historical)
- Ritual completion timestamps retained indefinitely

---

## §17 Q&A Log

| # | Question | Answer |
|---|----------|--------|
| 1 | Is the ritual restricted to Mondays? | **No.** The ritual can be completed any day. "Weekly" is a recommendation, not a constraint. The system tracks "days since last ritual" and shows gentle nudges after 7+ days. |
| 2 | Can a user complete multiple rituals per day? | **Yes.** Each completion creates a new snapshot. The dashboard always reflects the most recent snapshot. |
| 3 | What happens if TCP is negative? | Display as `−$X,XXX.XX` in red. Health status is automatically "Critical". Runway is "0.0 weeks". Projection starts negative. |
| 4 | What if the user has no recurring transactions? | TCP equals Bank Balance. Net Weekly Cash Flow is $0.00. Runway is "∞". Projection is flat line. Health is based on runway (∞ = Healthy). |
| 5 | What if weekly expenses equal zero? | Runway displays "∞" with tooltip. Health is "Healthy" (∞ ≥ 8.0). |
| 6 | How are bi-weekly transactions handled at frequency boundaries? | Bi-weekly means every 2 weeks from start date. The `nextOccurrence` is calculated from start date, skipping forward in 14-day increments. |
| 7 | What about quarterly transactions at year boundaries? | Quarterly means every 3 months from start date. If start is Nov 1, next occurrences are Feb 1, May 1, Aug 1, Nov 1. Year boundary is not special. |
| 8 | Can a user abandon the ritual mid-way? | Yes. State persists in sessionStorage for 24 hours. Returning to `/cash-flow/ritual` resumes at last step. After 24 hours, starts fresh. |
| 9 | What if sessionStorage is cleared mid-ritual? | Wizard resets to Step 1. No data loss (nothing saved to server until completion). |
| 10 | Can the FOM complete a ritual on behalf of an FP? | No. The ritual route is hidden from FOM. Direct URL access redirects to dashboard. |
| 11 | What happens to recurring transactions when paused? | Paused transactions are excluded from TCP, Net Weekly Cash Flow, Runway, and Projections. They remain in the table with "Paused" badge. |
| 12 | Is there a maximum number of recurring transactions? | No hard limit. UI pagination after 50 rows. Performance target: render 200 transactions in < 500ms. |
| 13 | What if two users edit the same transaction simultaneously? | Last write wins. No conflict resolution. This is acceptable because only FPs can edit, and a franchise has one FP. |
| 14 | How is the 18-month history cutoff enforced? | Server-side. Snapshots older than 78 weeks are excluded from API responses. Deletion is a background job, not user-facing. |
| 15 | Are health thresholds configurable? | **No.** Thresholds are fixed: 4 weeks (Critical/Caution boundary), 8 weeks (Caution/Healthy boundary). This simplifies coaching conversations. |

---

## §18 Confirmation Modals

| Action | Requires Confirmation? | Modal Text |
|--------|----------------------|------------|
| Delete recurring transaction | ✅ Yes | "Delete [name]? This transaction will be permanently removed and will no longer appear in your projections." |
| Bulk delete transactions | ✅ Yes | "Delete [N] transactions? This cannot be undone." |
| Abandon ritual (via back nav or close) | ✅ Yes | "Leave ritual? Your progress will be saved for 24 hours." |
| Complete ritual | ❌ No | Direct action from Summary step |
| Pause/Resume transaction | ❌ No | Direct toggle with toast feedback |

---

## §19 Feature Dependencies

| Dependency | Required? | Notes |
|------------|-----------|-------|
| Authentication / Session | ✅ | Needed for role detection and franchise scoping |
| Franchise data (name, ID) | ✅ | From session context |
| FOM franchise assignments | ✅ | For franchise picker |
| WOW OS Navigation | ❌ | Standalone app; own nav sidebar |
| Dashboard module | ❌ | Independent; no data sharing |

---

## §20 Non-Goals

The following are explicitly **out of scope** for this version:

1. **No real bank integration** — All data is manually entered. No Plaid, no bank feeds, no CSV import.
2. **No alerts or notifications** — No email/SMS when health status changes. No push notifications.
3. **No data export** — No CSV/PDF download of transactions or snapshots.
4. **No custom thresholds** — Health thresholds (4/8 weeks) are fixed, not configurable per franchise.
5. **No multi-currency** — All amounts in CAD. No currency selection.
6. **No budget comparison** — No "budget vs actual" feature.
7. **No forecast scenarios** — No "what-if" modeling (e.g., "what if I add a crew?").
8. **No approval workflow** — FP actions are immediate; no FOM approval required.
9. **No integration with Projects/Funnel** — Cash flow data is self-contained.
10. **No mobile app** — Responsive web only.

---

## §21 Wizard Behavior Detail

### Step Flow

| Step | Name | Primary Action | Can Skip? | Can Go Back? |
|------|------|---------------|-----------|-------------|
| 1 | Welcome | Review last ritual summary | No (entry point) | No (first step) |
| 2 | Bank Balance | Enter current bank balance | No (required) | Yes → Step 1 |
| 3 | Review Recurring | Confirm/skip each transaction | Yes (if 0 transactions) | Yes → Step 2 |
| 4 | One-Off Items | Add optional one-time items | Yes (all items optional) | Yes → Step 3 |
| 5 | Summary | Review and complete | No (exit point) | Yes → Step 4 |

### State Persistence

- **During wizard:** State stored in `sessionStorage` key `cash-flow-ritual-state`
- **On step advance:** State serialized to sessionStorage
- **On browser close:** State persists until sessionStorage cleared or 24h TTL
- **On completion:** sessionStorage cleared, WeeklySnapshot saved to server
- **On abandon:** State remains in sessionStorage for resume

### Validation Per Step

| Step | Validation | Block Advance? |
|------|-----------|---------------|
| 2 | Bank balance must be a valid number ≥ 0 | Yes |
| 3 | No validation (toggle-only UI) | No |
| 4 | If adding item: amount ≠ 0, description required | Only if form is dirty |
| 5 | No validation (display-only) | N/A |
