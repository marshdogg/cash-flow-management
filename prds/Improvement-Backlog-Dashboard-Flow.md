# Improvement Backlog: Dashboard Flow
## Generated: 2026-02-28
## Items: 21 · Carried Over: 0

## Priority: P0 = fix before next cycle | P1 = within 2 cycles | P2 = when convenient | P3 = parking lot

## Backlog Items

### #1: Add "Metric Definitions" section to PRD template
**Priority:** P0 · **Owner:** PRD template
**Type:** PRD template
**Effort:** S · **Source:** Retro finding "Close Rate definition changed mid-stream" + Intervention #2

**Problem:** Close Rate formula was assumed by Eddie (Won ÷ Won+Lost) but the real business definition was different (Won ÷ total estimates presented). No place in the PRD template prompts for explicit metric formulas.
**Proposed Change:** Add a "## Metric Definitions" section to `templates/paul-prd-template.md` between Data Model and Acceptance Criteria. Include table: Metric Name | Formula | Denominator Source | Display Format | Example. Make it required for any flow with KPIs or calculated metrics.
**Expected Impact:** Eliminates mid-build metric corrections. All agents share one source of truth for business calculations.
**Acceptance Criteria:**
- [ ] PRD template includes Metric Definitions section
- [ ] Paul flags any PRD with KPIs but no Metric Definitions as incomplete
- [ ] Next cycle has zero metric-related corrections

### #2: Add "Role-Based Access" section to PRD template
**Priority:** P0 · **Owner:** PRD template
**Type:** PRD template
**Effort:** S · **Source:** Retro finding "Tab visibility not specified" + Intervention #1

**Problem:** PRD didn't specify which roles could see which tabs. Eddie had to ask the user.
**Proposed Change:** Add "## Role-Based Access" section to PRD template. Include matrix: Feature/Section × Role → Visible | Hidden | Disabled | Read-Only. Make it required for any flow with role-differentiated UIs.
**Expected Impact:** Eddie doesn't need to flag role visibility as a product decision. Ian gets clear auth requirements.
**Acceptance Criteria:**
- [ ] PRD template includes Role-Based Access section
- [ ] Next cycle has zero role-visibility clarifications

### #3: Add "Project Type" to pipeline intake
**Priority:** P0 · **Owner:** Orchestrator (Sally)
**Type:** Process
**Effort:** S · **Source:** Retro finding "Greenfield context not handled" + Intervention #6

**Problem:** Pipeline assumed existing codebase. User had to clarify "greenfield project." This affected mock strategy, file structure, and dependency assumptions.
**Proposed Change:** Add "Project Type" field to Sally's intake checklist: greenfield | feature-on-existing | migration. When greenfield: auto-generate project scaffolding, default to MSW mocks, skip "existing code review" steps. Update Sally agent spec §Intake.
**Expected Impact:** Correct assumptions from the start. No wasted time checking for existing code.
**Acceptance Criteria:**
- [ ] Sally's intake includes Project Type question
- [ ] Greenfield projects get scaffolding automatically
- [ ] Next greenfield cycle has zero project-context clarifications

### #4: Wire integration layer before test validation
**Priority:** P1 · **Owner:** Cody spec
**Type:** Agent spec update
**Effort:** M · **Source:** Retro finding "useDashboardData built but not wired" + validation gaps

**Problem:** Cody-Integration built the SWR hooks, API fetchers, and MSW handlers but left the DashboardShell using static mock imports. This caused 14 test scenarios to be unvalidated (loading states, error states, auto-refresh, period refetching). The handoff between Cody-Integration and Cody-Resilience assumed the integration was wired.
**Proposed Change:** Add to Cody-Integration spec: "Before handing off, verify that ALL data flows through the hooks you built. Replace direct mock imports with hook calls. Static mock data should ONLY exist in /src/mocks/ and MSW handlers — never imported directly into components."
**Expected Impact:** Loading/error/empty states work on first validation. Resilience layer has real error conditions to handle.
**Acceptance Criteria:**
- [ ] No component directly imports from /src/mocks/ (except API route handlers for greenfield)
- [ ] All data flows through SWR hooks
- [ ] Loading, error, and empty states render correctly

### #5: Add toast notification system to shared components
**Priority:** P1 · **Owner:** Cody spec / shared components
**Type:** Tooling
**Effort:** M · **Source:** Retro finding "No toast system" + 5 test scenarios affected

**Problem:** Task completion errors, refresh success, and 404 handling all require toast notifications. No toast system exists. shadcn/ui Toast was listed in shared components but never implemented.
**Proposed Change:** Cody-UI should create a ToastProvider + useToast hook as part of shared components. Add to Cody-UI spec: "If the Design Spec lists Toast as a shared component, implement it in the first phase."
**Expected Impact:** Error feedback available for all subsequent Cody phases. 5 test scenarios pass.
**Acceptance Criteria:**
- [ ] ToastProvider wraps the app layout
- [ ] useToast hook available for all components
- [ ] Toast supports success, error, warning, info variants
- [ ] aria-live="polite" on toast container

### #6: Cross-reference period labels between PRD and code
**Priority:** P1 · **Owner:** Ian spec
**Type:** Agent spec update
**Effort:** S · **Source:** Retro finding "Period options mismatch"

**Problem:** PRD specified "Today" and "YTD" but Ian's Implementation Brief used "This Quarter" and "This Year." The mismatch propagated to constants and wasn't caught until test validation.
**Proposed Change:** Add to Ian's spec: "When defining constants/enums, cross-reference the exact labels used in the PRD. Quote the PRD text. If a label differs, flag it as a decision with rationale."
**Expected Impact:** Zero label mismatches between PRD and code.
**Acceptance Criteria:**
- [ ] Implementation Brief constants match PRD labels exactly
- [ ] Any label deviations are documented with rationale

### #7: Cody-Logic should validate filter/map logic before handoff
**Priority:** P2 · **Owner:** Cody spec
**Type:** Agent spec update
**Effort:** S · **Source:** Retro finding "visibleTasks filter was a no-op"

**Problem:** The filter `!A || A` (always true) slipped through Cody-Logic. This would have caused completed tasks to never disappear.
**Proposed Change:** Add to Cody-Logic anti-patterns: "Test filter/map/reduce predicates mentally or with edge cases before committing. Specifically: does the filter ever return false? Does the map transform anything?"
**Expected Impact:** Fewer logic bugs in custom hooks.
**Acceptance Criteria:**
- [ ] No tautological filters in hooks

### #8: Mandatory visual spec for edge state behaviors in PRD
**Priority:** P2 · **Owner:** PRD template
**Type:** PRD template
**Effort:** S · **Source:** Retro finding "Visual behavior for over-achievement not specified" + Intervention #3

**Problem:** Progress bar >100% behavior wasn't specified in the original PRD. Required a product decision during Eddie's phase.
**Proposed Change:** Add to PRD template acceptance criteria section: "For any visual element with a numeric input, specify behavior at: 0, negative, max, over-max, and null."
**Expected Impact:** Fewer design decisions deferred to Eddie. Dora gets clearer specs.
**Acceptance Criteria:**
- [ ] PRD acceptance criteria include edge value visual behaviors
- [ ] Eddie flags zero edge-value-related product decisions next cycle

## Summary

| # | Title | Priority | Owner | Effort | Status |
|---|-------|----------|-------|--------|--------|
| 1 | Add "Metric Definitions" section to PRD template | P0 | PRD template | S | Done |
| 2 | Add "Role-Based Access" section to PRD template | P0 | PRD template | S | Done |
| 3 | Add "Project Type" to pipeline intake | P0 | Orchestrator (Sally) | S | Done |
| 4 | Wire integration layer before test validation | P1 | Cody spec | M | Done |
| 5 | Add toast notification system to shared components | P1 | Cody spec / shared components | M | Done |
| 6 | Cross-reference period labels between PRD and code | P1 | Ian spec | S | Done |
| 7 | Cody-Logic should validate filter/map logic before handoff | P2 | Cody spec | S | Done |
| 8 | Mandatory visual spec for edge state behaviors in PRD | P2 | PRD template | S | Done |
| 9 | Centralized metric value formatting utility | P2 | Cody-Logic spec | S | Done |
| 10 | RoleGate component for conditional rendering | P2 | Cody-UI spec | S | Done |
| 11 | Test priority tagging (P0/P1/P2) for CI optimization | P3 | Tess spec | S | Done |
| 12 | Add `npm run build` to Phase 10 verification steps | P0 | Sally spec | S | Done |
| 13 | Add `npm run lint` to Phase 10 verification steps | P0 | Sally spec | S | Done |
| 14 | Cody-Integration must verify API response shape after unwrapping | P1 | Cody-Integration spec | S | Done |
| 15 | Add runtime smoke test (page load, no console errors) to Phase 10/11 | P1 | Tess spec | M | Done |
| 16 | GitHub Actions CI pipeline (lint + build + smoke tests on PR) | P0 | Infrastructure | S | Done |
| 17 | Playwright E2E smoke tests for dashboard | P0 | Infrastructure | M | Done |
| 18 | Type-safe API response helpers (`apiSuccess`/`apiError`) | P1 | Infrastructure | S | Done |
| 19 | MOCK_MODE env flag for mock/real data toggle | P1 | Infrastructure | S | Done |
| 20 | Fast-track change size classification (major/minor/patch) in Sally intake | P1 | Sally spec | S | Done |
| 21 | Add `npm test` / `npm run test:smoke` scripts to package.json | P0 | Infrastructure | S | Done |
