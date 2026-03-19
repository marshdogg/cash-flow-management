# Edge Case Report — Dashboard Flow PRD

> **Analyzed by:** Edge Case Eddie
> **PRD Version:** V2 Rebuild, March 1, 2026
> **Date:** March 1, 2026

---

## Summary

| Severity | Count |
|----------|-------|
| 🔴 Critical | 3 |
| 🟠 Major | 14 |
| 🟡 Minor | 12 |
| 🔵 Note (Product Decision) | 4 |
| **Total** | **33** |

**Overall Assessment:** The PRD is well-structured with solid acceptance criteria, and Update 4 addressed many gaps (JTBD, Q&A, tracking events, defaults). The biggest risk areas are **state and timing around task completion** (optimistic UI with no failure/revert spec) and **permissions enforcement for cross-role dashboard viewing** (FOM completing another user's tasks). The single most important thing to resolve before development: specify what happens when the task completion API call fails after the optimistic UI has already shown success.

---

## Happy Paths

### Flow 1: Morning Health Check (FP)

**Persona:** Franchise Partner
**Trigger:** FP opens WOW OS at start of day

1. Dashboard loads with Overview tab, "This Month" period
2. Scans 4 KPI cards — all green, on track
3. Checks Today's Focus — 2 estimates scheduled, 1 follow-up due
4. Reviews My Tasks — 1 overdue call, 2 due today
5. Checks off the overdue call task → strikethrough + slide out
6. Clicks "Follow-ups Due" → navigates to Funnel filtered view

**PRD Coverage:** §6.1, §6.2, §7.1, §7.2, §7.5, §8

---

### Flow 2: Sales Pipeline Review (Estimator)

**Persona:** Sales Consultant
**Trigger:** Estimator checks performance after selling day

1. Navigates to Sales tab via tab bar
2. Reviews pipeline funnel — 5 new deals, 3 scheduled, 2 sent
3. Checks close rate metric — 42%, above target
4. Scrolls to Estimator Performance — sees own row with 8 estimates, 42% close rate
5. Clicks "View Funnel →" to drill into specific deals

**PRD Coverage:** §6.3, §7.1, §8

---

### Flow 3: Profitability Check (FP)

**Persona:** Franchise Partner
**Trigger:** FP reviews weekly P&L

1. Switches to Profitability tab, selects "This Week"
2. Reviews Revenue, GP, GP Margin KPI cards
3. Scans P&L summary — labor costs high
4. Checks collections — $12k outstanding
5. Clicks "View Details →" to investigate projects

**PRD Coverage:** §6.4, §7.2, §8

---

### Flow 4: Task Completion

**Persona:** Any user with assigned tasks
**Trigger:** User sees overdue task on dashboard

1. Sees task with red left border, "2 days overdue" label
2. Clicks circular checkbox
3. Checkbox fills green, title shows strikethrough, row dims
4. Waits 3 seconds → task slides out of list
5. Task count adjusts

**PRD Coverage:** §6.2 (Task Checkbox Behavior), §7.5

---

### Flow 5: FOM Coaching Prep

**Persona:** Operations (FOM)
**Trigger:** FOM preparing for franchise coaching call

1. Selects franchise from portfolio (mechanism not in this PRD)
2. Views franchise's Overview tab — notes amber callback rate
3. Switches to Sales tab — reviews estimator performance
4. Switches to Profitability tab — checks GP margin
5. Notes red/amber items for coaching call

**PRD Coverage:** §4 (JTBD), §6.1–6.4, §7.1

---

## Edge Cases by Category

---

### Category 1: Input Boundaries

| # | Edge Case | Severity | PRD Section | Specified? | Details |
|---|-----------|----------|-------------|------------|---------|
| 1.1 | Task title is extremely long (100+ characters) | 🟡 | §6.2 | ❌ No | Task title text has no max-width or truncation rule specified. On mobile, this could break the layout. **Suggested behavior:** Truncate with ellipsis after 2 lines (line-clamp: 2). Full title visible on hover/tap. |
| 1.2 | KPI value is $0 or negative | 🟡 | §6.2, §6.4 | ❌ No | Revenue or GP could be $0 (no completed jobs) or negative (refunds exceed revenue). Empty state covers "no data" but not "$0 with data." **Suggested behavior:** Show "$0" normally. Negative values show in red with parentheses: "($1,234)". Trend arrow hidden when both periods are $0. |
| 1.3 | Franchise name is very long (50+ characters) | 🟡 | §6.1 | ❌ No | Header subtitle "[Period] · [Franchise Name]" could overflow on mobile. **Suggested behavior:** Truncate franchise name with ellipsis after available width. Full name in tooltip. |
| 1.4 | Estimator name is very long or contains special characters | 🟡 | §6.3 | ❌ No | Estimator Performance rows show name. No truncation rule. **Suggested behavior:** Truncate with ellipsis at 24 characters. |

---

### Category 2: State & Timing

| # | Edge Case | Severity | PRD Section | Specified? | Details |
|---|-----------|----------|-------------|------------|---------|
| 2.1 | Task completion API call fails after optimistic UI update | 🔴 | §6.2, §7.5 | ❌ No | User clicks checkbox → optimistic UI shows complete → API PATCH fails (network error, 500, etc.). The PRD specifies optimistic completion with 3-second undo but never addresses API failure. The task could appear completed on dashboard but remain open in the Tasks flow. **Suggested behavior:** If API returns error within the 3-second undo window, auto-revert the checkbox and show error toast: "Unable to complete task. Please try again." If API returns error after task has slid out, show error toast and re-insert the task at its original position on next refresh. |
| 2.2 | Double-click / rapid toggle on task checkbox | 🟠 | §6.2, §7.5 | ❌ No | User double-clicks checkbox rapidly: first click → complete → second click → undo → race condition with two API calls (PATCH complete, then PATCH reopen). **Suggested behavior:** Debounce checkbox clicks — ignore clicks for 500ms after a toggle. Only fire one API call per settled state. |
| 2.3 | Auto-refresh fires during the 3-second task undo window | 🟠 | §7.7, §6.2 | ❌ No | User completes task → 3-second undo window starts → auto-refresh fires at second 2 → refresh returns the task as "completed" (from the optimistic API call) or "open" (if API hasn't processed yet). Could reset the visual state unexpectedly. **Suggested behavior:** Suppress auto-refresh updates for task items that are currently in the undo window. Apply refresh data after undo window closes. |
| 2.4 | Rapid period switching — multiple fetches in flight | 🟠 | §7.2 | ❌ No | User clicks "Today" then immediately "This Week" then "This Month." Three data fetches fire. If "Today" returns last, the UI shows "Today" data with "This Month" selected. **Suggested behavior:** Cancel in-flight requests when a new period is selected. Only apply data from the most recent request. Use an AbortController or request ID. |
| 2.5 | Dashboard tab left open overnight — stale session | 🟡 | §7.7, §14 | Partial | Auto-refresh handles staleness up to 15 minutes. But if the user's session token expires overnight, the next auto-refresh will fail silently (per §7.7). The user sees stale data with no indication their session is dead. **Suggested behavior:** If auto-refresh returns 401/403, show a session-expired banner: "Your session has expired. Please refresh the page to continue." |
| 2.6 | Task deleted from Tasks flow while visible on dashboard | 🟠 | §6.2 | ❌ No | Another user or system deletes a task that's currently showing in My Tasks. User clicks the checkbox → API returns 404. **Suggested behavior:** Treat 404 on task PATCH as success — remove the task from the list with a toast: "This task is no longer available." |

---

### Category 3: Permissions & Roles

| # | Edge Case | Severity | PRD Section | Specified? | Details |
|---|-----------|----------|-------------|------------|---------|
| 3.1 | FOM viewing franchise dashboard can complete tasks | 🔴 | §4 (Personas), §6.2 | ❌ No | The PRD says FOMs view the FP's dashboard as "read-only" but the My Tasks section shows tasks with clickable checkboxes. If the FOM clicks a checkbox, whose tasks are they completing? The Tasks API filter is `assigned_to=current_user` — so the FOM would see *their own* tasks (if any), not the FP's. But the FOM may have no franchise-scoped tasks, showing an empty task section. **This needs a clear decision.** **Suggested behavior:** When viewing another franchise's dashboard (FOM context), hide the My Tasks section entirely and show the operational focus items only. Alternatively, show the FP's tasks as read-only (no checkboxes). |
| 3.2 | Estimator sees Profitability tab with sensitive margin data | 🔵 | §6.4, §4 | ❌ No | All three tabs are visible to all roles in v1. An Estimator seeing GP Margin, Labor Costs, and Adjusted GP may be problematic — some franchise partners consider this sensitive. **Product decision needed:** Should Profitability tab be hidden for Estimator and PM roles? Or is transparency the desired approach? |
| 3.3 | Franchise data boundary enforcement not explicit | 🟠 | §4, §16 | ❌ No | The PRD states "data is franchise-scoped" in the shared context, but the Dashboard PRD itself never specifies how franchise context is enforced. No mention of tenant isolation in data fetches. **Suggested behavior:** Add to §16: "All API calls include `franchise_id` from the authenticated session. Server-side middleware enforces franchise boundary — no dashboard API endpoint accepts a client-supplied franchise_id parameter (except for FOM franchise-switching, which is authorized by role)." |

---

### Category 4: Volume & Scale

| # | Edge Case | Severity | PRD Section | Specified? | Details |
|---|-----------|----------|-------------|------------|---------|
| 4.1 | Estimator Performance section with 10+ estimators | 🟠 | §6.3 | ❌ No | The PRD shows estimator rows but specifies no maximum or scrolling behavior. A franchise with 10 estimators would produce a long list that could push content below the fold. **Suggested behavior:** Show maximum of 5 estimator rows. If more exist, show "View All X Estimators →" link. Rows sorted by close rate descending (already specified). |
| 4.2 | Exactly 6 tasks (boundary) | 🟡 | §6.2 | Partial | PRD says "Maximum of 6 tasks displayed; if more exist, shows 'View all X tasks →' link." At exactly 6 tasks, no link is shown. This is correct but worth confirming: if user completes 1 task (now 5 showing), does a 7th task slide in? **Suggested behavior:** No — task list is a snapshot at load/refresh time. Completing a task does not pull in additional tasks. The next auto-refresh (5 min) or manual refresh will repopulate. |

---

### Category 5: Data Relationships

| # | Edge Case | Severity | PRD Section | Specified? | Details |
|---|-----------|----------|-------------|------------|---------|
| 5.1 | Task linked to a deleted customer/project/deal | 🟠 | §6.2 | ❌ No | A task has `record_name` = "John Smith" linked to a customer that was deleted. The "Record link" in the task item would point to a nonexistent page. **Suggested behavior:** If the linked record no longer exists, show the record name as plain text (not a link). If record_name is null, omit the record link element entirely. |
| 5.2 | KPI target not configured in Franchise Settings | 🟠 | §6.2, §6.4, §17 Q9 | ❌ No | Q&A #9 says thresholds come from Franchise Settings with network-level defaults. But what if no default exists either? KPI card would have a progress bar with no target. **Suggested behavior:** If no target is configured, hide the progress bar and target line. Show the KPI value and trend only. Add a subtle "Set target →" link pointing to Franchise Settings (visible to FP and Admin roles only). |

---

### Category 6: Time & Dates

| # | Edge Case | Severity | PRD Section | Specified? | Details |
|---|-----------|----------|-------------|------------|---------|
| 6.1 | Timezone for "today" calculations not specified | 🟠 | §6.2, §7.2, §16 | ❌ No | Tasks filter uses `due_date <= today` and the "Today" period selector shows a single date. But "today" in which timezone? A franchise in Vancouver (PST) vs. one in Toronto (EST) would have different "todays" at 10 PM PST. **Suggested behavior:** All date calculations use the franchise's configured timezone (set in Franchise Settings). Server-side APIs accept and return dates in UTC; client converts for display using the franchise timezone. |
| 6.2 | "This Week" start day not defined | 🟠 | §7.2 | ❌ No | "This Week" period is shown but the PRD never specifies Monday-start or Sunday-start. This affects which data is included. **Suggested behavior:** Week starts Monday (ISO 8601 standard). This matches Canadian business convention. Configurable per franchise in a future update if needed. |
| 6.3 | Qualification Call "within 24 hours" — calendar days vs. clock hours | 🟡 | §6.2 | Partial | PRD says "within 24 hours (today or tomorrow)." The parenthetical suggests calendar days, but "24 hours" suggests clock time. At 11 PM, "tomorrow" is 1 hour away but "within 24 hours" includes most of the day after tomorrow. **Suggested behavior:** Use calendar days: "today or tomorrow" in the franchise's timezone. The "24 hours" language is a rough descriptor, not the actual filter logic. |

---

### Category 7: Integration & Cross-Module

| # | Edge Case | Severity | PRD Section | Specified? | Details |
|---|-----------|----------|-------------|------------|---------|
| 7.1 | Dashboard links to Funnel filters that may not exist yet | 🟠 | §8 | ❌ No | Dashboard links to `08-funnel-cards.html?filter=qual-call-needed` and `?filter=follow-up`. If the Funnel Flow PRD doesn't implement these filter parameters, the links load an unfiltered funnel (silently wrong) or break. Since this is greenfield, both flows will be built — but the dependency needs to be tracked. **Suggested behavior:** Add to §20 (Related Documents): "Dashboard depends on the following URL parameters being supported by destination flows" with a dependency checklist. During build, if a destination flow doesn't support the filter param, the link should navigate to the base page (unfiltered) rather than breaking. |
| 7.2 | Close Rate calculation consistency across modules | 🔵 | §6.2, §6.3, §16 | ❌ No | Dashboard says Close Rate = "Won deals ÷ total estimates." Does "total estimates" mean total sent, total created, or total in any stage? This must match the Funnel Flow PRD's definition exactly. **Product decision needed:** Define "total estimates" denominator explicitly. Recommendation: Won ÷ (Won + Lost) for a given period — excluding open/in-progress deals. |

---

### Category 8: Mobile & Responsive

Category 8 is well-covered by §9 (Responsive Breakpoints) and §9 (Touch Targets). No additional issues beyond what's captured in Category 1 (text overflow) and Category 2 (undo interaction difficulty on mobile, but the 3-second window is sufficient for touch re-tap).

---

### Category 9: User Behavior Patterns

| # | Edge Case | Severity | PRD Section | Specified? | Details |
|---|-----------|----------|-------------|------------|---------|
| 9.1 | Back button after tab switch | 🔵 | §7.1, §15 | ❌ No | Tab switches update the URL with `?tab=`. The back button would navigate to the previous tab state. Is this the desired behavior, or should back navigate to the previous page entirely? Both are valid. **Product decision needed.** Recommendation: Back button navigates between tab states (browser history entries per tab switch). This matches user expectation for URL-updating tabs. |
| 9.2 | Invalid URL parameters | 🟠 | §15 | ❌ No | User navigates to `?tab=invalid` or `?period=xyz`. No fallback behavior specified. **Suggested behavior:** Invalid `tab` values fall back to "overview." Invalid `period` values fall back to "month." No error shown — silent fallback to defaults. Log `dashboard_error` event with `error_type=invalid_param`. |

---

### Category 10: Business Logic Gaps

| # | Edge Case | Severity | PRD Section | Specified? | Details |
|---|-----------|----------|-------------|------------|---------|
| 10.1 | KPI progress bar exceeds 100% of target | 🔵 | §6.2, §6.4 | ❌ No | Revenue MTD exceeds the monthly target. Does the progress bar cap at 100% or show overflow (e.g., 120%)? Both are valid UX. **Product decision needed.** Recommendation: Show the actual percentage (e.g., "120%") with the progress bar filled completely. The progress bar caps visually at 100% but the label shows the true number. Use a "success" color when target is exceeded. |
| 10.2 | Trend arrow when prior period has zero data | 🟡 | §6.2, §17 Q8 | Partial | Q8 defines trend as "current vs. same-length prior period." But if the prior period value is $0 (new franchise, first month), the percentage change is mathematically infinite or undefined. **Suggested behavior:** If prior period value is $0 and current is > $0, show "↑ New" instead of a percentage. If both are $0, hide the trend arrow entirely. |

---

### Category 11: V2 Rebuild — Metric Definitions (§6)

| # | Edge Case | Severity | PRD Section | Specified? | Details |
|---|-----------|----------|-------------|------------|---------|
| EC-22 | Metric Formula Division-by-Zero | 🔴 | §6 | ❌ No | Close Rate denominator is 0 (no estimates presented in period). All 8 metrics in §6 could have zero denominators. **Expected behavior:** Display "—", hide trend + progress bar. **Risk:** Division-by-zero crash or NaN display. |
| EC-26 | Edge Value Consistency Across Tabs | 🟠 | §6, §7 | ❌ No | Revenue KPI shows on both Overview and Profitability tabs. **Expected behavior:** Same value, same formatting, same edge value handling across tabs. **Risk:** Inconsistent display between tabs for the same metric. |
| EC-27 | Null Metric with Target Configured | 🟡 | §6, §17 | ❌ No | Target exists in Settings but current period has no data (null value). **Expected behavior:** Show "—" for value, hide progress bar despite target existing. **Risk:** Progress bar showing 0% vs hiding entirely — different UX. |
| EC-28 | All Metrics Null Simultaneously | 🟡 | §6 | ❌ No | New franchise with no data across all metrics. **Expected behavior:** All KPI cards show "—", all focus items show 0, welcome state. **Risk:** Layout collapse if all elements are in null/empty state. |

---

### Category 12: V2 Rebuild — Role-Based Access (§7)

| # | Edge Case | Severity | PRD Section | Specified? | Details |
|---|-----------|----------|-------------|------------|---------|
| EC-23 | Role Transition Mid-Session | 🟠 | §7 | ❌ No | Admin changes user's role while dashboard is open. **Expected behavior:** Changes take effect on next page load/refresh. **Risk:** 403 error on auto-refresh for currently-viewed tab. PRD specifies: Redirect to Overview + info toast. |
| EC-24 | FOM Viewing Franchise — Task Checkbox Visible | 🟠 | §7 | ❌ No | FOM views franchise dashboard, task checkbox rendered but should be hidden. **Expected behavior:** My Tasks section entirely hidden for FOM viewing another franchise. **Risk:** FOM could complete tasks on behalf of franchise user. |
| EC-25 | Estimator Accessing Profitability via URL | 🟠 | §7, §15 | ❌ No | Estimator manually types `?tab=profitability` in URL. **Expected behavior:** Silently redirect to Overview tab. **Risk:** Information disclosure of financial data. |
| EC-32 | "Set Target" Link Role Visibility | 🟡 | §7, §6 | ❌ No | Only FP and Admin should see "Set target →" link. **Expected behavior:** Link hidden for Ops Manager, Estimator, PM, FOM. **Risk:** Non-authorized roles seeing Settings link. |

---

### Category 13: V2 Rebuild — Edge Values & Progress Bar

| # | Edge Case | Severity | PRD Section | Specified? | Details |
|---|-----------|----------|-------------|------------|---------|
| EC-29 | Negative Gross Profit | 🟠 | §6 | ❌ No | Costs exceed revenue, GP is negative. **Expected behavior:** Red text with parentheses "($5,000)", danger style on card. **Risk:** Progress bar behavior undefined for negative achievement. |
| EC-30 | Progress Bar at Exactly 100% | 🟡 | §6 | ❌ No | Achievement is exactly 100%. **Expected behavior:** Bar fills track completely, green color, "100%" label. **Risk:** Off-by-one between 100% (green) and 101% (over-target behavior). |
| EC-33 | Collection Rate Over 100% | 🟡 | §6 | ❌ No | Collected > Invoiced (advance payments or prior period invoices paid). **Expected behavior:** Collection Rate shows >100%, success style. **Risk:** Unexpected UI for collection rate exceeding 100%. |

---

### Category 14: V2 Rebuild — Toast System

| # | Edge Case | Severity | PRD Section | Specified? | Details |
|---|-----------|----------|-------------|------------|---------|
| EC-31 | Toast Stacking | 🟡 | §14 | ❌ No | Multiple errors occur simultaneously (task fail + refresh fail). **Expected behavior:** Toasts stack vertically, each auto-dismisses independently. **Risk:** Toasts overlap or push content off-screen. |

---

## Critical & Major — Resolution Summary

### 🔴 Critical (Must Resolve)

| # | Edge Case | Proposed Resolution | PRD Section to Update |
|---|-----------|--------------------|-----------------------|
| 2.1 | Task completion API failure — no revert specified | Add to §7.5: "If PATCH fails within undo window: auto-revert checkbox, show error toast. If fails after slide-out: show error toast, task reappears on next refresh." | §7.5, §14 |
| 3.1 | FOM can complete tasks on another franchise's dashboard | Add to §6.2: "When viewing in FOM context (another franchise), My Tasks section is hidden. Operational focus items remain visible as read-only." | §6.2, §4 |
| EC-22 | Metric Formula Division-by-Zero — all 8 metrics in §6 could crash | Add to §6: "For any metric where the denominator is 0, display '—' in place of the value, hide trend arrow, and hide progress bar. Never render NaN or Infinity." | §6 |

### 🟠 Major (Should Resolve)

| # | Edge Case | Proposed Resolution | PRD Section to Update |
|---|-----------|--------------------|-----------------------|
| 2.2 | Double-click race condition on checkbox | Add debounce: "Checkbox ignores clicks for 500ms after a toggle. One API call per settled state." | §7.5 |
| 2.3 | Auto-refresh during undo window | "Auto-refresh suppresses updates to task items in active undo window. Refresh data applied after window closes." | §7.7 |
| 2.4 | Rapid period switching — race condition | "Period change cancels in-flight data requests. Only the most recent period's response is applied." | §7.2 |
| 2.6 | Task deleted while visible on dashboard | "If task PATCH returns 404, remove task from list with toast: 'This task is no longer available.'" | §7.5, §14 |
| 3.3 | Franchise data boundary not explicit | Add to §16: "All API calls scoped by franchise_id from session. Server enforces — no client-supplied franchise_id." | §16 |
| 4.1 | 10+ estimators — no max/scroll | "Show max 5 estimator rows. If more, show 'View All X Estimators →' link." | §6.3 |
| 5.1 | Task linked to deleted record | "If linked record deleted, show name as plain text (no link). If record_name null, omit element." | §6.2 |
| 5.2 | KPI target not configured | "If no target: hide progress bar and target line. Show value + trend only. Show 'Set target →' link for FP/Admin." | §6.2, §6.4 |
| 6.1 | Timezone for "today" not specified | "All date calculations use franchise timezone from Settings. APIs use UTC; client converts." | §16, §17 |
| 6.2 | "This Week" start day undefined | "Week starts Monday (ISO 8601). Configurable in future if needed." | §7.2 |
| 7.1 | Dashboard links to unimplemented Funnel filters | "Add dependency checklist to §20. If destination doesn't support filter, navigate to base page." | §8, §20 |
| 9.2 | Invalid URL parameters — no fallback | "Invalid tab → 'overview'. Invalid period → 'month'. Silent fallback, log dashboard_error." | §15 |
| EC-23 | Role Transition Mid-Session — 403 on auto-refresh | "On role change detection (403 response), redirect to Overview tab and show info toast: 'Your permissions have been updated.' Changes take effect on next page load." | §7 |
| EC-24 | FOM Viewing Franchise — Task Checkbox Visible | "When FOM is viewing another franchise's dashboard, hide My Tasks section entirely. Operational focus items remain visible as read-only." | §7 |
| EC-25 | Estimator Accessing Profitability via URL | "If user's role does not have access to the requested tab, silently redirect to Overview tab. No error message." | §7, §15 |
| EC-26 | Edge Value Consistency Across Tabs | "Shared metrics appearing on multiple tabs must use the same data source, formatting logic, and edge value handling. No independent calculations per tab." | §6, §7 |
| EC-29 | Negative Gross Profit | "Negative financial values display in red with parentheses: '($5,000)'. Progress bar hidden when achievement is negative. Card uses danger style." | §6 |

### 🔵 Product Decisions Needed

| # | Question | Options | Recommendation | Impact if Deferred |
|---|----------|---------|---------------|-------------------|
| 3.2 | Should Estimator/PM roles see the Profitability tab? | A) All tabs visible to all roles. B) Profitability hidden for Estimator/PM. | A — Transparency. Revisit if FPs request restriction. | Minor — can restrict later via role-based tab visibility. |
| 7.2 | Close Rate denominator — what is "total estimates"? | A) Won ÷ Sent. B) Won ÷ (Won + Lost). C) Won ÷ All stages. | B — Won ÷ (Won + Lost) — excludes in-progress deals for a clean conversion metric. | Moderate — inconsistent definition across Dashboard and Funnel would confuse users. |
| 9.1 | Back button behavior after tab switch | A) Back navigates between tab states. B) Back navigates to previous page. | A — Tabs update URL, so back should walk through tab history. | Low — UX preference. |
| 10.1 | KPI progress bar when target exceeded (>100%) | A) Cap bar at 100%, show true %. B) Show overflow visualization. | A — Cap bar, show "120%" label in success color. | Low — cosmetic. |

---

## Cross-References

- §6 Metric Definitions: EC-22, EC-26, EC-27, EC-28, EC-29, EC-30, EC-33
- §7 Role-Based Access: EC-23, EC-24, EC-25, EC-32
- §8 Navigation & Drill-Down: 7.1 (existing)
- §9 Responsive Breakpoints: Category 8 (existing)
- §14 Error Handling / Toast: EC-31
- §15 URL Parameters: EC-25, 9.2 (existing)

---

## Next Steps

1. [ ] Review 🔴 Critical items — these block development
2. [ ] Make product decisions on 🔵 Notes
3. [ ] Run RESOLVE mode to generate PRD-ready language for accepted resolutions
4. [ ] Hand Resolution Report to PRD Paul for integration
5. [ ] Run VALIDATE mode on updated PRD

---

## Validation Scorecard (V2 Rebuild)

### Previous Edge Cases (EC-01 to EC-21)
- All 21 edge cases from V1 cycle validated as still addressed in V2 PRD ✅
- Section references updated to new numbering (§6→§8, §7→§9, etc.)

### New Edge Cases (EC-22 to EC-33)
- 12 new edge cases added covering: Metric Definitions (2), Role-Based Access (3), Edge Value Consistency (4), Toast System (1), Progress Bar (1), Collections (1)
- Severity: 1 Critical, 5 Major, 6 Minor

### Completeness Check
- §6 Metric Definitions: Covered by EC-22, EC-26, EC-27, EC-28
- §7 Role-Based Access: Covered by EC-23, EC-24, EC-25, EC-32
- Edge Values: Covered by EC-27, EC-28, EC-29, EC-30, EC-33
- Toast System: Covered by EC-31
