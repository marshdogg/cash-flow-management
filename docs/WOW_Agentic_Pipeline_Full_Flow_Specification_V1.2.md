# 🏗 WOW OS Agent Pipeline — Full Flow Specification

**Version:** 1.2 | **Last Updated:** February 27, 2026

---

## 1. Pipeline Overview

The WOW OS agent pipeline is a **12-phase**, sequential product development lifecycle managed by Sally, the Orchestrator Agent. Each phase has a designated agent owner, defined inputs and outputs, and a quality gate that must pass before the pipeline advances. Humans remain in the loop for all judgment calls, scope decisions, and final approvals.

> *Core principle: Sally delegates, validates, sequences, and escalates. She never writes PRDs, code, tests, designs, or retros herself.*

### Pipeline at a Glance

| # | Phase | Owner | Key Output | Quality Gate | Feedback Loop |
|---|-------|-------|------------|-------------|---------------|
| 1 | Intake | Sally | Validated draft PRD | Draft has problem statement, users, behavior | N/A |
| 2 | PRD Creation | PRD Paul | Formalized PRD v1 | PRD structure complete w/ all sections | N/A |
| 3 | Edge Case Analysis | Edge Case Eddie | Edge case document | All critical edges identified | N/A |
| 4 | Iteration Loop | Paul ↔ Eddie | Finalized PRD (Eddie-approved) | Eddie signs off; max 3 rounds | Paul ↔ Eddie loop |
| **5** | **Design** 🆕 | **Dora** | **Design Spec + Component Mapping + Updated Prototypes** | **Paul + Eddie approve designs; max 3 rounds** | **Dora ↔ Paul/Eddie review loop** |
| **6** | **Architecture Review** 🆕 | **Ian** | **Implementation Brief** | **Technical feasibility validated; scope concerns flagged** | **Ian ↔ Dora (via Sally) if feasibility issues** |
| 7 | Test Creation | Tess | Testing Report + E2E suite | Every acceptance criterion covered | N/A |
| 8 | Feature Build | Cody Squad | Implemented feature code | All Codys hand off successfully | N/A |
| 9 | Test / Fix Loop | Cody + Tess | All tests passing | Full suite green; max 5 cycles | Test ↔ Fix loop |
| 10 | Full E2E Validation | Tess | Complete E2E pass | All tests green | Back to Phase 9 if fail |
| 11 | Deploy | Sally | PR created, CI green | Human reviews and merges | N/A |
| 12 | Retrospective | Randy | Retro Report + Audit Log + Backlog | All 3 outputs produced | Feeds next cycle |

> **Bold rows** with 🆕 indicate phases added in v1.2.

---

## 2. Agent Profiles

Each agent in the pipeline has a distinct role, a focused mission, and clear boundaries. Below is a profile of each agent, what they own, and what they explicitly do not do.

### Sally — The Orchestrator

**Role:** Senior project manager of the pipeline. Sally coordinates the entire lifecycle by routing work to specialists, enforcing quality gates, and escalating to humans when needed.

**What Sally Does**

Routes artifacts between agents in the correct sequence. Validates that each phase's output meets structural requirements before advancing. Counts iterations and retries, escalating when thresholds are hit. Logs every human intervention for Randy's retrospective. Tracks pipeline state at all times. Routes technical escalations to Ian before escalating to humans.

**What Sally Does NOT Do**

Sally never writes PRDs, code, tests, designs, or retros. She never makes scope decisions, overrides agent outputs, skips phases, or auto-merges code. All content and judgment decisions are delegated to specialists or escalated to humans.

**Decisions Sally CAN Make**

Sequencing (which agent goes next), retry logic (how many attempts remain), structural validation (is the PRD missing a section?), artifact routing (send the Testing Report to Cody, not the test code), and status reporting.

**Decisions Requiring Human Escalation**

Scope changes, architecture choices beyond Ian's authority, priority conflicts, trade-off decisions (ship with known bug vs. delay), and any disagreement between agents that persists after iteration.

---

### PRD Paul — The Writer

**Role:** Takes a rough draft PRD from a human and formalizes it into a structured, comprehensive product requirements document with all required sections, acceptance criteria, and behavioral specifications.

**Inputs:** Draft PRD from human (via Sally). Edge case feedback from Eddie (during iteration loop).

**Outputs:** Formalized PRD with numbered sections, acceptance criteria, user stories, error states, responsive specs, and accessibility requirements.

**Operating Modes:** CREATE (new PRDs from drafts), REVIEW (score and gap-check existing PRDs), and CROSS-REFERENCE (dependency mapping and conflict detection across PRDs).

**Spec:** `PRD-Paul-Agent-Instructions-v2.md` + `PRD-Paul-Template-v2.md`

---

### Edge Case Eddie — The Critic

**Role:** Reviews a formalized PRD and identifies edge cases, gaps, ambiguities, and missing error handling. Eddie thinks about what could go wrong, what the PRD doesn't address, and what will confuse downstream agents.

**Inputs:** Formalized PRD from Paul.

**Outputs:** Edge Case Report listing every identified edge case across 10 systematic categories, classified by severity (🔴 Critical, 🟠 Major, 🟡 Minor, 🔵 Note), with proposed resolutions.

**Operating Modes:** ANALYZE (produce Edge Case Report), RESOLVE (produce PRD-ready resolution language), and VALIDATE (verify updated PRD addresses all critical/major items).

**Spec:** `Edge-Case-Eddie-Agent-Instructions.md` + `Edge-Case-Report-Template.md`

---

### Dora — The Designer 🆕

**Role:** Bridges the gap between "what to build" (the PRD) and "what it looks like" (the visual implementation). Dora reads finalized PRDs, accesses the design system, and produces design-system-grounded specifications, component mappings, and updated HTML prototypes.

**Inputs:** Finalized PRD (Eddie-approved), Edge Case Document, existing HTML prototypes, design system reference, related flow designs.

**Outputs:** Design Spec (comprehensive visual specification with tokens, states, and component mappings), Component Mapping (maps every UI element to existing design system components), Updated HTML Prototypes (token-accurate, state-complete), and Design Decision Log.

**Operating Modes:** DESIGN (produce complete design package from finalized PRD), REVISE (update designs based on Paul/Eddie feedback, max 3 iterations), and AUDIT (review existing flows against design system).

**Design Principles**

- **REUSE FIRST** — Check existing components before creating new ones
- **TOKEN PRECISION** — Never raw hex/pixels, always design tokens
- **STATE COMPLETENESS** — Every interactive element has default/hover/focus/active/disabled states
- **EDGE CASE VISUALS** — Every Eddie edge case gets visual treatment
- **ACCESSIBILITY BY DEFAULT** — WCAG AA contrast, visible focus indicators, minimum touch targets

**Review Gate**

Both Paul AND Eddie must approve designs before pipeline advances. Paul reviews for PRD alignment and acceptance criteria coverage. Eddie reviews for edge case visual coverage, all states designed, and responsive breakpoints. Sally mediates the review loop (max 3 rounds before human escalation).

**Spec:** `dora-designer-agent.md`

---

### Ian — The Implementation Agent 🆕

**Role:** Staff-level technical authority. Ian makes architecture decisions, reviews design feasibility, and resolves implementation blockers that would otherwise escalate to humans. He operates in two modes: proactive and reactive.

**Mode 1: Architecture Review (Proactive — Phase 6)**

After Dora's designs are approved, Ian produces an Implementation Brief that captures technical decisions, identifies risks, and provides structured guidance for the Cody Squad. Covers data model validation, rendering strategy, state management, API shape design, performance considerations, shared component identification, and architecture conflict detection.

**Mode 2: Technical Escalation Handler (Reactive — On-call Phases 8–10)**

During the build and test phases, when a Cody hits a technical blocker, Sally routes the question to Ian first. Ian either resolves it (architecture decisions, pattern conflicts, data shape mismatches, performance concerns) or determines it's a product/scope decision and tells Sally to escalate to human. This keeps humans focused on product judgment calls.

**Decision Authority**

| Ian Decides (Technical) | Humans Decide (Product/Scope) |
|------------------------|------------------------------|
| Rendering strategy (Server Components vs Client) | Scope changes |
| State management patterns | Feature trade-offs |
| API design (pagination, caching) | Data ownership (franchise vs corporate) |
| Component architecture | UX trade-offs (optimistic updates acceptable?) |
| Error handling patterns | Priority conflicts (which PRD requirement wins) |
| Performance mitigation | Timeline trade-offs (ship with debt vs delay) |

**Spec:** `ian-implementation-agent.md`

---

### Tess — The Testing Agent

**Role:** Reads finalized PRDs, design specs, implementation briefs, and HTML prototypes, then generates a Testing Report (plain-language test plan for Cody), an E2E Test Suite (Playwright, hidden from Cody), and a Test Runner CLI specification.

**The Red-Green Contract**

All tests start RED (failing). Cody's job is to make them GREEN through correct implementation. Cody never sees the test source code—only pass/fail output with behavioral error messages. This prevents "teaching to the test" and forces implementation from the PRD.

**What Tess Tests**

Acceptance criteria, user flows, error states, responsive breakpoints, navigation, business logic, and accessibility—all within a single flow/PRD. Tess does NOT test cross-flow integration, visual pixel-matching, third-party API contracts, or performance benchmarks.

**Security Measures**

Test files are not readable by Cody. CLI output is sanitized to strip file paths, selectors, and assertion code. Error messages describe expected behavior from the PRD's perspective, never the test's internals. Randomized test data prevents hardcoding.

---

### Cody Squad — The Builders

**Role:** A team of six specialized coding agents that implement features in a layered sequence. Each Cody inherits the previous Cody's work and builds on it, ensuring no single agent is overwhelmed with competing concerns.

| Agent | Nickname | Mission | Builds On |
|-------|----------|---------|-----------|
| Cody-UI | The Renderer | Build visual components from PRD + prototypes + Design Spec | Scaffold |
| Cody-Logic | The Brain | Wire up business logic, state management, data flow | Cody-UI's output |
| Cody-Integration | The Connector | API routes, data fetching, mutations, real-time updates | Cody-Logic's output |
| Cody-Resilience | The Guardian | Error states, loading states, empty states, validation, edge cases | Cody-Integration's output |
| Cody-A11y | The Advocate | Accessibility, keyboard nav, ARIA, screen reader support | Cody-Resilience's output |
| Cody-Observability | The Watcher | Analytics events, logging, performance monitoring, feature flags | Cody-A11y's output |

**Scaling the Squad**

Not every flow needs all six Codys. Simple flows (static pages) may only need Cody-UI. Standard CRUD flows use UI → Logic → Integration → Resilience. Full complex workflows use all six. A11y or Observability can run as standalone remediation passes on existing code.

**What Every Cody Receives**

The PRD, the Testing Report (plain language, no code), HTML prototypes, the Design Spec, the Implementation Brief, the previous Cody's output, and tech stack config (Next.js 14, Tailwind, shadcn/ui, TypeScript).

**What Cody NEVER Receives**

Test source code (.spec.ts files), test selectors or locators, test fixture data, or other Codys' system prompts. The test isolation boundary is absolute.

---

### Randy — The Retro Agent

**Role:** Runs retrospectives on completed build cycles. Reviews every artifact produced—test reports, handoff reports, escalation tickets, and critically, every moment a human had to intervene—then generates structured outputs that drive continuous improvement.

**Randy's Three Outputs**

- **Retro Report:** Structured summary with metrics, what went well, what didn't, what should change, and agent performance grades.
- **Prompt Audit Log:** Detailed analysis of every human intervention—categorized by type, severity, root cause, and suggested fix. This is Randy's most valuable output.
- **Improvement Backlog:** Prioritized, owned list of changes to agent specs, PRD templates, or processes. Items carry forward across cycles until resolved.

**Cross-Cycle Learning**

Randy's value compounds over multiple cycles. Improvement backlog items from Cycle 1 get fixed before Cycle 2 starts. Prompt audit patterns get incorporated into agent system prompts. Trend data validates whether improvements are working.

---

## 3. Phase-by-Phase Breakdown

Each phase below includes the trigger, inputs, outputs, quality gate, agent actions, and any feedback loops or escalation paths.

### Phase 1: Intake

| Attribute | Value |
|-----------|-------|
| **Owner** | Sally |
| **Trigger** | Human provides a draft PRD |
| **Inputs** | Draft PRD (markdown or freeform document) |
| **Outputs** | Validated intake + context package for Paul |
| **Quality Gate** | Draft PRD contains: problem statement, target users, and desired behavior description |

**Agent Actions**

- Receive the draft PRD from the human
- Validate that it contains enough context to proceed
- If too thin, Sally asks the human clarifying questions before proceeding
- Once validated, package the draft with any HTML prototypes and upstream context
- Hand the complete package to PRD Paul

**Escalation Rules**

> *If the draft is fundamentally incomplete (no problem statement, no users), Sally asks the human to flesh it out before entering the pipeline.*

---

### Phase 2: PRD Creation

| Attribute | Value |
|-----------|-------|
| **Owner** | PRD Paul |
| **Trigger** | Sally hands validated draft to Paul |
| **Inputs** | Validated draft PRD + context package from Sally |
| **Outputs** | Formalized PRD v1 with all required sections |
| **Quality Gate** | PRD has numbered sections, acceptance criteria, user stories, error handling, responsive specs, and a11y requirements |

**Agent Actions**

- Read the draft PRD and all supplementary context
- Formalize into a structured PRD with all required sections
- Ensure every requirement has at least one acceptance criterion
- Return PRD v1 to Sally

**Escalation Rules**

> *If Paul encounters a fundamental ambiguity that cannot be resolved from the draft alone, Sally escalates to the human for clarification.*

---

### Phase 3: Edge Case Analysis

| Attribute | Value |
|-----------|-------|
| **Owner** | Edge Case Eddie |
| **Trigger** | Sally hands formalized PRD to Eddie |
| **Inputs** | Formalized PRD v1 from Paul |
| **Outputs** | Edge Case Report with all identified gaps, ranked by severity |
| **Quality Gate** | All critical edge cases identified and categorized across Eddie's 10 systematic categories |

**Agent Actions**

- Read the PRD thoroughly
- Systematically walk through 10 edge case categories: Input Boundaries, State & Timing, Permissions & Roles, Volume & Scale, Data Relationships, Error Recovery, Integration & Cross-Module, Mobile & Responsive, User Behavior Patterns, Business Logic Gaps
- Classify each edge case by severity (🔴 Critical, 🟠 Major, 🟡 Minor, 🔵 Note)
- Propose specific resolutions for Critical and Major items
- Return Edge Case Report to Sally

---

### Phase 4: Paul ↔ Eddie Iteration Loop

| Attribute | Value |
|-----------|-------|
| **Owner** | Sally (mediating) |
| **Trigger** | Eddie's Edge Case Report is ready |
| **Inputs** | PRD from Paul + Edge Case Report from Eddie |
| **Outputs** | Finalized PRD that Eddie approves |
| **Quality Gate** | Eddie explicitly signs off on the PRD. Maximum 3 automatic iterations before mandatory human review. |

**Agent Actions**

- Send Eddie's edge cases to Paul for PRD update
- Paul produces PRD v2 addressing the feedback
- Send updated PRD back to Eddie for re-review (VALIDATE mode)
- Repeat until Eddie approves or iteration limit is reached
- Track iteration count and whether the same issue recurs

**Feedback Loop**

> *This is the first feedback loop. Paul and Eddie iterate up to 3 rounds automatically. If the same issue remains unresolved after 2 rounds, or if there is any scope disagreement, Sally escalates to the human with the specific decision needed.*

**Escalation Rules**

> *Same issue unresolved after 2 rounds → escalate. Any scope disagreement → escalate. 3 rounds completed without sign-off → mandatory human review.*

---

### Phase 5: Design 🆕

| Attribute | Value |
|-----------|-------|
| **Owner** | Dora |
| **Trigger** | Eddie approves the finalized PRD |
| **Inputs** | Finalized PRD + Edge Case Document + existing HTML prototypes + design system reference + related flow designs |
| **Outputs** | Design Spec + Component Mapping + Updated HTML Prototypes + Design Decision Log |
| **Quality Gate** | Both Paul AND Eddie approve designs. Maximum 3 review rounds before human escalation. |

**Agent Actions**

- Read the finalized PRD and Edge Case Document
- Audit existing design system for reusable components
- Produce Design Spec with exact design tokens, spacing, typography, colors, interaction states
- Map every UI element to existing design system components or flag new ones
- Update HTML prototypes to be token-accurate and state-complete (loading/empty/error/responsive)
- Log every design decision with rationale
- Return complete design package to Sally

**Review Loop**

Sally routes Dora's design package to both Paul and Eddie for review. Paul checks PRD alignment and acceptance criteria coverage. Eddie checks edge case visual coverage and responsive breakpoints. Both must explicitly approve. If either requests changes, Sally routes feedback to Dora for revision. Maximum 3 review rounds before human escalation.

**Escalation Rules**

> *Paul and Eddie give conflicting design feedback → Sally escalates to human. 3 review rounds without dual sign-off → mandatory human review. Dora identifies a scope question → Sally escalates to human.*

---

### Phase 6: Architecture Review 🆕

| Attribute | Value |
|-----------|-------|
| **Owner** | Ian |
| **Trigger** | Dora's designs approved by Paul and Eddie |
| **Inputs** | Finalized PRD + Design Spec + Updated Prototypes + existing codebase + tech stack config |
| **Outputs** | Implementation Brief |
| **Quality Gate** | Technical feasibility validated. Scope-impacting constraints flagged to human. |

**Agent Actions**

- Validate data model against PRD requirements and existing architecture
- Define rendering strategy (Server Components vs Client Components)
- Specify state management approach (URL params, useState, SWR)
- Design API shape (pagination, caching, data fetching patterns)
- Identify shared components that should be extracted
- Detect architecture conflicts with existing codebase
- Produce per-Cody guidance notes in the Implementation Brief
- Flag design feasibility concerns back to Sally for routing to Dora
- Flag scope-impacting constraints to Sally for human escalation

**Escalation Rules**

> *Design has significant implementation complexity → Sally routes Ian's feasibility feedback to Dora. Ian identifies scope-impacting constraint → Sally escalates to human. Technical decision requires product judgment → Ian provides technical analysis, Sally escalates product question to human.*

---

### Phase 7: Test Creation

| Attribute | Value |
|-----------|-------|
| **Owner** | Tess |
| **Trigger** | Ian completes Architecture Review |
| **Inputs** | Finalized PRD + Design Spec + Implementation Brief + HTML prototypes + tech stack config |
| **Outputs** | Testing Report (.md, given to Cody) + E2E Test Suite (hidden from Cody) + Test Runner CLI spec |
| **Quality Gate** | Every acceptance criterion in the PRD has at least one test. Tests are deterministic and behavioral. |

**Agent Actions**

- Read the finalized PRD, Design Spec, Implementation Brief, and all HTML prototypes
- Generate the Testing Report (plain-language test plan)
- Generate the E2E Test Suite in Playwright (starts RED)
- Define the Test Runner CLI output spec with sanitized error messages
- Return all three outputs to Sally

**Escalation Rules**

> *If Tess identifies PRD ambiguities that prevent writing deterministic tests, Sally escalates to the human (or routes back to Paul if it's a minor clarification).*

---

### Phase 8: Feature Build

| Attribute | Value |
|-----------|-------|
| **Owner** | Cody Squad |
| **Trigger** | Tess completes test creation |
| **Inputs** | PRD + Testing Report + Design Spec + Implementation Brief + HTML prototypes + tech stack config |
| **Outputs** | Implemented feature code + Handoff Reports from each Cody |
| **Quality Gate** | Each Cody in the chain produces a Handoff Report; the last Cody runs the full test suite |

**Agent Actions**

- Sally determines which Codys are needed based on flow complexity
- Cody-UI builds the visual shell from PRD + prototypes + Design Spec
- Cody-Logic wires up state and business logic per Implementation Brief
- Cody-Integration connects APIs and data fetching
- Cody-Resilience adds error/loading/empty states and validation
- Cody-A11y adds keyboard nav, ARIA, screen reader support
- Cody-Observability adds analytics, logging, feature flags
- The last Cody runs the full test suite

**Escalation Rules**

> *Technical blocker → Sally routes to Ian first. Ian resolves → Technical Decision routed back to Cody. Ian identifies scope/product question → Sally escalates to human. Non-technical blocker → Sally escalates to human directly.*

---

### Phase 9: Test / Fix Loop

| Attribute | Value |
|-----------|-------|
| **Owner** | Sally (mediating Cody + Tess) |
| **Trigger** | Last Cody runs tests and some fail |
| **Inputs** | Failing test results (sanitized output) + current codebase |
| **Outputs** | All tests passing (green) |
| **Quality Gate** | Full test suite passes. Maximum 5 total fix cycles. Maximum 3 retries on the same failing test. |

**Agent Actions**

- Run the full test suite
- Route sanitized failure output to the appropriate Cody
- Cody reads the failure, cross-references the PRD, and fixes
- Re-run tests
- Repeat until green or thresholds are hit
- Track per-test retry counts and total cycle count

**Feedback Loop**

> *This is the second major feedback loop. Cody attempts fixes, tests re-run, and the cycle repeats. Sally enforces two escalation thresholds: (1) same test fails 3 times → route to Ian first, then escalate that specific test, (2) 5 total fix cycles exceeded → mandatory human review of all remaining failures.*

**Escalation Rules**

> *Same test fails 3 times → route to Ian. Ian cannot resolve → human help. 5 total cycles exceeded → full human review. Cody reports it cannot debug → immediate escalation with context.*

---

### Phase 10: Full E2E Validation

| Attribute | Value |
|-----------|-------|
| **Owner** | Tess |
| **Trigger** | Test/Fix loop achieves all-green on targeted tests |
| **Inputs** | Complete codebase after fix loop |
| **Outputs** | Full E2E suite results (pass/fail) |
| **Quality Gate** | 100% of tests pass across the complete integrated E2E suite |

**Agent Actions**

- Tess runs the complete, unfiltered E2E test suite
- If all pass → proceed to Deploy
- If any fail → route failures back into Test/Fix Loop (Phase 9)

**Feedback Loop**

> *This phase exists because the fix loop may run tests incrementally or in isolation. The full E2E validates the complete integrated experience. If failures occur here, they loop back to Phase 9 with the same escalation rules.*

**Escalation Rules**

> *Failures here follow the same rules as Phase 9. If tests that previously passed now fail (regression), Sally flags this as a higher-severity issue.*

---

### Phase 11: Deploy

| Attribute | Value |
|-----------|-------|
| **Owner** | Sally |
| **Trigger** | Full E2E passes |
| **Inputs** | Fully tested, Tess-approved implementation |
| **Outputs** | Pull Request + CI pipeline triggered |
| **Quality Gate** | PR created, CI green, human reviews and merges. Sally NEVER auto-merges. |

**Agent Actions**

- Create a PR with structured description (flow name, summary, test results, edge cases addressed, known limitations)
- Trigger the CI pipeline
- Wait for human to manually review and merge
- Notify human that the PR is ready for review

**Escalation Rules**

> *CI failures are routed back to the appropriate Cody. Sally never proceeds past this phase without a human merge.*

---

### Phase 12: Retrospective

| Attribute | Value |
|-----------|-------|
| **Owner** | Randy |
| **Trigger** | PR is merged / deploy confirmed |
| **Inputs** | All artifacts: original + finalized PRD, edge case doc, Design Spec, Implementation Brief, iteration history, Testing Report, Cody handoff reports, test/fix loop history, human intervention log, deploy artifacts |
| **Outputs** | Retro Report + Prompt Audit Log + Improvement Backlog |
| **Quality Gate** | Randy produces all three outputs with actionable findings |

**Agent Actions**

- Sally compiles all artifacts from the build cycle
- Hands the complete package to Randy
- Randy reviews everything and produces three structured outputs
- Sally presents retro outputs to the human
- Build cycle marked as COMPLETE

**Feedback Loop**

> *Randy's outputs feed forward into the next build cycle. Improvement backlog items become PRD updates, agent spec patches, or process changes. Prompt audit patterns get incorporated into agent system prompts. This is the long-range learning loop.*

---

## 4. Escalation Framework

Sally uses a three-tier escalation system. Escalations are logged in the Human Intervention Log, which becomes Randy's most valuable input.

| Level | Trigger | Example | Sally's Action |
|-------|---------|---------|---------------|
| 🟡 Yellow | Agent needs clarification on a non-blocking issue | Paul isn't sure if a feature is Phase 1 or Phase 2 | Present the question to the human; pipeline pauses for this item only |
| 🟠 Orange | Iteration threshold hit or recurring issue | Same test fails 3 times; Paul ↔ Eddie loop hits round 3 | Present full context + agent attempts to human; recommend a path forward |
| 🔴 Red | Agent cannot proceed at all, or fundamental disagreement | Cody cannot debug a failure; Paul and Eddie disagree on scope | Full pipeline pause; present decision with options to human |

### Updated Escalation Routing 🆕

- Technical question from Cody → Sally routes to Ian first
- Ian resolves → Sally routes Technical Decision back to Cody
- Ian identifies scope/product question → Sally escalates to human
- Non-technical blocker → Sally escalates to human directly
- Design feasibility concern from Ian → Sally routes to Dora
- Paul ↔ Eddie dispute → Sally escalates to human
- Dora review dispute (Paul/Eddie conflicting) → Sally escalates to human

### Human Intervention Log Format

Every escalation is logged with: timestamp, build cycle name, phase, agent involved, escalation level, what triggered it, the decision presented, the human's verbatim response, and the action taken. This log is Randy's primary input for the Prompt Audit Log.

### Intervention Types

| Type | Example | Severity | Typical Root Cause |
|------|---------|----------|-------------------|
| Correction | Agent used wrong field name on a card | 🔴 High | PRD misread |
| Clarification | PRD said "status badge" — which element? | 🟡 Medium | PRD ambiguity |
| Unblock | Skip PaintScout integration, mock it | 🟡 Medium | Missing context |
| Override | Use slide-over panel, not a modal | 🟠 Med-High | Wrong assumption |
| Prompt Rephrase | Rewrote prompt to stop inline styles | 🔴 High | Spec gap |
| Scope Adjustment | Don't build filter bar — Phase 2 | 🟢 Low | Scope boundary |
| Bug Fix Direction | Issue is in useEffect deps, not render | 🟡 Medium | Debug limitation |
| Architecture | Use server actions, not API routes | 🟠 Med-High | Judgment gap |

---

## 5. Configuration & Thresholds

These parameters control Sally's automated behavior. They can be adjusted as the team builds confidence in the agent pipeline.

| Parameter | Default | Description |
|-----------|---------|-------------|
| `MAX_PAUL_EDDIE_ITERATIONS` | 3 | Auto-iterations before mandatory human review |
| `ESCALATE_PAUL_EDDIE_AFTER` | 2 | Same-issue unresolved rounds before escalation |
| `MAX_DESIGN_REVIEW_ITERATIONS` 🆕 | 3 | Design review rounds before human escalation |
| `MAX_TEST_FIX_CYCLES` | 5 | Full test-run cycles before mandatory human review |
| `MAX_PER_TEST_RETRIES` | 3 | Fix attempts on the same failing test before escalation |
| `ROUTE_TECH_TO_IAN` 🆕 | true | Route technical escalations to Ian before human |
| `REQUIRE_DUAL_DESIGN_SIGNOFF` 🆕 | true | Both Paul and Eddie must approve Dora's designs |
| `AUTO_MERGE` | false | Whether Sally can merge PRs (always false for now) |
| `REQUIRE_FULL_E2E` | true | Whether to run full E2E after fix loop (always true) |

---

## 6. Agent Spec Dependencies

Sally's pipeline depends on the following agent specifications. All are now defined and Sally can operate a full 12-phase pipeline.

| Agent | Status | Document | Notes |
|-------|--------|----------|-------|
| PRD Paul | ✅ Complete (v2) | `PRD-Paul-Agent-Instructions-v2.md` | Fully specified w/ template |
| Edge Case Eddie | ✅ Complete (v1) | `Edge-Case-Eddie-Agent-Instructions.md` | Fully specified w/ report template |
| **Dora** 🆕 | ✅ Complete (v1) | `dora-designer-agent.md` | Fully specified w/ design system integration |
| **Ian** 🆕 | ✅ Complete (v1) | `ian-implementation-agent.md` | Fully specified w/ dual-mode operation |
| Tess | ✅ Complete (v1.1) | `tess-testing-agentv2.md` | Fully specified |
| Cody Squad | ✅ Complete | `cody-coding-agent.md` | All 6 Codys specified |
| Randy | ✅ Complete (v1.0) | `randy-retro-agent.md` | Fully specified |
| **Sally** 🔄 | ✅ Complete (v2.0) | `sally-orchestrator-agent-v2.md` | 12-phase orchestrator |

---

## 7. Future Enhancements

### Phase 1 (Complete)

All original agent specs defined. Sally operates the sequential pipeline with human escalation. PRD Paul (v2) and Edge Case Eddie (v1) completed the initial agent lineup alongside Tess, Cody Squad, Randy, and Sally.

### Phase 1.5 (Complete — v1.2)

Design and Architecture Review phases added to the pipeline. Dora (v1) bridges the PRD-to-visual gap with design-system-grounded specifications. Ian (v1) provides staff-level technical authority for architecture decisions and implementation escalations. Sally updated to v2 with 12-phase orchestration, new escalation routing (technical → Ian first), and dual design signoff. Pipeline expanded from 10 phases to 12, catching expensive rework earlier in the lifecycle.

### Phase 2 (Planned)

Parallel test creation: Tess begins writing tests while Cody-UI starts (tests won't run until Cody finishes, but creation can overlap). Reduced escalation: as the team trusts Sally's and Ian's judgment, some scope decisions could be made by Sally with human notification, not approval. Multi-flow coordination: Sally manages multiple build cycles simultaneously.

### Phase 3 (Future)

Cross-flow integration testing: Sally coordinates integration tests spanning multiple flows. Automated retro application: Sally reads Randy's improvement backlog and patches agent specs automatically. Self-improving thresholds: Sally adjusts MAX_* values based on historical cycle data.

---

## Revision History

| Version | Date | Changes |
|---------|------|---------|
| v1.0 | Feb 2026 | Initial pipeline specification |
| v1.1 | Feb 2026 | Updated agent dependency statuses: PRD Paul and Edge Case Eddie specs now complete. Renamed Edge Case Ernie to Edge Case Eddie. Updated file references. Updated config parameter names. Marked Phase 1 as complete. |
| **v1.2** | **Feb 27, 2026** | **Major update: 12-phase pipeline with two new agents.** |

### v1.2 Changelog Detail

**New agents:**
- Dora (The Designer, v1.0) — Full agent profile with operating modes (DESIGN, REVISE, AUDIT), design principles, dual-approval review gate, and spec document.
- Ian (The Implementation Agent, v1.0) — Full agent profile with dual-mode operation (Architecture Review + Technical Escalation), decision authority matrix, and spec document.

**New phases:**
- Phase 5: Design (Dora) — Inserted between PRD iteration and test creation
- Phase 6: Architecture Review (Ian) — Inserted between design and test creation
- All subsequent phases renumbered (old 5–10 → new 7–12)

**Updated escalation routing:**
- Technical escalations from Cody now route to Ian first
- Ian resolves or identifies product questions for human escalation
- Design feasibility concerns from Ian route to Dora via Sally

**New configuration parameters:**
- `MAX_DESIGN_REVIEW_ITERATIONS` — 3
- `ROUTE_TECH_TO_IAN` — true
- `REQUIRE_DUAL_DESIGN_SIGNOFF` — true

**Updated inputs for downstream agents:**
- Tess now receives Design Spec + Implementation Brief
- Cody Squad now receives Design Spec + Implementation Brief
- Randy receives all new artifacts in retrospective package

**Updated agent dependencies:**
- Dora (v1.0) and Ian (v1.0) added
- Sally updated to v2.0 with 12-phase orchestration

**Future enhancements:**
- Phase 1.5 marked complete
- Phase 2 description updated to reference Ian's role
