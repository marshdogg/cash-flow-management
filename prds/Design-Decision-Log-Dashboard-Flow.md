# Design Decision Log: Dashboard Flow

## Decision #1 — KpiCard as new component vs. extending shadcn Card
### Context
The dashboard requires cards showing value + trend + target + progress bar + click navigation. No single existing shadcn/ui component combines all of these.
### Options Considered
1. **Compose from shadcn primitives** (Card + Progress + Badge) — Flexible but verbose, no shared styling for the 3 variants (standard/highlight/alert).
2. **New KpiCard component** — Single reusable component with variant prop. Encapsulates all KPI display logic.
### Decision
Option 2 — New `KpiCard` component.
### Rationale
KPI cards appear 8 times across the dashboard (4 on Overview, 4 on Profitability) with consistent structure but varying data. A dedicated component ensures visual consistency, reduces template duplication, and provides a clean API for the variants (standard, highlight, alert). The progress bar overflow behavior (>100%) is specific enough to warrant encapsulation.
### Impact
New component added to design system. May be reused in future role-specific dashboards (files 35-37) and potentially the FOM Network Dashboard.

---

## Decision #2 — Progress bar overflow visualization (extends past track)
### Context
PRD §6.2 and product decision: when a KPI exceeds its target (>100%), the progress bar should visually extend past the track.
### Options Considered
1. **Cap at 100%** — Bar fills completely, label shows true percentage. Simpler.
2. **Overflow visualization** — Bar extends past the right edge of the track to show over-achievement proportionally.
### Decision
Option 2 — Overflow visualization.
### Rationale
Product owner decision. Over-achievement is a positive signal that deserves visual celebration. The overflow creates a "breaking the bar" effect that reinforces success. Implementation: progress bar container uses `overflow: visible`, bar width calculated as actual percentage (e.g., 120% of container width). Label shows true percentage in `--color-success-600`.
### Impact
KpiCard component must handle overflow: visible on the progress bar container. Maximum visual overflow capped at 150% to prevent extreme layouts.

---

## Decision #3 — Task completion animation: strikethrough + slide-out (not fade)
### Context
PRD §6.2 specifies task completion visual behavior. Need to choose between fade-out and slide-out for the removal animation.
### Options Considered
1. **Fade out** — Opacity → 0, then remove. Simple but can leave layout gaps during transition.
2. **Slide out left + collapse** — translateX(-100%) + height → 0. More dynamic, clearly communicates "removal."
### Decision
Option 2 — Slide out left with height collapse.
### Rationale
The slide-out provides a clearer affordance that the task has been "completed and removed" rather than "disappeared." The 3-second undo window uses strikethrough + opacity 0.5 (static, no animation) to signal "completing but reversible." After 3 seconds, the slide-out animation (300ms) signals finality. The height collapse prevents layout jump.
### Impact
DashboardTaskItem needs CSS transitions for transform and max-height. The undo window is a state, not an animation.

---

## Decision #4 — Profitability tab hidden (not disabled) for restricted roles
### Context
PRD §6.1: Profitability tab is hidden for Estimator and PM roles. Need to choose between hiding and disabling.
### Options Considered
1. **Disabled tab** — Visible but grayed out, tooltip explaining restricted access. Informs users the tab exists.
2. **Hidden tab** — Not rendered at all. Cleaner interface, no questions about why it's disabled.
### Decision
Option 2 — Hidden (not rendered).
### Rationale
PRD explicitly states "not rendered (not disabled — invisible)." A disabled tab raises "why can't I see this?" questions that create support burden. Hiding keeps the interface clean for roles that don't need financial data. If users switch roles, the tab appears naturally.
### Impact
Tab rendering must be conditional on user role. URL param fallback (`?tab=profitability` for unauthorized role) silently redirects to Overview.

---

## Decision #5 — FOM context: hide My Tasks entirely (not show read-only)
### Context
Eddie's edge case 3.1: When an FOM views another franchise's dashboard, should they see the FP's tasks as read-only, or hide My Tasks entirely?
### Options Considered
1. **Show FP's tasks read-only** — Provides coaching context ("I see you have 3 overdue tasks"). Requires read-only task rendering variant.
2. **Hide My Tasks entirely** — Simpler. Operational focus items provide sufficient coaching context.
### Decision
Option 2 — Hide entirely.
### Rationale
PRD decision. Showing another user's personal tasks could feel invasive and creates privacy concerns. The FOM's coaching value comes from operational metrics (KPIs, focus items, pipeline), not individual task lists. Hiding avoids building a read-only task variant that serves only one use case.
### Impact
My Tasks section conditionally rendered based on whether the user is viewing their own franchise vs. another. FOM context detection required.

---

## Decision #6 — Checkbox error animation: shake (not color flash)
### Context
When a task completion API call fails, the checkbox needs to revert. Need an error animation.
### Options Considered
1. **Color flash** — Checkbox briefly turns red, then reverts. Subtle.
2. **Shake animation** — Checkbox shakes horizontally (translateX ±2px, 3 times, 200ms), then reverts. More noticeable.
3. **No animation** — Just revert + toast. Relies entirely on toast for feedback.
### Decision
Option 2 — Shake animation + error toast.
### Rationale
The shake provides immediate visual feedback at the point of interaction (the checkbox itself), while the toast provides the explanatory text. Together they make the failure obvious without being alarming. The shake animation is a common error pattern (e.g., login form shake on wrong password).
### Impact
TaskCheckbox component needs a `shake` CSS keyframe animation. Triggered when API returns error.

---

## Decision #7 — Funnel mini: horizontal with arrows (not vertical or minimal)
### Context
Sales tab needs a compact funnel visualization. The full Funnel flow uses a kanban/card view. Dashboard needs a summary.
### Options Considered
1. **Horizontal stages with → arrows** — Matches the left-to-right funnel progression mental model.
2. **Vertical stages** — Stacks top to bottom. More mobile-friendly but less intuitive.
3. **Minimal counts only** — Just numbers in a grid. Simplest but loses the funnel narrative.
### Decision
Option 1 desktop / Option 2 mobile.
### Rationale
The horizontal layout with arrow connectors visually tells the story of deal progression (New → Scheduled → Sent → Won → Booked). This matches the mental model of a sales funnel. On mobile (<768px), the horizontal layout doesn't fit, so stages stack vertically with ↓ arrows. Each stage is clickable and shows count + trend.
### Impact
FunnelMini component needs responsive layout switching. Must visually relate to the full Funnel flow (same stage names, same color conventions).

---

## Decision #8 — Stale data indicator: dot badge (not banner)
### Context
When data is >15 minutes old, the PRD requires a visual warning. Need to choose the visual treatment.
### Options Considered
1. **Amber dot badge** — Small (8px) amber dot next to "Last update" text. Subtle, non-intrusive.
2. **Warning banner** — Full-width amber banner below header. Prominent but potentially alarming.
3. **Amber text color** — "Last update" text changes to amber. Moderate visibility.
### Decision
Option 1 — Amber dot badge with tooltip.
### Rationale
Stale data is informational, not critical. An 8px amber dot is noticeable to attentive users without creating alarm. The tooltip ("Data may be outdated. Click Refresh to update.") provides context on demand. A full banner would be disproportionate for what may be a momentary condition (auto-refresh will resolve it within 5 minutes).
### Impact
Small StatusBadge component (reusable). Positioned adjacent to "Last update" timestamp. Tooltip on hover/focus.

---

## Decision #9 — DDL-09: Toast system placement — layout level vs. per-page
### Context
The toast notification system needs to be available across the entire application. Decision: where to mount the ToastProvider.
### Options Considered
1. **Per-page ToastProvider** — Each page/flow mounts its own ToastProvider. Allows page-specific configuration but duplicates setup and risks missed toasts during navigation.
2. **Layout-level ToastProvider** — Single ToastProvider wraps the root layout. Global availability, single source of truth.
### Decision
Option 2 — Layout-level ToastProvider for global availability.
### Rationale
Toasts are a cross-cutting concern. Mounting at the layout level ensures every page and component can trigger toasts via the `useToast` hook without additional setup. It also ensures toasts persist across client-side navigations (e.g., a success toast triggered on tab switch remains visible). A single provider avoids duplicate toast containers and stacking conflicts.
### Impact
ToastProvider added as a required shared component wrapping the root layout. All flows benefit without per-page configuration.

---

## Decision #10 — DDL-10: Edge value "—" display format
### Context
When a data value is null or unavailable, the UI needs a consistent placeholder. Need to choose the visual representation.
### Options Considered
1. **Em dash (—)** — Single character, clean, minimal visual weight.
2. **"N/A"** — Explicit but could be confused with "not applicable" vs. "not available."
3. **"No data"** — Most explicit but takes more space and adds visual noise in dense layouts.
### Decision
Option 1 — Em dash (—) for consistency with existing KPI empty state.
### Rationale
The KPI cards already use "—" for empty states (established in the original design spec, Section 6 Empty States). Using the same character across all components (StatCard, FunnelStage, PLRow, CollectionsGrid) maintains visual consistency. The em dash is compact, universally understood as "no value," and does not introduce ambiguity between "not applicable" and "not available."
### Impact
All null/empty value displays across dashboard components use "—" in `--color-neutral-500`. No new patterns introduced.

---

## Decision #11 — DDL-11: Progress bar cap — 100% vs. 150%
### Context
Original design (Decision #2) allowed the progress bar to overflow past the track up to 150% to celebrate over-achievement. This caused layout issues and visual inconsistency.
### Options Considered
1. **Keep 150% overflow** — Visual celebration of over-achievement, but causes layout unpredictability and overflow clipping issues in grid layouts.
2. **Cap at 100% fill width** — Bar never exceeds its track. Over-achievement communicated exclusively through the text label and its color.
### Decision
Option 2 — Changed from 150% to 100%. Bar never exceeds track. Over-achievement communicated via text label color change.
### Rationale
The overflow visualization created edge cases: nested overflow containers, clipping in 4-column grid at certain viewport widths, and inconsistent visual weight between KPI cards with different achievement levels. Capping at 100% width keeps the progress bar predictable and contained. The achievement percentage text (e.g., "125%") rendered in `--color-success-600` clearly communicates over-achievement without layout side effects. This is a reversal of Decision #2.
### Impact
KpiCard progress bar simplified: no `overflow: visible` needed on container. Achievement text label carries the over-achievement signal. Supersedes Decision #2 overflow behavior.

---

## Decision #12 — DDL-12: Role-based hiding — CSS display:none vs. conditional render
### Context
When elements are hidden due to role-based access (e.g., Profitability tab for Estimators, "Set target" links for non-admin roles), need to choose the hiding mechanism.
### Options Considered
1. **CSS `display: none`** — Element exists in DOM but is visually hidden. Simpler to implement but element is discoverable via DOM inspection.
2. **Conditional render (not in DOM)** — Element is never rendered. Not present in DOM at all.
### Decision
Option 2 — Conditional render (not in DOM) for security.
### Rationale
CSS `display: none` leaves the element in the DOM, which means it can be discovered and potentially re-enabled by users with browser developer tools. For role-based access controls — especially around financial data (Profitability tab, P&L) — the element must not exist in the rendered output. Conditional rendering (`{hasPermission && <Component />}`) ensures the markup is never sent to the client. This aligns with the principle of least privilege and prevents information leakage.
### Impact
All role-gated UI elements use conditional rendering. No CSS-based hiding for access control. This applies to: Profitability tab, "Set target" links, FOM read-only mode interactive elements, and My Tasks in FOM context.
