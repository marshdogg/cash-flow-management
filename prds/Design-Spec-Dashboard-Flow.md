# Design Spec: Dashboard Flow
## Generated from: PRD-Dashboard-Flow.md (Update 5)
## Design System Version: WOW OS v1 (shadcn/ui + Tailwind)
## Status: 🟢 Updated for V2 Rebuild

## 1. Design Overview

### Visual Direction
Data-dense, read-heavy aggregation dashboard. Three tabbed views serve as the franchise's daily command center. Visual hierarchy prioritizes: KPI cards (largest/boldest) > Today's Focus (action-oriented) > Quick Stats (supplementary). Uses color-coded alerting (green/amber/red) to surface exceptions without requiring users to parse numbers. The design must feel calm when things are good and urgent when they're not.

### Layout Pattern
Sidebar (fixed, 240px) + Main content area. Main uses a 2-column grid on Overview (2fr / 1fr) and equal columns on Sales/Profitability. All content scrolls within the main area; sidebar is fixed. Tabs + period selector sit in a persistent header above the grid.

## 2. Design Tokens Used

### Colors

| Token | Hex | Usage in this flow |
|-------|-----|-------------------|
| `--color-primary-500` | `#8BC34A` | Logo, active nav, focus rings, progress bar (on track), refresh button |
| `--color-primary-600` | `#7cb342` | Logo hover, button hover |
| `--color-primary-50` | `#f0f9e8` | Active nav background, focus item tint |
| `--color-neutral-50` | `#f9fafb` | Page background, card body background, task item background |
| `--color-neutral-100` | `#f3f4f6` | Period selector background, hover states, to-do badge background |
| `--color-neutral-200` | `#e5e7eb` | Borders, dividers, checkbox border |
| `--color-neutral-300` | `#d1d5db` | Checkbox border |
| `--color-neutral-500` | `#6b7280` | Secondary text, labels, subtitle |
| `--color-neutral-400` | `#9ca3af` | Tertiary text, external indicators |
| `--color-neutral-700` | `#374151` | Nav text, body text, team names |
| `--color-neutral-900` | `#111827` | Headings, primary text |
| `--color-success-600` | `#16a34a` | Trend up, completed state, collection rate, success toast |
| `--color-success-50` | `#f0fdf4` | Success stat background |
| `--color-warning-500` | `#f59e0b` | Warning/amber, under-target progress, due-today border, warning toast |
| `--color-warning-50` | `#fffbeb` | Warning item background |
| `--color-warning-100` | `#fef3c7` | Warning hover background, follow-up badge |
| `--color-danger-600` | `#dc2626` | Alert/red, overdue border, callback rate, error toast, nav badge |
| `--color-danger-50` | `#fef2f2` | Alert stat background, urgent item background |
| `--color-danger-100` | `#fee2e2` | Urgent hover background |
| `--color-info-500` | `#3b82f6` | Info toast |
| `--color-blue-100` | `#dbeafe` | Call badge background |
| `--color-blue-700` | `#1d4ed8` | Call badge text |
| `--color-purple-100` | `#f3e8ff` | Email badge background |
| `--color-purple-700` | `#7c3aed` | Email badge text |

### Typography

| Token | Spec | Usage |
|-------|------|-------|
| `--font-heading-xl` | 24px / 700 | Page title "Dashboard" |
| `--font-heading-md` | 15px / 600 | Section titles |
| `--font-body-md` | 14px / 400 | Nav items, team names, focus titles |
| `--font-body-md-medium` | 14px / 500 | Dashboard tabs, team names |
| `--font-body-sm` | 13px / 400 | Subtitle, task titles, period buttons, toast messages |
| `--font-body-sm-medium` | 13px / 500 | Period buttons, task title, refresh button text |
| `--font-caption` | 12px / 400 | Last update, stat labels, focus details |
| `--font-caption-medium` | 12px / 500 | KPI labels (uppercase) |
| `--font-overline` | 11px / 400 | Funnel stage labels, task meta, franchise label, user role |
| `--font-overline-medium` | 11px / 500 | Task type badges, task due labels, nav badge |
| `--font-kpi-value` | 28px / 700 | KPI card primary value |
| `--font-stat-value` | 22px / 700 | Quick stat values |
| `--font-focus-count` | 24px / 700 | Focus item counts |
| `--font-funnel-value` | 20px / 700 | Funnel stage counts |

### Spacing

| Token | Value | Usage |
|-------|-------|-------|
| `--spacing-1` | 4px | Nav gap, icon gap |
| `--spacing-2` | 8px | Target margin-top, section title gap, funnel gap |
| `--spacing-3` | 12px | Focus list gap, nav item padding-y, task item padding-y, header actions gap |
| `--spacing-4` | 16px | Sidebar padding, stats grid gap, top KPIs gap, sidebar footer padding-top |
| `--spacing-5` | 20px | KPI card padding, section body padding |
| `--spacing-6` | 24px | Main padding-y, dashboard grid gap, tab margin-bottom, period margin-bottom |
| `--spacing-8` | 32px | Main padding-x, logo margin-bottom |

### Shadows & Borders

| Token | Value | Usage |
|-------|-------|-------|
| `--shadow-sm` | `0 1px 2px rgba(0,0,0,0.05)` | Cards, period selector active |
| `--shadow-md` | `0 4px 6px rgba(0,0,0,0.1)` | Toast notifications, hover cards |
| `--shadow-lg` | `0 2px 8px rgba(0,0,0,0.1)` | Mobile nav toggle |
| `--border-sm` | `1px solid --color-neutral-200` | Cards, sidebar, dividers |
| `--border-alert` | `3px solid --color-danger-600` | Overdue task left border |
| `--border-warning` | `3px solid --color-warning-500` | Due-today task left border |
| `--border-highlight` | `2px solid --color-primary-500` | Highlight KPI card |
| `--radius-sm` | 6px | Buttons, nav items |
| `--radius-md` | 8px | Focus items, task items, toast |
| `--radius-lg` | 12px | Cards, sections |
| `--radius-full` | 50% | Logo, avatars, checkboxes |
| `--radius-pill` | 10px | Badges |

## 3. Component Mapping

| UI Element | Design System Component | Variant/Config | New? | Notes |
|-----------|------------------------|----------------|------|-------|
| Sidebar | `AppSidebar` | Fixed, 240px | No | Shared across all flows |
| Sidebar nav item | `NavItem` | default / active / with-badge | No | Badge variant for Tasks overdue count |
| Mobile hamburger | `MobileNavToggle` | — | No | Shared component |
| Sidebar overlay | `Overlay` | Semi-transparent | No | Shared component |
| Dashboard tabs | shadcn `Tabs` | underline variant | No | Custom styling for green underline |
| Period selector | shadcn `ToggleGroup` | single-select | No | Custom styling for active state |
| KPI card | `KpiCard` | standard / highlight / alert | **Yes** | New component — combines value, trend, target, progress |
| Progress bar | shadcn `Progress` | color-coded, capped at 100% fill | Extend | Extend with color variants. Bar never exceeds track; over-achievement shown via text label only |
| Trend indicator | `TrendBadge` | up / down / new / hidden | **Yes** | New component — positioned absolute top-right of KPI card |
| Section card | `SectionCard` | with header + optional link | No | Reuse card pattern from other flows |
| Focus item | `FocusItem` | standard / urgent / warning | **Yes** | New component — icon + info + count + link |
| Task item | `DashboardTaskItem` | overdue / due-today | **Yes** | New component — checkbox + title + badge + meta |
| Task checkbox | `TaskCheckbox` | unchecked / checked / completing | **Yes** | New — circular, animated, with undo window |
| Type badge | shadcn `Badge` | call / email / todo / followup | Extend | Extend with task-type color variants |
| Quick stat card | `StatCard` | standard / success / alert | **Yes** | New — value + label + trend + link |
| Funnel mini | `FunnelMini` | horizontal with arrow connectors | **Yes** | New component — compact horizontal funnel |
| Funnel stage | `FunnelStage` | clickable | **Yes** | New — label + count + trend |
| Estimator row | `TeamRow` | with avatar + stats | No | Reuse from Technicians flow |
| P&L row | `PLRow` | standard / subtotal / total | **Yes** | New — label + amount, with bold variants |
| Collections grid | `StatCard` (reuse) | standard / success / alert | No | Same as Quick Stat card |
| ToastProvider | `ToastProvider` | wraps layout | **NEW** | Required shared component — provides toast context at layout level |
| Toast notification | `Toast` | 4 variants: success / error / warning / info | **NEW** | Required shared component — see Toast Component Design Spec |
| useToast hook | `useToast` | Hook for triggering toasts | **NEW** | Required shared component — imperative API for showing toasts |
| Refresh button | `RefreshButton` | default / loading / success / error | **Yes** | New — multi-state button with spinner |
| Skeleton card | shadcn `Skeleton` | card-sized | No | For loading states |
| Skeleton row | shadcn `Skeleton` | row-sized | No | For loading list items |
| Error banner | `AlertBanner` | error / session-expired | No | Shared component from error pattern |
| Empty state | `EmptyState` | with message + optional CTA | No | Shared pattern |
| Stale data badge | `StatusBadge` | warning variant | No | Reuse badge pattern |

## 4. New Components

### KpiCard
**Rationale:** No existing component combines value + trend + target + progress + click navigation in a single card. This is dashboard-specific.
**Visual Spec:**
- Container: `--radius-lg`, `--border-sm`, background white, padding `--spacing-5`
- Variants: `standard` (white bg), `highlight` (green gradient `#f0fdf4` → white), `alert` (red gradient `#fef2f2` → white, `--border-alert`)
- Label: `--font-caption-medium`, uppercase, `--color-neutral-500`
- Value: `--font-kpi-value`, `--color-neutral-900`. Negative values: `--color-danger-600` with parentheses.
- Trend: Positioned absolute top-right, `--font-overline-medium`. Green for ↑, red for ↓, neutral for "New".
- Target line: `--font-overline`, `--color-neutral-500`, `--spacing-2` margin-top
- Progress bar: height 6px, `--radius-full`. Bar NEVER extends beyond its track. When achievement > 100%, bar fills to exactly 100% width with `--color-success-600`. The achievement percentage TEXT shows the true value (e.g., "125%").
- Achievement: `--font-overline-medium`, right-aligned below progress bar
- No target state: Progress bar + target line hidden. "Set target →" link in `--font-overline`, `--color-primary-500` (FP/Admin only).
**States:** Default | Hover (shadow-md, border darkens) | Focus (2px `--color-primary-500` outline) | Loading (skeleton) | Empty (value "—", no trend/target)
**Responsive:** Full width at mobile. 2-col grid at tablet. 4-col grid at desktop.

### DashboardTaskItem
**Rationale:** Task items in the dashboard are a specialized view-only representation with inline completion — different from the full task list in the Tasks flow.
**Visual Spec:**
- Container: `--radius-md`, background `--color-neutral-50`, padding `--spacing-3` horizontal, `--spacing-3` vertical
- Left border: 3px, `--color-danger-600` (overdue) or `--color-warning-500` (due-today)
- Checkbox: 20px circle, `--border-sm` `--color-neutral-300`. Checked: `--color-success-600` fill, white ✓. Tap area: 44×44px.
- Title: `--font-body-sm-medium`, `--color-neutral-900`. Truncated: `line-clamp: 2`.
- Type badge: `--font-overline-medium`, `--radius-pill`, padding 2px 8px. Colors per type (see Color tokens).
- Due label: `--font-overline-medium`. Red text for overdue, amber for due-today.
- Record link: `--font-overline`, `--color-primary-500`, underline on hover.
**States:** Default | Hover (border darkens, bg `--color-neutral-100`) | Completing (strikethrough title, opacity 0.5, 3s) | Sliding-out (translateX(-100%), opacity 0, 300ms) | Focus (2px outline)
**Responsive:** Full width all breakpoints. Meta wraps to second line on mobile.

### TaskCheckbox
**Rationale:** Circular checkbox with animated completion, undo window, and debounce is specific to dashboard tasks.
**Visual Spec:**
- Size: 20×20px visual, 44×44px tap area (transparent padding)
- Unchecked: `--border-sm` `--color-neutral-300`, white fill
- Checked: `--color-success-600` fill, white ✓ icon (12px), scale animation (0.8 → 1.0, 150ms)
- Hover: border `--color-neutral-500`
- Focus: 2px `--color-primary-500` outline
- Completing state: Checkbox stays checked green during 3-second undo window
- Error revert: Checkbox shakes (translateX(-2px, 2px) 3 times, 200ms) then reverts to unchecked

### FocusItem
**Rationale:** Combines icon + text + count + link in a compact card-like row. No existing component matches.
**Visual Spec:**
- Container: `--radius-md`, padding `--spacing-3`, flex row, gap `--spacing-3`
- Variants: `standard` (neutral-50 bg), `urgent` (`--color-danger-50` bg, `--color-danger-600` border-left 3px), `warning` (`--color-warning-50` bg, `--color-warning-500` border-left 3px)
- Icon: 16px emoji
- Title: `--font-body-md`, `--color-neutral-700`
- Detail: `--font-caption`, `--color-neutral-500`
- Count: `--font-focus-count`, right-aligned
**States:** Default | Hover (border darkens, bg shifts) | Focus (2px outline)

### RefreshButton
**Rationale:** Multi-state button cycling through default → loading → success → error is not a standard shadcn button variant.
**Visual Spec:**
- Size: auto width, `--radius-pill` (20px), padding 8px 16px
- Default: `--color-primary-500` border, white bg, `--font-body-sm-medium` "↻ Refresh"
- Loading: `--color-primary-500` bg, white text "Refreshing...", spinner icon (16px, rotating)
- Success: `--color-success-600` bg, white text "✓ Updated", 2-second auto-revert to default
- Error: `--color-danger-600` border, white bg, "⚠ Failed · Retry"
**States:** Default | Loading (disabled) | Success (auto-revert 2s) | Error (persists until click)

### Toast (Required Shared Component)
**Rationale:** Global notification system required across all flows. ToastProvider wraps the layout to provide context; useToast hook provides imperative API for triggering toasts from any component.
**Visual Spec:**
- Position: bottom-right of viewport, 16px from edges
- Width: 360px fixed
- Height: auto, max 120px
- Padding: 12px 16px
- Border-radius: 8px (`--radius-md`)
- Shadow: `--shadow-md`
- Left border: 4px solid (color varies by type — see below)
- Background: white
- Content layout: flex row — icon (16px) + message (`--font-body-sm`, 13px) + dismiss button (x, 16px, `--color-neutral-400`, hover `--color-neutral-700`)
- Animation: slide-in from right (200ms ease-out on enter), fade-out (200ms on dismiss)
- Auto-dismiss: 4 seconds default
- Stacking: newest on bottom, 8px gap between toasts
- Accessibility: `aria-live="polite"`, `role="status"` on toast container
**Types:**
- `success`: left border `--color-success-600` (green), icon: checkmark
- `error`: left border `--color-danger-600` (red), icon: x-circle
- `warning`: left border `--color-warning-500` (amber), icon: alert-triangle
- `info`: left border `--color-info-500` (blue), icon: info-circle
**Responsive:** Full width at mobile (<768px), positioned at bottom of viewport.

## 5. Page-by-Page Visual Specs

### All Tabs — Page Header
**Layout:** Flex column, gap `--spacing-6` | **Background:** `--color-neutral-50`

- Title row: flex, justify-between, align-center
  - Left: "Dashboard" `--font-heading-xl` + subtitle `--font-body-sm` `--color-neutral-500`
  - Right: "Last update: [time]" `--font-caption` `--color-neutral-500` + RefreshButton
- Tabs: `Tabs` component, green underline active indicator (3px `--color-primary-500`), `--spacing-6` margin-bottom
- Period selector: `ToggleGroup`, `--spacing-6` margin-bottom
- Franchise name in subtitle: truncate with ellipsis, tooltip on hover

### Overview Tab
**Layout:** 2-column grid (2fr / 1fr), gap `--spacing-6`

- **Column 1:**
  - Top KPIs: 4-column grid, gap `--spacing-4`
  - Today's Focus: SectionCard with focus items + task items
- **Column 2:**
  - Quick Stats: SectionCard with 2×2 StatCard grid

### Sales Tab
**Layout:** 2-column grid (1fr / 1fr), gap `--spacing-6`

- **Column 1:**
  - Sales Pipeline: SectionCard with FunnelMini
  - Sales Metrics: 2×2 StatCard grid
- **Column 2:**
  - Estimator Performance: SectionCard with max 5 TeamRows

### Profitability Tab
**Layout:** 2-column grid (1fr / 1fr), gap `--spacing-6`
**Visibility:** Hidden for Estimator and PM roles (tab not rendered)

- **Column 1:**
  - Top KPIs: 4-column grid (same pattern as Overview)
  - P&L Summary: SectionCard with PLRow items
- **Column 2:**
  - Collections: SectionCard with 2×2 StatCard grid

## 6. Interaction States

### Loading States
- **Initial load:** Skeleton screens for all KPI cards (gray animated pulse, card-sized). Skeleton rows for focus items and task items. Period selector and tabs render immediately but period buttons disabled (opacity 0.5, pointer-events none).
- **Section refresh (tab switch):** Semi-transparent overlay (white, opacity 0.6) on affected section with centered spinner (24px, `--color-primary-500`). Previous data visible but dimmed. Timeout after 10 seconds → show error state.
- **Auto-refresh:** Silent — no visual loading indicators. Data updates in place.

### Empty States
Per section, following pattern: centered text + optional CTA link.
- **KPI cards:** Value shows "—" in `--color-neutral-400`. Trend indicator hidden. Progress bar hidden. Target line hidden.
- **Today's Focus (Ops):** "Nothing scheduled for today" `--font-body-sm` `--color-neutral-500`. CTA: "View Calendar →" `--color-primary-500`.
- **Today's Focus (Tasks):** "No tasks due today — you're all caught up!" `--font-body-sm` `--color-neutral-500`. CTA: "View All Tasks →".
- **Quick Stats:** Value shows "—".
- **Sales Pipeline:** "No pipeline activity this period" + "View Funnel →" CTA.
- **Estimator Performance:** "No estimates completed this period" + "View Technicians →" CTA.
- **P&L Summary:** "No completed jobs this period" + "View Projects →" CTA.
- **Collections:** "No invoices this period". No CTA.
- **First-time user:** Welcome message "Welcome to your Dashboard" `--font-heading-md`. Onboarding checklist below. All KPIs show "—" with info tooltips explaining what data will appear.

### Error States
- **Full API failure:** AlertBanner at top of main content. Red left border (4px `--color-danger-600`). Icon ❌. Text: "Unable to load dashboard data". "Retry" button. Previous data (if any) dimmed to opacity 0.4.
- **Partial failure:** Inline error within affected section. Text: "Unable to load [section name]". "Retry" link in `--color-primary-500`. Other sections display normally.
- **Task API failure:** My Tasks section shows "Unable to load tasks" with "Retry" link. Operational focus items above display normally.
- **Session expired:** AlertBanner. Amber border. Text: "Your session has expired. Please refresh the page to continue." "Refresh Page" button. All interactive elements remain visible but non-functional (opacity 0.5, pointer-events none).
- **Stale data (>15 min):** Amber dot badge (8px circle, `--color-warning-500`) next to "Last update" timestamp. Tooltip: "Data may be outdated. Click Refresh to update."

## 7. Responsive Specs

### Desktop (>1024px)
- Sidebar: visible, fixed, 240px
- Main: margin-left 240px, padding `--spacing-6` vertical, `--spacing-8` horizontal
- KPI grid: 4 columns
- Dashboard grid: 2 columns (2fr/1fr for Overview, 1fr/1fr for others)
- All content visible, no stacking

### Tablet (768px–1024px)
- Sidebar: hidden, hamburger menu top-left
- Main: full width, padding `--spacing-6`
- KPI grid: 2 columns
- Dashboard grid: single column (sections stack)
- Task items: unchanged layout

### Mobile (<768px)
- Sidebar: hidden, hamburger menu
- Main: full width, padding `--spacing-4`
- KPI grid: single column
- Dashboard grid: single column
- Period selector: full width, buttons expand equally
- Funnel: vertical stack (stages top to bottom, arrows become ↓)
- Task items: meta row wraps to second line if needed
- Toast: full width at bottom of viewport

## 8. Accessibility Specs

- **Color contrast:** All text meets WCAG 2.1 AA (4.5:1 for normal text, 3:1 for large). Red on white: 4.6:1. Green on white: 3.2:1 (large text only — KPI values are 28px/bold, qualifies as large).
- **Focus indicators:** 2px solid `--color-primary-500`, offset 2px, on ALL interactive elements. Tab buttons use inset focus ring (offset -2px).
- **Touch targets:** Minimum 44×44px on all interactive elements. Task checkboxes: 20px visual, 44px tap area (transparent padding).
- **Heading hierarchy:** `<h1>` page title, `<h2>` section titles, semantic landmarks (`<aside>`, `<nav>`, `<main>`).
- **Screen reader:** `aria-live="polite"` on toast container for announcements. Descriptive `aria-label` on KPI cards. `role="tablist"`, `role="tab"`, `role="tabpanel"` on dashboard tabs.
- **Skip link:** "Skip to main content" link as first focusable element, visible on focus.
- **Color independence:** Progress bar color supplemented by achievement percentage text. Status indicators include icons (✓, ⚠, ❌) alongside color.

## 9. Edge Case Visual Coverage

| Edge Case (from Eddie) | Severity | Visual Treatment | Component |
|----------------------|----------|-----------------|-----------|
| 2.1 Task API failure | 🔴 | Checkbox shakes + reverts; error toast | TaskCheckbox, Toast |
| 3.1 FOM task completion | 🔴 | My Tasks section hidden entirely in FOM context | DashboardTaskItem |
| 2.2 Double-click checkbox | 🟠 | 500ms debounce — no visual change, just ignored | TaskCheckbox |
| 2.3 Auto-refresh during undo | 🟠 | Task items in undo window are excluded from refresh update | DashboardTaskItem |
| 2.4 Rapid period switching | 🟠 | Only latest period's loading state visible; prior requests cancelled | Period selector |
| 2.6 Task deleted (404) | 🟠 | Task slides out + info toast "This task is no longer available" | DashboardTaskItem, Toast |
| 3.3 Franchise boundary | 🟠 | No visual treatment needed — server-enforced | — |
| 4.1 10+ estimators | 🟠 | Max 5 rows + "View All X Estimators →" link | TeamRow |
| 5.1 Deleted record link | 🟠 | Record name as plain text (no link, no underline) | DashboardTaskItem |
| 5.2 No KPI target | 🟠 | Progress bar + target hidden; "Set target →" link (FP/Admin) | KpiCard |
| 6.1 Timezone | 🟠 | No visual treatment — data layer concern | — |
| 9.2 Invalid URL params | 🟠 | Silent fallback to defaults — no error visible | — |
| 1.1 Long task title | 🟡 | 2-line clamp with ellipsis; full title on hover tooltip | DashboardTaskItem |
| 1.2 $0 / negative KPI | 🟡 | "$0" normal; negative in red with parentheses "($1,234)" | KpiCard |
| 1.3 Long franchise name | 🟡 | Ellipsis truncation; full name in tooltip | Page header |
| 10.1 Progress bar >100% | 🔵 | Bar fills to exactly 100% width with success green; achievement text shows true value (e.g., "125%") in `--color-success-600`. Bar NEVER exceeds track. | KpiCard progress bar |
| 10.2 Trend zero prior period | 🟡 | "↑ New" instead of percentage; hidden if both $0 | TrendBadge |
| 2.5 Session expired | 🟡 | AlertBanner with "Refresh Page" button; controls dimmed | AlertBanner |

## 10. Edge Value Visual Treatments

Per-component rendering when data is null, zero, or negative.

| Component | Condition | Visual Treatment |
|-----------|-----------|-----------------|
| KpiCard | null value | Value shows "—" in `--color-neutral-500`. Trend badge hidden. Progress bar hidden. Card remains clickable (navigates to detail view). |
| KpiCard | negative value | Value rendered in `--color-danger-600` with parentheses, e.g., "($1,234)". |
| StatCard | null value | Value shows "—" in `--color-neutral-500`. Subtitle hidden. |
| FunnelStage | null count | Count shows "—". Trend indicator hidden. |
| PLRow | null amount | Amount shows "—". No color coding applied. |
| EstimatorPerformance | 0% close rate | "0%" displayed in `--color-danger-600`. |
| CollectionsGrid | null stats | Each stat shows "—" independently (other stats in the grid may still display values). |

## 11. Role-Based Access: Disabled and Hidden State Visuals

### Hidden Elements
Elements hidden due to role-based access control are **not rendered in the DOM**. Do NOT use CSS `display: none` — the element must not exist in the rendered output at all. This is enforced via conditional rendering (e.g., `{hasPermission && <Component />}`).

### Disabled Elements
Elements that are visible but non-interactive for the current role:
- Opacity: 0.5
- Cursor: `cursor-not-allowed`
- Attribute: `aria-disabled="true"`
- No hover/focus state changes

### FOM Read-Only Mode
When an FOM is viewing another franchise's dashboard in read-only context:
- All interactive elements (checkboxes, "Set target" links, action buttons) are **not rendered** (same as Hidden Elements above — not in DOM).
- All data displays (KPI values, charts, stat cards, P&L rows) render normally with full styling.
- My Tasks section is hidden entirely (per Decision #5).

## 12. Cross-Flow Consistency Check

| Shared Element | This Flow | Other Flow(s) | Consistent? | Notes |
|---------------|-----------|---------------|-------------|-------|
| Sidebar | AppSidebar, 240px fixed | All flows | ✅ | Shared component |
| Toast system | Bottom-right, 4-second auto-dismiss | All flows | ✅ | Shared component |
| Card pattern | 12px radius, 1px border, white bg | Funnel, Projects, Customers | ✅ | Same card base |
| Nav badge (overdue) | Red pill on Tasks nav item | Tasks flow sidebar | ✅ | Same count source |
| Focus ring | 2px solid #8BC34A | All flows | ✅ | Shared token |
| Empty state pattern | Centered text + CTA link | All flows | ✅ | Shared pattern |
| Error banner | Red left border, retry button | All flows | ✅ | Shared AlertBanner |
| TeamRow | Avatar + name + stats | Technicians flow | ✅ | Reuse same component |
| Period selector | ToggleGroup | Calendar flow (if applicable) | ⚠️ | Verify Calendar uses same period pattern |
| KPI card | New component | — | N/A | Dashboard-specific, no cross-flow reuse yet |
| Funnel mini | New compact version | Funnel flow (full version) | ⚠️ | Must visually relate to full funnel — same stage names, colors, arrow pattern |
