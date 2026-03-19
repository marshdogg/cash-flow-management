# Edge Case Report — Cash Flow Guide PRD

> **Analyzed by:** Edge Case Eddie
> **PRD Version:** 1.0
> **Date:** March 1, 2026

---

## Summary

| Severity | Count |
|----------|-------|
| 🔴 Critical | 4 |
| 🟠 Major | 14 |
| 🟡 Minor | 10 |
| 🔵 Note (Product Decision) | 4 |
| **Total** | **32** |

**Overall Assessment:** The PRD is exceptionally thorough — metric formulas include explicit zero, null, and negative behaviors, and boundary values (exactly 4.0, exactly 8.0 weeks) are specified. The biggest risk areas are **financial calculation precision and overflow at cumulative scale** (13-week projection with large values and confidence bands), **wizard abandonment and session edge cases** (sessionStorage is fragile), and **franchise data isolation enforcement** (FOM read-only access must be airtight since this is financial data). The single most important thing to resolve before development: specify what happens when a user has hundreds of recurring transactions and completes a ritual — the frequency normalization math and projection calculations need defined precision and rounding behavior to prevent cumulative drift across 13 weeks.

---

## Happy Paths

### Flow 1: Weekly Monday Ritual (FP)

**Persona:** Franchise Partner
**Trigger:** FP opens Cash Flow Guide on Monday morning to do their weekly check-in

1. Navigates to `/cash-flow/dashboard` — sees last week's TCP, Health Gauge (Caution, 5.2 weeks), Projection Chart
2. Clicks "Start Ritual" in Quick Actions strip → navigates to `/cash-flow/ritual`
3. Step 1 (Welcome): Sees "Last ritual: 7 days ago", current TCP $32,000 → clicks "Let's get started"
4. Step 2 (Bank Balance): Input pre-filled with $32,000. Updates to $35,500 from online banking → clicks Next
5. Step 3 (Review Recurring): Sees 12 recurring transactions. Toggles off a paused supplier payment, confirms the rest → clicks Next
6. Step 4 (One-Off Items): Adds one-off expense: "Equipment repair $1,200" → clicks Next
7. Step 5 (Summary): Reviews updated TCP $46,800, health now "Healthy" (8.4 weeks), projection chart shows positive trend → clicks "Complete Ritual"
8. Redirected to Dashboard with success toast. TCP, Health Gauge, and Projection Chart all reflect new data.

**PRD Coverage:** §6.1–6.5, §8 (Ritual Wizard), §21

---

### Flow 2: Managing Recurring Transactions (FP)

**Persona:** Franchise Partner
**Trigger:** FP just signed a new vehicle lease and needs to add it as a recurring expense

1. Navigates to `/cash-flow/recurring`
2. Sees data table with 15 transactions, sorted by Next Occurrence ascending
3. Clicks "Add" button → modal opens
4. Fills in: Name "Van Lease #3", Type "Expense", Amount $850.00, Frequency "Monthly", Start Date March 15 2026
5. Saves → toast "Transaction added", table updates with new row
6. Filters by Type: "Expense" to review all expenses
7. Selects 2 old transactions → Bulk action: Delete → confirms in modal → toast "2 transactions deleted"

**PRD Coverage:** §8 (Recurring Transactions), §14, §18

---

### Flow 3: FOM Portfolio Review

**Persona:** Franchise Operations Manager
**Trigger:** FOM preparing for weekly coaching calls across 5 franchises

1. Opens `/cash-flow/dashboard?franchise=fr_001`
2. Sees franchise picker dropdown in header — "Acme Painters" selected
3. Reviews dashboard: TCP $22,000, Health "Caution" (5.8 weeks) — notes this for coaching call
4. No Quick Actions to start ritual (hidden for FOM)
5. Navigates to `/cash-flow/recurring?franchise=fr_001` — sees transaction list in read-only mode
6. Switches franchise picker to "Best Brush Co" (fr_002) — all data reloads
7. Reviews: TCP $85,000, Health "Healthy" (14.2 weeks) — no concerns

**PRD Coverage:** §7, §8 (FOM-specific ACs)

---

### Flow 4: First-Time User (FP)

**Persona:** New Franchise Partner, never used Cash Flow Guide
**Trigger:** FP opens Cash Flow Guide for the first time

1. Dashboard shows TCP as "—" with subtitle "Complete your first ritual to see your cash position"
2. Health Gauge: gray, "Not Available", subtitle "Complete your first ritual"
3. Projection Chart: empty state message "Complete your first ritual to see projections"
4. Quick Actions: "Start Ritual" is prominent
5. Clicks "Start Ritual" → Step 1 shows "No previous ritual" and current TCP "—"
6. Completes all 5 steps → first WeeklySnapshot created → dashboard populates

**PRD Coverage:** §6.1 (Null Behavior), §6.4 (No Data), §6.5 (No Data), §8

---

### Flow 5: Widget Quick Check (FP)

**Persona:** Franchise Partner
**Trigger:** FP sees compact widget on another page, wants a quick status check

1. Widget displays: TCP "$48,500.00", Health "Healthy" (green), Last Reviewed "2 days ago"
2. Clicks widget → navigates to `/cash-flow/dashboard`

**PRD Coverage:** §8 (Widget)

---

## Edge Cases by Category

---

### Category 1: Financial Calculations

| # | Edge Case | Severity | PRD Section | Specified? | Details |
|---|-----------|----------|-------------|------------|---------|
| EC-01 | Frequency normalization precision — cumulative rounding drift over 13 weeks | 🔴 | §6.2, §6.5 | ❌ No | Monthly amount $1,000 normalized to weekly: $1,000 ÷ 4.33 = $230.946882... The PRD says "display 2 decimal places" but does not specify whether to use the rounded or unrounded value in projection calculations. Over 13 weeks, rounding at each step vs. rounding once at the end produces different results. With 50+ recurring transactions, cumulative drift could be $50+. **Suggested behavior:** All intermediate calculations use full floating-point precision (no rounding). Round only at the final display step. Store and transmit values with at least 6 decimal places internally. Display rounds to 2 decimal places using banker's rounding (round half to even). |
| EC-02 | Projection overflow with large TCP and net flow | 🟠 | §6.5 | ❌ No | TCP = $999,999,999.99 (max bank balance) + max weekly inflows. Projection at week 13 = TCP + (Net Flow × 13). With large net positive flow, values could exceed the display format or JavaScript safe integer range (though unlikely with currency). More practically, the chart Y-axis scaling becomes unreadable. **Suggested behavior:** Y-axis uses dynamic scaling with SI abbreviations ($1M, $2M). If projection exceeds $999,999,999.99 at any week, cap the display value with a ">" prefix. |
| EC-03 | Confidence band calculation when Net Weekly Cash Flow is zero | 🟡 | §6.5 | Partial | PRD §6.5 says "All Zero Net Flow: Flat horizontal line at TCP value. Confidence band collapses to zero width." This is specified. However, when Net Weekly Cash Flow is very small (e.g., +$1.00/week), the ±10% band is ±$0.10/week — at week 13, the band is only ±$1.30, which is invisible on a chart where TCP might be $50,000. **Suggested behavior:** If the cumulative confidence band width at week 13 is less than 1% of TCP, hide the band entirely rather than rendering an invisible sliver. |
| EC-04 | Runway calculation when TCP is exactly zero | 🟡 | §6.3, §6.4 | ❌ No | TCP = $0.00, Weekly Expenses = $5,000. Runway = $0 ÷ $5,000 = 0.0 weeks. This is distinct from negative TCP (which the PRD handles). Health should be "Critical" (0.0 < 4.0). **Suggested behavior:** Display "0.0 weeks". Health status: "Critical". This is the natural result of the formulas but should be explicitly tested. |
| EC-05 | Bank balance of exactly $0.00 entered in ritual | 🟡 | §14, §21 | ✅ Yes | PRD §14 says Bank Balance validation: "numeric, ≥ 0." So $0.00 is valid. The PRD §6.1 says "Zero Behavior: Display $0.00 normally." Well covered. Noting for completeness — ensure the UI does not show a validation error for $0.00. |
| EC-06 | Frequency normalization for bi-weekly: ÷ 2 or × (26/52)? | 🟠 | §6.2 | Partial | PRD says "Bi-weekly ÷ 2 × 1" which simplifies to "÷ 2". This means bi-weekly $1,000 → weekly $500. But bi-weekly = 26 occurrences/year, so annualized = $26,000, weekly = $26,000 ÷ 52 = $500. The math aligns. However, the PRD formula "÷ 2 × 1" is oddly written and may confuse developers. More critically: is "bi-weekly" every 2 weeks or twice per week? **Suggested behavior:** Clarify that "Bi-weekly" means "every 2 weeks" (fortnightly), not "twice per week." Simplify formula notation: "Bi-weekly amount ÷ 2 = weekly equivalent." |

---

### Category 2: Wizard Flow

| # | Edge Case | Severity | PRD Section | Specified? | Details |
|---|-----------|----------|-------------|------------|---------|
| EC-07 | Wizard abandoned at Step 3, user returns after 23h 59m | 🟠 | §21, §16 | Partial | PRD says sessionStorage persists for 24 hours. But sessionStorage has no native TTL — the app must check a stored timestamp. If the user returns at 23h 59m and spends 5 minutes on the remaining steps, the state could expire mid-wizard (if checked on each step advance). **Suggested behavior:** Check TTL only on initial wizard load (resume vs. fresh start). Once the wizard is active, do not expire mid-session. The 24-hour TTL applies only to the "resume prompt" — if the user is actively using the wizard, time limit does not apply. |
| EC-08 | User opens wizard in two browser tabs simultaneously | 🟠 | §21, §16 | ❌ No | FP opens `/cash-flow/ritual` in Tab A, advances to Step 3. Opens a new tab to `/cash-flow/ritual` (Tab B) — both read/write to the same sessionStorage key `cash-flow-ritual-state`. Tab B loads at Step 3 (from Tab A's state). Now both tabs modify state independently, overwriting each other. Completing in Tab A creates a snapshot, but Tab B still shows the wizard. If Tab B also completes, two snapshots are created for the same ritual session. **Suggested behavior:** On wizard load, generate a unique `ritual_session_id` and store it. If another tab detects a different session ID in sessionStorage, show a message: "You have another ritual in progress in a different tab. Please complete it there." Block the second tab from proceeding. |
| EC-09 | Browser sessionStorage cleared by user or browser policy mid-ritual | 🟡 | §21, Q9 | ✅ Yes | PRD Q9 explicitly addresses this: "Wizard resets to Step 1. No data loss (nothing saved to server until completion)." Well covered. The user loses their in-progress entries but no persisted data is affected. |
| EC-10 | User clicks browser back button on Step 3 of wizard | 🟠 | §21, §10 | Partial | PRD §10 says "Escape opens abandon confirmation" and §21 says user can go back to any completed step. But the browser back button behavior is undefined — does it go to the previous wizard step, or navigate away from the wizard entirely (to Dashboard)? If it navigates away, the abandon confirmation should trigger. **Suggested behavior:** Wizard steps push to browser history (using `history.pushState` with `?step=N`). Browser back button navigates to the previous wizard step, not away from the wizard. If the user navigates back past Step 1, show the abandon confirmation modal. |
| EC-11 | Wizard Step 3 with 200 recurring transactions | 🟠 | §21, §8, Q12 | ❌ No | PRD Q12 says "No hard limit. UI pagination after 50 rows" for the Recurring Transactions table. But the Ritual Wizard Step 3 ("Review Recurring") requires the user to "confirm/skip each transaction." With 200 active transactions, this step becomes unusable — scrolling through 200 toggle items. **Suggested behavior:** In the wizard, paginate or group transactions. Show active transactions grouped by type (Income, then Expenses). If more than 20, show "Confirm all" batch action at the top. Users can then selectively toggle off specific ones. |
| EC-12 | User completes ritual with $0 bank balance and no recurring transactions | 🟡 | §21, §6 | Partial | Step 2: enters $0. Step 3: no transactions to review (auto-skipped per §21). Step 4: adds no one-offs. Step 5: TCP = $0, Net Flow = $0, Runway = "∞" (no expenses), Health = "Healthy" (∞ ≥ 8.0). This is technically correct per the formulas but may confuse a new user — "Healthy" with $0 TCP because there are no expenses. **Suggested behavior:** This is mathematically correct. Consider adding a contextual note on the Summary step: "Your health is based on runway. Add recurring expenses to get a more accurate picture." |

---

### Category 3: Franchise Data Isolation

| # | Edge Case | Severity | PRD Section | Specified? | Details |
|---|-----------|----------|-------------|------------|---------|
| EC-13 | FP attempts to access another franchise's data via URL parameter | 🔴 | §7, §15, §16 | Partial | PRD §15 says "FP accessing FOM-only params: params ignored silently." This covers `?franchise=other_id` being ignored. But §16 says "Data isolation is enforced at the API layer." The question is: if an FP somehow crafts an API call with another franchise ID (via browser dev tools), is the server enforcing this? The PRD says yes ("no client-side filtering") but the enforcement mechanism is not detailed. **Suggested behavior:** Add explicit AC: "API middleware validates that `franchise_id` in every request matches the authenticated user's assigned franchise (for FP role). Any mismatch returns 403. For FOM, the requested franchise must be in their assigned franchise list. Log all 403 violations for security auditing." |
| EC-14 | FOM accesses ritual route directly via URL | 🟡 | §7, §8, §15 | ✅ Yes | PRD §8 says "FOM cannot access ritual wizard (route guard redirects to dashboard)." PRD §15 says "FOM accessing `/cash-flow/ritual`: redirect to `/cash-flow/dashboard` with info toast." Fully specified. |
| EC-15 | FOM sees stale franchise data after FP completes a ritual | 🟠 | §7, §16 | ❌ No | FOM has franchise "Acme Painters" open in their dashboard. The FP for Acme completes a ritual, updating TCP from $30K to $45K. The FOM's dashboard still shows $30K. PRD §16 specifies SWR with `dedupingInterval: 5000` — but there is no push notification or polling interval defined for the dashboard page itself. The FOM could be looking at stale data for their entire session. **Suggested behavior:** Dashboard data should have a `revalidateOnFocus: true` SWR option (like recurring transactions already do per §16). Additionally, display "Last updated: [time]" on the dashboard with a manual "Refresh" button. |
| EC-16 | FOM has one franchise unassigned mid-session | 🟠 | §7 | ❌ No | FOM is viewing franchise fr_003. Admin removes fr_003 from FOM's assignment list. On next data fetch (or franchise picker reload), fr_003 should disappear. But the FOM currently has it loaded. **Suggested behavior:** If API returns 403 for the currently-selected franchise, clear the view and show toast: "You no longer have access to this franchise." Auto-select the first available franchise from the picker. If no franchises remain, show the empty state: "No franchises assigned. Contact your administrator." |

---

### Category 4: Concurrent Edits

| # | Edge Case | Severity | PRD Section | Specified? | Details |
|---|-----------|----------|-------------|------------|---------|
| EC-17 | Two browser tabs editing the same recurring transaction | 🟠 | Q13 | Partial | PRD Q13 says "Last write wins. No conflict resolution. This is acceptable because only FPs can edit, and a franchise has one FP." This addresses the "why" but not the UX. If Tab A opens edit modal for "Rent $5,000", Tab B also opens it, Tab A saves as $5,500, Tab B saves as $4,800 — Tab B wins silently. Tab A's data is overwritten without warning. **Suggested behavior:** Last write wins is acceptable. On save success, the SWR cache should revalidate, so Tab A will show the correct $4,800 on next focus (per `revalidateOnFocus: true`). No additional conflict handling needed for v1 — but the toast in Tab A should not say "Transaction updated" if it was immediately overwritten. Accept this limitation and document it. |
| EC-18 | User deletes a transaction while it's being referenced in an active ritual wizard | 🟠 | §21, §8 | ❌ No | FP starts ritual, reaches Step 3 (Review Recurring), sees "Rent $5,000". Opens a second tab, navigates to Recurring Transactions, deletes "Rent." Returns to the ritual tab, confirms "Rent" in Step 3. On ritual completion, the system tries to reference a deleted transaction. **Suggested behavior:** On ritual completion (Step 5 submit), re-fetch current recurring transactions from the server. Ignore any confirmed transactions in the wizard state that no longer exist. Show a toast if discrepancies are found: "Some transactions were modified since you started this ritual. Your summary reflects the latest data." |

---

### Category 5: Health Threshold Boundaries

| # | Edge Case | Severity | PRD Section | Specified? | Details |
|---|-----------|----------|-------------|------------|---------|
| EC-19 | Runway is exactly 4.0 weeks | 🟡 | §6.4 | ✅ Yes | PRD explicitly states: "Boundary: exactly 4.0 → Caution (≥ 4.0 is Caution, not Critical)." Fully specified. Noting for test coverage. |
| EC-20 | Runway is exactly 8.0 weeks | 🟡 | §6.4 | ✅ Yes | PRD explicitly states: "Boundary: exactly 8.0 → Healthy (≥ 8.0 is Healthy, not Caution)." Fully specified. Noting for test coverage. |
| EC-21 | Runway is infinity (zero expenses) | 🟡 | §6.3, §6.4, Q4, Q5 | ✅ Yes | PRD Q4: "Runway is ∞." Q5: "Health is Healthy (∞ ≥ 8.0)." §6.3 says display "∞" with tooltip. Well covered. Ensure the comparison `Infinity >= 8.0` evaluates true in the implementation (it does in JavaScript). |
| EC-22 | Runway is 3.999999 weeks (floating-point near-boundary) | 🔴 | §6.3, §6.4 | ❌ No | TCP = $25,999.9935, Weekly Expenses = $6,500. Runway = 3.999999... Due to floating-point representation, this might evaluate as exactly 4.0 in some calculations, flipping between "Critical" and "Caution." The display rounds to "4.0 weeks" (1 decimal place per §6.3) but the health classification uses the unrounded value. A user sees "4.0 weeks — Critical" which contradicts the stated rule that 4.0 = Caution. **Suggested behavior:** Health status classification should use the displayed (rounded to 1 decimal place) value, not the raw floating-point value. If the display shows "4.0 weeks", health must show "Caution." Apply rounding before threshold comparison. Document: "Health thresholds are evaluated against the displayed runway value (1 decimal place, standard rounding)." |

---

### Category 6: History Cutoff

| # | Edge Case | Severity | PRD Section | Specified? | Details |
|---|-----------|----------|-------------|------------|---------|
| EC-23 | Snapshot created exactly at the 78-week boundary | 🟡 | §16, Q14 | Partial | PRD says "Snapshots older than 78 weeks are excluded from API responses." If a snapshot was created exactly 78 weeks ago to the second, is it included or excluded? The phrase "older than 78 weeks" implies strictly older (> 78 weeks), so exactly 78 weeks is included. **Suggested behavior:** Use "strictly older than 78 weeks" (> 78w, not ≥ 78w). A snapshot created exactly 78 weeks ago is still included. The background deletion job should use the same threshold. Document the comparison operator explicitly. |
| EC-24 | User's earliest snapshot is at week 77 — next week it disappears | 🔵 | §16, Q14 | ❌ No | A franchise has been using Cash Flow Guide for 79 weeks. Their earliest snapshot (week 1) was deleted by the background job. The user has no UI indication that historical data has been pruned. If they're tracking long-term trends mentally, they may be confused. **Product decision needed:** Should the UI indicate that historical data older than 18 months has been archived? Or is this invisible to the user? **Recommendation:** This data is not currently surfaced in any UI (projection uses only current data per §6.5, no historical trend view exists). No UI change needed for v1. Revisit if a historical view is added. |

---

### Category 7: Recurring Transaction Edge Cases

| # | Edge Case | Severity | PRD Section | Specified? | Details |
|---|-----------|----------|-------------|------------|---------|
| EC-25 | Bi-weekly transaction where next occurrence falls on a weekend/holiday | 🔵 | §6.2, Q6 | ❌ No | PRD Q6 says bi-weekly means "14-day increments from start date." No mention of business-day adjustment. If start date is a Monday, all occurrences are Mondays. If start date is a Saturday, all occurrences are Saturdays. **Product decision needed:** Should recurring transactions be business-day aware, or purely calendar-based? **Recommendation:** Calendar-based (no business-day adjustment) for v1. This is a cash-flow planning tool, not a payment scheduler. The date represents "approximately when this cash moves," not an exact payment date. |
| EC-26 | Quarterly transaction at year boundary | 🟡 | Q7 | ✅ Yes | PRD Q7 explicitly addresses this: "If start is Nov 1, next occurrences are Feb 1, May 1, Aug 1, Nov 1. Year boundary is not special." Well covered. |
| EC-27 | Paused transaction included in TCP calculation | 🔴 | §6.1, Q11 | Partial | PRD Q11 says "Paused transactions are excluded from TCP, Net Weekly Cash Flow, Runway, and Projections." But §6.1 defines Pending Inflows/Outflows as "all active recurring transactions where type = income/expense." The word "active" implies paused are excluded, but this is implicit — the connection between "active" in §6.1 and the "Paused" status in the Recurring Transactions schema is not explicit. If a developer misses Q11, paused transactions could be included in TCP. **Suggested behavior:** Add explicit filter to §6.1 formula definitions: "Pending Inflows = Sum of all recurring transactions where `status = 'active'` AND `type = 'income'` AND `nextOccurrence ≤ today + 7 days`." Mirror the same for Pending Outflows. The `status = 'active'` filter must appear in the formula, not just in the Q&A. |
| EC-28 | All recurring transactions paused simultaneously | 🟡 | Q4, Q11 | Partial | If every transaction is paused, the state is equivalent to "no recurring transactions" (Q4): TCP = Bank Balance, Net Flow = $0, Runway = "∞", Health = "Healthy." This is correct per the formulas. But the user sees a full table of paused transactions while the dashboard says "Healthy" with infinite runway — this may cause confusion. **Suggested behavior:** Mathematically correct, no change needed. Consider a dashboard note: "All recurring transactions are currently paused" if the count of active transactions is zero but paused transactions exist. |

---

### Category 8: Input Boundaries

| # | Edge Case | Severity | PRD Section | Specified? | Details |
|---|-----------|----------|-------------|------------|---------|
| EC-29 | Bank balance at maximum: $999,999,999.99 | 🟡 | §14 | ✅ Yes | PRD specifies max $999,999,999.99 for bank balance. Ensure the input field accepts this value without truncation. Display: "$999,999,999.99" — 16 characters including commas. Verify the hero card TCP typography (28px, 700 weight) doesn't overflow its container at this width. |
| EC-30 | Transaction name with special characters, emoji, or Unicode | 🟠 | §14 | Partial | PRD says "1-100 chars" for transaction name. No character restrictions beyond length. A name like "Paiement mensuel — fournisseur #3 (Québec)" with accented characters, em-dash, and special symbols must display correctly. Emoji like "🏠 Rent" should either be accepted or explicitly rejected. **Suggested behavior:** Accept all Unicode characters. Trim leading/trailing whitespace. Reject whitespace-only strings. The 100-character limit counts Unicode code points, not bytes. Emoji are allowed (they're valid business context for quick recognition). |
| EC-31 | Transaction amount with more than 2 decimal places entered | 🟠 | §14 | Partial | PRD says "max 2 decimal places." If user enters $100.999, should it be rejected, truncated, or rounded? **Suggested behavior:** Round to 2 decimal places on blur (banker's rounding). Show the rounded value in the input. Do not reject — silently normalize. Display validation message only if the value is otherwise invalid (negative, over max, etc.). |
| EC-32 | Empty string or whitespace-only for transaction name | 🟡 | §14 | ✅ Yes | PRD says "Required, 1-100 chars." An empty string or whitespace-only string should fail validation. The error message "Name is required (max 100 characters)" covers this. Ensure the validation trims whitespace before checking length. |

---

### Category 9: Session & State

| # | Edge Case | Severity | PRD Section | Specified? | Details |
|---|-----------|----------|-------------|------------|---------|
| EC-33 | sessionStorage unavailable (private browsing, storage quota, disabled) | 🔴 | §16, §21 | ❌ No | Some browsers in private/incognito mode throw exceptions when writing to sessionStorage. If sessionStorage is unavailable, the wizard cannot persist state between steps (mid-session loss on page refresh) and cannot resume after abandonment. The ritual still works for a single uninterrupted session, but any interruption loses progress. **Suggested behavior:** Wrap all sessionStorage calls in try/catch. If sessionStorage is unavailable, the wizard still functions but: (1) show a one-time warning: "Progress cannot be saved between sessions in private browsing mode," (2) disable the 24-hour resume feature gracefully, (3) keep state in-memory for the current session (React state) so step navigation works normally. |
| EC-34 | Token expiry during ritual completion (Step 5 submit) | 🟠 | §14 | Partial | PRD §14 covers 401: "Your session has expired. Please refresh the page." But during ritual completion, the user has entered 5 steps of data. If the session expires on the final POST, telling them to "refresh the page" loses all wizard state (sessionStorage may persist, but the page refresh clears React state). **Suggested behavior:** On 401 during ritual save, persist the final wizard state to sessionStorage (if available), then show the session-expired message. After re-authentication, navigating to `/cash-flow/ritual` should resume at Step 5 with the summary data intact, allowing the user to click "Complete Ritual" again. |
| EC-35 | Wizard resume after exactly 24 hours | 🟠 | §21, Q8 | Partial | PRD Q8 says "State persists in sessionStorage for 24 hours. After 24 hours, starts fresh." The boundary condition: if the TTL timestamp indicates exactly 24h 0m 0s have elapsed, should the state be preserved or cleared? **Suggested behavior:** Use "greater than 24 hours" (> 24h) for expiry. At exactly 24h, the state is still valid. This prevents edge cases where the user returns right at the boundary and loses their work. Use millisecond precision in the timestamp comparison. |

---

### Category 10: Display Formatting

| # | Edge Case | Severity | PRD Section | Specified? | Details |
|---|-----------|----------|-------------|------------|---------|
| EC-36 | Large TCP value on mobile (small screen) | 🟠 | §6.1, §9, §11 | ❌ No | TCP of $999,999,999.99 at 28px bold = approximately 320px wide. On a 320px mobile viewport, this overflows the hero card. **Suggested behavior:** On mobile (< 640px), use responsive font sizing for the TCP value — scale down to 22px or 20px if the value exceeds 10 characters. Alternatively, abbreviate: "$1.0B" or "$999.9M" on mobile only. Desktop always shows full precision. |
| EC-37 | Null TCP displayed as "—" versus $0.00 — user confusion | 🔵 | §6.1 | Partial | PRD distinguishes: no bank balance = "—", zero bank balance = "$0.00." The distinction is correct, but a user who sees "—" may not understand the difference from "$0.00." **Product decision needed:** Is the current "—" with subtitle "Complete your first ritual" sufficient, or should there be a more prominent empty state (e.g., an illustration with onboarding copy)? **Recommendation:** The subtitle is sufficient for v1. The happy path (Flow 4) covers the first-time experience. No change needed. |
| EC-38 | Negative TCP display format inconsistency | 🔵 | §6.1 | ❌ No | PRD §6.1 says negative TCP: "−$1,234.56 (no parentheses)." But the existing Dashboard Flow PRD (Edge Case 1.2) established a convention of "($1,234)" with parentheses for negative financial values. If both features are in WOW OS, the inconsistency may confuse users. **Product decision needed:** Should all financial negatives in WOW OS use the same format? **Recommendation:** Adopt the Cash Flow Guide convention (minus sign, no parentheses) as the standard — it's more universally understood outside accounting. Update the Dashboard Flow if needed for consistency. |

---

## Critical & Major — Resolution Summary

### 🔴 Critical (Must Resolve)

| # | Edge Case | Proposed Resolution | PRD Section to Update |
|---|-----------|--------------------|-----------------------|
| EC-01 | Frequency normalization rounding drift over 13-week projection | Add to §6.2: "All intermediate calculations use full floating-point precision. Rounding to 2 decimal places occurs only at the display layer. Internal values transmitted via API use at least 6 decimal places. Display rounding uses banker's rounding (round half to even)." Add to §6.5: "Projection values are calculated using unrounded intermediate values. Each week's projection is independently calculated from TCP and cumulative net flow, not from the previous week's rounded value." | §6.2, §6.5 |
| EC-13 | FP accessing another franchise's data via API manipulation | Add to §16 (Franchise Scoping): "API middleware validates that the `franchise_id` in every request matches the authenticated user's assigned franchise (for FP role). For FOM role, the requested franchise must be in the user's assigned franchise list. Mismatches return 403 Forbidden. All 403 violations from franchise scope checks are logged with `user_id`, `requested_franchise_id`, `timestamp` for security auditing. No API endpoint accepts an arbitrary client-supplied `franchise_id` without server-side authorization check." | §16 |
| EC-22 | Floating-point boundary at 3.9999 weeks displaying as "4.0" but classified as Critical | Add to §6.4: "Health status thresholds are evaluated against the runway value after rounding to 1 decimal place (standard rounding). If the displayed runway is '4.0 weeks', health must be 'Caution', not 'Critical'. Implementation: `roundedRunway = Math.round(rawRunway * 10) / 10; if (roundedRunway >= 8.0) → Healthy; else if (roundedRunway >= 4.0) → Caution; else → Critical`." | §6.3, §6.4 |
| EC-33 | sessionStorage unavailable in private browsing or restricted environments | Add to §16 (Caching Strategy): "All sessionStorage operations must be wrapped in try/catch. If sessionStorage is unavailable: (1) wizard operates with in-memory state only (React state), (2) one-time info toast: 'Ritual progress cannot be saved between sessions in this browser mode', (3) 24-hour resume feature is gracefully disabled, (4) all other functionality is unaffected. Track `cash_flow_error_shown` with `error_type=sessionstorage_unavailable`." | §16, §21 |

### 🟠 Major (Should Resolve)

| # | Edge Case | Proposed Resolution | PRD Section to Update |
|---|-----------|--------------------|-----------------------|
| EC-02 | Projection chart overflow with very large values | Add to §6.5: "Projection chart Y-axis uses dynamic scaling with abbreviated labels ($10K, $1M). If any weekly projection exceeds $999,999,999.99, display the cap value." | §6.5 |
| EC-06 | Bi-weekly frequency ambiguity (every 2 weeks vs. twice per week) | Add to §6.2 or §8: "Bi-weekly means 'every 2 weeks' (fortnightly). This is not 'twice per week.' Frequency option label in the UI should read 'Every 2 weeks' to eliminate ambiguity." | §6.2, §8 |
| EC-07 | Wizard TTL expiry mid-session after 24h boundary | Add to §21 (State Persistence): "The 24-hour TTL is checked only when the wizard route loads (initial navigation or page refresh). Once the wizard is actively in use, the TTL is not re-checked between steps. If the user is actively completing the wizard, their session is not interrupted by TTL expiry." | §21 |
| EC-08 | Two browser tabs running ritual wizard simultaneously | Add to §21: "On wizard initialization, a `ritual_session_id` (UUID) is generated and stored in sessionStorage alongside the wizard state. On subsequent wizard loads, if the stored `ritual_session_id` differs from the current tab's ID, show info message: 'A ritual is already in progress in another tab.' and offer 'Resume there' or 'Start fresh' options." | §21 |
| EC-10 | Browser back button behavior in wizard | Add to §21 or §15: "Wizard steps update the URL via `history.pushState` using the `?step=N` parameter. Browser back button navigates to the previous wizard step. Navigating back past Step 1 triggers the abandon confirmation modal (per §18)." | §21, §15 |
| EC-11 | Step 3 with 200 recurring transactions is unusable | Add to §21 (Step 3 behavior): "If more than 20 active recurring transactions exist, show a 'Confirm all' toggle at the top of the list (default: on). Users can then individually toggle off specific transactions. Transactions grouped by type (Income first, then Expenses). Scrollable list with search/filter within the step." | §21 |
| EC-15 | FOM sees stale data after FP ritual completion | Add to §16 (Caching Strategy): "Dashboard data SWR configuration includes `revalidateOnFocus: true`. Dashboard header displays 'Last updated: [relative time]' with a manual refresh icon button." | §16, §8 |
| EC-16 | FOM franchise unassigned mid-session | Add to §7 (FOM Franchise Picker Behavior): "If an API call returns 403 for the currently-selected franchise, remove it from the picker, show toast: 'You no longer have access to [franchise name]', and auto-select the first remaining franchise. If no franchises remain, show empty state." | §7, §14 |
| EC-17 | Two tabs editing same recurring transaction (last write wins) | Add to §8 or Q13: "Last-write-wins is the accepted conflict model. After any successful CRUD operation, the SWR cache is revalidated. No additional conflict detection is needed for v1. Document in architecture brief as a known limitation." | Q13 |
| EC-18 | Transaction deleted during active ritual wizard | Add to §21 (Step 5): "On ritual completion (Step 5 submit), the server re-fetches current active recurring transactions and calculates TCP, Net Flow, and Runway from live data — not from the wizard's cached Step 3 state. If transactions were added, deleted, or paused since Step 3, the server-calculated values take precedence. The Summary step displays the server-calculated results after save." | §21, §8 |
| EC-27 | Paused transaction status filter missing from formula definitions | Update §6.1: "Pending Inflows = Sum of all recurring transactions where `status = 'active'` AND `type = 'income'` AND `nextOccurrence ≤ today + 7 days`. Pending Outflows = Sum of all recurring transactions where `status = 'active'` AND `type = 'expense'` AND `nextOccurrence ≤ today + 7 days`." Add `status = 'active'` explicitly to the formula, not just Q&A. | §6.1, §6.2, §6.3 |
| EC-30 | Special characters and emoji in transaction name | Add to §14 (Input Validation — Transaction Name): "All Unicode characters accepted. Leading/trailing whitespace trimmed. Whitespace-only strings rejected. 100-character limit counts Unicode code points. No character blacklist." | §14 |
| EC-31 | Decimal precision beyond 2 places in amount input | Add to §14 (Input Validation — Transaction Amount): "If user enters more than 2 decimal places, round to 2 decimal places on blur using banker's rounding. Display the rounded value. No validation error for excess decimal places." | §14 |
| EC-34 | Token expiry during ritual save at Step 5 | Add to §14 (API Errors — 401): "If 401 occurs during ritual save, persist current wizard state to sessionStorage before showing the session-expired message. After re-authentication, navigating to `/cash-flow/ritual` resumes at Step 5 with data intact." | §14, §21 |
| EC-35 | Wizard state TTL boundary at exactly 24 hours | Add to §21 (State Persistence): "TTL expiry comparison uses strict greater-than: state is expired only when `now - saved_timestamp > 24 hours`. At exactly 24 hours (equal), state is still valid. Use millisecond precision." | §21 |
| EC-36 | Large TCP value overflows hero card on mobile | Add to §9 (Specific Responsive Behaviors): "TCP hero value: if the formatted string exceeds 13 characters, reduce font size from 28px to 22px on mobile (< 640px). If it exceeds 16 characters, abbreviate with SI suffix ($999.9M) on mobile only." | §9, §11 |

### 🔵 Product Decisions Needed

| # | Question | Options | Recommendation | Impact if Deferred |
|---|----------|---------|---------------|-------------------|
| EC-24 | Should users be notified that historical snapshots older than 18 months are pruned? | A) Silent pruning (current). B) Show "Data available since [date]" note. | A — Silent. No UI currently displays historical snapshots, so the pruning is invisible. Revisit if historical trend view is added. | None for v1. |
| EC-25 | Should recurring transaction dates be business-day aware? | A) Calendar-based (every N days from start). B) Business-day adjusted (skip weekends/holidays). | A — Calendar-based. This is a planning tool, not a payment scheduler. Simplicity wins. | Low — users can mentally adjust. |
| EC-37 | Is the "—" display for null TCP with subtitle sufficient for first-time UX? | A) "—" with subtitle (current). B) Illustrated empty state with onboarding wizard prompt. | A — Current design is sufficient. The Quick Action "Start Ritual" is the primary onboarding path. | Low — cosmetic enhancement for later. |
| EC-38 | Should negative financial values use minus sign (Cash Flow Guide) or parentheses (Dashboard Flow)? | A) Minus sign: −$1,234.56 (Cash Flow Guide §6.1). B) Parentheses: ($1,234) (Dashboard Flow convention). | A — Minus sign, applied consistently across WOW OS. More universally understood. Update Dashboard Flow to match. | Moderate — inconsistency between modules if not standardized. Users see two different conventions. |

---

## Cross-References

- §6.1 TCP Formula: EC-01, EC-13, EC-27, EC-29, EC-36, EC-37
- §6.2 Net Weekly Cash Flow: EC-01, EC-06
- §6.3 Weeks of Runway: EC-04, EC-21, EC-22
- §6.4 Health Status: EC-19, EC-20, EC-21, EC-22
- §6.5 Projection: EC-01, EC-02, EC-03
- §7 Role-Based Access: EC-13, EC-14, EC-15, EC-16
- §8 Acceptance Criteria: EC-11, EC-17, EC-18, EC-30
- §9 Responsive: EC-36
- §14 Error Handling & Validation: EC-30, EC-31, EC-32, EC-34
- §15 URL Parameters: EC-10, EC-13, EC-14
- §16 API & Data Integration: EC-13, EC-15, EC-23, EC-33
- §21 Wizard Behavior: EC-07, EC-08, EC-09, EC-10, EC-11, EC-12, EC-18, EC-34, EC-35
- Q&A Log: EC-06 (Q6), EC-09 (Q9), EC-17 (Q13), EC-21 (Q4/Q5), EC-23 (Q14), EC-26 (Q7), EC-27 (Q11)

---

## Next Steps

1. [ ] Review 🔴 Critical items (EC-01, EC-13, EC-22, EC-33) — these block development
2. [ ] Make product decisions on 🔵 Notes (EC-24, EC-25, EC-37, EC-38)
3. [ ] Run RESOLVE mode to generate PRD-ready language for accepted resolutions
4. [ ] Hand Resolution Report to PRD Paul for integration
5. [ ] Run VALIDATE mode on updated PRD
