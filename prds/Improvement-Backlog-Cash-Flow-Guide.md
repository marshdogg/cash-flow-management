# Improvement Backlog — Cash Flow Guide

| Field | Value |
|-------|-------|
| **Generated** | 2026-03-01 |
| **Source** | Retro Report — Cash Flow Guide |
| **Items** | 7 |
| **Carried Over** | 0 (all Dashboard V2 items resolved) |
| **Post-Build Additions** | 3 (IB-CF-05 through IB-CF-07, added from Post-Build Testing Addendum) |

---

## Priority Levels

| Level | Description |
|-------|-------------|
| **P0** | Fix before next build cycle |
| **P1** | Fix within next 2 cycles |
| **P2** | Fix at convenient time |
| **P3** | Parking lot — revisit quarterly |

---

## Backlog Items

### IB-CF-01: Dependency Verification Step

| Field | Value |
|-------|-------|
| **Priority** | P1 |
| **Owner** | Sally spec |
| **Type** | Process |
| **Effort** | S |
| **Source** | Retro §What Didn't Go Well #1 |

**Problem:** The Implementation Brief specified Recharts as a new dependency, but no pipeline step verified that it was added to `package.json`. The build succeeded because the developer used inline SVG instead, but this was an unplanned divergence.

**Proposed Change:** Add a verification step in Phase 9 (Build) that cross-references the Implementation Brief's dependency list against `package.json`. If any dependency is missing, block the build and prompt for installation or plan revision.

**Draft spec update (Sally Agent V3):**
> After scaffolding completes, verify:
> 1. All dependencies listed in Implementation Brief §4 "New Dependencies" are present in package.json
> 2. If missing, run `npm install` for each
> 3. If the dependency was intentionally omitted (e.g., replaced with a simpler approach), update the Implementation Brief to reflect the change

**Expected Impact:** Prevents silent dependency omissions. Ensures build output matches architectural plans.

**Acceptance Criteria:**
- [ ] Sally spec includes dependency verification step in Phase 9
- [ ] Implementation Brief template has a "New Dependencies" section
- [ ] Verification step logs which dependencies were checked

---

### IB-CF-02: Greenfield Scaffolding Checklist

| Field | Value |
|-------|-------|
| **Priority** | P2 |
| **Owner** | Sally spec |
| **Type** | Process |
| **Effort** | M |
| **Source** | Retro §Greenfield-Specific Observations |

**Problem:** Greenfield apps need additional scaffolding not required for feature additions: directory creation, new layout files, navigation components, env var updates, CI config updates. These were handled ad-hoc during the Cash Flow Guide build.

**Proposed Change:** Create a greenfield scaffolding checklist that Phase 9 (Cody-UI) follows when `classification = greenfield`.

**Draft checklist:**
> For greenfield apps:
> 1. Create directory tree per Implementation Brief §6
> 2. Create layout.tsx with app-specific navigation
> 3. Add new dependencies from Implementation Brief
> 4. Update `.env.example` with any new env vars
> 5. Verify CI pipeline covers new routes (lint, build, smoke)
> 6. Create mock data fixtures
> 7. Verify shared component reuse vs new creation

**Expected Impact:** Standardizes greenfield builds. Reduces ad-hoc decisions.

**Acceptance Criteria:**
- [ ] Sally spec includes greenfield checklist
- [ ] Cody-UI spec references checklist when classification = greenfield
- [ ] Checklist is versioned alongside other templates

---

### IB-CF-03: FOM Franchise API Documentation

| Field | Value |
|-------|-------|
| **Priority** | P2 |
| **Owner** | Paul spec |
| **Type** | Documentation |
| **Effort** | S |
| **Source** | Retro §What Didn't Go Well #2 |

**Problem:** The FOM franchise picker uses hardcoded mock data for franchise assignments. The franchise assignment API is outside the Cash Flow Guide scope, but it's a prerequisite for production deployment.

**Proposed Change:** Add a "Production Prerequisites" section to the PRD that lists external API dependencies that must exist before the feature can go live.

**Expected Impact:** Prevents deployment surprises. Makes external dependencies visible during planning.

**Acceptance Criteria:**
- [ ] PRD template includes "Production Prerequisites" section
- [ ] Cash Flow Guide PRD updated with franchise assignment API prerequisite

---

### IB-CF-04: Chart Library Decision Template

| Field | Value |
|-------|-------|
| **Priority** | P3 |
| **Owner** | Dora spec |
| **Type** | Template |
| **Effort** | S |
| **Source** | Retro §What Didn't Go Well #1 |

**Problem:** The decision to use Recharts vs inline SVG for the projection chart was made in the Implementation Brief but diverged during implementation. The Design Decision Log should include a standard framework for chart rendering decisions.

**Proposed Change:** Add a chart rendering decision framework to the Design Decision Log template.

**Draft framework:**
> When the design requires data visualization:
> 1. Evaluate complexity: How many data points? How many series? Interactive tooltips? Animations?
> 2. If simple (< 20 data points, single series, minimal interaction): consider inline SVG
> 3. If moderate (20-100 points, multiple series, tooltips): consider Recharts
> 4. If complex (streaming data, zoom, pan, annotations): consider Visx or D3
> 5. Document bundle size impact and lazy-loading strategy

**Expected Impact:** Makes chart library decisions more systematic and traceable.

**Acceptance Criteria:**
- [ ] Dora spec includes chart rendering decision framework
- [ ] Design Decision Log template includes chart section

---

### IB-CF-05: Tess: Require `main` Scoping for h1 Locators

| Field | Value |
|-------|-------|
| **Priority** | P0 |
| **Owner** | Tess spec |
| **Type** | Agent spec |
| **Effort** | S |
| **Source** | Post-Build Testing Addendum RC-1 |

**Problem:** Tess generates `getByRole('heading', { level: 1 })` without scoping to the `main` content area. When navigation components also render an `h1` (e.g., `CashFlowNav`), strict mode fails because two `h1` elements match. This caused 4 test failures across 2 files.

**Proposed Change:** Add a rule to the Tess spec requiring that all `h1` locators be scoped to `main`:

**Draft spec update (Tess Agent V4):**
> **Locator Rule L1 — h1 scoping:** All `h1` heading locators MUST be scoped to the `main` content area. Use `page.locator('main').getByRole('heading', { level: 1 })` instead of `page.getByRole('heading', { level: 1 })`. Rationale: navigation and sidebar components may render their own `h1`, causing strict mode violations.

**Expected Impact:** Eliminates duplicate-h1 failures in all future test generations.

**Acceptance Criteria:**
- [ ] Tess spec includes Locator Rule L1 for h1 scoping
- [ ] Example in spec shows correct `main`-scoped locator
- [ ] Tess spec checklist includes h1 scoping verification

---

### IB-CF-06: Tess: Mandate Mobile Viewport Awareness in Test Design

| Field | Value |
|-------|-------|
| **Priority** | P0 |
| **Owner** | Tess spec |
| **Type** | Agent spec |
| **Effort** | M |
| **Source** | Post-Build Testing Addendum RC-3 |

**Problem:** Tess generates tests that assert the presence of desktop-only elements (sidebar nav, skip links, multi-column layouts) without checking whether the test runs at a mobile viewport. Elements hidden via `lg:block` or `hidden md:flex` are not visible at mobile widths, causing 10+ test failures.

**Proposed Change:** Add viewport awareness rules to the Tess spec:

**Draft spec update (Tess Agent V4):**
> **Locator Rule L2 — Viewport awareness:** When designing tests for responsive components:
> 1. Check the component's CSS breakpoints before writing assertions
> 2. If the test viewport is mobile (< 1024px), skip assertions for elements with `lg:` or `xl:` visibility classes
> 3. If testing both viewports, create separate test blocks with explicit viewport annotations
> 4. Use `test.skip()` with a descriptive message for viewport-conditional tests: `test.skip(isMobile, 'Sidebar hidden on mobile')`

**Expected Impact:** Eliminates mobile viewport failures in all future test generations. Prevents 10+ failures per feature.

**Acceptance Criteria:**
- [ ] Tess spec includes Locator Rule L2 for viewport awareness
- [ ] Tess spec requires viewport annotation on test blocks
- [ ] Example in spec shows correct viewport-conditional skip pattern

---

### IB-CF-07: Tess: Require Exact Locators Over Text Substring Matching

| Field | Value |
|-------|-------|
| **Priority** | P1 |
| **Owner** | Tess spec |
| **Type** | Agent spec |
| **Effort** | M |
| **Source** | Post-Build Testing Addendum RC-2, RC-4 |

**Problem:** Tess generates `getByText('Paused')` instead of `getByRole('button', { name: 'Paused' })` or `getByText('Paused', { exact: true })`. When the same text appears in multiple components (filter button + status badge, card + detail view), strict mode violations occur. Additionally, Tess matches visually rendered text (`REVENUE`) instead of DOM text (`Revenue`) when CSS `text-transform` is applied. This caused 16+ test failures.

**Proposed Change:** Add strict locator rules to the Tess spec:

**Draft spec update (Tess Agent V4):**
> **Locator Rule L3 — Exact locators:**
> 1. Prefer role-based locators (`getByRole`) over text-based locators (`getByText`) whenever possible
> 2. When using `getByText()`, always use `{ exact: true }` unless partial matching is intentionally needed
> 3. Never match against visually styled text — always match the DOM text content (CSS `text-transform`, `::before`/`::after`, and `aria-hidden` elements affect visual but not DOM text)
> 4. If multiple elements share the same text, scope with a parent locator or use `.first()` / `.nth()` with a comment explaining why

**Expected Impact:** Eliminates strict mode violations and CSS text-transform mismatches. Prevents 16+ failures per feature.

**Acceptance Criteria:**
- [ ] Tess spec includes Locator Rule L3 for exact locators
- [ ] Tess spec explicitly calls out CSS `text-transform` as a locator trap
- [ ] Examples in spec show role-based locator preference

---

## Summary

| # | Title | Priority | Owner | Effort | Status |
|---|-------|----------|-------|--------|--------|
| IB-CF-01 | Dependency verification step | P1 | Sally spec | S | Open |
| IB-CF-02 | Greenfield scaffolding checklist | P2 | Sally spec | M | Open |
| IB-CF-03 | FOM franchise API documentation | P2 | Paul spec | S | Open |
| IB-CF-04 | Chart library decision template | P3 | Dora spec | S | Open |
| IB-CF-05 | Tess: require `main` scoping for h1 locators | P0 | Tess spec | S | Open |
| IB-CF-06 | Tess: mandate mobile viewport awareness in test design | P0 | Tess spec | M | Open |
| IB-CF-07 | Tess: require exact locators over text substring matching | P1 | Tess spec | M | Open |

**Total: 7 items (2 P0, 2 P1, 2 P2, 1 P3)**

The build phase produced only 4 items (IB-CF-01 through 04) — none critical. However, post-build testing revealed 3 additional items (IB-CF-05 through 07), two of which are P0. All 3 post-build items target the Tess agent spec and address systemic locator quality issues that caused 47 test failures. These P0 items should be resolved before the next build cycle to prevent the same class of failures.
