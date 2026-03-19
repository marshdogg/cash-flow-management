# Dashboard Flow PRD
## Updated: March 1, 2026 (V2 Rebuild)

## 1. Brief Initiative Description

The **Dashboard Flow** is WOW OS's central reporting and KPI tracking hub that aggregates data from all other flows into actionable insights. It provides franchise partners with a tabbed interface covering Overview, Sales, and Profitability metrics—enabling quick health checks, surfacing tasks requiring attention, and identifying areas for improvement.

---

## 2. Short Description

A tabbed dashboard with three views: Overview (daily focus + tasks + key KPIs), Sales (pipeline funnel + estimator performance), and Profitability (P&L breakdown + collections). The Overview tab combines operational focus items with a personal task list showing overdue and due-today tasks inline. Features period selectors (Today/Week/Month/YTD), target progress tracking, trend indicators, and alert highlighting for metrics exceeding thresholds.

---

## 3. Associated HTML Files

| File | Component | Status |
|------|-----------|--------|
| `28-dashboard-tabbed.html` | Complete interactive dashboard with all three tabs + tasks | ✅ Updated |
| `28-dashboard-responsive.html` | Responsive variant | Deprecated — merged into main |
| `35-dashboard-estimator.html` | Estimator role-specific view | Pending update |
| `36-dashboard-pm.html` | PM role-specific view | Pending update |
| `37-dashboard-internal.html` | Internal (Sales Centre) view | Pending update |

---

## 4. Description & Business Impact

### Why We're Building This

**The Visibility Problem:** Franchise partners currently piece together performance data from multiple sources—spreadsheets, PaintScout reports, accounting software. There's no single place showing franchise health at a glance.

**The Alerting Problem:** Critical issues (high callback rates, SLA breaches, outstanding invoices) often go unnoticed until they become serious problems. The dashboard surfaces these proactively.

**The Trend Problem:** Understanding whether metrics are improving or declining requires manual comparison of reports over time. The dashboard shows trends automatically.

**The Task Problem:** Tasks and follow-ups live separately from operational metrics, requiring users to check multiple views. Embedding tasks directly in the dashboard's daily focus eliminates context switching and ensures nothing falls through the cracks.

### Context & Background

The Dashboard is a **read-only aggregation layer** that pulls data from all other WOW OS flows:

```
┌─────────────────────────────────────────────────────────┐
│                    DASHBOARD                             │
├─────────────────────────────────────────────────────────┤
│  Overview (+ Tasks)  │  Sales  │  Profitability         │
└─────────────────────────────────────────────────────────┘
       ↑          ↑            ↑              ↑
    All Flows  Funnel     Projects         Tasks
              Flow       Flow             Flow
```

### Dashboard Tabs

| Tab | Icon | Focus Area |
|-----|------|------------|
| **Overview** | 📊 | Daily focus, tasks, top KPIs, quick stats |
| **Sales** | 📈 | Pipeline, close rates, estimator performance |
| **Profitability** | 💰 | Revenue, GP, P&L, collections |

> **Note:** Customer Care was previously a standalone fourth tab. Customer care metrics (Callback Rate KPI, Cases Needing Attention focus item) remain visible on the Overview tab for at-a-glance awareness, while the full Customer Care Kanban remains accessible via sidebar navigation.

### Expected Outcomes

- **Single source of truth** — One place for all key metrics
- **Proactive alerting** — Issues surfaced before they escalate
- **Trend awareness** — Clear up/down indicators vs. prior periods
- **Time savings** — No manual report compilation needed
- **Task visibility** — Overdue and due-today tasks surfaced where the user starts their day

### Affected Personas

| Persona | Relationship to Dashboard |
|---------|--------------------------|
| **Franchise Partner (FP)** | Primary user. Morning command center for franchise health, P&L, and daily priorities. |
| **Ops Manager** | Daily user. Exception management, operational oversight, task follow-through. |
| **Sales Consultant (Estimator)** | Sales tab consumer. Pipeline tracking, personal close rate, follow-up awareness. |
| **Project Manager (PM)** | Overview tab consumer. Active project status, task completion, profitability monitoring. |
| **Operations (FOMs & VP Ops)** | Read-only viewer. Franchise health checks during coaching calls. Views FP's dashboard in their context. |
| **Admin** | Configuration only. Sets KPI targets and thresholds in Franchise Settings that feed dashboard cards. |

Personas **not** affected: Crew (no dashboard interaction), Legal (no direct use), Marketing (attribution data not surfaced here), Sales Centre (inbound call flow, not reporting).

### Jobs-to-Be-Done

**Franchise Partner — Morning Command Center**

> "When I start my day, I want to see my franchise health at a glance, so I can focus on what matters most."

- **Trigger:** FP opens WOW OS at the start of the business day.
- **Flow:** Lands on Overview tab (default) → Scans top KPIs for red/amber alerts → Checks Today's Focus for urgent operational items (qual calls needed, overdue follow-ups) → Reviews My Tasks for overdue and due-today items, checks off completed ones → Glances at Quick Stats for pipeline and collections health → If a metric looks off, clicks the KPI card to drill into the detail page.
- **Success Criteria:** FP knows within 60 seconds what needs attention today. No need to open any other tool.
- **Pain Point Relief:** "No real-time visibility" + "toggling between multiple disconnected tools."

**Franchise Partner — Weekly P&L Check**

> "When I review my week's financials, I want to see revenue vs. costs with margin trends, so I can course-correct before month-end."

- **Trigger:** FP switches to Profitability tab and selects "This Week" period.
- **Flow:** Reviews Revenue, GP, and GP Margin KPI cards with target progress → Scans Jobs P&L Summary for labor cost and materials breakdown → Checks Collections grid for outstanding invoices → If labor overage is high, clicks "View Details" to identify which projects leaked margin.
- **Success Criteria:** FP understands weekly profitability and knows which cost categories to investigate.
- **Pain Point Relief:** "No real-time visibility into gross profit until weeks after a job completes."

**Ops Manager — Exception Triage**

> "When something is trending wrong, I want the dashboard to surface it immediately, so I can intervene before it cascades."

- **Trigger:** Ops Manager opens dashboard and sees red/amber indicators.
- **Flow:** Spots Callback Rate KPI in red → Clicks through to Customer Care Kanban → Sees Cases Needing Attention count is elevated → Returns to Overview → Checks Follow-ups Due (amber warning) → Clicks through to Funnel filtered view to reassign overdue follow-ups.
- **Success Criteria:** All urgent exceptions identified and routed to the right person within 5 minutes.
- **Pain Point Relief:** "No centralized view" + "customer care issues tracked informally."

**Sales Consultant — Pipeline Performance**

> "When I want to check my sales performance, I want to see my pipeline and close rate against targets, so I can adjust my approach."

- **Trigger:** Estimator navigates to Sales tab during or after a selling day.
- **Flow:** Reviews Sales Pipeline funnel stages → Checks Close Rate and Avg Estimate Value metrics → Scrolls to Estimator Performance to see their own row → Compares close rate to team average → If pipeline value is low, clicks "View Funnel" to review specific deals.
- **Success Criteria:** Estimator knows where they stand against monthly goals and which deals need attention.
- **Pain Point Relief:** "No personal dashboard showing their own metrics."

**Operations (FOM) — Coaching Call Prep**

> "When I'm preparing for a franchise coaching call, I want to see the franchise's dashboard exactly as they see it, so I can have a data-driven conversation."

- **Trigger:** FOM selects a franchise from their portfolio and opens their dashboard.
- **Flow:** Reviews Overview KPIs to assess overall health → Switches to Sales tab to check pipeline activity and estimator performance → Switches to Profitability tab to review margins and collections → Notes any red/amber alerts to discuss on the call.
- **Success Criteria:** FOM has a complete picture of franchise health without asking the FP to compile reports.
- **Pain Point Relief:** "No centralized portfolio view" + "performance data is often stale."

---

## 5. Goals & Non-Goals

### Goals

1. ✅ **Three tabbed views** — Overview (with tasks), Sales, Profitability
2. ✅ **Period selection** — Today, This Week, This Month, YTD
3. ✅ **KPI cards with targets** — Progress bars showing achievement vs. goals
4. ✅ **Trend indicators** — Up/down percentages vs. prior period
5. ✅ **Alert highlighting** — Visual callouts for metrics exceeding thresholds
6. ✅ **Today's Focus section** — Operational items + personal tasks for the day
7. ✅ **Inline task list** — Overdue and due-today tasks with completable checkboxes
8. ✅ **Quick navigation** — Links from dashboard cards to relevant detail pages
9. ✅ **Auto-refresh** — Periodic data updates with last-updated timestamp
10. ✅ **Franchise context** — Clear indication of which franchise data is displayed

### Non-Goals (Out of Scope)

- **Dedicated Customer Care tab** — Removed because care metrics (Callback Rate, Cases Needing Attention) are already surfaced on Overview; a dedicated tab duplicated data without adding value. Full case management remains in the Customer Care Kanban via sidebar nav.
- **Custom report builder** — The dashboard serves pre-defined KPIs aligned to franchise operations. Ad-hoc reporting adds significant complexity and is a Phase 2 consideration once we understand which custom views users actually request.
- **Data export** — CSV/PDF export is useful but not essential for v1. Adding export later is low-risk since the data layer will already exist. Phase 2 candidate.
- **Goal setting interface** — KPI targets are configured in Franchise Settings to maintain a single source of truth for configuration. The dashboard consumes targets; it does not set them.
- **Multi-franchise comparison** — Cross-franchise benchmarking requires a fundamentally different data model (network-level aggregation). This is a corporate/FOM feature scoped for a future Network Dashboard initiative.
- **Historical trend charts** — Line graphs over time are valuable but add significant front-end complexity. v1 uses period-over-period comparison (trend arrows). Time-series charts are a Phase 2 enhancement.
- **Email/SMS alerts** — Automated notifications require a notification infrastructure that doesn't exist yet. Dashboard alerts are in-app only for v1. Notification system is a separate initiative.
- **Full task management from dashboard** — Creating, editing, and deleting tasks happens in the Tasks flow to avoid duplicating task management logic. Dashboard provides view + complete only, keeping it a read-heavy aggregation layer.

---

## 6. Metric Definitions

All calculated metrics displayed on the Dashboard. Every metric referenced in KPI cards, stat cards, or section values has a row below.

| Metric Name | Formula | Denominator Source | Display Format | Example |
|-------------|---------|-------------------|----------------|---------|
| Revenue MTD | SUM(completed_projects.total_amount) for selected period | `projects` table, `status = completed`, `completed_date` within period | Currency, no decimals | $142,500 |
| Gross Profit | Revenue − (Labor + Materials + Sundry) | Derived from Revenue and cost line items in `projects` | Currency, no decimals | $71,250 |
| Close Rate | Won ÷ (Sent + Won + Lost + Booked) for selected period | `estimates` table, deals that reached "Sent" stage or beyond | Percentage, 0 decimals | 42% |
| Callback Rate | Callbacks ÷ Completed Projects for selected period | `customer_care_cases` where `type = callback`, `projects` where `status = completed` | Percentage, 1 decimal | 2.1% |
| GP Margin | Gross Profit ÷ Revenue × 100 | Derived from Gross Profit and Revenue (above) | Percentage, 0 decimals | 50% |
| Labor Overage | Actual Labor − Estimated Labor | `projects` table, `actual_labor_cost` vs `estimated_labor_cost` | Currency, no decimals | $4,200 |
| Collection Rate | Collected ÷ Invoiced × 100 | `invoices` table, `status = paid` vs `status IN (paid, outstanding)` | Percentage, 0 decimals | 74% |
| Avg Days to Pay | AVG(payment_date − invoice_date) for paid invoices in period | `invoices` table, `status = paid`, dates within period | Integer + " days" | 18 days |

**Division-by-Zero Handling:**

- If the denominator is zero for any formula (e.g., no estimates presented → Close Rate denominator is 0), the metric displays "—" (em dash) instead of a calculated value.
- The trend indicator is hidden when the current value is "—".
- The progress bar is hidden when the current value is "—".
- API responses return `null` for the `value` field when the denominator is zero; the `formattedValue` field returns `"—"`.

**Metric Consistency:**

- Close Rate MUST use the same formula across Dashboard, Funnel Flow, and Estimator Profile. The definition in this table is authoritative.
- Revenue and Gross Profit MUST match the Projects Flow P&L calculations exactly. No rounding differences.
- All date-scoped metrics use the franchise's configured timezone for period boundaries.

---

## 7. Role-Based Access

Access matrix for all Dashboard UI elements by role. Elements marked **Hidden** are not rendered (no DOM element). Elements marked **Disabled** are visible but non-interactive (grayed out, `aria-disabled="true"`).

| Feature / Section | Franchise Partner | Ops Manager | Admin | FOM (viewing own) | FOM (viewing franchise) | Estimator | Project Manager |
|-------------------|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
| **Overview Tab** | Visible | Visible | Visible | Visible | Visible (read-only) | Visible | Visible |
| **Sales Tab** | Visible | Visible | Visible | Visible | Visible (read-only) | Visible | Visible |
| **Profitability Tab** | Visible | Visible | Visible | Visible | Visible (read-only) | **Hidden** | **Hidden** |
| **KPI Cards (Overview)** | Visible | Visible | Visible | Visible | Visible | Visible | Visible |
| **KPI Cards (Profitability)** | Visible | Visible | Visible | Visible | Visible | **Hidden** | **Hidden** |
| **Today's Focus (Ops)** | Visible | Visible | Visible | Visible | Visible (read-only) | Visible | Visible |
| **My Tasks** | Visible | Visible | Visible | Visible | **Hidden** | Visible | Visible |
| **Quick Stats** | Visible | Visible | Visible | Visible | Visible | Visible | Visible |
| **Sales Pipeline** | Visible | Visible | Visible | Visible | Visible | Visible | Visible |
| **Estimator Performance** | Visible | Visible | Visible | Visible | Visible | Visible | Visible |
| **P&L Summary** | Visible | Visible | Visible | Visible | Visible | **Hidden** | **Hidden** |
| **Collections** | Visible | Visible | Visible | Visible | Visible | **Hidden** | **Hidden** |
| **"Set target →" link** | Visible | **Hidden** | Visible | **Hidden** | **Hidden** | **Hidden** | **Hidden** |
| **Refresh button** | Visible | Visible | Visible | Visible | Visible | Visible | Visible |
| **Task checkbox (complete)** | Visible | Visible | Visible | Visible | **Hidden** | Visible | Visible |
| **Period Selector** | Visible | Visible | Visible | Visible | Visible | Visible | Visible |

**Role Transition Mid-Session:**

- If a user's role changes while they have the dashboard open (e.g., admin changes an Estimator to PM), the change takes effect on the next page load or auto-refresh that returns a 403 for a previously-authorized endpoint.
- No real-time role push is implemented in v1. The session token contains the role at login time.
- If an auto-refresh returns 403 for a tab the user is currently viewing (e.g., Profitability tab access revoked), redirect to Overview tab and show info toast: "Your access has been updated. Some sections may no longer be available."

---

## 8. Definition of Done & Acceptance Criteria

### 8.1 Page Header (All Tabs)

**Header Elements:**

- [x] Page title "Dashboard"
- [x] Subtitle: "[Period] · [Franchise Name]" (e.g., "January 2026 · W1D Test Franchise 1"). Franchise name truncated with ellipsis if it exceeds available width; full name shown in tooltip.
- [x] Last update timestamp: "Last update: [time]"
- [x] "↻ Refresh" button — triggers manual data refresh

**Dashboard Tabs:**

- [x] 📊 Overview — visible to all roles
- [x] 📈 Sales — visible to all roles
- [x] 💰 Profitability — visible to Franchise Partner, Ops Manager, and Operations (FOM) only. **Hidden for Estimator and PM roles.**

**Tab Visibility by Role:**

| Role | Overview | Sales | Profitability |
|------|----------|-------|---------------|
| Franchise Partner | ✅ | ✅ | ✅ |
| Ops Manager | ✅ | ✅ | ✅ |
| Operations (FOM) | ✅ | ✅ | ✅ |
| Admin | ✅ | ✅ | ✅ |
| Estimator | ✅ | ✅ | ❌ Hidden |
| Project Manager | ✅ | ✅ | ❌ Hidden |

- [x] If a user's role does not have access to a tab, the tab is not rendered (not disabled — invisible)
- [x] If a URL param `?tab=profitability` is used by an unauthorized role, fall back to Overview tab silently

**Period Selector:**

- [x] Button group: Today | This Week | This Month | YTD
- [x] Active period highlighted
- [x] Period change updates header subtitle with date range

---

### 8.2 Overview Tab

**Top KPIs (4 cards):**

| KPI | Type | Shows | Destination |
|-----|------|-------|-------------|
| Revenue MTD | Highlight (green border) | Amount + trend + target progress | Projects (completed) |
| Gross Profit | Standard | Amount + margin % + target progress | Projects (profitability) |
| Close Rate | Standard | Percentage (green if > target) + target progress | Funnel |
| Callback Rate | Alert (red border if over threshold) | Percentage (red if > threshold) | Customer Care Kanban |

**KPI Card Elements:**

- [x] Label (uppercase, small)
- [x] Value (large, bold). Show "$0" when value is zero with data present. Negative values displayed in red with parentheses: "($1,234)".
- [x] Trend indicator (↑/↓ percentage, positioned top-right). If prior period value is $0 and current is > $0, show "↑ New" instead of a percentage. If both periods are $0, hide the trend indicator entirely.
- [x] Target line with label. If no target is configured in Franchise Settings, hide the target line and progress bar entirely. Show value + trend only. Show a subtle "Set target →" link pointing to Franchise Settings (visible to FP and Admin roles only).
- [x] Progress bar (color-coded: green=on track, amber=under, red=danger). When target is exceeded (>100%), the progress bar caps at 100% fill width (never extends beyond the track), turns success green, and the achievement percentage label below shows the true value (e.g., "125%") in success green color to communicate over-achievement.
- [x] Achievement percentage
- [x] **Clickable** — navigates to relevant detail page
- [x] **Keyboard accessible** — Enter/Space activates

**KPI Card Edge Value Behaviors:**

| Condition | Value Display | Trend | Progress Bar | Achievement Label |
|-----------|--------------|-------|-------------|-------------------|
| **Value = 0** (data present) | "$0" or "0%" | Shows normally (comparison to prior period) | Shows 0% width (empty track visible) | "0%" |
| **Value negative** | Red text with parentheses: "($1,234)" | Shows normally | Hidden (no progress bar for negative) | Hidden |
| **Value = null** (no data) | "—" (em dash) | Hidden | Hidden | Hidden |
| **Achievement = 0%** | Normal value display | Shows normally | 0% width (empty gray track) | "0%" in gray |
| **Achievement 1-79%** | Normal value display | Shows normally | Warning amber fill | Percentage in gray |
| **Achievement 80-100%** | Normal value display | Shows normally | Primary green fill, capped at 100% width | Percentage in gray |
| **Achievement > 100%** | Normal value display | Shows normally | Success green fill, **capped at 100% width** (never extends beyond track) | True value (e.g., "125%") in success green |
| **No target configured** | Normal value display | Shows normally | Hidden entirely | "Set target →" link (FP/Admin only) |

**Today's Focus Section:**

The Today's Focus section is divided into two zones: **Operational Focus** (aggregate counts) and **My Tasks** (individual task items).

**Section Header:**
- [x] Section title "📋 Today's Focus"
- [x] "All Tasks →" link — navigates to `42-tasks-list.html`

**Operational Focus Items:**

| Focus Item | Icon | Shows | Destination | Style |
|------------|------|-------|-------------|-------|
| Qualification Call Needed | 📞 | Count of estimates within 24hrs without logged call | Funnel (qual-call-needed filter) | **Urgent (red)** |
| Estimates Scheduled | 📦 | Count + assigned estimators | Calendar (day view) | Standard |
| Follow-ups Due | ⏰ | Count (warning style if > 3) | Funnel (follow-up filter) | Warning (amber) |
| Projects In Progress | 🎨 | Count + project names | Projects (in-progress) | Standard |
| Cases Needing Attention | 🛠️ | Count (urgent style if SLA at risk) | Customer Care (urgent filter) | Urgent (red) |

- [x] Each focus item is **clickable link** to relevant page

**Qualification Call Needed Logic:**

- Displays count of deals in "Estimate Scheduled" stage where:
    - Appointment is today or tomorrow (calendar days in the franchise's configured timezone — not a rolling 24-hour clock window)
    - No "Qualification Call" activity has been logged on the deal
- Always shows as **urgent (red)** styling when count > 0
- Links to Funnel filtered to show only these deals
- Clears when qualification call is logged on each deal

**My Tasks Sub-Section:**

Below the operational focus items, a labeled divider ("☑️ My Tasks") introduces inline task items.

- [x] **FOM context:** When viewing another franchise's dashboard (FOM/Operations role), the My Tasks section is **hidden entirely**. Operational focus items remain visible as read-only. FOMs manage their own tasks from their own dashboard context.
- [x] Section divider label: "☑️ My Tasks" with horizontal rule
- [x] Shows tasks assigned to the current user that are **overdue** or **due today**
- [x] Tasks ordered: overdue first (oldest first), then due today (earliest time first)
- [x] Maximum of 6 tasks displayed; if more exist, shows "View all X tasks →" link

**Task Item Elements:**

| Element | Description |
|---------|-------------|
| Checkbox | Circular, completable inline (marks task done without leaving dashboard) |
| Type icon | Emoji prefix matching task type (📞 Call, ✉️ Email, ☑️ To-do, 🔄 Follow-up) |
| Title | Task title text (13px, medium weight). Truncated with ellipsis after 2 lines (line-clamp: 2). Full title visible on hover/long-press. |
| Type badge | Compact pill: Call (blue), Email (purple), To-do (gray), Follow-up (amber) |
| Due label | Color-coded: red "X days overdue" or amber "Due today · [time]" |
| Record link | Associated customer/project/deal name (if linked). If the linked record has been deleted, show the record name as plain text (no link). If `record_name` is null, omit the record link element entirely. |

**Task Item Styling:**

| State | Left Border | Background |
|-------|------------|------------|
| Overdue | 3px solid `#dc2626` (red) | `#f9fafb` (default) |
| Due Today | 3px solid `#f59e0b` (amber) | `#f9fafb` (default) |

**Task Checkbox Behavior:**

- [x] Click checkbox → toggles complete state
- [x] Checkbox click does **not** navigate (event.stopPropagation)
- [x] Completed tasks show checkmark (✓) with green fill
- [x] After completion, task shows strikethrough on title + dimmed opacity (0.5) for 3 seconds, then slides out of the list. If user clicks the checkbox again within 3 seconds, the completion is undone (optimistic undo).
- [x] Completion persists via API call to Tasks flow

**Quick Stats Section (2×2 grid):**

| Stat | Style | Shows | Destination |
|------|-------|-------|-------------|
| Completed Jobs | Success (green) | Count + vs. last month | Projects (completed) |
| In Pipeline | Standard | Count + pipeline value | Funnel |
| Collected | Standard | Amount + collection rate | Customers (collected filter) |
| Outstanding | Alert (red) | Amount + invoice count | Customers (outstanding filter) |

- [x] Each stat item is **clickable** to relevant page

**Quick Stats Edge Value Behaviors:**

| Condition | Value Display | Subtitle | Background |
|-----------|--------------|----------|------------|
| **Value = 0** | "0" or "$0" | Shows normally | Normal style background |
| **Value negative** | Red text: "($1,234)" | Shows normally | Alert (red) background |
| **Value = null** | "—" (em dash) | Hidden | Standard (white) background |

**Task Count Edge Values:**

| Condition | Display |
|-----------|---------|
| **0 tasks** | "No tasks due today — you're all caught up!" empty state |
| **> 6 tasks** | Show first 6 + "View all X tasks →" link |
| **All tasks completed** | Empty state with congratulatory message |

---

### 8.3 Sales Tab

**Sales Pipeline Section:**

- [x] Section title "📈 Sales Pipeline"
- [x] "View Funnel →" link — navigates to `08-funnel-cards.html`
- [x] Mini funnel visualization with clickable stages

| Stage | Shows | Destination |
|-------|-------|-------------|
| New Deals | Count + trend | Funnel (stage=new) |
| Scheduled | Count + trend | Funnel (stage=scheduled) |
| Sent | Count + trend | Funnel (stage=sent) |
| Won | Count + trend | Funnel (stage=won) |
| Booked | Count + trend | Funnel (stage=booked) |

**Funnel Stage Display:**

- [x] Arrow connectors between stages (→)
- [x] Up/down trend indicators (green/red)
- [x] **Clickable stages** — navigate to funnel filtered by stage

**Sales Metrics Section (2×2 grid):**

| Metric | Style | Shows |
|--------|-------|-------|
| Close Rate | Success | Percentage + vs. last month |
| Avg Estimate Value | Standard | Amount + vs. target |
| Pipeline Value | Standard | Amount + deal count |
| Cancellation Rate | Standard | Percentage + trend |

**Estimator Performance Section:**

- [x] Section title "👥 Estimator Performance"
- [x] "View All →" link — navigates to `15-technicians-list.html?role=estimator`
- [x] Team member rows showing:
    - Avatar (colored by resource)
    - Name
    - Estimate count this month
    - Close rate (color-coded)
- [x] Rows sorted by close rate descending (highest first)
- [x] Maximum of 5 estimator rows displayed. If the franchise has more, show "View All X Estimators →" link below the list.
- [x] Estimator names truncated with ellipsis at 24 characters
- [x] **Clickable rows** — navigate to estimator profile

**Funnel Stage Edge Value Behaviors:**

| Condition | Count Display | Trend |
|-----------|--------------|-------|
| **Count = 0** | "0" | Shows normally (could be down trend) |
| **Count = null** | "—" | Hidden |
| **All stages = 0** | Show all stages with "0" | Pipeline empty state: "No pipeline activity this period" |

**Estimator Performance Edge Value Behaviors:**

| Condition | Display |
|-----------|---------|
| **Close rate = 0%** | "0%" in danger red |
| **Close rate = 100%** | "100%" in success green |
| **Close rate > 100%** | Not possible (capped at 100% by formula) |
| **Estimate count = 0** | "0 estimates" — row still displays |
| **No estimators** | Empty state: "No estimates completed this period" |

**Sales Metrics Edge Value Behaviors:**

| Condition | Value Display | Style |
|-----------|--------------|-------|
| **Value = 0** | "$0" or "0%" | Standard (no alert) |
| **Value negative** | Red text with parentheses | Alert style |
| **Value = null** | "—" | Standard background |
| **Cancellation Rate = 0%** | "0%" | Success style |
| **Cancellation Rate > 15%** | Value shown | Alert style |

---

### 8.4 Profitability Tab

**Top KPIs (4 cards):**

| KPI | Type | Shows |
|-----|------|-------|
| Revenue | Highlight | Amount + trend + target progress |
| Gross Profit | Standard | Amount + target progress |
| GP Margin | Standard | Percentage + target progress |
| Labor Overage | Alert (if high) | Percentage + watch threshold |

**Jobs Profit & Loss Summary Section:**

- [x] Section title "💰 Jobs Profit & Loss Summary"
- [x] "View Details →" link — navigates to projects profitability view
- [x] Line items:

| Line | Shows |
|------|-------|
| Total Revenue | $amount |
| Labor Costs | ($amount) |
| Materials | ($amount) |
| Sundry (2%) | ($amount) |
| **Gross Profit** | $amount (bold) |
| Royalties (11%) | ($amount) |
| **Adjusted GP** | $amount (bold) |

**Collections Section (2×2 grid):**

| Metric | Style | Shows | Destination |
|--------|-------|-------|-------------|
| Invoiced | Standard | Amount + invoice count | — |
| Collected | Success | Amount + collection rate | — |
| Outstanding | Alert | Amount + invoice count | Customers (outstanding) |
| Avg Days to Pay | Standard | Days + trend | — |

**P&L Summary Edge Value Behaviors:**

| Condition | Amount Display | Style |
|-----------|--------------|-------|
| **Amount = $0** | "$0" | Normal row style |
| **Amount negative** (costs) | "($X,XXX)" in red | Standard (expected for cost lines) |
| **Gross Profit negative** | "($X,XXX)" in red, bold | Subtotal style with danger color |
| **All amounts = $0** | Show all rows with "$0" | Normal layout preserved |
| **Amount = null** | "—" | Normal row, no amount link |

**Collections Edge Value Behaviors:**

| Condition | Value Display | Style |
|-----------|--------------|-------|
| **Invoiced = $0** | "$0" | Standard |
| **Collected = $0** | "$0" with "0% collection rate" | Standard (not success) |
| **Outstanding = $0** | "$0" with "0 invoices" | Success (everything collected) |
| **Avg Days to Pay = 0** | "0 days" | Success |
| **Avg Days to Pay = null** (no paid invoices) | "—" | Standard |
| **Outstanding negative** (overpayment) | "($X,XXX)" in green | Success style (credit balance) |

---

## 9. Interactive Behavior Specifications

### 9.1 Tab Switching

```
// Behavior: Click tab → switch content without page reload
// Implementation: switchTab(tabName)

- Tabs use role="tablist" and role="tab" for accessibility
- Active tab has aria-selected="true"
- Tab content panels have role="tabpanel"
- Arrow keys navigate between tabs
- Enter/Space activates focused tab
- URL updates with ?tab=<name> for bookmarking
- Default tab on initial load: Overview (unless ?tab= URL param is present)
- Back button navigates between tab states (each tab switch pushes a browser history entry)
- Tabs not authorized for the user's role are not rendered (see §6.1 Tab Visibility by Role)
```

### 9.2 Period Selector

```
// Behavior: Click period → update data context
// Implementation: setPeriod(period)

- Active period shows white background with shadow
- Header subtitle updates with date range:
  - today: "January 18, 2026"
  - week: "Jan 13-19, 2026"
  - month: "January 2026"
  - ytd: "2026 Year to Date"
- URL updates with ?period=<name> for bookmarking
- Default period on initial load: This Month (unless ?period= URL param is present)
- "This Week" starts Monday (ISO 8601 standard), consistent with Canadian business convention
- Period change cancels any in-flight data requests. Only the most recent period's response is applied (use AbortController or request ID to prevent stale data from a slower earlier request overwriting newer data).
- Toast notification confirms data loading
```

### 9.3 Refresh Button

```
// Behavior: Click refresh → show loading → update timestamp
// Implementation: refreshDashboard()

States:
1. Default: "↻ Refresh" (green outline)
2. Loading: Spinner + "Refreshing..." (disabled)
3. Success: "✓ Updated" (green fill) — 2 second duration
4. Error: "⚠ Failed · Retry" (red outline) — stays until clicked

- Updates "Last update" timestamp on success
- Shows toast notification with result
```

### 9.7 Auto-Refresh

```
// Behavior: Periodic background data refresh
// Implementation: setInterval + refreshDashboard()

- Auto-refresh every 5 minutes while the browser tab is active
- Pauses when the browser tab is hidden (Page Visibility API)
- Resumes immediately when the tab becomes visible again (if last refresh > 5 minutes ago)
- Does NOT show loading states during auto-refresh (silent update)
- Updates "Last update" timestamp on success
- If auto-refresh fails, does not show error toast (avoids spam); stale data warning (section 14) handles visibility
- Auto-refresh suppresses updates to task items that are currently in the 3-second undo window. Refresh data for those tasks is applied after the undo window closes.
- If auto-refresh returns 401/403 (session expired), show a session-expired banner: "Your session has expired. Please refresh the page to continue." (See §14)
- Auto-refresh interval is configurable per franchise in Franchise Settings (default: 5 minutes)
```

### 9.4 Navigation

```
// Behavior: Click element → navigate to destination
// Implementation: navigateTo(url) or <a href="">

All clickable elements:
- KPI cards → relevant detail page
- Focus items → relevant filtered view
- Stat items → relevant list view
- Team rows → technician profile
- Section links → full list/kanban view
- Funnel stages → funnel filtered by stage
- Task items → tasks list (filtered)
- "All Tasks →" link → tasks list
```

### 9.5 Task Checkbox Completion

```
// Behavior: Click checkbox → mark task complete
// Implementation: inline event handler

- Click on checkbox toggles .checked class
- Checkbox fills green with ✓ icon
- event.preventDefault() + event.stopPropagation() prevents navigation
- Debounce: ignore additional clicks for 500ms after a toggle to prevent double-click race conditions. Only one API call fires per settled state.
- API call updates task status in Tasks flow
- Task visually updates (strikethrough + dimmed opacity for 3 seconds, then slides out)
- Does NOT remove task from list immediately (user may undo within 3 seconds)

API Failure Handling:
- If PATCH returns error WITHIN the 3-second undo window: auto-revert the checkbox to unchecked state and show error toast: "Unable to complete task. Please try again."
- If PATCH returns error AFTER the task has slid out: show error toast "Unable to complete task" and the task reappears on the next auto-refresh or manual refresh.
- If PATCH returns 404 (task deleted by another user/system): remove the task from the list and show info toast: "This task is no longer available."
```

### 9.6 Mobile Sidebar

```
// Behavior: Hamburger toggle → slide sidebar
// Implementation: toggleSidebar()

- Hidden by default on screens ≤1024px
- Hamburger button (☰) appears top-left
- Sidebar slides in from left
- Overlay dims background
- Click overlay or navigate closes sidebar
```

---

## 10. Navigation Map

### Sidebar Navigation

| Nav Item | Destination | Notes |
|----------|-------------|-------|
| WOW Logo | `28-dashboard-tabbed.html` | Home |
| 📊 Dashboard | `28-dashboard-tabbed.html` | Current page (active) |
| 📈 Funnel | `08-funnel-cards.html` | Sales pipeline |
| 👥 Customers | `29-customers-list.html` | Customer list |
| 🎨 Projects | `30-projects-list.html` | Project list |
| 📅 Calendar | `27-calendar.html` | Schedule view |
| ☑️ Tasks | `42-tasks-list.html` | Task list (with overdue badge) |
| 👷 Technicians | `15-technicians-list.html` | Team list |
| 📋 PaintScout | `https://app.paintscout.com` | External (↗ indicator) |
| 🛠️ Customer Care | `11-customer-care-kanban.html` | Case management |
| ⚙️ Settings | `26-franchise-settings.html` | Franchise configuration |

### Dashboard Element Destinations

| Element | Click Destination |
|---------|-------------------|
| Revenue MTD KPI | `30-projects-list.html?status=completed` |
| Gross Profit KPI | `30-projects-list.html?view=profitability` |
| Close Rate KPI | `08-funnel-cards.html` |
| Callback Rate KPI | `11-customer-care-kanban.html` |
| Qualification Call Needed | `08-funnel-cards.html?filter=qual-call-needed` |
| Estimates Scheduled | `27-calendar.html?view=day` |
| Follow-ups Due | `08-funnel-cards.html?filter=follow-up` |
| Projects In Progress | `30-projects-list.html?status=in-progress` |
| Cases Needing Attention | `11-customer-care-kanban.html?filter=urgent` |
| "All Tasks →" link | `42-tasks-list.html` |
| Overdue task item | `42-tasks-list.html?filter=overdue` |
| Due-today task item | `42-tasks-list.html?filter=due-today` |
| Completed Jobs stat | `30-projects-list.html?status=completed` |
| In Pipeline stat | `08-funnel-cards.html` |
| Collected stat | `29-customers-list.html?filter=collected` |
| Outstanding stat | `29-customers-list.html?filter=outstanding` |
| View Funnel → | `08-funnel-cards.html` |
| Funnel stage (e.g., "Won") | `08-funnel-cards.html?stage=won` |
| View All → (Estimators) | `15-technicians-list.html?role=estimator` |
| Estimator row | `18-estimator-profile.html?id={id}` |
| View Details → (P&L) | `30-projects-list.html?view=profitability` |

---

## 11. Responsive Breakpoints

### Desktop (>1024px)

- Full sidebar visible (240px)
- 4-column KPI grid
- 2-column dashboard grid (2fr / 1fr for Overview, 1fr / 1fr for others)
- All content visible
- Task items show full meta row

### Tablet (768px–1024px)

- Sidebar hidden, hamburger menu
- 2-column KPI grid
- Single-column dashboard grid
- Full content with scrolling
- Task items unchanged

### Mobile (<768px)

- Sidebar hidden, hamburger menu
- Single-column KPI grid
- Single-column dashboard grid
- Stacked period selector (full width)
- Simplified funnel (vertical stack)
- Task items: meta wraps to second line if needed

### Touch Targets

- All interactive elements minimum 44×44px tap area
- Adequate spacing between clickable elements
- Task checkboxes 20×20px visual but 44×44px tap area

---

## 12. Toast Notification System

### Types

| Type | Icon | Border Color | Use Case |
|------|------|-------------|----------|
| success | ✅ | Green (`#16a34a`) | Action completed successfully |
| error | ❌ | Red (`#dc2626`) | Action failed |
| warning | ⚠️ | Amber (`#f59e0b`) | Needs attention |
| info | ℹ️ | Blue (`#3b82f6`) | Informational |

### Behavior

- Appears bottom-right of viewport
- Auto-dismisses after 4 seconds (configurable)
- Manual dismiss via × button
- Stacks vertically if multiple
- Animates in/out

---

## 13. Keyboard Accessibility

| Element | Keys | Action |
|---------|------|--------|
| Dashboard tabs | ←/→ | Navigate between tabs |
| Dashboard tabs | Enter/Space | Activate tab |
| KPI cards | Tab | Focus card |
| KPI cards | Enter/Space | Navigate to destination |
| Period buttons | Tab | Focus button |
| Period buttons | Enter/Space | Select period |
| Focus items | Tab/Enter | Navigate to destination |
| Task checkboxes | Tab/Space | Toggle completion |
| Links | Enter | Navigate |
| Refresh button | Enter/Space | Trigger refresh |

All focusable elements have visible focus ring (2px solid `#8BC34A`).

---

## 14. Loading States

All data-dependent sections must show loading indicators during data fetch.

### Initial Page Load

- [x] Show skeleton screens for all KPI cards (gray animated placeholders)
- [x] Show skeleton rows for list items (Today's Focus, Task items)
- [x] Sidebar and header render immediately (no skeleton needed)
- [x] Period selector disabled during load

### Refresh Button States

| State | Visual | Duration |
|-------|--------|----------|
| Default | "↻ Refresh" | — |
| Loading | Spinner + "Refreshing..." | Until data returns |
| Success | "✓ Updated" (green) | 2 seconds |
| Error | "⚠ Failed · Retry" (red) | Until clicked |

### Section-Level Loading

When individual sections refresh (e.g., navigating tabs):

- [x] Show spinner overlay on affected section
- [x] Keep previous data visible (dimmed) until new data loads
- [x] Timeout after 10 seconds → show error state

---

## 15. Empty States

Define what displays when no data exists for the selected period.

### Overview Tab Empty States

| Section | Empty State Message | CTA |
|---------|---------------------|-----|
| Top KPIs | "—" for values, hide trend indicators, hide progress bars | — |
| Today's Focus (Ops) | "Nothing scheduled for today" | "View Calendar →" |
| Today's Focus (Tasks) | "No tasks due today — you're all caught up! ✅" | "View All Tasks →" |
| Quick Stats | "—" for all values | — |

### Sales Tab Empty States

| Section | Empty State Message | CTA |
|---------|---------------------|-----|
| Sales Pipeline | "No pipeline activity this period" | "View Funnel →" |
| Sales Metrics | "—" for all values | — |
| Estimator Performance | "No estimates completed this period" | "View Technicians →" |

### Profitability Tab Empty States

| Section | Empty State Message | CTA |
|---------|---------------------|-----|
| Top KPIs | "—" for values | — |
| P&L Summary | "No completed jobs this period" | "View Projects →" |
| Collections | "No invoices this period" | — |

### First-Time User (No Historical Data)

When franchise is new with no data across any period:

- [x] Show welcome message: "Welcome to your Dashboard"
- [x] Display onboarding checklist
- [x] All KPIs show "—" with explanatory tooltips

---

## 16. Error States

### API Failure

When data fetch fails completely:

- [x] Show error banner at top of main content area
- [x] Banner text: "Unable to load dashboard data"
- [x] Banner includes "Retry" button
- [x] Previous data (if any) remains visible but dimmed
- [x] Log `dashboard_error` event with error details

### Partial Failure

When some data sources fail:

- [x] Affected sections show inline error: "Unable to load [section name]"
- [x] Include "Retry" link within section
- [x] Unaffected sections display normally

### Task API Failure

When task data fails but other dashboard data loads:

- [x] My Tasks section shows: "Unable to load tasks"
- [x] "Retry" link within section
- [x] Operational focus items display normally above

### Session Expired

When auto-refresh or manual refresh returns 401/403:

- [x] Show error banner at top of main content area
- [x] Banner text: "Your session has expired. Please refresh the page to continue."
- [x] Banner includes "Refresh Page" button (triggers full page reload)
- [x] All interactive elements (checkboxes, period selector, tabs) remain visible but non-functional
- [x] Log `dashboard_error` event with `error_type=session_expired`

### Stale Data Warning

When data is older than 15 minutes:

- [x] Show amber warning badge next to "Last update" timestamp
- [x] Tooltip: "Data may be outdated. Click Refresh to update."

---

## 17. URL Parameters

Dashboard supports URL parameters for deep linking and bookmarking:

| Parameter | Values | Effect |
|-----------|--------|--------|
| `tab` | overview, sales, profitability | Opens specified tab |
| `period` | today, week, month, ytd | Sets period selector |

**Fallback Behavior:**

- Invalid `tab` value (e.g., `?tab=invalid`) → falls back to "overview" silently
- Invalid `period` value (e.g., `?period=xyz`) → falls back to "month" silently
- `?tab=profitability` for a role without Profitability access → falls back to "overview" silently
- No error shown to user for invalid params. Log `dashboard_error` event with `error_type=invalid_param`.

**Examples:**

- `28-dashboard-tabbed.html?tab=sales` — Opens Sales tab
- `28-dashboard-tabbed.html?tab=profitability&period=week` — Opens Profitability tab with This Week selected

---

## 18. Data Sources & Integration

### Data Scoping & Security

- [x] All dashboard API calls are scoped by `franchise_id` from the authenticated user session. Server-side middleware enforces franchise boundary — no dashboard API endpoint accepts a client-supplied `franchise_id` parameter.
- [x] Exception: FOM franchise-switching is authorized by the Operations role. When an FOM selects a franchise from their portfolio, the server validates the FOM's portfolio access before returning data.
- [x] All date/time calculations use the **franchise's configured timezone** (set in Franchise Settings). APIs store and transmit dates in UTC; the client converts for display using the franchise timezone.

### Close Rate Definition

Close Rate is calculated as: **Won deals ÷ Total estimates presented** for the selected period. "Estimates presented" means deals that reached the "Sent" stage or beyond (Sent + Won + Lost + Booked). This excludes deals still in New or Scheduled stages that haven't been presented to the customer yet. This definition must be consistent across the Dashboard, Funnel Flow, and any other module displaying close rate.

### Task Data Integration

The My Tasks section on the Overview tab pulls from the Tasks flow API:

| Data Point | Source | Filter |
|------------|--------|--------|
| Task list | Tasks API | `assigned_to=current_user AND status=open AND (due_date <= today)` |
| Task type | Tasks API | `type` field (todo, call, email, followup) |
| Due date/time | Tasks API | `due_date`, `due_time` fields |
| Associated record | Tasks API | `record_type`, `record_id`, `record_name` fields |
| Completion | Tasks API (write) | `PATCH /tasks/{id}` with `status=completed` |

### Other Data Sources

| Dashboard Section | Source Flow | Data Points |
|-------------------|------------|-------------|
| Revenue / GP KPIs | Projects Flow | Completed project totals, margin calculations |
| Close Rate KPI | Funnel Flow | Won ÷ Total estimates presented for selected period (see Close Rate Definition above) |
| Callback Rate KPI | Customer Care Flow | Callback count ÷ completed projects |
| Today's Focus (Ops) | Multiple | Funnel, Calendar, Projects, Customer Care |
| Sales Pipeline | Funnel Flow | Stage counts and trends |
| Estimator Performance | Technicians Flow | Per-estimator close rates and counts |
| P&L Summary | Projects Flow | Revenue, labor, materials, sundry, royalties |
| Collections | Customer Flow | Invoice and payment data |

---

## 19. Q&A

Anticipated questions from designers and engineers.

| # | Question | Answer |
|---|----------|--------|
| 1 | What is the default tab on initial load? | Overview. URL param `?tab=` overrides. |
| 2 | What is the default period on initial load? | This Month. URL param `?period=` overrides. |
| 3 | What is the auto-refresh interval? | Every 5 minutes while the browser tab is active. Configurable per franchise in Franchise Settings. |
| 4 | Do KPI targets vary by franchise? | Yes. Targets are set per franchise in Franchise Settings and pulled at dashboard load. |
| 5 | What happens when a user completes a task via the checkbox? | Checkbox fills green with checkmark. Title shows strikethrough and row dims to 0.5 opacity for 3 seconds. If user clicks again within 3 seconds, completion is undone (optimistic undo). After 3 seconds, the task slides out of the list. API call persists the completion to the Tasks flow. |
| 6 | Can the user undo a task completion from the dashboard? | Yes, within 3 seconds by clicking the checkbox again. After the task slides out, undo is only available from the Tasks flow. |
| 7 | Which tab does a role-specific user land on? | v1 uses the same default (Overview) for all roles. Role-specific dashboard variants (files 35-37) are pending and will customize the default view per role in a future update. |
| 8 | How are "trend" percentages calculated? | Current period value vs. same-length prior period. E.g., "This Month" compares to last month; "This Week" compares to last week; "YTD" compares to same period last year. "Today" compares to same day last week. |
| 9 | Where do KPI thresholds (red/amber/green) come from? | Franchise Settings. Each franchise can configure target values and alert thresholds. Defaults are set at the network level. |
| 10 | Does the dashboard work for franchises with no estimators? | Yes. Estimator Performance section shows the empty state: "No estimates completed this period" with a "View Technicians" CTA. Sales Pipeline still populates from deals regardless of estimator assignment. |
| 11 | Is dashboard data cached client-side? | SWR handles client-side caching with stale-while-revalidate. Initial load fetches fresh data; subsequent visits may show stale data briefly while revalidating. |
| 12 | How does the FOM view a franchise's dashboard? | FOMs select a franchise from their portfolio, which sets the franchise context. They see the exact same dashboard the FP sees, read-only. |
| 13 | What happens if the user navigates away during a task completion API call? | The API call fires and forgets. On return, the task list reflects the server state (completed or not). |
| 14 | Are the P&L percentages (Sundry 2%, Royalties 11%) hardcoded? | No. These are configured per franchise in Franchise Settings. The labels show the configured percentage. |
| 15 | What happens if the task completion API fails? | If failure occurs within the 3-second undo window, the checkbox auto-reverts and an error toast appears. If after slide-out, error toast shows and the task reappears on next refresh. See §7.5. |
| 16 | Can an FOM complete tasks on a franchise's dashboard? | No. When viewing another franchise's dashboard, the My Tasks section is hidden. FOMs see operational focus items as read-only only. |
| 17 | Can Estimators and PMs see the Profitability tab? | No. The Profitability tab is hidden for Estimator and PM roles. See §6.1 Tab Visibility by Role. |
| 18 | What happens on double-click of a task checkbox? | Checkbox clicks are debounced — additional clicks within 500ms are ignored. Only one API call per settled state. |
| 19 | What timezone is used for "today" and date calculations? | The franchise's configured timezone from Franchise Settings. Server APIs use UTC; client converts for display. |
| 20 | What day does "This Week" start on? | Monday (ISO 8601). Consistent with Canadian business convention. |
| 21 | How is Close Rate calculated? | Won ÷ Total estimates presented (Sent + Won + Lost + Booked) for the selected period. Excludes deals in New or Scheduled stages. Must be consistent across all modules. |
| 22 | What if URL params are invalid? | Invalid `tab` falls back to "overview". Invalid `period` falls back to "month". No error shown; event logged. |
| 23 | Where are metric formulas defined? | §6 Metric Definitions contains the authoritative formula for every calculated metric. Close Rate, GP Margin, Collection Rate, etc. all have explicit denominator sources and division-by-zero handling. |
| 24 | What happens when a metric's denominator is zero? | The metric displays "—" (em dash). Trend indicator and progress bar are hidden. API returns `null` for the `value` field. See §6 Division-by-Zero Handling. |
| 25 | How does role-based access work? | §7 defines the access matrix. Hidden elements are not rendered in DOM. Estimator and PM roles cannot see Profitability tab, P&L, or Collections. FOMs viewing another franchise see read-only with My Tasks hidden. |
| 26 | What happens if a user's role changes mid-session? | The change takes effect on next page load or auto-refresh. If an auto-refresh returns 403 for a currently-viewed tab, the user is redirected to Overview with an info toast. See §7 Role Transition Mid-Session. |

---

## 20. Tracking Events

| Event | Trigger | Properties |
|-------|---------|------------|
| `dashboard_viewed` | Page load completes | `tab`, `period`, `franchise_id`, `user_role` |
| `dashboard_tab_switched` | User clicks a different tab | `from_tab`, `to_tab` |
| `dashboard_period_changed` | User clicks a different period | `from_period`, `to_period`, `tab` |
| `dashboard_kpi_clicked` | User clicks a KPI card | `kpi_name`, `tab`, `destination_url` |
| `dashboard_focus_item_clicked` | User clicks a Today's Focus item | `item_type`, `item_count`, `destination_url` |
| `dashboard_task_completed` | User checks a task checkbox | `task_id`, `task_type`, `was_overdue`, `days_overdue` |
| `dashboard_task_undo` | User unchecks within undo window | `task_id`, `task_type` |
| `dashboard_stat_clicked` | User clicks a Quick Stats item | `stat_name`, `tab`, `destination_url` |
| `dashboard_funnel_stage_clicked` | User clicks a pipeline stage | `stage_name`, `stage_count` |
| `dashboard_estimator_clicked` | User clicks an estimator row | `estimator_id`, `estimator_close_rate` |
| `dashboard_refreshed` | User clicks Refresh button | `time_since_last_refresh_seconds`, `result` (success/error) |
| `dashboard_auto_refreshed` | Auto-refresh completes | `result` (success/error) |
| `dashboard_error` | Data fetch fails | `error_type` (full/partial/task), `error_message`, `section` |
| `dashboard_link_clicked` | User clicks any section "View" link | `link_label`, `destination_url`, `tab` |
| `dashboard_toast_shown` | Toast notification displayed | `toast_type` (success/error/warning/info), `toast_message`, `trigger_action` |
| `dashboard_toast_dismissed` | User manually dismisses a toast | `toast_type`, `toast_message`, `auto_dismiss` (boolean) |
| `dashboard_role_access_denied` | User attempts to access a hidden section via URL | `section`, `user_role`, `redirect_to` |

---

## 21. Confirmation Modals

The dashboard is primarily read-only, so confirmation modals are minimal.

| Action | Confirmation Required? | Details |
|--------|----------------------|---------|
| Task completion (checkbox) | No | Optimistic action with 3-second undo window. No modal needed — low-risk, easily reversible. |
| Refresh button | No | Non-destructive action. |
| Navigation (clicking KPI/stat/link) | No | Standard navigation, no data loss risk. |
| Period change | No | Non-destructive. Previous period data is not lost. |
| Tab switch | No | Non-destructive. No form state to lose. |

> **Note:** If future versions add editable elements to the dashboard (e.g., inline goal setting, drag-and-drop task reordering), confirmation modals should be revisited.

---

## 22. Related Documents

- [Funnel Flow PRD](./PRD-Funnel-Flow.md) — Source for pipeline and sales metrics
- [Projects Flow PRD](./PRD-Projects-Flow-updated.md) — Source for revenue and profitability data
- [Customer Care Flow PRD](./PRD-Customer-Care-Flow.md) — Source for case and callback data
- [Technicians Flow PRD](./PRD-Technicians-Flow.md) — Source for team performance metrics
- [Customer Flow PRD](./PRD-Customer-Flow.md) — Source for collection data
- [Franchise Settings Flow PRD](./PRD-Franchise-Settings-Flow.md) — Target configuration
- [Tasks List Design](./42-tasks-list.html) — Full tasks interface reference

### Cross-Module Filter Dependencies

Dashboard navigation links depend on destination flows supporting specific URL filter parameters. If a destination flow does not yet support the filter, the link should navigate to the base page (unfiltered) rather than breaking.

| Dashboard Element | Destination URL | Required Filter Param |
|-------------------|-----------------|-----------------------|
| Qualification Call Needed | `08-funnel-cards.html?filter=qual-call-needed` | `filter=qual-call-needed` |
| Follow-ups Due | `08-funnel-cards.html?filter=follow-up` | `filter=follow-up` |
| Cases Needing Attention | `11-customer-care-kanban.html?filter=urgent` | `filter=urgent` |
| Funnel stage click | `08-funnel-cards.html?stage=<name>` | `stage=<name>` |
| Collected stat | `29-customers-list.html?filter=collected` | `filter=collected` |
| Outstanding stat | `29-customers-list.html?filter=outstanding` | `filter=outstanding` |

These must be implemented in the respective destination flows. Track as build dependencies.

---

## Changelog

### 2026-03-01 (V2 Rebuild — PRD Paul)
- ✅ **Added §6 Metric Definitions** — 8 metrics with formulas, denominator sources, display formats, examples, division-by-zero handling
- ✅ **Added §7 Role-Based Access** — Full access matrix for 7 role variants across 16 UI elements; role transition mid-session spec
- ✅ **Added edge value visual behaviors** for KPI cards (§8.2), Quick Stats (§8.2), funnel stages (§8.3), estimator performance (§8.3), sales metrics (§8.3), P&L summary (§8.4), collections (§8.4), task counts (§8.2)
- ✅ **Renumbered** sections to match V2 PRD template (§6→§8, §7→§9, etc.)
- ✅ **Added Q&A** entries #23-#26 covering metric definitions, division-by-zero, role-based access, mid-session role changes
- ✅ **Added tracking events** for toast notifications and role access denied
- ✅ **Completeness flags:** §6 Metric Definitions ✅, §7 Role-Based Access ✅, Edge Value Specs ✅

### 2026-02-28 (Update 5 — Edge Case Eddie Resolution)
- ✅ **Resolved 🔴 Critical:** Task completion API failure — added revert behavior for failed PATCH within/after undo window, 404 handling for deleted tasks (§7.5)
- ✅ **Resolved 🔴 Critical:** FOM task completion — My Tasks section hidden when viewing another franchise's dashboard (§6.2)
- ✅ **Added** Tab Visibility by Role — Profitability tab hidden for Estimator and PM roles (§6.1)
- ✅ **Added** Data Scoping & Security section — franchise boundary enforcement, FOM access validation (§16)
- ✅ **Added** Close Rate Definition — Won ÷ Total estimates presented (§16)
- ✅ **Added** Timezone specification — franchise timezone from Settings, UTC in APIs (§16)
- ✅ **Added** Session Expired error state (§14)
- ✅ **Added** Cross-Module Filter Dependencies checklist (§20)
- ✅ **Added** URL parameter fallback behavior for invalid values (§15)
- ✅ **Added** 8 new Q&A entries (#15–#22) covering edge case decisions
- ✅ **Updated** KPI cards: $0/negative display, trend with zero prior period, progress bar capped at 100% width for over-achievement, missing target fallback (§6.2)
- ✅ **Updated** Task checkbox: 500ms debounce, API failure handling, 404 handling (§7.5)
- ✅ **Updated** Auto-refresh: suppress during undo window, session expired handling (§7.7)
- ✅ **Updated** Period selector: rapid-switch cancellation, week starts Monday (§7.2)
- ✅ **Updated** Tab switching: back button navigates tab history, role-based visibility (§7.1)
- ✅ **Updated** Estimator Performance: max 5 rows with "View All" link, name truncation (§6.3)
- ✅ **Updated** Task items: title truncation (2-line clamp), deleted record link handling (§6.2)
- ✅ **Updated** Qualification Call logic: clarified calendar days vs. clock hours (§6.2)
- ✅ **Updated** Header subtitle: franchise name truncation with tooltip (§6.1)

### 2026-02-28 (Update 4 — PRD Paul Review)
- ✅ **Added** Affected Personas section — identified 6 affected personas with relationship descriptions
- ✅ **Added** Jobs-to-Be-Done section — 5 JTBD flows for FP (x2), Ops Manager, Estimator, and FOM
- ✅ **Added** Section 17: Q&A — 14 anticipated questions with answers
- ✅ **Added** Section 18: Tracking Events — 14 analytics events with trigger and properties
- ✅ **Added** Section 19: Confirmation Modals — documented that no modals are needed for v1
- ✅ **Added** Section 7.7: Auto-Refresh behavior — 5-minute interval, Page Visibility API, silent updates
- ✅ **Updated** Non-Goals with reasoning for each exclusion
- ✅ **Updated** Task completion behavior — resolved "TBD" with strikethrough + 3-second optimistic undo
- ✅ **Updated** Tab switching default — Overview tab on initial load (unless URL param overrides)
- ✅ **Updated** Period selector default — This Month on initial load (unless URL param overrides)
- ✅ **Updated** Estimator Performance — added sort order (close rate descending)
- ✅ **Updated** Loading states — confirmed all items as accepted (checkboxes checked)

### 2026-02-26 (Update 3)
- ❌ **Removed** Customer Care tab — care metrics (Callback Rate KPI, Cases Needing Attention) remain on Overview; full case management accessed via sidebar nav
- ✅ **Added** My Tasks sub-section to Today's Focus on Overview tab
- ✅ **Added** inline task items showing overdue and due-today tasks with completable checkboxes
- ✅ **Added** task item styling (type badges, due labels, left border accents, record links)
- ✅ **Added** "All Tasks →" link in Today's Focus section header
- ✅ **Added** ☑️ Tasks to sidebar navigation with overdue badge
- ✅ **Added** Section 16: Data Sources & Integration (task API details)
- ✅ **Added** Task-specific empty state and error state definitions
- ✅ **Updated** tab count from 4 to 3, URL parameter values updated
- ✅ **Updated** Section 7: Added task checkbox completion behavior spec (7.5)
- ✅ **Updated** Section 8: Navigation map with task destinations
- ✅ **Updated** `28-dashboard-tabbed.html` prototype

### 2026-01-18 (Update 2)
- ✅ Added "Qualification Call Needed" focus item to Today's Focus section
- ✅ Renamed "Profit & Loss Summary" to "Jobs Profit & Loss Summary"
- ✅ Added business logic documentation for Qualification Call Needed feature

### 2026-01-18 (Update 1)
- ✅ Added interactive behavior specifications (Section 7)
- ✅ Added complete navigation map (Section 8)
- ✅ Added responsive breakpoints (Section 9)
- ✅ Added toast notification system (Section 10)
- ✅ Added keyboard accessibility requirements (Section 11)
- ✅ Added URL parameters support (Section 15)
- ✅ Updated acceptance criteria with click destinations
- ✅ Updated `28-dashboard-tabbed.html` with full interactivity

### 2026-01-16
- Initial PRD creation
