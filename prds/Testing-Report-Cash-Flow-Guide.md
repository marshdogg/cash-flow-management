# Testing Report: Cash Flow Guide
## Generated from: PRD-Cash-Flow-Guide.md (V1.0) + Implementation-Brief-Cash-Flow-Guide.md
## Test Suite: cash-flow
## Total Test Scenarios: 130
## Status: 🔴 ALL RED (pre-implementation)

## How to Run Tests

| Command | Description |
|---------|-------------|
| `run_tests` | Run entire suite |
| `run_tests --suite cash-flow` | Run cash-flow suite |
| `run_tests --flow [name]` | Run specific user flow |
| `run_tests --tag smoke` | Run smoke tests (core happy paths) |
| `run_tests --tag regression` | Run full regression |
| `run_tests --tag edge-case` | Run edge case scenarios only |
| `run_tests --tag responsive` | Run responsive layout tests only |
| `run_tests --tag a11y` | Run accessibility tests only |
| `run_tests --verbose` | Detailed failure output |
| `run_tests --summary` | Pass/fail counts only |

---

## Test Coverage Summary

### Flow 1: Dashboard — Page Load & Layout
**What it validates:** Cash Flow Dashboard loads with correct layout, hero TCP card, secondary metrics, Quick Actions, and loading/error states for the authenticated user.
**Scenarios:** 12 · **Tags:** smoke, regression

| # | Scenario | Expected Behavior | Priority |
|---|----------|-------------------|----------|
| 1.1 | Dashboard loads at `/cash-flow/dashboard` | Page renders with header showing "Cash Flow Guide" title, franchise name in subtitle, sidebar navigation with Cash Flow items active | P0 |
| 1.2 | Hero card displays True Cash Position | TCP value shown at 28px/700 weight with `$XX,XXX.XX` format, subtitle shows breakdown: "Bank: $X − Outflows: $X + Inflows: $X" | P0 |
| 1.3 | TCP negative value displayed in red | When TCP is negative, value displays as `−$1,234.56` with `text-danger-600` color, no parentheses | P0 |
| 1.4 | TCP null shows dash with guidance | When no bank balance exists, TCP displays `"—"` with subtitle "Complete your first ritual to see your cash position" | P0 |
| 1.5 | Net Weekly Cash Flow card displays | Card shows positive value as `+$1,234.56` in green, negative as `−$1,234.56` in red, zero as `$0.00` in neutral | P1 |
| 1.6 | Weeks of Runway card displays | Runway shows value with 1 decimal and " weeks" suffix (e.g., "7.5 weeks") | P1 |
| 1.7 | Weeks of Runway shows infinity when expenses zero | When weekly expenses equal 0, runway displays `"∞"` with tooltip "No recurring expenses recorded" | P1 |
| 1.8 | Weeks of Runway caps at 999.9 | When calculated runway exceeds 999.9, display shows `"999.9+ weeks"` | P2 |
| 1.9 | Last Ritual date shown with relative time | Displays "Last reviewed: 3 days ago" or similar relative format next to metrics | P1 |
| 1.10 | Loading skeletons display per section | While data fetches, TCP card shows skeleton shimmer, Health Gauge shows gray placeholder, chart area shows skeleton, metrics show skeleton cards | P1 |
| 1.11 | Error state per section shows retry | On API failure, affected section shows "Unable to load data" with Retry button; other sections render normally | P1 |
| 1.12 | Quick Actions strip shows two buttons | "Start Ritual" and "Manage Transactions" buttons displayed in action strip below hero area | P0 |

---

### Flow 2: Dashboard — Health Gauge
**What it validates:** Health Gauge renders the correct color, label, icon, and arc fill for each health threshold, including boundary values and edge cases.
**Scenarios:** 10 · **Tags:** smoke, regression, edge-case

| # | Scenario | Expected Behavior | Priority |
|---|----------|-------------------|----------|
| 2.1 | Health Gauge shows "Critical" when runway < 4.0 weeks | Gauge arc fills red, label reads "Critical", red icon displayed, `text-danger-600` styling | P0 |
| 2.2 | Health Gauge shows "Caution" when runway >= 4.0 and < 8.0 weeks | Gauge arc fills yellow, label reads "Caution", yellow icon displayed, `text-warning-500` styling | P0 |
| 2.3 | Health Gauge shows "Healthy" when runway >= 8.0 weeks | Gauge arc fills green, label reads "Healthy", green icon displayed, `text-success-600` styling | P0 |
| 2.4 | Health Gauge boundary: exactly 4.0 weeks shows "Caution" | At exactly 4.0 weeks runway, gauge shows "Caution" (not "Critical") per PRD boundary rule | P0 |
| 2.5 | Health Gauge boundary: exactly 8.0 weeks shows "Healthy" | At exactly 8.0 weeks runway, gauge shows "Healthy" (not "Caution") per PRD boundary rule | P0 |
| 2.6 | Health Gauge "Not Available" when no data | Gray gauge, label "Not Available", subtitle "Complete your first ritual" | P1 |
| 2.7 | Health Gauge "Critical" when TCP is negative | Regardless of runway calculation, negative TCP forces "Critical" status with red gauge | P1 |
| 2.8 | Health Gauge "Healthy" when runway is infinity | When expenses are zero, runway is infinity (>= 8.0), gauge shows "Healthy" | P1 |
| 2.9 | Health Gauge animated fill on data load | Gauge arc animates from 0 to target fill over 800ms ease-out on initial load | P2 |
| 2.10 | Health Gauge WCAG: label + icon, not color alone | Status communicated via text label and icon in addition to color; passes WCAG color-alone requirement | P1 |

---

### Flow 3: Dashboard — Projection Chart
**What it validates:** 13-week projection line chart renders correctly with confidence bands, handles edge cases, and responds to data changes.
**Scenarios:** 8 · **Tags:** regression, edge-case

| # | Scenario | Expected Behavior | Priority |
|---|----------|-------------------|----------|
| 3.1 | Projection chart renders 13-week line | Recharts line chart with X-axis showing Week 1-13 labels, Y-axis showing dollar amounts, center projection line drawn | P0 |
| 3.2 | Confidence bands display as shaded area | +/-10% cumulative confidence band shown as shaded area around the projection line | P1 |
| 3.3 | Negative projection crosses below $0 | Projection line continues below $0 axis; dashed red horizontal line drawn at $0 threshold | P1 |
| 3.4 | All-zero net flow shows flat line | When Net Weekly Cash Flow is $0, projection is a flat horizontal line at TCP value; confidence band collapses to zero width | P1 |
| 3.5 | No data shows empty state | When no ritual completed, chart area shows message "Complete your first ritual to see projections" | P1 |
| 3.6 | Chart line draw animation | Projection line draws with 600ms ease-out animation on initial render | P2 |
| 3.7 | Chart tooltip on hover shows week detail | Hovering a data point shows tooltip with week number, projected value, upper/lower bound values | P2 |
| 3.8 | Mobile: chart reduces to 8-week view | On viewports < 640px, chart shows 8 weeks with "See full projection" link | P1 |

---

### Flow 4: Dashboard — Quick Actions & Navigation
**What it validates:** Quick Action buttons navigate correctly, are role-gated, and link to the right destinations.
**Scenarios:** 5 · **Tags:** smoke, regression

| # | Scenario | Expected Behavior | Priority |
|---|----------|-------------------|----------|
| 4.1 | "Start Ritual" button navigates to wizard | Clicking "Start Ritual" navigates to `/cash-flow/ritual` | P0 |
| 4.2 | "Manage Transactions" navigates to recurring | Clicking "Manage Transactions" navigates to `/cash-flow/recurring` | P0 |
| 4.3 | Quick Actions hidden for FOM | When FOM is viewing a franchise dashboard, "Start Ritual" button is not rendered; "Manage Transactions" still navigates to read-only view | P0 |
| 4.4 | Sidebar navigation items active states | Cash Flow Dashboard nav item is highlighted/active when on dashboard page; Recurring and Ritual nav items are visible | P1 |
| 4.5 | Skip-to-content link present | First focusable element on page is a "Skip to main content" link, visible on focus | P2 |

---

### Flow 5: Ritual Wizard — Step Navigation
**What it validates:** 5-step wizard loads correctly with step indicator, enforces navigation rules (no skip-ahead, allow back), and shows proper step transitions.
**Scenarios:** 9 · **Tags:** smoke, regression

| # | Scenario | Expected Behavior | Priority |
|---|----------|-------------------|----------|
| 5.1 | Wizard loads at Step 1 (Welcome) | Step 1 displays last ritual date, current TCP, and "Let's get started" CTA button | P0 |
| 5.2 | Step indicator shows 5 steps | Step indicator renders all 5 steps: Welcome, Bank Balance, Review Recurring, One-Off Items, Summary; Step 1 is active, others are upcoming | P0 |
| 5.3 | Advance from Step 1 to Step 2 | Clicking "Let's get started" transitions to Step 2 (Bank Balance) with 300ms ease animation; step indicator updates to show Step 1 complete, Step 2 active | P0 |
| 5.4 | Cannot skip ahead past current step | Clicking Step 3 indicator when on Step 1 has no effect; only completed steps and current step are clickable | P1 |
| 5.5 | Can navigate back to completed step | On Step 3, clicking Step 2 indicator navigates back to Step 2 with data preserved | P0 |
| 5.6 | Step 3 skippable when zero transactions | When franchise has no recurring transactions, Step 3 shows "No recurring transactions to review" with "Continue" button to skip to Step 4 | P1 |
| 5.7 | Step 4 skippable (all items optional) | Step 4 (One-Off Items) shows "Continue" button even with no items added | P1 |
| 5.8 | Keyboard: Enter advances to next step | When on a valid step, pressing Enter advances to the next step (when inputs are valid) | P1 |
| 5.9 | Keyboard: Escape opens abandon confirmation | Pressing Escape while in the wizard triggers the abandon confirmation dialog | P1 |

---

### Flow 6: Ritual Wizard — Bank Balance Input (Step 2)
**What it validates:** Bank balance numeric input field works correctly with validation, pre-fill, currency formatting, and error handling.
**Scenarios:** 7 · **Tags:** smoke, regression, edge-case

| # | Scenario | Expected Behavior | Priority |
|---|----------|-------------------|----------|
| 6.1 | Input pre-filled with last known balance | Step 2 loads with input showing the last recorded bank balance value | P0 |
| 6.2 | Currency formatting on blur | After typing "45000", blurring input formats to "$45,000.00" | P1 |
| 6.3 | Validation: empty field blocks advance | Leaving bank balance empty and clicking "Continue" shows error "Enter a valid dollar amount"; cannot advance to Step 3 | P0 |
| 6.4 | Validation: negative value rejected | Entering "-5000" shows error "Enter a valid dollar amount"; negative values are not accepted for bank balance input (bank balance >= 0) | P1 |
| 6.5 | Validation: exceeds max amount | Entering "1000000000" (> $999,999,999.99) shows error "Enter a valid dollar amount" | P1 |
| 6.6 | Validation: non-numeric rejected | Entering "abc" or "$45,xyz" shows error "Enter a valid dollar amount" | P1 |
| 6.7 | Valid input allows advance (including $0) | Entering "45000" and clicking "Continue" advances to Step 3; entering "0" is also accepted as a valid balance ($0.00) | P0 |

---

### Flow 7: Ritual Wizard — Review Recurring (Step 3)
**What it validates:** Step 3 lists all recurring transactions with toggle to confirm/skip each, correctly reflects transaction data.
**Scenarios:** 5 · **Tags:** regression

| # | Scenario | Expected Behavior | Priority |
|---|----------|-------------------|----------|
| 7.1 | All active recurring transactions listed with toggles defaulting to on | Step 3 displays each active recurring transaction with name, type badge (Income/Expense), amount, and frequency; all toggle switches default to the confirmed (on) state | P0 |
| 7.2 | Toggle to skip a transaction | Toggling a transaction "off" excludes it from this ritual's TCP calculation; toggling back "on" re-includes it | P1 |
| 7.3 | Paused transactions not shown | Transactions with status "paused" are excluded from the review list | P1 |
| 7.4 | No validation blocks advance | Step 3 has no required input; "Continue" button is always enabled regardless of toggle states | P1 |
| 7.5 | Back button returns to Step 2 with balance preserved | Clicking back from Step 3 returns to Step 2 with the previously entered bank balance still populated | P1 |

---

### Flow 8: Ritual Wizard — One-Off Items (Step 4)
**What it validates:** Step 4 allows adding/removing one-time income or expenses for the current week, with proper validation.
**Scenarios:** 7 · **Tags:** regression, edge-case

| # | Scenario | Expected Behavior | Priority |
|---|----------|-------------------|----------|
| 8.1 | Add one-off income item | Click "Add Item", select type "Income", enter description "Client deposit" and amount "5000", item appears in list | P0 |
| 8.2 | Add one-off expense item | Click "Add Item", select type "Expense", enter description "Emergency repair" and amount "2000", item appears in list | P0 |
| 8.3 | Remove one-off item | Click delete/remove icon on an added item, item is removed from the list | P1 |
| 8.4 | Validation: amount zero rejected | Entering amount "0" for a one-off item shows error "Enter a non-zero dollar amount" | P1 |
| 8.5 | Validation: description required (1-200 chars) | Leaving description empty shows error "Description is required"; entering over 200 characters also shows validation error | P1 |
| 8.6 | Advance with no items | Clicking "Continue" with no one-off items added advances to Step 5 (step is optional) | P1 |
| 8.7 | Validation: dirty form blocks advance | If the add-item form is partially filled (dirty), clicking "Continue" shows validation errors on the incomplete form fields | P1 |

---

### Flow 9: Ritual Wizard — Summary & Completion (Step 5)
**What it validates:** Summary step displays updated TCP, health status, and projection chart preview, then completes the ritual and redirects to dashboard.
**Scenarios:** 7 · **Tags:** smoke, regression

| # | Scenario | Expected Behavior | Priority |
|---|----------|-------------------|----------|
| 9.1 | Summary shows updated TCP | Step 5 displays the recalculated True Cash Position based on entered bank balance, reviewed recurring transactions, and one-off items | P0 |
| 9.2 | Summary shows health status | Health Gauge preview shows the computed health status (Critical/Caution/Healthy) based on the updated TCP and weekly expenses | P0 |
| 9.3 | Summary shows projection chart | 13-week projection chart rendered using the updated data from the wizard | P1 |
| 9.4 | "Complete Ritual" button submits | Clicking "Complete Ritual" calls `POST /api/cash-flow/ritual` with `{ bankBalance, oneOffTransactions[] }` | P0 |
| 9.5 | After completion: redirect to dashboard with toast | On success, user is redirected to `/cash-flow/dashboard` with success toast "Ritual completed! Your dashboard has been updated." | P0 |
| 9.6 | After completion: sessionStorage cleared | After successful ritual completion, the `cash-flow-ritual-state` key is removed from sessionStorage | P1 |
| 9.7 | Completion failure: toast + local save | If `POST /api/cash-flow/ritual` fails, error toast "Unable to save your ritual. Your progress has been saved locally." is shown; wizard state remains in sessionStorage | P0 |

---

### Flow 10: Ritual Wizard — Abandon & Resume
**What it validates:** Abandoning the ritual mid-flow persists state for 24 hours, and resuming restores the wizard to the last step.
**Scenarios:** 5 · **Tags:** regression, edge-case

| # | Scenario | Expected Behavior | Priority |
|---|----------|-------------------|----------|
| 10.1 | Abandon via back navigation shows confirmation | Clicking browser back or close while in wizard triggers confirmation dialog: "Leave ritual? Your progress will be saved for 24 hours." Confirming saves state to sessionStorage with 24-hour TTL. Cancelling dismisses dialog. | P0 |
| 10.2 | Resume within 24 hours restores state | Navigating to `/cash-flow/ritual` within 24 hours of abandoning resumes at the last active step with all data intact (bank balance, toggle states, one-off items) | P0 |
| 10.3 | Resume after 24 hours starts fresh | Navigating to `/cash-flow/ritual` after 24 hours ignores expired sessionStorage and starts at Step 1 | P1 |
| 10.4 | Deep link `?step=3` resumes at Step 3 | Loading `/cash-flow/ritual?step=3` resumes wizard at Step 3 if valid session state exists for steps 1-2; otherwise redirects to Step 1 | P1 |
| 10.5 | SessionStorage cleared mid-ritual resets to Step 1 | If sessionStorage is cleared while in the wizard (e.g., browser tools), returning to `/cash-flow/ritual` starts at Step 1; no crash or error | P2 |

---

### Flow 11: Recurring Transactions — Table Rendering
**What it validates:** Transaction data table displays all columns correctly, renders proper badges and formatting, and handles empty state.
**Scenarios:** 7 · **Tags:** smoke, regression

| # | Scenario | Expected Behavior | Priority |
|---|----------|-------------------|----------|
| 11.1 | Table renders all 6 columns | Columns displayed: Name, Type (Income/Expense), Amount, Frequency, Next Occurrence, Status (Active/Paused) | P0 |
| 11.2 | Type column shows colored badges | Income transactions show green "Income" badge; Expense transactions show red "Expense" badge | P1 |
| 11.3 | Amount displays with currency format | Amounts display as `$X,XXX.XX` with 2 decimal places | P1 |
| 11.4 | Frequency displays human-readable label | Frequency shows label from constants: "Weekly", "Bi-weekly", "Monthly", "Quarterly", "Annually" | P1 |
| 11.5 | Status shows Active/Paused badge | Active transactions show green "Active" badge; Paused transactions show gray "Paused" badge | P1 |
| 11.6 | Pagination after 50 rows | When more than 50 transactions exist, table paginates with page controls; 50 rows per page | P1 |
| 11.7 | Empty state when no transactions | Table shows "No recurring transactions yet. Add your first one to get started." with Add button | P0 |

---

### Flow 12: Recurring Transactions — Sort & Filter
**What it validates:** Table sorting and filtering work correctly for all supported columns and filter combinations.
**Scenarios:** 7 · **Tags:** regression

| # | Scenario | Expected Behavior | Priority |
|---|----------|-------------------|----------|
| 12.1 | Default sort: Next Occurrence ascending | On initial load, transactions are sorted by Next Occurrence with soonest first | P0 |
| 12.2 | Sort by Name column | Clicking Name header sorts alphabetically A-Z; clicking again reverses to Z-A | P1 |
| 12.3 | Sort by Amount column | Clicking Amount header sorts numerically ascending; clicking again reverses to descending | P1 |
| 12.4 | Filter by type: Income only | Selecting "Income" filter shows only income transactions; count updates in results header | P1 |
| 12.5 | Filter by type: Expense only | Selecting "Expense" filter shows only expense transactions | P1 |
| 12.6 | Filter by status: Active only | Selecting "Active" status filter shows only active transactions, hiding paused | P1 |
| 12.7 | Combined filter: Income + Active | Selecting type "Income" and status "Active" shows only active income transactions; "All" resets both filters | P1 |

---

### Flow 13: Recurring Transactions — CRUD Operations
**What it validates:** Create, Read, Update, and Delete operations for recurring transactions work correctly with modals, validation, and toast feedback.
**Scenarios:** 8 · **Tags:** smoke, regression

| # | Scenario | Expected Behavior | Priority |
|---|----------|-------------------|----------|
| 13.1 | Add button opens modal | Clicking "Add Transaction" opens modal (200ms ease animation) with form: name, type, amount, frequency, start date fields | P0 |
| 13.2 | Create valid transaction | Filling all fields correctly and clicking "Save" creates transaction, closes modal, shows toast "Transaction added", table updates with new row | P0 |
| 13.3 | Edit button opens pre-filled modal | Clicking Edit on a transaction row opens modal with all fields pre-populated with current values | P0 |
| 13.4 | Update transaction | Changing amount and clicking "Save" updates the transaction, closes modal, shows toast "Transaction updated" | P0 |
| 13.5 | Delete with confirmation dialog | Clicking Delete on a row shows confirmation dialog: "Delete [name]? This transaction will be permanently removed and will no longer appear in your projections." Confirming removes the transaction and shows toast "Transaction deleted". Cancelling dismisses dialog. | P0 |
| 13.6 | Pause/Resume toggle (no confirmation) | Toggling a transaction's status between Active and Paused happens directly with toast feedback; no confirmation dialog required | P1 |
| 13.7 | Modal: Escape closes without saving | Pressing Escape while modal is open closes it without saving; focus returns to the trigger button | P1 |
| 13.8 | Modal: focus trap and keyboard navigation | Tab key cycles through modal form fields without leaving the modal; focus is trapped within the dialog | P1 |

---

### Flow 14: Recurring Transactions — Validation & Bulk Actions
**What it validates:** Form field validation rules and bulk action workflows work correctly.
**Scenarios:** 8 · **Tags:** regression, edge-case

| # | Scenario | Expected Behavior | Priority |
|---|----------|-------------------|----------|
| 14.1 | Name required validation | Submitting with empty name shows "Name is required (max 100 characters)" | P1 |
| 14.2 | Name max 100 characters | Entering 101+ characters in name field shows validation error | P2 |
| 14.3 | Amount must be positive | Entering "0" or "-100" in amount shows "Enter a positive dollar amount" | P1 |
| 14.4 | Amount max $9,999,999.99 | Entering amount exceeding max shows validation error | P2 |
| 14.5 | Frequency required | Submitting without selecting frequency shows "Select a frequency" | P1 |
| 14.6 | Bulk select multiple rows | Checking individual row checkboxes or "Select All" checkbox selects rows; BulkActionBar appears with count | P1 |
| 14.7 | Bulk pause selected | With 3 transactions selected, clicking "Pause" pauses all 3, shows toast "3 transactions paused" | P1 |
| 14.8 | Bulk delete with confirmation | With 2 transactions selected, clicking "Delete" shows confirmation "Delete 2 transactions? This cannot be undone."; confirming deletes all, shows toast "2 transactions deleted" | P1 |

---

### Flow 15: Widget
**What it validates:** Compact CashFlowWidget component displays TCP, health status, last reviewed date, and navigates to the full dashboard on click.
**Scenarios:** 10 · **Tags:** smoke, regression

| # | Scenario | Expected Behavior | Priority |
|---|----------|-------------------|----------|
| 15.1 | Widget displays TCP formatted | Compact card shows True Cash Position in `$XX,XXX.XX` format | P0 |
| 15.2 | Widget displays health status with color + label | Health status shown as colored indicator with text label (e.g., green "Healthy") | P0 |
| 15.3 | Widget displays last reviewed date | Shows "Last reviewed: [relative time]" (e.g., "2 days ago") | P1 |
| 15.4 | Widget click navigates to dashboard | Clicking anywhere on the widget navigates to `/cash-flow/dashboard` | P0 |
| 15.5 | Widget "Not Available" state | When no ritual completed, widget shows "Not Available" title with "Complete your first ritual" description | P1 |
| 15.6 | Widget negative TCP in red | When TCP is negative, widget displays value in `text-danger-600` with minus prefix | P1 |
| 15.7 | Widget loading state | While fetching data, widget shows skeleton placeholder | P2 |
| 15.8 | Widget error state | On API failure, widget shows fallback content (not a blank card) | P2 |
| 15.9 | Widget keyboard accessible | Tab focuses the widget card, Enter/Space activates navigation to dashboard | P1 |
| 15.10 | FOM widget shows selected franchise data | When FOM views widget, it reflects the data for their currently selected franchise | P1 |

---

### Flow 16: Role-Based Access
**What it validates:** Franchise Partner and Franchise Operations Manager see the correct UI elements, with proper data isolation and route guards.
**Scenarios:** 10 · **Tags:** smoke, regression, edge-case

| # | Scenario | Expected Behavior | Priority |
|---|----------|-------------------|----------|
| 16.1 | FP sees full dashboard with actions | FP sees TCP, Health Gauge, Projection, Quick Actions ("Start Ritual" + "Manage Transactions"), metrics | P0 |
| 16.2 | FOM sees read-only dashboard | FOM sees TCP, Health Gauge, Projection, metrics but "Start Ritual" Quick Action is not rendered | P0 |
| 16.3 | FOM franchise picker displays in header | FOM sees a dropdown in the header listing all assigned franchises, sorted alphabetically | P0 |
| 16.4 | FOM franchise picker switches data | Selecting a different franchise from the picker reloads all dashboard data for the new franchise | P0 |
| 16.5 | FOM franchise picker default selection | Picker defaults to the first franchise alphabetically | P1 |
| 16.6 | FOM accessing `/cash-flow/ritual` redirected | FOM navigating directly to ritual URL is redirected to `/cash-flow/dashboard` with info toast "The ritual is only available to Franchise Partners." | P0 |
| 16.7 | FOM sees recurring transactions read-only | FOM can view the transaction table but Add, Edit, Delete, and Bulk Action controls are not rendered | P0 |
| 16.8 | FOM with 0 assigned franchises sees empty state | FOM with no franchise assignments sees "No franchises assigned. Contact your administrator." | P1 |
| 16.9 | FP cannot see franchise picker | FP user does not see the franchise picker dropdown; page uses their own franchise context | P1 |
| 16.10 | Deep link `?franchise=invalid` redirects with warning | FOM loading a URL with an invalid franchise ID is redirected to default franchise with warning toast | P1 |

---

### Flow 17: Smoke Tests
**What it validates:** Core routes load, no console errors, and API endpoints respond.
**Scenarios:** 5 · **Tags:** smoke

| # | Scenario | Expected Behavior | Priority |
|---|----------|-------------------|----------|
| 17.1 | `/cash-flow/dashboard` loads without console errors | Route renders fully with no JavaScript errors in console | P0 |
| 17.2 | `/cash-flow/ritual` loads for FP without console errors | Route renders wizard Step 1 with no JavaScript errors | P0 |
| 17.3 | `/cash-flow/recurring` loads without console errors | Route renders transaction table (or empty state) with no JavaScript errors | P0 |
| 17.4 | `GET /api/cash-flow/dashboard` returns 200 | API health check returns valid JSON response with `apiSuccess` envelope | P0 |
| 17.5 | `GET /api/cash-flow/recurring` returns 200 | API health check returns valid JSON response with transactions array | P0 |

---

## Edge Cases & Error States

| # | Scenario | Trigger Condition | Expected Behavior |
|---|----------|-------------------|-------------------|
| E1 | Full API failure on dashboard | All `/api/cash-flow/` endpoints return 500 | Error banner: "Something went wrong. Please try again." with Retry button. All sections show error state. |
| E2 | Partial API failure: widget loads but dashboard fails | `/api/cash-flow/widget` succeeds, `/api/cash-flow/dashboard` returns 500 | Widget displays correctly. Dashboard shows per-section error banners with Retry. |
| E3 | Network failure | Device loses connectivity | Error message: "Unable to load data. Check your connection and try again." per section with Retry button. |
| E4 | Session expired (401) | Auth token expires during usage | Warning toast: "Your session has expired. Please refresh the page." Controls become non-functional. |
| E5 | Forbidden franchise (403) | FOM accesses a franchise not assigned to them | Error toast: "You don't have permission to view this franchise." Redirected to default franchise. |
| E6 | Franchise not found (404) | Deep link to deleted franchise `?franchise=deleted_id` | Error toast: "This franchise could not be found." Redirected to default franchise. |
| E7 | Ritual save failure (500) | `POST /api/cash-flow/ritual` returns 500 on Step 5 completion | Error toast: "Unable to save your ritual. Your progress has been saved locally." Wizard stays on Step 5. sessionStorage preserved. |
| E8 | Transaction CRUD failure | `POST /api/cash-flow/recurring` returns 500 | Error toast: "Unable to add transaction. Please try again." Modal stays open with form data preserved. |
| E9 | TCP calculation: no recurring transactions | FP has zero recurring transactions | TCP equals Bank Balance exactly. Net Weekly Cash Flow = $0.00. Runway = "∞". Projection = flat line. Health = "Healthy". |
| E10 | TCP calculation: negative TCP | Bank: $5,000, pending outflows: $8,000, pending inflows: $2,000 --> TCP = -$1,000 | TCP displays `−$1,000.00` in red. Health = "Critical". Runway = "0.0 weeks". Projection starts negative. |
| E11 | Division by zero: runway with zero expenses | Bank balance exists but all transactions are income (zero expenses) | Runway = "∞" with tooltip. Health = "Healthy". No crash or NaN. |
| E12 | Frequency normalization edge: annual transaction | Annual $52,000 expense exists | Weekly normalized amount = $52,000 / 52 = $1,000.00/week. Used correctly in Net Weekly Cash Flow and Runway. |
| E13 | Multiple rituals same day | FP completes 2 rituals in one day | Each creates a separate WeeklySnapshot. Dashboard reflects the most recent snapshot. No error on second completion. |
| E14 | Concurrent transaction edit (last write wins) | Two browser tabs edit the same transaction | Last saved version wins. No conflict error. SWR revalidation shows the latest data. |
| E15 | 200 recurring transactions performance | FP has 200 active transactions | Table renders in < 500ms. Pagination at 50 rows. Step 3 lists all 200 for review without lag. |

---

## Responsive Breakpoints

| Breakpoint | Width | Key Behavioral Changes |
|------------|-------|------------------------|
| Desktop | >= 1024px | Full sidebar nav, all dashboard cards in multi-column grid, all table columns visible, full step indicator |
| Tablet | 640-1023px | Two-column grid for dashboard cards, table shows fewer columns, step indicator full |
| Mobile | < 640px | Single column stacked cards, table horizontal scroll with hidden Frequency/Next Occurrence columns, step indicator collapses to "Step X of 5", projection chart reduced to 8 weeks, health gauge reduced diameter, burger menu |

### Responsive Test Scenarios (5)

| # | Scenario | Expected Behavior | Priority |
|---|----------|-------------------|----------|
| R1 | Mobile: dashboard cards stack vertically | TCP hero card, Health Gauge, Projection Chart, and metric cards all stack in a single column | P1 |
| R2 | Mobile: transaction table horizontal scroll | Table scrolls horizontally; Frequency and Next Occurrence columns hidden; swipe to reveal row actions | P1 |
| R3 | Mobile: wizard step indicator collapses | Step indicator shows "Step 2 of 5" text instead of full step bar with all step names | P1 |
| R4 | Mobile: projection chart 8-week view | Chart shows only 8 weeks with "See full projection" link below | P1 |
| R5 | Mobile: touch targets minimum 44px | All interactive elements (buttons, toggles, checkboxes, links) have minimum 44x44px tap area | P1 |

---

## Acceptance Criteria Traceability

| PRD Section | Criterion | Test Scenario(s) |
|-------------|-----------|-------------------|
| §6.1 | TCP formula: Bank Balance + Pending Inflows - Pending Outflows | Flow 1, #1.2; E9, E10 |
| §6.1 | TCP null display: "—" with guidance | Flow 1, #1.4 |
| §6.1 | TCP negative in red | Flow 1, #1.3; Flow 15, #15.6; E10 |
| §6.1 | TCP zero displays $0.00 | E9 (implied when bank = $0 and no transactions) |
| §6.2 | Net Weekly Cash Flow: positive green, negative red, zero neutral | Flow 1, #1.5 |
| §6.2 | Frequency normalization divisors | E12 |
| §6.3 | Weeks of Runway: TCP / weekly expenses | Flow 1, #1.6 |
| §6.3 | Runway division by zero: "∞" | Flow 1, #1.7; E11 |
| §6.3 | Runway negative TCP: 0.0 weeks | E10 |
| §6.3 | Runway cap at 999.9+ | Flow 1, #1.8 |
| §6.4 | Health Critical < 4.0 weeks | Flow 2, #2.1 |
| §6.4 | Health Caution >= 4.0 and < 8.0 | Flow 2, #2.2 |
| §6.4 | Health Healthy >= 8.0 | Flow 2, #2.3 |
| §6.4 | Health boundary: exactly 4.0 --> Caution | Flow 2, #2.4 |
| §6.4 | Health boundary: exactly 8.0 --> Healthy | Flow 2, #2.5 |
| §6.4 | Health "Not Available" when no data | Flow 2, #2.6 |
| §6.4 | Negative TCP forces "Critical" | Flow 2, #2.7 |
| §6.4 | Gauge uses color + text + icon (WCAG) | Flow 2, #2.10 |
| §6.5 | Projection 13-week line chart | Flow 3, #3.1 |
| §6.5 | Projection confidence bands +/-10% | Flow 3, #3.2 |
| §6.5 | Projection negative crosses $0 | Flow 3, #3.3 |
| §6.5 | Projection all-zero: flat line | Flow 3, #3.4 |
| §6.5 | Projection no data: empty state | Flow 3, #3.5 |
| §7 | FP: full CRUD access | Flow 13, #13.1-13.8; Flow 16, #16.1 |
| §7 | FOM: read-only dashboard | Flow 4, #4.3; Flow 16, #16.2 |
| §7 | FOM: franchise picker | Flow 16, #16.3-16.5 |
| §7 | FOM: ritual hidden (route guard) | Flow 16, #16.6 |
| §7 | FOM: recurring read-only | Flow 16, #16.7 |
| §7 | FOM: 0 franchises empty state | Flow 16, #16.8 |
| §8 | Dashboard hero TCP card | Flow 1, #1.2-1.4 |
| §8 | Dashboard Health Gauge all states | Flow 2, #2.1-2.8 |
| §8 | Dashboard Projection Chart | Flow 3, #3.1-3.5 |
| §8 | Dashboard Quick Actions | Flow 4, #4.1-4.3; Flow 1, #1.12 |
| §8 | Dashboard loading skeletons | Flow 1, #1.10 |
| §8 | Dashboard error state with retry | Flow 1, #1.11; E1-E3 |
| §8 | Ritual 5-step wizard | Flow 5, #5.1-5.9 |
| §8 | Ritual Step 2: bank balance input | Flow 6, #6.1-6.7 |
| §8 | Ritual Step 3: review recurring with toggles | Flow 7, #7.1-7.5 |
| §8 | Ritual Step 4: one-off items | Flow 8, #8.1-8.7 |
| §8 | Ritual Step 5: summary + completion | Flow 9, #9.1-9.7 |
| §8 | Ritual abandon/resume with 24h TTL | Flow 10, #10.1-10.5 |
| §8 | Ritual: FOM route guard redirect | Flow 16, #16.6 |
| §8 | Recurring: data table all columns | Flow 11, #11.1-11.7 |
| §8 | Recurring: sort by any column | Flow 12, #12.1-12.3 |
| §8 | Recurring: filter by type and status | Flow 12, #12.4-12.7 |
| §8 | Recurring: add/edit modal | Flow 13, #13.1-13.4 |
| §8 | Recurring: delete with confirmation | Flow 13, #13.5 |
| §8 | Recurring: bulk actions | Flow 14, #14.6-14.8 |
| §8 | Recurring: validation rules | Flow 14, #14.1-14.5 |
| §8 | Recurring: empty state | Flow 11, #11.7 |
| §8 | Recurring: FOM read-only | Flow 16, #16.7 |
| §8 | Recurring: toast on CRUD | Flow 13, #13.2, #13.4, #13.5, #13.6; Flow 14, #14.7-14.8 |
| §8 | Widget: TCP + health + last reviewed | Flow 15, #15.1-15.3 |
| §8 | Widget: click navigates to dashboard | Flow 15, #15.4 |
| §8 | Widget: "Not Available" state | Flow 15, #15.5 |
| §8 | Widget: FOM sees selected franchise | Flow 15, #15.10 |
| §9 | Mobile: single column, stacked cards | R1 |
| §9 | Mobile: table horizontal scroll, hidden columns | R2 |
| §9 | Mobile: step indicator text-only | R3 |
| §9 | Mobile: projection chart 8 weeks | R4, Flow 3, #3.8 |
| §9 | Mobile: health gauge reduced diameter | R1 (implied) |
| §10 | Touch targets 44x44px | R5 |
| §10 | Wizard: Enter advances, Escape abandons | Flow 5, #5.8-5.9 |
| §10 | Modal: focus trap, Escape closes | Flow 13, #13.7-13.8 |
| §10 | Skip-to-content link | Flow 4, #4.5 |
| §10 | Widget keyboard accessible | Flow 15, #15.9 |
| §12 | Skeleton shimmer 1.5s loop | Flow 1, #1.10 |
| §12 | Wizard step transition 300ms | Flow 5, #5.3 |
| §12 | Modal open/close 200ms | Flow 13, #13.1 |
| §12 | Toast 4000ms auto-dismiss | Covered by toast integration (E7, E8) |
| §12 | Health Gauge fill 800ms | Flow 2, #2.9 |
| §12 | Chart line draw 600ms | Flow 3, #3.6 |
| §14 | API error messages (401, 403, 404, 500) | E1-E8 |
| §14 | Input validation: bank balance | Flow 6, #6.3-6.6 |
| §14 | Input validation: transaction name | Flow 14, #14.1-14.2 |
| §14 | Input validation: transaction amount | Flow 14, #14.3-14.4 |
| §14 | Input validation: frequency required | Flow 14, #14.5 |
| §14 | Input validation: one-off amount | Flow 8, #8.4 |
| §14 | Input validation: one-off description | Flow 8, #8.5 |
| §15 | URL: `/cash-flow/dashboard?franchise=fr_id` | Flow 16, #16.4, #16.10 |
| §15 | URL: `/cash-flow/ritual?step=N` resume | Flow 10, #10.4 |
| §15 | URL: `/cash-flow/recurring?type=&status=` | Flow 12, #12.4-12.7 (implied by filter state) |
| §15 | Invalid franchise param fallback | Flow 16, #16.10; E5, E6 |
| §15 | Invalid step param fallback to Step 1 | Flow 10, #10.4 |
| §15 | FOM accessing `/cash-flow/ritual` redirect | Flow 16, #16.6 |
| §17 | Q&A: multiple rituals per day | E13 |
| §17 | Q&A: no recurring = TCP equals bank balance | E9 |
| §17 | Q&A: paused excluded from calculations | Flow 7, #7.3 |
| §17 | Q&A: sessionStorage cleared mid-ritual | Flow 10, #10.5 |
| §18 | Delete confirmation modal text | Flow 13, #13.5 |
| §18 | Bulk delete confirmation modal text | Flow 14, #14.8 |
| §18 | Abandon confirmation modal text | Flow 10, #10.1 |
| §18 | Pause/Resume: no confirmation | Flow 13, #13.6 |
| §18 | Complete ritual: no confirmation | Flow 9, #9.4 |
| §21 | Wizard step flow (skip rules, back rules) | Flow 5, #5.4-5.7 |
| §21 | Wizard state persistence: sessionStorage key | Flow 9, #9.6; Flow 10, #10.1-10.2 |
| §21 | Wizard validation per step | Flow 6, #6.3-6.7; Flow 7, #7.4; Flow 8, #8.4-8.5, #8.7 |

---

## Notes for the Coding Agent

- All 130 tests are currently RED. Your job is to make them GREEN.
- Run `run_tests --summary` frequently during development.
- When a test fails, the error message describes what SHOULD happen -- cross-reference the PRD.
- Do NOT access or read test files. CLI commands only.
- Max 3 retries per failing test before escalating.
- **Start with smoke tests** (`run_tests --tag smoke`) -- these cover the critical happy paths across all 3 routes and 2 API endpoints.
- **Calculation engine:** TCP, Net Weekly Cash Flow, Runway, and Health are computed by pure functions in `src/lib/cash-flow/calculations.ts`. If Health Gauge or Runway tests fail, check the calculation functions first -- especially boundary values (exactly 4.0 and exactly 8.0 weeks).
- **Division-by-zero guards:** Runway calculation must check for zero weekly expenses before dividing. Display "∞" -- not `Infinity`, `NaN`, or a crash.
- **Frequency normalization:** The divisors in `constants/cash-flow.ts` (weekly: 1, biweekly: 2, monthly: 4.33, quarterly: 13, annually: 52) must be used exactly as specified. Tests will verify precise values.
- **Wizard state persistence:** Tests involving abandon/resume rely on the `sessionStorage` key `cash-flow-ritual-state` with a 24-hour TTL. Ensure your TTL check compares `expiresAt` vs current time, not a relative offset.
- **Role-based tests:** Tests run with different user sessions (FP and FOM). Ensure your role-based UI visibility reads from the auth context and uses the `RoleGate` component. The ritual route guard must redirect FOM at the server-page level (not client-side).
- **FOM franchise picker:** Tests will switch franchise via URL param `?franchise=fr_id`. Ensure `useFranchisePicker` syncs with URL params and triggers SWR revalidation on change.
- **Mock APIs:** Tests use mock API responses matching the TypeScript interfaces in `src/types/cash-flow.ts`. Ensure your components handle the response shapes defined in the Implementation Brief (especially `null` values for TCP and projection).
- **Negative TCP display:** Use minus sign prefix `−$1,234.56`, NOT parentheses. This differs from the Dashboard Flow convention.
- **Toast messages:** All toast text must match the constants in `src/constants/cash-flow.ts` exactly. Tests will assert on exact message strings.
- **Chart library:** The Projection Chart uses Recharts. Ensure `recharts` is installed and only the required components are imported: `LineChart`, `Line`, `Area`, `XAxis`, `YAxis`, `Tooltip`, `ResponsiveContainer`.
