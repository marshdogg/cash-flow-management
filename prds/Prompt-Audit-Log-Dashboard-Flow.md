# Prompt Audit Log: Dashboard Flow
## Build Cycle: 2026-02-28 (Cycle 1 — Greenfield)
## Total Interventions: 6
## Severity Breakdown: 🔴 0 | 🟠 1 | 🟡 1 | 🟢 4

## Intervention Index

| # | Agent | Type | Severity | Root Cause | Fix Status |
|---|-------|------|----------|------------|------------|
| 1 | Edge Case Eddie | Clarification | 🟢 Info | PRD ambiguity | Backlog #1 |
| 2 | Edge Case Eddie / PRD integration | Correction | 🟠 Medium | PRD ambiguity + Wrong assumption | Backlog #2 |
| 3 | Edge Case Eddie | Clarification | 🟢 Info | PRD ambiguity | Backlog #3 |
| 4 | Sally (orchestrator) | Process | 🟢 Info | Pipeline design (intentional) | No fix needed |
| 5 | PRD Paul | Addition | 🟡 Low | Missing context (draft PRD) | Backlog #4 |
| 6 | General (all agents) | Addition | 🟢 Info | Missing context | Backlog #5 |

## Detailed Analysis

### Intervention #1: Product Decisions on Tab Visibility
**Agent:** Edge Case Eddie · **Type:** Clarification · **Severity:** 🟢 Info
**Phase:** Edge case resolution

**What happened:** Eddie identified 4 edge cases requiring product decisions: tab visibility by role, close rate formula, back button behavior, and progress bar overflow. Eddie could not resolve these autonomously because the PRD did not specify which roles should see which tabs. The user provided the ruling that Estimator and PM roles do not need the profitability tab.

**The human's exact prompt:**
> Estimator and PM don't need to see the profitabilty tab

**Root cause analysis:** PRD ambiguity. The original PRD did not include role-based access rules for dashboard tabs. Eddie correctly identified this as an unresolvable gap and escalated rather than assuming.

**Pattern match:** First occurrence. However, role-based visibility is a predictable requirement for any multi-persona feature in WOW OS. This will recur if not addressed structurally.

**Recommended fix:**
| Target | Change | Priority |
|--------|--------|----------|
| PRD template (`templates/paul-prd-template.md`) | Add a "Role-Based Access" section requiring explicit tab/section visibility rules per persona for every new flow | P1 |

---

### Intervention #2: Close Rate Denominator Correction
**Agent:** Edge Case Eddie / PRD integration · **Type:** Correction · **Severity:** 🟠 Medium
**Phase:** Paul/Eddie loop — integrating edge case resolutions into PRD

**What happened:** Eddie recommended a close rate formula of Close Rate = Won / (Won + Lost). When initially asked about the formula, the user said "no sure tbh," so the pipeline defaulted to Eddie's recommendation. The user then corrected mid-edit with the actual business definition: total estimates presented as the denominator. This required updating 3 locations in the PRD (Close Rate Definition section, data sources table, and Q&A #21).

**The human's exact prompt:**
> close rate denominatior is total estimates presented.

**Root cause analysis:** Two compounding causes. (1) PRD ambiguity — the original PRD referenced "close rate" without defining the formula. (2) Wrong assumption — Eddie assumed a simpler Won/(Won+Lost) formula rather than the domain-specific Won/Total Estimates Presented. The pipeline had no way to know the business definition without the user.

**Pattern match:** First occurrence. However, "business metrics definitions" is a category that will recur across any feature involving KPIs, dashboards, or reporting. This is high-impact when wrong because a wrong denominator silently produces incorrect data in production.

**Recommended fix:**
| Target | Change | Priority |
|--------|--------|----------|
| PRD template (`templates/paul-prd-template.md`) | Add a "Metric Definitions" section. Every business metric referenced in the PRD must include: display name, formula (numerator and denominator explicitly), data source, and edge case handling (e.g., divide-by-zero). | P0 |
| Edge Case Eddie spec (`agents/EdgeCase_Eddie_Agent_V3.md`) | When Eddie encounters an undefined business metric, escalate as a 🟠 Medium blocker rather than recommending a default formula. Business metric definitions should never be assumed. | P1 |

---

### Intervention #3: Progress Bar Overflow Behavior
**Agent:** Edge Case Eddie · **Type:** Clarification · **Severity:** 🟢 Info
**Phase:** Edge case resolution

**What happened:** Eddie asked whether a progress bar exceeding 100% should cap at 100% or continue past it (overflow). The user chose overflow behavior, meaning the progress bar visually extends beyond 100% to reflect over-achievement.

**The human's exact prompt (via AskUserQuestion):**
> button should no sure tbh progress bar behavoious should continur past 100%

**Root cause analysis:** PRD ambiguity. The PRD specified a progress bar for targets but did not define the visual behavior when a metric exceeds its target. This is a common gap — edge-state visualizations are rarely specified in initial PRDs.

**Pattern match:** First occurrence. Visual behavior decisions for boundary states (overflow, empty state, error state) are frequently missing from PRDs. This is a predictable gap category.

**Recommended fix:**
| Target | Change | Priority |
|--------|--------|----------|
| PRD template (`templates/paul-prd-template.md`) | Add an "Edge State Visualizations" subsection to the visual spec section. Should prompt the PRD author to define behavior for: empty state, overflow/over-achievement, error/loading, and zero-data scenarios. | P2 |

---

### Intervention #4: Phase Transitions (x5)
**Agent:** Sally (orchestrator) · **Type:** Process · **Severity:** 🟢 Info
**Phase:** All transitions (5 occurrences)

**What happened:** The user confirmed each phase transition as designed. Sally presented the phase summary and requested approval before proceeding to the next agent. The user approved each transition promptly.

**The human's exact prompts:**
> yes kick off Paul's review

> yes kick off Eddie

> yes commit and continue to Dora

> yes commit and continue to Ian

> yes commit and continue

**Root cause analysis:** Pipeline design. Human-in-the-loop approval at phase transitions is intentional. These are not "problems" — they are the pipeline working correctly.

**Pattern match:** Consistent across all 5 transitions in this cycle. Working as designed.

**Recommended fix:**
| Target | Change | Priority |
|--------|--------|----------|
| None | No fix needed. Human-in-the-loop phase transitions are a core safety mechanism. | N/A |

---

### Intervention #5: PRD Section Drafting
**Agent:** PRD Paul · **Type:** Addition · **Severity:** 🟡 Low
**Phase:** PRD review

**What happened:** Paul scored the incoming PRD at C+ (68%) and identified 3 major gaps: missing JTBD (Jobs To Be Done) flows, no Q&A section, and no tracking events. Rather than sending the PRD back to the original author for rework, the user directed the pipeline to draft the missing sections itself.

**The human's exact prompt:**
> draft the missing sections into the PRD

**Root cause analysis:** Missing context. The user brought a draft PRD and expected the pipeline to improve it. This is not a failure — it is the pipeline's value proposition. Paul correctly identified the gaps; the user made an efficient decision to let the pipeline self-improve the document rather than adding a round-trip.

**Pattern match:** First cycle, so this is the baseline. The severity of this intervention depends on how complete future PRDs are at intake. If every cycle starts with a C+ PRD, the pipeline will spend significant time in the Paul phase. If intake quality improves, this intervention disappears.

**Recommended fix:**
| Target | Change | Priority |
|--------|--------|----------|
| Pipeline intake process | Create a "PRD Intake Checklist" that helps users include the minimum required sections (JTBD flows, Q&A, tracking events, metric definitions, role-based access) before starting the pipeline. This does not block intake — it surfaces gaps early so users can choose to address them upfront or let Paul handle them. | P1 |

---

### Intervention #6: Greenfield Project Context
**Agent:** General (all agents) · **Type:** Addition · **Severity:** 🟢 Info
**Phase:** Intake

**What happened:** The user proactively clarified that this is a greenfield project with no existing codebase, and that the system would be built piece by piece. This context affected how all agents approached their work — no legacy constraints, no migration concerns, but also no existing patterns to follow.

**The human's exact prompt:**
> Just so you know, this is a greenfield project, so we'll build piece by piece if that's ok

**Root cause analysis:** Missing context. The pipeline assumed an existing codebase by default. The user had to volunteer this information rather than being prompted for it.

**Pattern match:** First cycle. This distinction (greenfield vs. existing vs. migration) fundamentally changes agent behavior: Ian's architecture decisions, Cody's implementation approach, Tess's testing strategy, and Dora's design constraints all shift based on project type.

**Recommended fix:**
| Target | Change | Priority |
|--------|--------|----------|
| Sally intake spec (`agents/Orchestration_Sally_Agent_V3.md`) | Add a "Project Type" field to intake: greenfield, existing codebase, or migration. This should be asked at intake, not discovered mid-cycle. | P1 |
| All agent specs | Each agent spec should document how behavior differs based on project type (e.g., Ian skips legacy compatibility analysis for greenfield; Cody uses scaffold-first approach). | P2 |

---

## Pattern Analysis

### Recurring Themes
| Theme | Occurrences | Agents Affected | Root Cause | Fix |
|-------|-------------|-----------------|------------|-----|
| PRD ambiguity | 3 (#1, #2, #3) | Eddie, Paul | PRD template does not prompt for role-based access, metric definitions, or edge-state visuals | Expand PRD template with dedicated sections (P0-P1) |
| Missing context at intake | 2 (#5, #6) | Paul, General | Intake process does not gather project type or validate PRD completeness | Add intake checklist and project type field (P1) |
| Business metric assumptions | 1 (#2) | Eddie | Agent assumed formula instead of escalating | Update Eddie spec to always escalate undefined metrics (P1) |

### Distribution by Agent
| Agent | Total | 🔴 | 🟠 | 🟡 | 🟢 |
|-------|-------|-----|-----|-----|-----|
| Edge Case Eddie | 3 | 0 | 1 | 0 | 2 |
| PRD Paul | 1 | 0 | 0 | 1 | 0 |
| Sally (orchestrator) | 1 | 0 | 0 | 0 | 1 |
| General (all agents) | 1 | 0 | 0 | 0 | 1 |
| **Total** | **6** | **0** | **1** | **1** | **4** |

### Distribution by Root Cause
| Root Cause | Count | % |
|-----------|-------|---|
| PRD ambiguity | 3 | 50% |
| Missing context | 2 | 33% |
| Wrong assumption | 1 | 17% |
| Agent spec gap | 0 | 0% |
| Hallucination | 0 | 0% |
| Scope creep | 0 | 0% |
| Architectural limitation | 0 | 0% |

> **Note:** Intervention #2 has two root causes (PRD ambiguity + wrong assumption). It is counted under PRD ambiguity in the table above since that was the primary cause; the wrong assumption was a secondary consequence. The 17% for wrong assumption reflects that it was a contributing factor in 1 of the 6 interventions.

## Prompts Worth Preserving

### Prompt #1: "Draft the missing sections into the PRD"
**Context:** Paul scored the PRD at C+ (68%) with 3 major gaps. Rather than sending the PRD back to the original author (which would add a round-trip and delay the cycle), the user directed the pipeline to self-improve the document.
**The prompt:**
> draft the missing sections into the PRD
**Why it worked:** This is an efficient directive that leverages the pipeline's knowledge of what a complete PRD looks like. Instead of describing what was missing, the user trusted Paul to fill the gaps based on the scoring criteria. This kept the cycle moving forward without sacrificing PRD quality.
**Incorporate into:** Consider adding this as a suggested user action in Sally's phase transition prompt when Paul scores a PRD below B. Sally could say: "Paul scored this PRD at [grade]. You can (a) send it back to the PRD author, or (b) ask us to draft the missing sections."

### Prompt #2: "Close rate denominator is total estimates presented"
**Context:** Eddie had assumed Close Rate = Won / (Won + Lost). The user corrected this mid-edit with the actual business definition.
**The prompt:**
> close rate denominatior is total estimates presented.
**Why it worked:** This is a domain-specific correction that no agent could have inferred. The user provided the exact business logic in a single sentence, which was clear enough to update 3 locations in the PRD without further clarification. This demonstrates the value of human-in-the-loop for business domain knowledge.
**Incorporate into:** This specific formula should be added to `docs/WOW_OS_CONTEXT_V2.md` under a "Business Metrics Glossary" section so that all future cycles have access to the correct definitions. Any dashboard or reporting feature will reference close rate.

---

## Cycle Health Summary

**Overall Rating: 🟢 Smooth**
- 6 total interventions, but 4 are 🟢 Info (phase transitions and proactive context)
- 0 high-severity (🔴) interventions
- 1 medium-severity (🟠) intervention (close rate correction — caught before it reached implementation)
- First-cycle baseline: this is the cleanest possible first run given a draft PRD and greenfield project

**Key Takeaway:** The dominant root cause is PRD ambiguity (50%). The single highest-leverage fix is expanding the PRD template with dedicated sections for role-based access, metric definitions, and edge-state visualizations. This one change would have prevented 3 of 6 interventions.
