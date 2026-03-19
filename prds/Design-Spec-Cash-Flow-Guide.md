# Design Spec: Cash Flow Guide
## Generated from: PRD-Cash-Flow-Guide.md (Version 1.0)
## Design System Version: WOW OS v1 (shadcn/ui + Tailwind)
## Status: Draft

## 1. Design Overview

### Visual Direction
Financial health dashboard with a calm, confident tone. The Cash Flow Guide is a standalone financial check-in tool for Franchise Partners. Visual hierarchy prioritizes: True Cash Position hero card (largest, boldest) > Health Gauge (visual-first, color-coded arc) > Metric cards (Net Flow + Runway) > Projection Chart (data-dense, full width) > Quick Actions (action-oriented strip). The design uses triple-redundancy status indicators (color + text + icon) per WCAG guidelines. When health is good, the interface feels calm and reassuring; when health is critical, urgency surfaces through red accents and warning iconography without creating panic.

### Layout Pattern
Sidebar (shared WOW OS nav, fixed 240px on desktop) + Main content area. The Cash Flow Guide uses a single-column primary flow with embedded 2-column grids within sections. All content scrolls within the main area. A FranchisePicker dropdown replaces the franchise name in the header for FOM users.

### Tech Stack
Next.js 14 (App Router), Tailwind CSS, shadcn/ui, Radix UI primitives, Lucide React icons, Recharts (new dependency for charts).

---

## 2. Design Tokens Used

### Colors

| Token | Hex | Usage in this flow |
|-------|-----|-------------------|
| `--color-primary-500` | `#8BC34A` | CTAs, active states, focus rings, wizard progress, chart accent |
| `--color-primary-600` | `#7cb342` | CTA hover states |
| `--color-primary-50` | `#f0f9e8` | Active nav background, wizard completed step tint |
| `--color-success-600` | `#16a34a` | Healthy status, positive values (+$), gauge healthy fill, trend up |
| `--color-success-50` | `#f0fdf4` | Healthy status background tint |
| `--color-warning-500` | `#f59e0b` | Caution status, gauge caution fill, stale data indicator |
| `--color-warning-50` | `#fffbeb` | Caution status background tint |
| `--color-danger-600` | `#dc2626` | Critical status, negative values, gauge critical fill, error states, $0 threshold line |
| `--color-danger-50` | `#fef2f2` | Critical status background tint |
| `--color-neutral-50` | `#fafafa` | Page background, card body background |
| `--color-neutral-100` | `#f3f4f6` | Hover states, skeleton base, filter bar background |
| `--color-neutral-200` | `#e5e7eb` | Borders, dividers, table row borders |
| `--color-neutral-300` | `#d1d5db` | Input borders, disabled states |
| `--color-neutral-400` | `#9ca3af` | Placeholder text, empty state "---" |
| `--color-neutral-500` | `#6b7280` | Secondary text, labels, captions |
| `--color-neutral-700` | `#404040` | Primary body text, nav text, table cell text |
| `--color-neutral-900` | `#111827` | Headings, hero value text |
| `--color-info-500` | `#3b82f6` | Info toast |

### Typography

| Token | Spec | Usage |
|-------|------|-------|
| `--font-heading-xl` | 24px / 700 | Page titles ("Cash Flow Dashboard", "Recurring Transactions") |
| `--font-heading-lg` | 18px / 600 | Section titles (card headers, wizard step titles) |
| `--font-kpi-value` | 28px / 700 | TCP hero value |
| `--font-stat-value` | 22px / 700 | Secondary metric values (Net Flow, Runway) |
| `--font-body-md` | 14px / 400 | Body text, table cells, descriptions, nav items |
| `--font-body-md-medium` | 14px / 500 | Table column headers, button text, filter labels |
| `--font-body-sm` | 13px / 400 | Subtitles, wizard body text, toast messages |
| `--font-body-sm-medium` | 13px / 500 | Quick action button text, step indicator labels |
| `--font-caption` | 12px / 400 | Timestamps, chart axis labels, "Last Ritual" text, subtitles |
| `--font-caption-medium` | 12px / 500 | KPI labels (uppercase), status labels |
| `--font-overline` | 11px / 400 | Franchise label, badge text |
| `--font-overline-medium` | 11px / 500 | Table action labels, pagination info |

### Spacing

| Token | Value | Usage |
|-------|-------|-------|
| `--spacing-1` | 4px | Icon gaps, inline element spacing |
| `--spacing-2` | 8px | Metric label margin-top, badge padding, step indicator dot gap |
| `--spacing-3` | 12px | Table cell padding, filter bar gap, wizard step padding |
| `--spacing-4` | 16px | Inner card gaps, form field gaps, quick action strip padding |
| `--spacing-5` | 20px | Card inner padding (alias for p-5) |
| `--spacing-6` | 24px | Card padding (p-6), card-to-card gaps (gap-6), main content padding-y |
| `--spacing-8` | 32px | Section gaps (gap-8), main content padding-x, wizard section spacing |

### Shadows & Borders

| Token | Value | Usage |
|-------|-------|-------|
| `--shadow-sm` | `0 1px 2px rgba(0,0,0,0.05)` | Cards at rest, input fields |
| `--shadow-md` | `0 4px 6px rgba(0,0,0,0.1)` | Card hover, modal, toast |
| `--shadow-lg` | `0 2px 8px rgba(0,0,0,0.1)` | Franchise picker dropdown |
| `--border-sm` | `1px solid --color-neutral-200` | Cards, table rows, input borders |
| `--border-health-healthy` | `2px solid --color-success-600` | Healthy status card accent |
| `--border-health-caution` | `2px solid --color-warning-500` | Caution status card accent |
| `--border-health-critical` | `2px solid --color-danger-600` | Critical status card accent |
| `--radius-sm` | 6px | Buttons, badges, inputs |
| `--radius-md` | 8px | Table rows, toast, modal corners |
| `--radius-lg` | 12px | Cards, sections, wizard container |
| `--radius-full` | 50% | Gauge arc, status dots, avatars |
| `--radius-pill` | 10px | Status badges, filter pills |

---

## 3. Component Mapping

| UI Element | Design System Component | Variant/Config | New? | Notes |
|-----------|------------------------|----------------|------|-------|
| Sidebar | `AppSidebar` | Fixed, 240px | No | Shared across all flows |
| Sidebar nav item | `NavItem` | default / active | No | Shared component |
| Mobile hamburger | `MobileNavToggle` | --- | No | Shared component |
| TCP hero card | `CashPositionCard` | standard / negative / empty | **Yes** | New --- hero metric card specific to cash flow |
| Health gauge | `HealthGauge` | healthy / caution / critical / no-data | **Yes** | New --- arc gauge with color fill, text, icon |
| Metric card | `MetricCard` | net-flow / runway | **Yes** | New --- value + label + subtitle in compact card |
| Projection chart | `ProjectionChart` | populated / empty | **Yes** | New --- Recharts area chart with confidence bands |
| Quick actions strip | `QuickActions` | fp / fom | **Yes** | New --- horizontal button strip |
| Franchise picker | `FranchisePicker` | --- | **Yes** | New --- dropdown in header for FOM role |
| Wizard container | `RitualWizard` | --- | **Yes** | New --- multi-step wizard shell |
| Step indicator | `StepIndicator` | --- | **Yes** | New --- horizontal stepper with progress dots |
| Welcome step | `WelcomeStep` | fresh / returning | **Yes** | New --- wizard step 1 content |
| Bank balance step | `BankBalanceStep` | --- | **Yes** | New --- currency input with validation |
| Review recurring step | `ReviewRecurringStep` | has-items / empty | **Yes** | New --- toggle list for recurring transactions |
| One-off items step | `OneOffItemsStep` | --- | **Yes** | New --- add/remove one-time items |
| Summary step | `SummaryStep` | --- | **Yes** | New --- review and complete |
| Transaction table | `TransactionTable` | --- | **Yes** | New --- sortable data table for recurring items |
| Transaction form | `TransactionForm` | add / edit | **Yes** | New --- modal form for transaction CRUD |
| Bulk action bar | `BulkActionBar` | --- | **Yes** | New --- contextual action bar for multi-select |
| Filter bar | `FilterBar` | --- | **Yes** | New --- type + status filter controls |
| Widget | `CashFlowWidget` | populated / no-data / loading | **Yes** | New --- compact card for embedding |
| Toast | `Toast` | success / error / warning / info | No | Shared --- reuse from Dashboard Flow |
| ToastProvider | `ToastProvider` | wraps layout | No | Shared --- layout-level provider |
| useToast hook | `useToast` | --- | No | Shared --- imperative toast API |
| Skeleton card | shadcn `Skeleton` | card-sized | No | For loading states |
| Skeleton row | shadcn `Skeleton` | row-sized | No | For loading list items |
| Error banner | `AlertBanner` | error / session-expired | No | Shared component |
| Empty state | `EmptyState` | with message + optional CTA | No | Shared pattern |
| Confirmation dialog | shadcn `AlertDialog` | destructive | No | For delete confirmations |
| Modal | shadcn `Dialog` | --- | No | For transaction add/edit forms |
| Input | shadcn `Input` | currency / text / date | No | Extend with currency formatting |
| Select | shadcn `Select` | --- | No | For frequency picker, type picker |
| Button | shadcn `Button` | default / destructive / outline / ghost | No | Standard variants |
| Checkbox | shadcn `Checkbox` | --- | No | For bulk selection in table |
| Table | shadcn `Table` | sortable | Extend | Extend with sort headers and sticky column |
| Pagination | shadcn `Pagination` | --- | No | Standard pagination |

---

## 4. New Components

### CashPositionCard
**Rationale:** No existing component combines a hero-sized currency value + subtitle + "last reviewed" timestamp + health-aware border accent in a single card. This is the primary visual anchor of the Cash Flow Dashboard and has unique formatting rules (negative values in red, empty state with guidance text).

**Visual Spec:**
- Container: `--radius-lg`, `--border-sm`, background white, padding `--spacing-6`, `--shadow-sm`
- Top accent border: 3px top border, color matches health status (green/amber/red/neutral-200 for no-data)
- Label: `--font-caption-medium`, uppercase, `--color-neutral-500`, text "TRUE CASH POSITION"
- Value: `--font-kpi-value` (28px/700), `--color-neutral-900`. Negative values: `--color-danger-600`, formatted as `-$1,234.56`
- Subtitle: `--font-caption`, `--color-neutral-500`, "Bank: $X + Inflows: $X - Outflows: $X" breakdown
- Last reviewed: `--font-caption`, `--color-neutral-400`, "Last ritual: 3 days ago" with Lucide `Clock` icon (14px)
- Empty state: Value shows "---" in `--color-neutral-400`. Subtitle replaced with "Complete your first ritual to see your cash position" in `--font-body-sm`, `--color-neutral-500`. No accent border (neutral-200).

**States:**
- Default: White background, sm shadow, health-colored top border
- Hover: `--shadow-md`, slight border color intensification
- Focus: 2px `--color-primary-500` outline, offset 2px
- Loading: Skeleton pulse. Label visible, value area shows animated gray block (h-8 w-48). Subtitle shows gray block (h-4 w-64).
- Empty: "---" value with guidance subtitle
- Error: Hidden (error handled at page level via AlertBanner)

**Responsive:**
- Mobile (<640px): Full width, padding `--spacing-4`, value size unchanged (28px)
- Tablet (640-1023px): Full width, padding `--spacing-6`
- Desktop (>=1024px): Full width, padding `--spacing-6`

**Accessibility:**
- `role="region"`, `aria-label="True Cash Position"`
- Value announced with currency context: `aria-label="True Cash Position: $48,500.00"`
- Last reviewed timestamp uses `<time>` element with `datetime` attribute

---

### HealthGauge
**Rationale:** No existing component renders a semi-circular arc gauge with dynamic color fill, centered text label, and status icon. A pie chart or progress bar would not communicate "health meter" as intuitively. The arc gauge is a widely recognized pattern for health/score visualization.

**Visual Spec:**
- Container: `--radius-lg`, `--border-sm`, background white, padding `--spacing-6`, `--shadow-sm`
- Title: `--font-heading-lg` (18px/600), `--color-neutral-900`, "Cash Health"
- Gauge arc: SVG semicircle, 180-degree arc, stroke-width 12px, diameter 160px (desktop), 120px (mobile)
  - Track (background): `--color-neutral-200`
  - Fill: Animated from 0 to calculated position, 800ms ease-out
  - Critical (<4 weeks): `--color-danger-600` fill, arc fills 0-33%
  - Caution (4-8 weeks): `--color-warning-500` fill, arc fills 34-66%
  - Healthy (>=8 weeks): `--color-success-600` fill, arc fills 67-100%
- Center text (inside arc):
  - Status label: `--font-body-md-medium` (14px/500), color matches status (success-600/warning-500/danger-600)
  - Status text: "Healthy", "Caution", or "Critical"
- Icon: Lucide icon below arc, 20px, color matches status
  - Healthy: `ShieldCheck` in `--color-success-600`
  - Caution: `AlertTriangle` in `--color-warning-500`
  - Critical: `AlertOctagon` in `--color-danger-600`
- Subtitle: `--font-caption`, `--color-neutral-500`, "[X.X] weeks of runway"
- No-data state: Arc track only (no fill), center text "Not Available" in `--color-neutral-400`, subtitle "Complete your first ritual", icon `HelpCircle` in `--color-neutral-400`

**States:**
- Default: Arc rendered at calculated fill level with appropriate color
- Loading: Skeleton circle (diameter matches gauge) with pulse animation. Label visible, arc replaced with gray ring.
- No Data: Gray arc track, "Not Available" text, guidance subtitle
- Animating: On data load/update, arc fill animates from 0 to target (800ms ease-out)

**Responsive:**
- Mobile (<640px): Gauge diameter 120px. Container full width. Title and subtitle below gauge.
- Tablet (640-1023px): Gauge diameter 140px. Left column of 2-col grid.
- Desktop (>=1024px): Gauge diameter 160px. Left column of 2-col grid.

**Accessibility:**
- `role="meter"`, `aria-valuenow="[runway weeks]"`, `aria-valuemin="0"`, `aria-valuemax="52"`
- `aria-label="Cash Health: [Healthy/Caution/Critical], [X.X] weeks of runway"`
- Triple redundancy: color + text label + icon ensures status is communicated without relying on color alone (WCAG 1.4.1)
- No-data state: `aria-label="Cash Health: Not Available. Complete your first ritual."`

---

### MetricCard
**Rationale:** The dashboard shows secondary metrics (Net Weekly Cash Flow, Weeks of Runway) in a compact card format that differs from the Dashboard Flow KpiCard. These cards are simpler: value + label + optional subtitle, without progress bars or trend badges. Creating a separate component avoids overloading KpiCard with unused props.

**Visual Spec:**
- Container: `--radius-lg`, `--border-sm`, background white, padding `--spacing-6`, `--shadow-sm`
- Label: `--font-caption-medium`, uppercase, `--color-neutral-500`
- Value: `--font-stat-value` (22px/700)
  - Net Flow variant: Positive values `--color-success-600` with `+$` prefix. Negative values `--color-danger-600` with `-$` prefix. Zero `--color-neutral-700` as `$0.00`.
  - Runway variant: `--color-neutral-900` for value. "infinity" rendered as `--color-success-600`. "0.0 weeks" rendered as `--color-danger-600`.
- Subtitle: `--font-caption`, `--color-neutral-500`
  - Net Flow: "Weekly income - expenses"
  - Runway: "TCP / weekly expenses" or tooltip "No recurring expenses recorded" for infinity
- Empty state: Value "---" in `--color-neutral-400`. Subtitle: "Complete your first ritual"

**States:**
- Default: White background, sm shadow
- Hover: `--shadow-md`
- Focus: 2px `--color-primary-500` outline
- Loading: Skeleton pulse for value (h-6 w-24) and label (h-3 w-20)
- Empty: "---" with guidance subtitle

**Responsive:**
- Mobile (<640px): Full width, stacked vertically
- Tablet (640-1023px): Right column of 2-col grid, stacked vertically within column
- Desktop (>=1024px): Right column of 2-col grid, stacked vertically within column

**Accessibility:**
- `role="region"`, `aria-label="[label]: [value]"`
- Infinity symbol announced as "unlimited" via `aria-label`

---

### ProjectionChart
**Rationale:** No existing component renders a Recharts area chart with confidence bands, a $0 threshold line, and the specific empty/populated states required by the Cash Flow Guide. This is a new visualization type for the WOW OS design system. Recharts is chosen as the charting library (see Design Decision Log #1).

**Visual Spec:**
- Container: `--radius-lg`, `--border-sm`, background white, padding `--spacing-6`, `--shadow-sm`
- Title: `--font-heading-lg` (18px/600), `--color-neutral-900`, "13-Week Projection"
- Chart area: Recharts `AreaChart`, responsive via `ResponsiveContainer`
  - X-axis: Week labels ("Wk 1" through "Wk 13"), `--font-caption`, `--color-neutral-500`
  - Y-axis: Dollar amounts, auto-scaled, `--font-caption`, `--color-neutral-500`, formatted as `$Xk`
  - Center line: 2px stroke, `--color-primary-500`
  - Confidence band: Recharts `Area` with fill `--color-primary-500` at 10% opacity, no stroke
  - $0 threshold: Dashed line, 1px, `--color-danger-600`, label "$0" at right end
  - Grid lines: Horizontal only, `--color-neutral-100`, 1px dashed
  - Tooltip: On hover, show week label + projected amount + confidence range. White background, `--shadow-md`, `--radius-md`, padding `--spacing-3`
- Chart height: 280px (desktop), 220px (tablet), 180px (mobile)
- Empty state: Chart area replaced with centered message. Lucide `BarChart3` icon (48px, `--color-neutral-300`). Text "Complete your first ritual to see projections" in `--font-body-sm`, `--color-neutral-500`.
- Mobile truncation: Show 8 weeks with "See full projection" link (`--font-body-sm`, `--color-primary-500`) below chart

**States:**
- Default: Fully rendered chart with data
- Loading: Skeleton block matching chart dimensions with pulse animation. Title visible.
- Empty: Icon + message centered in chart area
- Error: Inline error text "Unable to load projections" with "Retry" link
- Hover: Tooltip appears at cursor position showing week details

**Responsive:**
- Mobile (<640px): Full width, 180px height, 8-week view, axis labels rotated 45 degrees. "See full projection" link below.
- Tablet (640-1023px): Full width, 220px height, all 13 weeks
- Desktop (>=1024px): Full width, 280px height, all 13 weeks

**Accessibility:**
- `role="img"`, `aria-label="13-week cash projection chart showing [summary]"`
- Hidden data table alternative: A visually hidden `<table>` with all 13 weeks of data is rendered for screen readers
- Chart is decorative for keyboard users; data table provides the accessible content
- Tooltip content announced via `aria-live="polite"` region

---

### QuickActions
**Rationale:** The dashboard needs a horizontal strip of primary action buttons ("Start Ritual", "Manage Transactions") that adapts to role context (hidden for FOM). No existing action bar pattern combines role-conditional rendering with this specific layout.

**Visual Spec:**
- Container: `--radius-lg`, `--border-sm`, background `--color-neutral-50`, padding `--spacing-4`, flex row, gap `--spacing-4`, justify-center
- Buttons: shadcn `Button`, `--radius-sm`
  - "Start Ritual": `variant="default"`, `--color-primary-500` background, white text, Lucide `Play` icon (16px) left-aligned. Navigates to `/cash-flow/ritual`.
  - "Manage Transactions": `variant="outline"`, `--color-primary-500` border and text, Lucide `List` icon (16px) left-aligned. Navigates to `/cash-flow/recurring`.
- FOM mode: Entire QuickActions component is not rendered (conditional render, not CSS hide)

**States:**
- Default: Buttons at rest
- Hover: Default button darkens to `--color-primary-600`. Outline button fills with `--color-primary-50` background.
- Focus: 2px `--color-primary-500` outline on focused button
- Disabled: Not applicable (buttons always active for FP)

**Responsive:**
- Mobile (<640px): Buttons stack vertically, full width
- Tablet (640-1023px): Horizontal row, buttons auto-width
- Desktop (>=1024px): Horizontal row, buttons auto-width, centered

**Accessibility:**
- Each button has descriptive `aria-label`: "Start weekly cash flow ritual", "Manage recurring transactions"
- `role="navigation"`, `aria-label="Quick actions"`

---

### FranchisePicker
**Rationale:** FOM users need to switch between franchises they manage. The picker replaces the franchise name in the page header. No existing franchise selector component exists in the design system. A dropdown in the header is chosen over a sidebar selector (see Design Decision Log #7).

**Visual Spec:**
- Container: Inline in page header, replacing franchise name text
- Trigger: shadcn `Select` trigger, `--font-body-md-medium`, `--color-neutral-700`, Lucide `ChevronDown` icon (16px)
  - Width: auto, min-width 200px, max-width 320px
  - Border: `--border-sm`, `--radius-sm`
  - Background: white
- Dropdown: shadcn `SelectContent`, `--shadow-lg`, `--radius-md`, max-height 320px with scroll
  - Items: `--font-body-md`, `--color-neutral-700`, padding `--spacing-3` vertical, `--spacing-4` horizontal
  - Active item: `--color-primary-50` background, `--color-primary-500` left border (2px)
  - Hover: `--color-neutral-100` background
- Sorting: Alphabetical by franchise name
- Default: First franchise alphabetically
- Empty state (0 franchises): Select trigger shows "No franchises assigned" in `--color-neutral-400`, disabled
- URL sync: Selection updates `?franchise=fr_id` parameter

**States:**
- Default (closed): Trigger shows selected franchise name with chevron
- Open: Dropdown visible with franchise list, shadow-lg
- Hover (item): `--color-neutral-100` background
- Focus: 2px `--color-primary-500` outline on trigger
- Loading: Trigger shows skeleton text (w-32 h-4 pulse)
- Empty: "No franchises assigned. Contact your administrator." in dropdown

**Responsive:**
- Mobile (<640px): Full width of header area, dropdown full width
- Tablet (640-1023px): Auto-width, max 280px
- Desktop (>=1024px): Auto-width, max 320px

**Accessibility:**
- `role="combobox"`, `aria-label="Select franchise"`
- `aria-expanded` toggled on open/close
- `aria-activedescendant` tracks highlighted option
- Keyboard: Arrow keys navigate options, Enter selects, Escape closes
- Screen reader: "Viewing [franchise name]. Select franchise, [N] options available."

---

### RitualWizard
**Rationale:** Multi-step wizard with linear progression, back navigation, session persistence, and step-specific content is a complex interaction pattern not covered by any existing component. The wizard shell manages step state, persistence to sessionStorage, and navigation logic.

**Visual Spec:**
- Container: Centered, `max-w-2xl` (672px), margin auto, padding `--spacing-8` vertical
- Background: `--color-neutral-50` page background
- Wizard card: `--radius-lg`, `--border-sm`, background white, padding `--spacing-6`, `--shadow-sm`
- Navigation buttons (bottom):
  - Layout: Flex row, justify-between, padding-top `--spacing-6`, border-top `--border-sm`
  - "Back" button: `variant="ghost"`, `--color-neutral-500`, Lucide `ArrowLeft` icon (16px). Hidden on Step 1.
  - "Next" / "Complete Ritual" button: `variant="default"`, `--color-primary-500` background, white text
  - "Next" shows Lucide `ArrowRight` icon (16px) right-aligned
  - "Complete Ritual" shows Lucide `CheckCircle` icon (16px) left-aligned (Step 5 only)
- Abandon behavior: Navigating away triggers confirmation dialog: "Leave ritual? Your progress will be saved for 24 hours."

**States:**
- Fresh start: All steps uncompleted, begin at Step 1
- Resume: SessionStorage state found, resume at last step, show "Welcome back" message on Step 1
- Completing: Step 5 "Complete Ritual" button shows loading spinner, disabled
- Completed: Redirect to Dashboard with success toast "Ritual completed! Your cash position has been updated."

**Responsive:**
- Mobile (<640px): Full width with `--spacing-4` padding. Wizard card flush to edges (no horizontal margin).
- Tablet (640-1023px): `max-w-xl` (576px) centered
- Desktop (>=1024px): `max-w-2xl` (672px) centered

**Accessibility:**
- `role="form"`, `aria-label="Weekly cash flow ritual"`
- Step navigation announced via `aria-live="polite"`: "Step [N] of 5: [step name]"
- Enter key advances to next step (when form is valid)
- Escape key opens abandon confirmation dialog
- Focus trapped within wizard card

---

### StepIndicator
**Rationale:** Horizontal stepper showing current step, completed steps, and remaining steps with connecting lines is a common wizard pattern but not available in shadcn/ui. This component is specific to the 5-step ritual flow.

**Visual Spec:**
- Container: Flex row, justify-between, padding-bottom `--spacing-6`, margin-bottom `--spacing-6`, border-bottom `--border-sm`
- Steps: 5 circles connected by lines
  - Circle: 32px diameter, centered step number (`--font-body-md-medium`)
  - Completed: `--color-primary-500` fill, white number, Lucide `Check` icon (16px) replaces number
  - Current: `--color-primary-500` border (2px), white fill, `--color-primary-500` number
  - Upcoming: `--color-neutral-300` border (1px), white fill, `--color-neutral-400` number
  - Connecting line: 2px height, `--color-primary-500` (between completed steps), `--color-neutral-200` (between upcoming steps)
- Step labels (below circles): `--font-caption`, `--color-neutral-500` (upcoming), `--color-neutral-700` (current), `--color-primary-500` (completed)
  - Labels: "Welcome", "Balance", "Recurring", "One-Offs", "Summary"
- Mobile collapse: Circles + lines replaced with text "Step 2 of 5: Bank Balance" in `--font-body-sm-medium`, `--color-neutral-700`

**States:**
- Step N active: Steps 1 through N-1 show completed state, step N shows current state, steps N+1 through 5 show upcoming state
- All completed (Step 5): Steps 1-4 completed, Step 5 current

**Responsive:**
- Mobile (<640px): Collapsed to "Step N of 5: [name]" text. No circles or lines.
- Tablet (640-1023px): Full stepper with circles, shorter connecting lines
- Desktop (>=1024px): Full stepper with circles and labels

**Accessibility:**
- `role="navigation"`, `aria-label="Ritual progress"`
- Each step: `aria-current="step"` on current step
- Completed steps: `aria-label="Step [N]: [name], completed"`
- Current step: `aria-label="Step [N]: [name], current"`
- Upcoming steps: `aria-label="Step [N]: [name], upcoming"`
- Screen reader announces step change via `aria-live="polite"` on the container

---

### WelcomeStep
**Rationale:** Step 1 of the ritual wizard has unique content: last ritual summary, current TCP, and a motivational CTA. This is specific to the wizard flow.

**Visual Spec:**
- Title: `--font-heading-lg`, `--color-neutral-900`, "Welcome to Your Weekly Check-In"
- Returning user subtitle: `--font-body-sm`, `--color-neutral-500`, "Your last ritual was [X days ago]"
- Current snapshot card: `--radius-md`, `--color-neutral-50` background, padding `--spacing-4`
  - TCP: `--font-stat-value`, `--color-neutral-900`
  - Health: Status badge with color dot + text
  - Runway: `--font-body-md`, `--color-neutral-500`
- Fresh user (no prior ritual): Subtitle "This is your first check-in. Let's set up your cash position." No snapshot card.
- CTA: Implicit (user clicks "Next" in wizard navigation)

**States:**
- Fresh: No snapshot card, welcoming first-time message
- Returning: Shows last ritual summary with snapshot card

**Accessibility:**
- Heading is `<h2>` for proper hierarchy within wizard
- Snapshot values have `aria-label` with full currency/status text

---

### BankBalanceStep
**Rationale:** Step 2 requires a specialized currency input with pre-fill, real-time formatting, and validation. The input behavior (format on blur, strip formatting on focus) is specific to this wizard step.

**Visual Spec:**
- Title: `--font-heading-lg`, `--color-neutral-900`, "Update Your Bank Balance"
- Instructions: `--font-body-sm`, `--color-neutral-500`, "Enter your current bank account balance as of today."
- Input: shadcn `Input`, large size variant
  - Width: 100%, max-width 320px
  - Height: 48px
  - Font: `--font-stat-value` (22px/700) for the value inside
  - Prefix: "$" symbol in `--color-neutral-500`, positioned inside input left
  - Border: `--border-sm`, `--radius-sm`
  - Pre-filled: Last known bank balance, formatted as currency
  - On focus: Strip formatting, show raw number, cursor at end
  - On blur: Format as currency with commas and 2 decimal places
- Validation error: Below input, `--font-caption`, `--color-danger-600`, "Enter a valid dollar amount"
- Last balance reference: Below input, `--font-caption`, `--color-neutral-400`, "Previous balance: $XX,XXX.XX"

**States:**
- Default: Pre-filled with last balance (formatted)
- Focus: Raw number, blue border (`--color-primary-500`)
- Error: Red border (`--color-danger-600`), error message visible
- Valid: Green border (`--color-success-600`) briefly on blur when valid, then reverts to default border

**Responsive:**
- Mobile (<640px): Input full width, 48px height maintained for easy touch input
- Tablet/Desktop: Input max-width 320px

**Accessibility:**
- `<label>` explicitly associated with input via `htmlFor`
- `aria-describedby` links to instruction text and error message
- `inputmode="decimal"` for mobile numeric keyboard
- `aria-invalid="true"` when validation fails

---

### ReviewRecurringStep
**Rationale:** Step 3 lists all recurring transactions with toggle switches to confirm or skip each one for the current week. This is a unique interaction pattern not replicated elsewhere.

**Visual Spec:**
- Title: `--font-heading-lg`, `--color-neutral-900`, "Review Recurring Transactions"
- Instructions: `--font-body-sm`, `--color-neutral-500`, "Confirm which recurring transactions should be included this week."
- Transaction list: Flex column, gap `--spacing-3`
  - Each item: `--radius-md`, `--border-sm`, padding `--spacing-3` `--spacing-4`, flex row, justify-between, align-center
  - Left side: Name (`--font-body-md`, `--color-neutral-700`), Amount + Frequency (`--font-caption`, `--color-neutral-500`)
  - Right side: shadcn `Switch` toggle
  - Income items: Small green dot (8px) before name
  - Expense items: Small red dot (8px) before name
- Summary footer: Border-top `--border-sm`, padding-top `--spacing-4`
  - "Included: [N] transactions totaling $X,XXX" in `--font-body-sm`, `--color-neutral-700`
- Empty state (no transactions): "No recurring transactions set up yet." with link "Add transactions after completing your ritual" in `--color-primary-500`

**States:**
- Default: All active transactions toggled on
- Item toggled off: Opacity 0.5, amount struck through
- Loading: Skeleton rows (5 rows, pulse animation)
- Empty: Message with link

**Responsive:**
- Mobile (<640px): Full width, items stack name/amount vertically, switch remains right-aligned
- Tablet/Desktop: Items in single row layout

**Accessibility:**
- Each switch: `aria-label="Include [transaction name] ($[amount] [frequency])"`
- List: `role="list"` with `role="listitem"` per transaction
- Summary updated via `aria-live="polite"`

---

### OneOffItemsStep
**Rationale:** Step 4 allows adding and removing one-time income or expense items for the current week. This is a dynamic list builder not available as an existing component.

**Visual Spec:**
- Title: `--font-heading-lg`, `--color-neutral-900`, "One-Off Items This Week"
- Instructions: `--font-body-sm`, `--color-neutral-500`, "Add any one-time income or expenses expected this week. This step is optional."
- Add item row: Flex row, gap `--spacing-3`
  - Type selector: shadcn `Select`, options "Income" / "Expense", width 120px
  - Description: shadcn `Input`, placeholder "Description", flex-grow
  - Amount: shadcn `Input`, placeholder "$0.00", width 120px, `inputmode="decimal"`
  - Add button: shadcn `Button` icon-only, Lucide `Plus` (16px), `--color-primary-500`, `--radius-sm`
- Added items list: Below add row, flex column, gap `--spacing-2`
  - Each item: `--radius-md`, `--color-neutral-50` background, padding `--spacing-3`, flex row, align-center
  - Type badge: "Income" in `--color-success-600` or "Expense" in `--color-danger-600`, `--font-overline-medium`
  - Description: `--font-body-md`, `--color-neutral-700`, flex-grow
  - Amount: `--font-body-md-medium`, income in `--color-success-600`, expense in `--color-danger-600`
  - Remove button: Lucide `X` icon (16px), `--color-neutral-400`, hover `--color-danger-600`
- Empty state (no items added): "No one-off items added. Click Next to skip this step." in `--font-body-sm`, `--color-neutral-500`

**States:**
- Default: Add row visible, no items
- With items: Add row + list of items
- Validation error on add: Red border on invalid field, error caption below
- Removing item: Item fades out (opacity 0, 200ms), then collapses height

**Responsive:**
- Mobile (<640px): Add row fields stack vertically. Type and amount on first row, description full width below, add button full width.
- Tablet/Desktop: Add row fields in single horizontal row

**Accessibility:**
- Add row: `aria-label="Add one-off item"`
- Remove button: `aria-label="Remove [description]"`
- List updates announced via `aria-live="polite"`

---

### SummaryStep
**Rationale:** Step 5 shows the updated TCP, health status, mini projection chart, and the "Complete Ritual" action. This summary view combines multiple data visualizations in a step-specific layout.

**Visual Spec:**
- Title: `--font-heading-lg`, `--color-neutral-900`, "Review & Complete"
- Summary card: `--radius-lg`, `--color-neutral-50` background, padding `--spacing-6`
  - Updated TCP: `--font-kpi-value`, `--color-neutral-900` (or `--color-danger-600` if negative)
  - Label: `--font-caption-medium`, uppercase, "UPDATED CASH POSITION"
  - Health status: Inline badge with color dot (12px) + status text (`--font-body-md-medium`)
  - Runway: `--font-body-md`, `--color-neutral-500`
- Change indicator: Below TCP value, `--font-body-sm`
  - Positive change: `--color-success-600`, "+$X,XXX from last ritual"
  - Negative change: `--color-danger-600`, "-$X,XXX from last ritual"
  - No change: `--color-neutral-500`, "No change from last ritual"
- Mini projection: Smaller Recharts `AreaChart` (height 160px), simplified (no tooltip, no grid, just line + band)
- "Complete Ritual" button: In wizard navigation bar (not in step content)

**States:**
- Default: Full summary visible
- Completing: "Complete Ritual" button shows spinner, disabled. All content remains visible.
- Completed: Redirect to dashboard (handled by wizard shell)

**Responsive:**
- Mobile (<640px): Full width, mini projection at 120px height
- Tablet/Desktop: Standard layout, projection at 160px height

**Accessibility:**
- Summary values have `aria-label` with full context
- Change indicator: `aria-label="Cash position changed by [+/-]$X,XXX since last ritual"`

---

### TransactionTable
**Rationale:** The Recurring Transactions page requires a full data table with sorting, filtering, bulk selection, inline status badges, and role-conditional action columns. While shadcn provides a `Table` primitive, the Cash Flow table needs sticky first column on mobile, sort indicators, and conditional action rendering. This extends the base table with flow-specific behavior.

**Visual Spec:**
- Container: `--radius-lg`, `--border-sm`, background white, `--shadow-sm`, overflow hidden
- Header row: `--color-neutral-50` background, `--font-body-md-medium`, `--color-neutral-500`, padding `--spacing-3`, sticky top
  - Sortable columns: Lucide `ArrowUpDown` icon (14px) after text. Active sort: `ArrowUp` or `ArrowDown` in `--color-primary-500`
- Columns: Checkbox (32px) | Name (flex-grow, min 200px) | Type (100px) | Amount (120px) | Frequency (120px) | Next Occurrence (140px) | Status (100px) | Actions (80px)
- Body rows: `--font-body-md`, `--color-neutral-700`, padding `--spacing-3`, border-bottom `--border-sm`
  - Hover: `--color-neutral-50` background
  - Selected (checkbox): `--color-primary-50` background
  - Type badge: `--radius-pill`, padding 2px 8px
    - Income: `--color-success-50` background, `--color-success-600` text
    - Expense: `--color-danger-50` background, `--color-danger-600` text
  - Status badge: `--radius-pill`, padding 2px 8px
    - Active: `--color-success-50` background, `--color-success-600` text
    - Paused: `--color-neutral-100` background, `--color-neutral-500` text
  - Amount: `--font-body-md-medium`, right-aligned
  - Actions (FP only): Lucide `Pencil` (14px, `--color-neutral-500`, hover `--color-primary-500`) + Lucide `Trash2` (14px, `--color-neutral-500`, hover `--color-danger-600`)
- Pagination: Below table, flex row, justify-between
  - Left: "Showing 1-20 of 47" in `--font-overline`, `--color-neutral-500`
  - Right: shadcn `Pagination` component, 20 items per page
- FOM mode: Checkbox column hidden, Actions column hidden. Table is read-only.
- Mobile horizontal scroll: Table scrolls horizontally. First column (Name) is sticky with white background and right shadow.

**States:**
- Default: Populated table with all columns
- Loading: Skeleton rows (10 rows, pulse animation). Header visible.
- Empty: Full-width centered empty state within table container. Lucide `FileText` icon (48px, `--color-neutral-300`). Text "No recurring transactions yet." CTA "Add your first transaction" as link in `--color-primary-500`.
- Error: Inline error text "Unable to load transactions" with "Retry" link
- Sorting: Active sort column header highlighted, arrow icon changes direction
- Row selected: Primary-50 background, checkbox checked

**Responsive:**
- Mobile (<640px): Horizontal scroll. Sticky first column (Name). Hide Frequency and Next Occurrence columns. Actions revealed via swipe or overflow menu (Lucide `MoreVertical`).
- Tablet (640-1023px): All columns visible, horizontal scroll if needed
- Desktop (>=1024px): All columns visible, no scroll needed

**Accessibility:**
- `role="table"` with `aria-label="Recurring transactions"`
- Sort buttons: `aria-sort="ascending"` / `"descending"` / `"none"`
- Checkbox: `aria-label="Select [transaction name]"`
- Actions: `aria-label="Edit [name]"`, `aria-label="Delete [name]"`
- Keyboard: Arrow keys navigate rows when table focused, Enter opens edit modal for focused row, Space toggles checkbox
- Mobile sticky column: `aria-hidden` on shadow overlay

---

### TransactionForm
**Rationale:** Adding and editing recurring transactions uses a modal form with the same fields. A modal is chosen over inline editing (see Design Decision Log #6) for consistent desktop/mobile behavior.

**Visual Spec:**
- Modal: shadcn `Dialog`, `--radius-lg`, `--shadow-lg`, max-width 480px, padding `--spacing-6`
- Title: `--font-heading-lg`, `--color-neutral-900`, "Add Transaction" or "Edit Transaction"
- Form fields (flex column, gap `--spacing-4`):
  - Name: shadcn `Input`, label "Transaction Name", placeholder "e.g., Payroll"
  - Type: shadcn `Select`, label "Type", options "Income" / "Expense"
  - Amount: shadcn `Input`, label "Amount", "$" prefix, `inputmode="decimal"`, placeholder "0.00"
  - Frequency: shadcn `Select`, label "Frequency", options "Weekly" / "Bi-weekly" / "Monthly" / "Quarterly" / "Annually"
  - Start Date: shadcn date picker, label "Start Date"
- Validation: Inline, below each field. `--font-caption`, `--color-danger-600`. Validation fires on blur and on submit attempt.
- Footer: Flex row, gap `--spacing-3`, justify-end
  - Cancel: shadcn `Button` `variant="ghost"`, "Cancel"
  - Submit: shadcn `Button` `variant="default"`, "Add Transaction" / "Save Changes"
- Loading (submit): Submit button shows spinner, disabled. Cancel remains active.

**States:**
- Add mode: Empty form, "Add Transaction" title and submit label
- Edit mode: Pre-filled form, "Edit Transaction" title, "Save Changes" submit label
- Validation error: Red borders on invalid fields, error messages visible
- Submitting: Spinner on submit button, form fields disabled

**Responsive:**
- Mobile (<640px): Modal becomes full-screen sheet (slides up from bottom), `--radius-lg` on top corners only
- Tablet/Desktop: Centered modal with backdrop

**Accessibility:**
- Focus trapped within modal
- `aria-labelledby` points to title
- `aria-describedby` for form instructions
- Escape closes modal
- Tab cycles through form fields and buttons
- On open: focus moves to first field (Name)
- On close: focus returns to trigger element

---

### BulkActionBar
**Rationale:** When multiple transactions are selected via checkboxes, a contextual action bar appears with bulk operations (Pause, Resume, Delete). This is a common data table pattern not available in shadcn.

**Visual Spec:**
- Container: Sticky bottom of table container, `--color-neutral-900` background, padding `--spacing-3` `--spacing-4`, flex row, justify-between, align-center, `--radius-md` top corners
  - Appears with slide-up animation (200ms ease-out) when 1+ rows selected
  - Disappears with slide-down animation (200ms ease-in) when 0 rows selected
- Left: "[N] selected" in `--font-body-sm-medium`, white text
- Right: Action buttons, gap `--spacing-3`
  - "Pause": shadcn `Button` `variant="outline"`, white border, white text, Lucide `Pause` (14px)
  - "Resume": shadcn `Button` `variant="outline"`, white border, white text, Lucide `Play` (14px)
  - "Delete": shadcn `Button` `variant="destructive"`, Lucide `Trash2` (14px)
- Confirmation: Delete triggers shadcn `AlertDialog`: "Delete [N] transactions? This cannot be undone."

**States:**
- Hidden: 0 rows selected
- Visible: 1+ rows selected, slide-up animation
- Confirming delete: AlertDialog open

**Responsive:**
- Mobile (<640px): Buttons stack horizontally, text size unchanged, container full width
- Tablet/Desktop: Single row layout

**Accessibility:**
- `role="toolbar"`, `aria-label="Bulk actions for [N] selected transactions"`
- Buttons have descriptive `aria-label`: "Pause [N] selected transactions"
- Slide animation: `prefers-reduced-motion` disables animation, shows/hides instantly

---

### FilterBar
**Rationale:** The Recurring Transactions page needs a filter strip for type (All/Income/Expense) and status (All/Active/Paused). This is a simple toggle filter not requiring a full filter panel component.

**Visual Spec:**
- Container: Flex row, gap `--spacing-4`, align-center, margin-bottom `--spacing-4`
- Type filter: shadcn `ToggleGroup`, single-select
  - Options: "All", "Income", "Expense"
  - Active: `--color-primary-500` background, white text
  - Inactive: `--color-neutral-100` background, `--color-neutral-700` text
  - `--radius-sm`, padding 6px 12px, `--font-body-sm-medium`
- Status filter: shadcn `ToggleGroup`, single-select
  - Options: "All", "Active", "Paused"
  - Same visual treatment as type filter
- Search (optional future): shadcn `Input` with Lucide `Search` icon prefix, placeholder "Search transactions...", flex-grow

**States:**
- Default: "All" selected for both filters
- Filtered: Active filter highlighted with primary-500

**Responsive:**
- Mobile (<640px): Filters stack vertically, each full width
- Tablet/Desktop: Horizontal row

**Accessibility:**
- Each toggle group: `role="radiogroup"`, `aria-label="Filter by type"` / `"Filter by status"`
- Active filter: `aria-pressed="true"`

---

### CashFlowWidget
**Rationale:** A compact, self-contained card for embedding in other dashboards or sidebars. Shows TCP, health status, and last reviewed date at a glance. No existing widget component matches this specific data display.

**Visual Spec:**
- Container: `--radius-lg`, `--border-sm`, background white, padding `--spacing-4`, min-width 280px, `--shadow-sm`, cursor pointer (entire card is clickable)
- Title row: Flex row, justify-between, align-center
  - "Cash Flow" in `--font-body-md-medium`, `--color-neutral-700`
  - Lucide `TrendingUp` icon (16px, `--color-primary-500`)
- TCP value: `--font-stat-value` (22px/700), `--color-neutral-900`. Negative: `--color-danger-600`.
- Health badge: Inline, flex row, align-center, gap `--spacing-1`
  - Dot: 8px circle, color matches status
  - Text: `--font-caption-medium`, color matches status
  - "Healthy" / "Caution" / "Critical"
- Last reviewed: `--font-caption`, `--color-neutral-400`, "Reviewed 3 days ago"
- Click: Navigate to `/cash-flow/dashboard`
- No-data state: TCP shows "---" in `--color-neutral-400`. Health badge: gray dot + "Not Available". Last reviewed: "No rituals completed".

**States:**
- Populated: Full data display
- No Data: "---" value, gray status, guidance text
- Loading: Skeleton blocks for value (h-6 w-24), badge (h-3 w-16), timestamp (h-3 w-20)
- Hover: `--shadow-md`, border color darkens slightly
- Focus: 2px `--color-primary-500` outline

**Responsive:**
- Min-width 280px enforced. Widget scales to fill container width.
- Internal layout unchanged across breakpoints (always compact).

**Accessibility:**
- `role="link"`, `aria-label="Cash Flow: [TCP value], [health status]. Click to view dashboard."`
- Keyboard: Focusable via Tab, Enter/Space activates navigation
- Health status communicated via text (not color alone)

---

## 5. Page-by-Page Visual Specs

### Dashboard Page (`/cash-flow/dashboard`)

**Layout:** Single column primary flow with embedded grids

**Background:** `--color-neutral-50`

**Structure (top to bottom):**

1. **Page Header**
   - Layout: Flex row, justify-between, align-center, margin-bottom `--spacing-6`
   - Left: "Cash Flow Dashboard" in `--font-heading-xl`, `--color-neutral-900`
   - Subtitle: Franchise name in `--font-body-sm`, `--color-neutral-500` (FP) or FranchisePicker (FOM)
   - Right: "Last ritual: [relative time]" in `--font-caption`, `--color-neutral-400`, Lucide `Clock` icon

2. **Hero TCP Card** (full width)
   - `CashPositionCard` component, full width
   - Margin-bottom: `--spacing-6`

3. **Health + Metrics Row** (2-column grid)
   - Grid: `grid-cols-1 lg:grid-cols-3`, gap `--spacing-6`
   - Left (lg:col-span-1): `HealthGauge` component
   - Right (lg:col-span-2): 2-column inner grid, gap `--spacing-6`
     - `MetricCard` (Net Weekly Cash Flow)
     - `MetricCard` (Weeks of Runway)
   - Margin-bottom: `--spacing-8`

4. **Projection Chart** (full width)
   - `ProjectionChart` component, full width
   - Margin-bottom: `--spacing-6`

5. **Quick Actions Strip** (full width)
   - `QuickActions` component, full width
   - FOM mode: Not rendered

### Ritual Wizard Page (`/cash-flow/ritual`)

**Layout:** Centered content, single column

**Background:** `--color-neutral-50`

**Structure:**

1. **Page Header**
   - "Weekly Ritual" in `--font-heading-xl`, `--color-neutral-900`, centered
   - Margin-bottom: `--spacing-6`

2. **Step Indicator**
   - `StepIndicator` component, full width within `max-w-2xl` container
   - Margin-bottom: `--spacing-6`

3. **Wizard Card**
   - `RitualWizard` component containing step content
   - Step 1: `WelcomeStep`
   - Step 2: `BankBalanceStep`
   - Step 3: `ReviewRecurringStep`
   - Step 4: `OneOffItemsStep`
   - Step 5: `SummaryStep`
   - Step transition: 300ms ease slide (outgoing slides left, incoming slides from right)

4. **Navigation Buttons**
   - Within wizard card, bottom, separated by border-top

**Route Guard:** FOM users redirected to `/cash-flow/dashboard` with info toast "The ritual is available to Franchise Partners only."

### Recurring Transactions Page (`/cash-flow/recurring`)

**Layout:** Full width content area

**Background:** `--color-neutral-50`

**Structure:**

1. **Page Header**
   - Layout: Flex row, justify-between, align-center, margin-bottom `--spacing-6`
   - Left: "Recurring Transactions" in `--font-heading-xl`, `--color-neutral-900`
   - Subtitle: Franchise name or FranchisePicker (FOM)
   - Right (FP only): "Add Transaction" shadcn `Button` `variant="default"`, Lucide `Plus` icon (16px). Opens `TransactionForm` modal in add mode.
   - Right (FOM): Not rendered

2. **Filter Bar**
   - `FilterBar` component, full width
   - Margin-bottom: `--spacing-4`

3. **Data Table**
   - `TransactionTable` component, full width
   - Includes inline pagination

4. **Bulk Action Bar** (conditional)
   - `BulkActionBar` component, sticky bottom
   - Visible only when 1+ rows selected (FP only)
   - FOM: Checkbox column not rendered, bulk actions not available

---

## 6. Interaction States

### Loading States

- **Dashboard initial load:** Skeleton screens per section. CashPositionCard skeleton (label visible, value area pulsing gray). HealthGauge skeleton (gray ring). MetricCards skeleton (2 gray blocks). ProjectionChart skeleton (gray rectangle at chart height). QuickActions render immediately (no data dependency). Granular per-section loading means fast sections appear first (see Design Decision Log #8).
- **Ritual wizard load:** StepIndicator renders immediately. Step content area shows skeleton appropriate to current step. Step 3 (Review Recurring) shows skeleton rows for transaction list.
- **Recurring transactions load:** FilterBar renders immediately (static). Table shows 10 skeleton rows with header visible. Pagination hidden until data loads.
- **Widget load:** Skeleton blocks for value, badge, and timestamp. Container and title visible.

### Empty States

Per section, following pattern: centered icon + text + optional CTA link.

- **Dashboard (no ritual completed):**
  - CashPositionCard: Value "---", subtitle "Complete your first ritual to see your cash position"
  - HealthGauge: Gray arc, "Not Available", "Complete your first ritual"
  - MetricCards: Value "---", subtitle "Complete your first ritual"
  - ProjectionChart: Lucide `BarChart3` icon (48px) + "Complete your first ritual to see projections"
  - QuickActions: "Start Ritual" button gets accent treatment (pulse border animation, `--color-primary-500`)
- **Recurring Transactions (no transactions):**
  - Table area: Lucide `FileText` icon (48px) + "No recurring transactions yet. Add your first one to get started." + "Add Transaction" CTA link
- **Recurring Transactions (filter returns 0 results):**
  - Table area: "No transactions match your filters." + "Clear filters" link
- **Ritual Step 3 (no recurring transactions):**
  - "No recurring transactions set up yet. Add transactions after completing your ritual."
- **Widget (no data):**
  - TCP: "---", Health: gray dot + "Not Available", Last reviewed: "No rituals completed"

### Error States

- **Full API failure (Dashboard):** `AlertBanner` at top of main content. Red left border (4px `--color-danger-600`). Lucide `XCircle` icon (16px). Text: "Unable to load dashboard data. Check your connection and try again." "Retry" button. All sections show dimmed previous data (if cached) at opacity 0.4 or empty states.
- **Partial failure (Dashboard):** Inline error within affected section only. Text: "Unable to load [section name]." "Retry" link in `--color-primary-500`. Other sections display normally.
- **Ritual save failure:** Error toast: "Unable to save your ritual. Your progress has been saved locally." Wizard remains on Step 5. "Complete Ritual" button reverts to enabled state.
- **Transaction CRUD failure:** Error toast per PRD section 14 error messages. Form modal remains open for retry.
- **Session expired:** `AlertBanner` at top. Amber border (4px `--color-warning-500`). Text: "Your session has expired. Please refresh the page to continue." "Refresh Page" button. All interactive elements: opacity 0.5, pointer-events none.
- **403 Forbidden (FOM wrong franchise):** Redirect to default franchise with warning toast: "You don't have permission to view this franchise."
- **Network offline:** AlertBanner with "No internet connection. Some features may be unavailable." Cached data (SWR) remains visible.

---

## 7. Responsive Grid Layouts

### Desktop (>=1024px)
- Sidebar: Visible, fixed, 240px
- Main: margin-left 240px, padding `--spacing-6` vertical, `--spacing-8` horizontal
- Dashboard: Single column outer, 3-column inner grid (1fr 1fr 1fr) for Health + Metrics row
- Ritual Wizard: `max-w-2xl` (672px), centered
- Transaction Table: All columns visible, no horizontal scroll
- Widget: Min 280px, scales to container

### Tablet (640px-1023px)
- Sidebar: Hidden, hamburger menu top-left
- Main: Full width, padding `--spacing-6`
- Dashboard: Single column outer, 2-column inner grid for Health + Metrics (gauge full row, metrics side by side)
- Ritual Wizard: `max-w-xl` (576px), centered
- Transaction Table: All columns visible, horizontal scroll if needed
- Widget: Unchanged

### Mobile (<640px)
- Sidebar: Hidden, hamburger menu
- Main: Full width, padding `--spacing-4`
- Dashboard: Single column throughout. All cards stack vertically. Projection chart reduces to 8 weeks, 180px height.
- Ritual Wizard: Full width, no horizontal margin. Step indicator collapses to text. One-off item add row fields stack vertically.
- Transaction Table: Horizontal scroll. Name column sticky (left: 0, z-index 1, white background with right box-shadow). Hide Frequency and Next Occurrence columns. Actions via overflow menu (`MoreVertical`).
- Widget: Full width
- FilterBar: Filters stack vertically
- QuickActions: Buttons stack vertically

---

## 8. Accessibility Specs

- **Color contrast:** All text meets WCAG 2.1 AA (4.5:1 for normal text, 3:1 for large text). Health status uses triple redundancy: color + text label + icon to communicate state without relying on color alone (WCAG 1.4.1). Red (#dc2626) on white: 4.6:1. Green (#16a34a) on white: 4.6:1. Warning amber (#f59e0b) on white: meets 3:1 for large text only --- status label text is supplemented with icon.
- **Focus indicators:** 2px solid `--color-primary-500`, offset 2px, on ALL interactive elements. Modal elements use inset focus ring.
- **Touch targets:** Minimum 44x44px on all interactive elements. Toggle switches in wizard: 44px touch area. Table action icons: 44px touch area (transparent padding around 14px icon).
- **Heading hierarchy:** `<h1>` page title, `<h2>` section/card titles, `<h3>` within wizard steps. Semantic landmarks: `<aside>` sidebar, `<nav>` navigation, `<main>` content area, `<form>` wizard.
- **Screen reader:**
  - `aria-live="polite"` on toast container, wizard step announcements, filter result counts
  - `role="meter"` on HealthGauge with `aria-valuenow`, `aria-valuemin`, `aria-valuemax`
  - `role="table"` on TransactionTable with `aria-sort` on sortable columns
  - `role="form"` on wizard with step-level `aria-label`
  - `role="navigation"` on QuickActions, StepIndicator
  - Hidden data table alternative for ProjectionChart
- **Skip link:** "Skip to main content" as first focusable element on every page, visible on focus
- **Keyboard navigation:**
  - Wizard: Enter advances (when valid), Escape opens abandon dialog, Tab cycles fields
  - Table: Arrow keys navigate rows, Enter opens edit modal, Space toggles checkbox
  - Modal: Focus trapped, Escape closes, Tab cycles fields
  - Franchise picker: Arrow keys navigate options, Enter selects, Escape closes
- **Reduced motion:** `prefers-reduced-motion: reduce` disables gauge fill animation, chart line draw, wizard step transitions, bulk action bar slide. All transitions become instant.

---

## 9. Edge Case Visual Coverage

| Edge Case | Severity | Visual Treatment | Component |
|-----------|----------|-----------------|-----------|
| Negative TCP | High | Value in `--color-danger-600` as `-$X,XXX.XX`. Top border `--color-danger-600`. Health auto-Critical. | CashPositionCard, HealthGauge |
| TCP exactly $0.00 | Medium | Display `$0.00` normally. Health based on runway calculation. | CashPositionCard |
| Runway infinity (no expenses) | Medium | Display "infinity" symbol in `--color-success-600`. Tooltip "No recurring expenses recorded". Health = Healthy. | MetricCard, HealthGauge |
| Runway exactly 4.0 weeks | Medium | Health = "Caution" (not Critical). Boundary: >= 4.0 is Caution. | HealthGauge |
| Runway exactly 8.0 weeks | Medium | Health = "Healthy" (not Caution). Boundary: >= 8.0 is Healthy. | HealthGauge |
| Projection line below $0 | Medium | Line continues below axis. Dashed red line at $0 threshold. Y-axis extends to negative values. | ProjectionChart |
| All-zero net flow projection | Low | Flat horizontal line at TCP. Confidence band collapses to zero width. | ProjectionChart |
| Runway > 999.9 weeks | Low | Display "999.9+ weeks". | MetricCard |
| Long franchise name | Low | Truncate with ellipsis in header. Full name in tooltip. Max-width 320px. | Page header, FranchisePicker |
| Long transaction name | Low | Truncate with ellipsis in table cell. Full name in tooltip. `line-clamp-1`. | TransactionTable |
| 200+ recurring transactions | Medium | Pagination at 20/page. Performance target: render < 500ms. | TransactionTable |
| FOM with 0 assigned franchises | Medium | FranchisePicker shows "No franchises assigned. Contact your administrator." All sections show empty state. | FranchisePicker |
| Session expired mid-ritual | High | AlertBanner with "Refresh Page". Wizard state preserved in sessionStorage. On refresh + re-auth, wizard resumes. | RitualWizard |
| SessionStorage cleared mid-ritual | Medium | Wizard resets to Step 1. No server data loss (nothing saved until completion). | RitualWizard |
| Ritual save failure | High | Error toast. Wizard stays on Step 5. State preserved locally. Retry available. | SummaryStep |
| Transaction CRUD failure | High | Error toast per operation. Modal remains open for retry. | TransactionForm |
| Concurrent FP edits (theoretical) | Low | Last write wins. Single FP per franchise makes this a non-issue. | TransactionForm |
| Invalid URL franchise param | Medium | Redirect to default franchise with warning toast. | FranchisePicker |
| Invalid URL step param | Low | Redirect to Step 1. | RitualWizard |
| FOM accessing /cash-flow/ritual | Medium | Route guard redirects to dashboard with info toast. | RitualWizard |
| Browser back during wizard | Medium | Confirmation dialog: "Leave ritual? Your progress will be saved for 24 hours." | RitualWizard |

---

## 10. Edge Value Visual Treatments

Per-component rendering when data is null, zero, or negative.

| Component | Condition | Visual Treatment |
|-----------|-----------|-----------------|
| CashPositionCard | null (no ritual) | Value "---" in `--color-neutral-400`. Subtitle: guidance text. No health border accent (neutral-200). |
| CashPositionCard | zero ($0.00) | Value "$0.00" in `--color-neutral-900`. Normal treatment. |
| CashPositionCard | negative | Value "-$X,XXX.XX" in `--color-danger-600`. Top border `--color-danger-600`. |
| HealthGauge | null (no data) | Gray arc track, "Not Available" text, `HelpCircle` icon, guidance subtitle. |
| HealthGauge | runway < 4.0 | Red arc fill (0-33%), "Critical" text + `AlertOctagon` icon in red. |
| HealthGauge | runway >= 4.0, < 8.0 | Amber arc fill (34-66%), "Caution" text + `AlertTriangle` icon in amber. |
| HealthGauge | runway >= 8.0 | Green arc fill (67-100%), "Healthy" text + `ShieldCheck` icon in green. |
| MetricCard (Net Flow) | null | Value "---" in `--color-neutral-400`. |
| MetricCard (Net Flow) | positive | "+$X,XXX.XX" in `--color-success-600`. |
| MetricCard (Net Flow) | negative | "-$X,XXX.XX" in `--color-danger-600`. |
| MetricCard (Net Flow) | zero | "$0.00" in `--color-neutral-700`. |
| MetricCard (Runway) | null | Value "---" in `--color-neutral-400`. |
| MetricCard (Runway) | infinity | "infinity" in `--color-success-600`. Tooltip: "No recurring expenses recorded". |
| MetricCard (Runway) | zero (negative TCP) | "0.0 weeks" in `--color-danger-600`. |
| MetricCard (Runway) | > 999.9 | "999.9+ weeks" in `--color-neutral-900`. |
| ProjectionChart | null (no data) | Empty state: icon + guidance text centered in chart area. |
| ProjectionChart | negative projection | Line extends below $0. Dashed red threshold line at $0. |
| ProjectionChart | flat (zero net flow) | Horizontal line at TCP value. No confidence band. |
| CashFlowWidget | null (no data) | Value "---", gray dot + "Not Available", "No rituals completed". |
| CashFlowWidget | negative TCP | Value in `--color-danger-600`. Red dot + "Critical". |

---

## 11. Role-Based Access: Disabled and Hidden State Visuals

### Hidden Elements
Elements hidden due to role-based access control are **not rendered in the DOM**. Do NOT use CSS `display: none` --- the element must not exist in the rendered output at all. This is enforced via conditional rendering (e.g., `{isFP && <Component />}`).

### FOM Read-Only Mode
When an FOM views a franchise's dashboard and transaction list:
- **Not rendered (hidden from DOM):**
  - QuickActions strip (no "Start Ritual" or "Manage Transactions" buttons)
  - "Add Transaction" button on Recurring Transactions page header
  - Checkbox column in TransactionTable
  - Actions column (Edit/Delete) in TransactionTable
  - BulkActionBar
  - Ritual Wizard route (redirect to dashboard)
- **Rendered normally (read-only):**
  - CashPositionCard (all data visible)
  - HealthGauge (all data visible)
  - MetricCards (all data visible)
  - ProjectionChart (all data visible)
  - TransactionTable (data columns, no action columns)
  - FilterBar (filtering is read-only navigation, not data mutation)
  - CashFlowWidget
- **Added for FOM:**
  - FranchisePicker in page header (replaces static franchise name)

---

## 12. Cross-Flow Consistency Check

| Shared Element | This Flow | Other Flow(s) | Consistent? | Notes |
|---------------|-----------|---------------|-------------|-------|
| Sidebar | AppSidebar, 240px fixed | All flows | Yes | Shared component |
| Toast system | Bottom-right, 4-second auto-dismiss | All flows (Dashboard) | Yes | Shared ToastProvider at layout level |
| Card pattern | 12px radius, 1px border, white bg, p-6 | Dashboard, Funnel, Projects | Yes | Same card base |
| Focus ring | 2px solid #8BC34A | All flows | Yes | Shared token |
| Empty state pattern | Centered icon + text + CTA | All flows | Yes | Shared EmptyState component |
| Error banner | Red left border, retry button | All flows (Dashboard) | Yes | Shared AlertBanner |
| Modal pattern | Dialog, focus trap, Escape close | All flows | Yes | shadcn Dialog shared |
| Confirmation dialog | AlertDialog, destructive action | All flows | Yes | shadcn AlertDialog shared |
| Skeleton loading | Per-section shimmer pulse | Dashboard Flow | Yes | Same skeleton pattern |
| Table pattern | Sortable headers, pagination, badges | Future table flows | New | First data table in system; establishes pattern |
| Wizard pattern | Stepper + content + nav buttons | N/A | New | First wizard in system; establishes pattern |
| Status badges | Color dot + text label | Dashboard Flow (health indicators) | Yes | Same badge pattern, different status set |
| Currency formatting | $X,XXX.XX with +/- prefix | Dashboard Flow (KPI values) | Yes | Same formatting utility |

---

## 13. Animation & Timing Spec

| Animation | Duration | Easing | Trigger | Reduced Motion Behavior |
|-----------|----------|--------|---------|------------------------|
| Card skeleton shimmer | 1.5s loop | linear | Data loading | Static gray (no pulse) |
| Gauge arc fill | 800ms | ease-out | Data load/update | Instant fill (no animation) |
| Chart line draw | 600ms | ease-out | Projection data render | Instant render |
| Wizard step transition | 300ms | ease | Step navigation (Next/Back) | Instant swap (no slide) |
| Modal open | 200ms | ease-out | Add/Edit transaction | Instant show |
| Modal close | 200ms | ease-in | Cancel/Save/Escape | Instant hide |
| Toast slide-in | 200ms | ease-out | After CRUD/ritual action | Instant show |
| Toast auto-dismiss | 4000ms | --- | After appearance | Same timing |
| Bulk action bar slide-up | 200ms | ease-out | Row selection | Instant show |
| Bulk action bar slide-down | 200ms | ease-in | Deselection | Instant hide |
| One-off item remove | 200ms | ease-out | Remove button click | Instant remove |
| Table row hover | 150ms | ease | Mouse enter/leave | Same (not motion) |
| Focus ring appear | 0ms | instant | Keyboard focus | Same |
