# Edge Case Report — [PRD Name]

> **Analyzed by:** Edge Case Eddie
> **PRD Version:** [version/date]
> **Date:** [analysis date]

---

## Summary

| Severity | Count |
|----------|-------|
| 🔴 Critical | 0 |
| 🟠 Major | 0 |
| 🟡 Minor | 0 |
| 🔵 Note (Product Decision) | 0 |
| **Total** | **0** |

**Overall Assessment:** [One paragraph: How solid is this PRD? Where are the biggest risk areas? What's the single most important thing to resolve before development?]

---

## Happy Paths

> *Document the assumed happy path for each major flow before stress-testing. This establishes the baseline that edge cases deviate from.*

### Flow 1: [Flow Name]

**Persona:** [Primary persona for this flow]
**Trigger:** [What starts the flow]

1. [Step 1]
2. [Step 2]
3. [Step 3]
4. [Expected outcome]

**PRD Coverage:** [Which sections specify this flow — e.g., §6.3, §6.5]

---

### Flow 2: [Flow Name]

> *Repeat for each major flow (typically 3-8 per PRD)*

---

## Edge Cases by Category

> *Only include categories that are relevant. Skip with a note: "Category N: N/A — [reason]"*

---

### Category 1: Input Boundaries

| # | Edge Case | Severity | PRD Section | Specified? | Details |
|---|-----------|----------|-------------|------------|---------|
| 1.1 | [Description] | 🟠 | §6.3 | ❌ No | [What happens? Why does it matter? Suggested behavior.] |
| 1.2 | [Description] | 🟡 | §6.3 | ✅ Yes | [Already handled — note for completeness] |

---

### Category 2: State & Timing

| # | Edge Case | Severity | PRD Section | Specified? | Details |
|---|-----------|----------|-------------|------------|---------|
| 2.1 | [Description] | 🔴 | §6.1 | ❌ No | [Details + suggested behavior] |

---

### Category 3: Permissions & Roles

| # | Edge Case | Severity | PRD Section | Specified? | Details |
|---|-----------|----------|-------------|------------|---------|

---

### Category 4: Volume & Scale

| # | Edge Case | Severity | PRD Section | Specified? | Details |
|---|-----------|----------|-------------|------------|---------|

---

### Category 5: Data Relationships

| # | Edge Case | Severity | PRD Section | Specified? | Details |
|---|-----------|----------|-------------|------------|---------|

---

### Category 6: Time & Dates

| # | Edge Case | Severity | PRD Section | Specified? | Details |
|---|-----------|----------|-------------|------------|---------|

---

### Category 7: Integration & Cross-Module

| # | Edge Case | Severity | PRD Section | Specified? | Details |
|---|-----------|----------|-------------|------------|---------|

---

### Category 8: Mobile & Responsive

| # | Edge Case | Severity | PRD Section | Specified? | Details |
|---|-----------|----------|-------------|------------|---------|

---

### Category 9: User Behavior Patterns

| # | Edge Case | Severity | PRD Section | Specified? | Details |
|---|-----------|----------|-------------|------------|---------|

---

### Category 10: Business Logic Gaps

| # | Edge Case | Severity | PRD Section | Specified? | Details |
|---|-----------|----------|-------------|------------|---------|

---

## Critical & Major — Resolution Summary

> *Quick reference of everything that needs action before development.*

### 🔴 Critical (Must Resolve)

| # | Edge Case | Proposed Resolution | PRD Section to Update |
|---|-----------|--------------------|-----------------------|
| [ref] | [Short description] | [What should happen] | [§X.X] |

### 🟠 Major (Should Resolve)

| # | Edge Case | Proposed Resolution | PRD Section to Update |
|---|-----------|--------------------|-----------------------|
| [ref] | [Short description] | [What should happen] | [§X.X] |

### 🔵 Product Decisions Needed

| # | Question | Options | Recommendation | Impact if Deferred |
|---|----------|---------|---------------|-------------------|
| [ref] | [What needs to be decided?] | [Option A vs Option B] | [Eddie's recommendation] | [What happens if we don't decide?] |

---

## Next Steps

1. [ ] Review 🔴 Critical items — these block development
2. [ ] Make product decisions on 🔵 Notes
3. [ ] Run RESOLVE mode to generate PRD-ready language for accepted resolutions
4. [ ] Hand Resolution Report to PRD Paul for integration
5. [ ] Run VALIDATE mode on updated PRD
