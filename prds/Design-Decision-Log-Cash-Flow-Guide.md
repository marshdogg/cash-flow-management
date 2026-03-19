# Design Decision Log: Cash Flow Guide

## Decision #1 --- Chart Library: Recharts

| Field | Value |
|-------|-------|
| Decision | Use Recharts as the charting library for the 13-week projection chart |
| Context | The Cash Flow Guide introduces the first data visualization chart in the WOW OS system. The 13-week projection requires an area chart with a center line, shaded confidence bands (+/-10%), a $0 threshold dashed line, responsive scaling, tooltip on hover, and an empty state. A charting library is needed because building SVG charts from scratch would be costly and brittle. |
| Decision Made | Recharts (new dependency) for all chart rendering in the Cash Flow Guide. |
| Options Considered | A: **Recharts** --- React-native charting library built on D3. Declarative component API (`<AreaChart>`, `<Line>`, `<Area>`, `<ReferenceLine>`). Supports `ResponsiveContainer` for responsive sizing. Actively maintained, 23k+ GitHub stars. / B: **Chart.js + react-chartjs-2** --- Canvas-based, imperative configuration. Good performance but less React-idiomatic. Confidence bands require manual dataset stacking. / C: **Nivo** --- React + D3 wrapper. Beautiful defaults but heavier bundle. Area chart with bands would require custom layers. / D: **Custom SVG** --- No dependency, full control. But significant development effort for responsive behavior, tooltips, animations, and accessibility. |
| Rationale | Recharts is the best fit because: (1) Its declarative JSX API aligns with the React + shadcn component model used throughout WOW OS. (2) The `Area` component natively supports filled confidence bands with opacity control. (3) `ReferenceLine` provides the $0 dashed threshold line without custom SVG. (4) `ResponsiveContainer` handles responsive chart sizing automatically. (5) Tooltip and animation props are first-class. (6) Bundle size (~45kb gzipped) is acceptable for this financial tool. Chart.js was rejected because its imperative config pattern creates a paradigm mismatch with the declarative component architecture. |

---

## Decision #2 --- Gauge Visual Treatment: Arc with Color Fill + Text + Icon

| Field | Value |
|-------|-------|
| Decision | Use a semi-circular arc gauge with color fill, centered text label, and status icon for the Health Gauge |
| Context | The Cash Flow Guide needs a prominent health status indicator that instantly communicates whether a franchise's cash position is Healthy, Caution, or Critical. The PRD specifies triple redundancy (color + text + icon) per WCAG 1.4.1. The visual must feel like a "health meter" that Franchise Partners can interpret in under 2 seconds. |
| Decision Made | Semi-circular SVG arc gauge (180 degrees) with dynamic color fill, centered status text, and a Lucide icon below. |
| Options Considered | A: **Arc gauge** (semi-circle) --- Classic health meter visual. Fill percentage maps to runway weeks. Color changes at threshold boundaries. Text and icon centered within the arc provide redundant status communication. / B: **Pie/donut chart** --- Shows proportion but implies "part of a whole," which is misleading for a health score. Does not naturally convey "good to bad" progression. / C: **Horizontal progress bar** --- Simple but does not feel like a "gauge" or "meter." Already used in the Dashboard Flow for KPI achievement; reusing the same pattern for health status would create visual confusion. / D: **Numeric score only** --- Simplest, but loses the visceral "at a glance" impact. Users would need to remember what score ranges mean. |
| Rationale | The arc gauge is the strongest visual metaphor for "health" or "score." Its semicircular shape is universally recognized from speedometers and fitness trackers, making it instantly interpretable. The fill amount (0-100% of the arc) creates an analog representation of runway health that a progress bar cannot match. Combined with text ("Healthy"/"Caution"/"Critical") and a Lucide icon (`ShieldCheck`/`AlertTriangle`/`AlertOctagon`), the triple redundancy ensures WCAG compliance without sacrificing visual impact. The pie chart was rejected because it implies composition rather than health, and the progress bar was rejected to avoid visual confusion with the Dashboard Flow's KPI progress bars. |

---

## Decision #3 --- Wizard Navigation: Linear Stepper with Back Navigation

| Field | Value |
|-------|-------|
| Decision | Use a horizontal step indicator with linear progression (no skip-ahead) and unrestricted back navigation |
| Context | The Ritual Wizard is a 5-step guided flow: Welcome, Bank Balance, Review Recurring, One-Off Items, Summary. The PRD specifies users cannot skip ahead past the current step but can navigate back to any completed step. The step indicator needs to show progress and enable navigation. |
| Decision Made | Horizontal stepper with numbered circles, connecting lines, and step labels. Linear forward progression enforced. Back navigation via "Back" button and clickable completed step circles. |
| Options Considered | A: **Linear stepper with back** --- Numbered circles connected by lines. Completed steps are clickable. Forward only via "Next" button. Clear visual progress. / B: **Free-form stepper** --- All steps clickable at any time. More flexible but violates the PRD requirement that users cannot skip ahead (e.g., cannot jump to Summary without entering a bank balance). / C: **No visual stepper (just "Step X of 5" text)** --- Minimal UI, no step navigation. Simpler but loses the visual progress feedback and back-navigation affordance. / D: **Accordion/collapsible steps** --- All steps visible, expand/collapse. Works for short forms but the ritual steps have distinct content types (input, list, summary) that do not suit a single-page layout. |
| Rationale | The linear stepper enforces the PRD's sequential requirement (bank balance must be entered before reviewing transactions) while still allowing users to go back and correct earlier entries. The horizontal circles with connecting lines provide a clear visual map of "where I am" and "how much is left," which reduces wizard abandonment. The mobile collapse to "Step 2 of 5: Bank Balance" text preserves the progress signal without taking up horizontal space. Free-form navigation was rejected because entering a bank balance is a prerequisite for meaningful review and summary steps. The accordion pattern was rejected because the ritual steps are conceptually sequential (a journey, not a form). |

---

## Decision #4 --- Mobile Table Treatment: Horizontal Scroll with Sticky First Column

| Field | Value |
|-------|-------|
| Decision | On mobile, the TransactionTable uses horizontal scrolling with a sticky first column (Name) rather than collapsing to cards |
| Context | The Recurring Transactions table has 8 columns (Checkbox, Name, Type, Amount, Frequency, Next Occurrence, Status, Actions). On mobile (<640px), all columns cannot fit. The table must remain functional for viewing and (for FPs) acting on transactions. |
| Decision Made | Horizontal scroll on the table container. Name column is sticky (position: sticky, left: 0). Frequency and Next Occurrence columns are hidden on mobile. Actions available via overflow menu (MoreVertical icon). |
| Options Considered | A: **Horizontal scroll + sticky first column** --- Table structure preserved. Users can scroll to see all data. Name always visible as anchor. Hidden columns reduce scroll distance. / B: **Card layout** --- Each row becomes a card with stacked fields. Better for scanning but loses the tabular comparison ability and makes bulk selection awkward. / C: **Responsive column hiding only** --- Hide multiple columns to fit remaining ones. Risk: too much data loss if many columns hidden, or still too wide if too few hidden. / D: **Expandable rows** --- Show Name + Amount in a row, tap to expand for other fields. Compact but requires extra interaction for every row. |
| Rationale | Horizontal scroll preserves the table's data structure and allows power users to see all fields by scrolling. The sticky first column ensures the transaction name (the primary identifier) is always visible, so users always know which row they are looking at. Hiding Frequency and Next Occurrence on mobile is acceptable because these are secondary reference fields (the PRD lists Name, Type, Amount, and Status as the most important columns). Card layout was rejected because (1) bulk selection with checkboxes is awkward in a card layout, (2) tabular comparison of amounts across transactions is important for the financial review use case, and (3) the table pattern establishes a reusable approach for future data tables in WOW OS. |

---

## Decision #5 --- Health Status Indicators: Color + Text + Icon Triple Redundancy

| Field | Value |
|-------|-------|
| Decision | Health status always displays with three redundant signals: color, text label, and icon |
| Context | WCAG 1.4.1 (Use of Color) requires that color is not the sole means of conveying information. The health status (Healthy/Caution/Critical) is a high-stakes indicator that Franchise Partners and FOMs rely on for decision-making. Misreading health status due to color vision deficiency could lead to missed financial warnings. |
| Decision Made | Every health status display (HealthGauge, CashFlowWidget, SummaryStep badge) uses all three signals simultaneously: color fill/dot, text label ("Healthy"/"Caution"/"Critical"), and Lucide icon (`ShieldCheck`/`AlertTriangle`/`AlertOctagon`). |
| Options Considered | A: **Triple redundancy (color + text + icon)** --- Maximum accessibility. Three independent channels for conveying status. / B: **Color + text only** --- Meets WCAG minimum (text is non-color). Simpler visual, fewer icons. / C: **Color + icon only** --- Visually compact but icon meaning may not be immediately obvious to all users (is a triangle "warning" or "change"?). / D: **Color only** --- Fails WCAG 1.4.1. Not considered as a real option. |
| Rationale | Triple redundancy exceeds the WCAG minimum (color + text) but is warranted for this use case because: (1) Health status is the single most important indicator in the Cash Flow Guide --- it must be unambiguous. (2) The icon adds an emotional signal (shield = safe, triangle = caution, octagon = stop) that reinforces the text label for users who scan visually rather than read. (3) The icon differentiates health indicators from other colored elements (e.g., positive/negative currency values also use green/red). (4) The additional icon has negligible performance and visual cost. Color + text was considered sufficient by WCAG standards but the icon provides meaningful additional signal for a safety-critical financial indicator. |

---

## Decision #6 --- Transaction Editing: Modal (Not Inline)

| Field | Value |
|-------|-------|
| Decision | Use a modal dialog for adding and editing recurring transactions, not inline table editing |
| Context | Franchise Partners need to add new recurring transactions and edit existing ones. The interaction could happen inline within the table row or in a separate modal form. The chosen approach must work consistently on desktop and mobile. |
| Decision Made | Modal dialog (shadcn `Dialog`) for both add and edit operations. On mobile, the modal becomes a full-screen bottom sheet. |
| Options Considered | A: **Modal dialog** --- Separate focused form with all fields. Consistent on desktop (centered overlay) and mobile (bottom sheet). Clear "add/edit" context. Focus trapped for accessibility. / B: **Inline table editing** --- Click a cell to edit it in place. Fast for single-field edits but complex for multi-field editing (name, type, amount, frequency, date). Poor mobile experience (cells too small for inline inputs). / C: **Side panel (drawer)** --- Slide-in panel from right. Keeps table visible but takes significant screen space on mobile. / D: **Separate page** --- Navigate to a `/cash-flow/recurring/edit/[id]` page. Heaviest approach, unnecessary for a 5-field form. |
| Rationale | The modal provides a focused, distraction-free editing experience that works identically on desktop and mobile. On desktop, it overlays the table with a centered dialog. On mobile, it slides up as a full-screen sheet, giving ample room for form fields and the mobile keyboard. Inline editing was rejected because: (1) editing 5 fields inline in a table row creates a complex, cramped UI, especially on mobile; (2) inline editing makes it difficult to validate all fields as a unit before saving; (3) the "add" case has no existing row to edit inline. The modal pattern is already established in the WOW OS design system via shadcn Dialog, so no new interaction paradigm is introduced. |

---

## Decision #7 --- Franchise Picker: Header Dropdown (Not Sidebar Selector)

| Field | Value |
|-------|-------|
| Decision | Place the FOM franchise picker as a dropdown in the page header, not as a sidebar selector or separate page |
| Context | FOMs manage multiple franchises and need to switch between them to view cash flow data. The franchise picker must be accessible from every Cash Flow page (Dashboard, Recurring Transactions) and persist selection across navigation. The PRD specifies it replaces the franchise name in the header for FOM users. |
| Decision Made | shadcn `Select` dropdown in the page header, positioned where the static franchise name appears for FP users. Selection syncs to URL parameter `?franchise=fr_id`. |
| Options Considered | A: **Header dropdown** --- Replaces franchise name with a Select component. Always visible, minimal space usage. URL sync enables deep linking. / B: **Sidebar selector** --- Dedicated section in the sidebar with franchise list. Always visible but takes permanent vertical space in navigation. Conflicts with the shared AppSidebar component. / C: **Separate franchise selection page** --- Landing page with franchise cards, then navigate into a selected franchise. Adds a navigation step before every context switch. / D: **Top bar with tabs** --- Franchise names as horizontal tabs. Does not scale beyond 4-5 franchises. |
| Rationale | The header dropdown is the most space-efficient and contextually appropriate placement. It replaces the franchise name, which is already displayed in the header for FP users, creating a natural conditional element (FP sees text, FOM sees dropdown). The URL sync enables deep linking and sharing of franchise-specific views. The sidebar selector was rejected because (1) it would require modifying the shared AppSidebar component for a Cash Flow-specific need, and (2) it consumes permanent space for a control that FOMs use intermittently. The separate page was rejected because switching franchises should be a lightweight, instant action, not a navigation event. Tabs were rejected because FOMs may manage 10+ franchises, exceeding horizontal tab capacity. |

---

## Decision #8 --- Skeleton Loading: Per-Section Granular (Not Full-Page)

| Field | Value |
|-------|-------|
| Decision | Use per-section skeleton loading instead of a full-page loading spinner or skeleton |
| Context | The Cash Flow Dashboard fetches data from multiple endpoints (TCP/metrics, health status, projection data). Each section may resolve at different times. The loading experience should minimize perceived wait time and show content progressively. |
| Decision Made | Each section (CashPositionCard, HealthGauge, MetricCards, ProjectionChart) renders its own skeleton independently. Sections that resolve first display real data while others continue showing skeletons. Static elements (page header, QuickActions) render immediately without skeletons. |
| Options Considered | A: **Per-section granular skeletons** --- Each section has its own loading state. Fast sections appear first. Progressive disclosure. / B: **Full-page skeleton** --- Single skeleton covering the entire page. Simpler implementation but all-or-nothing: user sees nothing real until everything loads. / C: **Full-page spinner** --- Centered spinner with no content preview. Fastest to implement but provides no layout preview and feels slower. / D: **Loading bar (top of page)** --- Thin progress bar at top of viewport. Provides progress signal but no content preview. Often combined with another approach. |
| Rationale | Per-section skeletons provide the best perceived performance. When the TCP endpoint resolves quickly (expected, as it is a single calculation), the hero card shows real data immediately while the projection chart (which requires more computation) continues loading. This progressive disclosure makes the page feel faster than waiting for all data. It also matches the Dashboard Flow's loading pattern (established in Design-Spec-Dashboard-Flow.md Section 6), maintaining cross-flow consistency. Full-page skeleton was rejected because it creates an unnecessary all-or-nothing wait. Full-page spinner was rejected because it provides no layout preview, making the page feel slower and causing layout shift when content loads. The established pattern from Dashboard Flow V2 validates this approach. |

---

## Decision #9 --- Wizard State Persistence: sessionStorage (Not Server-Side)

| Field | Value |
|-------|-------|
| Decision | Persist ritual wizard in-progress state in browser sessionStorage, not on the server |
| Context | The PRD specifies that abandoning the ritual mid-flow preserves state for 24 hours so users can resume. The wizard collects data across 5 steps (bank balance, recurring transaction confirmations, one-off items) before saving anything to the server on completion. The persistence mechanism must survive page refreshes and tab closes within the session. |
| Decision Made | Wizard state serialized to `sessionStorage` key `cash-flow-ritual-state` with a 24-hour TTL timestamp. State is written on every step advance. On completion, sessionStorage is cleared and a WeeklySnapshot is saved to the server. |
| Options Considered | A: **sessionStorage** --- Browser-native, synchronous, tab-scoped, survives page refresh. 24-hour TTL enforced by checking stored timestamp. No server round-trips for draft state. / B: **Server-side draft** --- Save partial ritual data to the server on each step. Survives browser close and device switch. Requires a "draft" state in the data model and additional API endpoints. / C: **localStorage** --- Persistent across browser sessions. No tab scoping. Risk of stale state if user forgets they started a ritual weeks ago. / D: **React state only (no persistence)** --- Lost on page refresh or navigation. Unacceptable per PRD requirements. |
| Rationale | sessionStorage is the right balance of durability and simplicity. It persists through page refreshes (common during development and user behavior) but is scoped to the browser tab session, reducing stale state risk. The 24-hour TTL check ensures old state is discarded. Server-side drafts were rejected because: (1) the ritual is fundamentally a local data-collection activity until completion; (2) saving drafts to the server adds API complexity (draft endpoints, draft cleanup jobs) for minimal benefit; (3) the PRD explicitly specifies sessionStorage with 24-hour TTL. localStorage was rejected because its indefinite persistence creates stale state risks and cross-tab conflicts. The PRD's Q&A #8-9 confirms this approach: if sessionStorage is cleared mid-ritual, the wizard simply resets to Step 1 with no data loss. |

---

## Decision #10 --- Currency Input Behavior: Format on Blur, Raw on Focus

| Field | Value |
|-------|-------|
| Decision | Currency input fields display formatted values when blurred and raw numeric values when focused |
| Context | The Bank Balance input (Step 2) and transaction Amount input require currency formatting ($XX,XXX.XX). The formatting behavior during editing affects usability: users need to type raw numbers easily but see formatted values for verification. |
| Decision Made | On focus: strip formatting, show raw numeric value, cursor at end. On blur: format as `$XX,XXX.XX` with commas and 2 decimal places. While typing: no live formatting (raw input). |
| Options Considered | A: **Format on blur, raw on focus** --- User types freely, sees formatted result on blur. Clean editing experience. / B: **Live formatting while typing** --- Format as user types (add commas, move cursor). More polished but cursor position management is complex and error-prone. Confusing when deleting characters. / C: **Format on submit only** --- No visual formatting until form submission. User never sees formatted value during entry. / D: **Masked input** --- Fixed format mask ($___,___.__ ) with cursor jumping. Restrictive and frustrating for variable-length amounts. |
| Rationale | Format on blur provides the best balance of editing ease and visual verification. When focused, the user sees a clean numeric value they can freely type, select, and delete. When they tab away or click elsewhere, the formatted value confirms what they entered (e.g., "45000" becomes "$45,000.00"). This is a well-established pattern used by financial applications. Live formatting was rejected because cursor position management during typing (especially with commas shifting) creates usability issues --- users report the cursor "jumping" when commas are inserted. Masked input was rejected because it forces a fixed character count that does not accommodate the wide range of amounts ($0.00 to $999,999,999.99). |

---

## Decision #11 --- Empty Dashboard State: Section-Level Guidance (Not Onboarding Overlay)

| Field | Value |
|-------|-------|
| Decision | First-time users see per-section empty states with guidance text, not a full-page onboarding overlay or tour |
| Context | When a Franchise Partner first visits the Cash Flow Dashboard before completing any ritual, all sections have no data. The empty state must guide them toward completing their first ritual without being overwhelming. |
| Decision Made | Each section renders its own empty state: "---" values with contextual guidance text ("Complete your first ritual to see your cash position"). The "Start Ritual" button in QuickActions gets a subtle pulse border animation to draw attention. No overlay, tour, or modal. |
| Options Considered | A: **Per-section empty states with contextual guidance** --- Each card shows its empty state independently. Guidance text is specific to each section. "Start Ritual" CTA is emphasized. / B: **Full-page onboarding overlay** --- Welcome modal or overlay with "Get started" flow. Blocks the page until dismissed. / C: **Guided tour** --- Step-by-step tooltip tour highlighting each section. Requires a tour library (additional dependency). / D: **Completely blank page with single CTA** --- Hide all sections, show only "Welcome! Complete your first ritual to get started." Single button. |
| Rationale | Per-section empty states show users what the dashboard will look like once populated, establishing expectations without blocking interaction. Users can see the full layout (TCP card, Health Gauge, Metrics, Projection Chart) and understand the data they will receive after their first ritual. This "preview of what's coming" approach is more motivating than a blank page or a blocking overlay. The pulsing "Start Ritual" CTA provides clear direction without being intrusive. Full-page overlays were rejected because they block the page and are frequently dismissed without reading. Guided tours were rejected because they add a dependency and are often skipped by users. A blank page was rejected because it provides no context about the tool's value proposition. |

---

## Decision #12 --- Projection Chart on Mobile: 8-Week Truncation with Link

| Field | Value |
|-------|-------|
| Decision | On mobile (<640px), truncate the projection chart to 8 weeks with a "See full projection" link |
| Context | The 13-week projection chart has 13 data points on the x-axis. On mobile screens (<640px), fitting 13 axis labels creates overlapping text and a cramped chart. The PRD specifies responsive behavior for the projection chart on mobile. |
| Decision Made | Mobile renders 8 weeks of the 13-week projection. The chart is 180px tall (vs. 280px desktop). X-axis labels are rotated 45 degrees. A "See full projection" text link below the chart navigates to (or scrolls to) a full-width, full 13-week view. |
| Options Considered | A: **8-week truncation + link** --- Show fewer weeks, clear link to full data. Chart remains readable. / B: **Full 13 weeks, smaller font** --- Keep all data but shrink axis labels. Risk: labels become unreadable at 9-10px on mobile. / C: **Horizontal scroll on chart** --- Full 13 weeks in a scrollable chart container. Conflicts with page scroll (two scroll axes). / D: **Replace chart with summary text** --- On mobile, show "Your projection is [positive/negative] over 13 weeks" as text instead of a chart. Loses the visual impact. |
| Rationale | 8-week truncation preserves the chart's readability on mobile while still showing the near-term trend (the most actionable timeframe). The "See full projection" link provides access to all 13 weeks for users who need it. Full 13-week rendering was rejected because axis labels below 10px are unreadable on mobile, and the data points become too dense for touch interaction (tooltip targeting). Horizontal scroll was rejected because nested horizontal scroll (chart within page) creates scroll hijacking issues on mobile browsers. Text replacement was rejected because the visual chart is a key value proposition of the Cash Flow Guide --- losing it on mobile diminishes the experience for the majority of users who access financial tools on their phones. |
