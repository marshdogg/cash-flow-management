# [Emoji] [Feature Name] PRD

## 1. Brief Initiative Description

> *One paragraph. What is this feature and what problem does it solve? Write so a franchise partner would understand it.*

## 2. Short Description

> *Two to three sentences. The elevator pitch — what it does, where it lives, key capabilities. This is the version that goes on a roadmap slide.*

## 3. Associated HTML Files

| File | Component |
|------|-----------|
| `XX-feature-name.html` | Description of what this mockup shows |

## 4. Description & Business Impact

### Why We're Building This

> *Frame as problems. Use the pattern: **The [X] Problem:** [Description of the pain point]. Include 2-3 problems that this feature addresses.*

### Context & Background

> *Where does this feature fit in the broader platform? Which modules does it connect to? Use the format:*
> ```
> Module A → Feature (relationship)
> Module B → Feature (relationship)
> ```
> *Then a paragraph explaining the feature's role in the platform.*

### [Feature Taxonomy — if applicable]

> *If the feature introduces types, statuses, or categories, define them in a table:*

| Type | Icon | Description | Auto-Detection / Default |
|------|------|-------------|-------------------------|
| | | | |

### Expected Outcomes

> *Bulleted list of measurable or observable results:*
> - **Outcome name** — Description

### Affected Personas

> *Quick reference — which personas are impacted? Full JTBD flows are in §7.*
> - **[Persona Name]** — [One line: how this feature affects them]
> - **[Persona Name]** — [One line]
> - *Not affected: [Persona], [Persona] — [brief reason]*

## 5. Goals & Non-Goals

### Goals

1. **Goal name** — Brief description
2. ...

### Non-Goals (Out of Scope)

- **Feature name** — Reason it's excluded (e.g., "not included in v1," "separate PRD," "no current business requirement")
- ...

## 6. Metric Definitions

> *Required for any flow with KPIs or calculated metrics. If this feature has no KPIs or calculated metrics, write "N/A — no calculated metrics in this flow."*

| Metric Name | Formula | Denominator Source | Display Format | Example |
|-------------|---------|-------------------|----------------|---------|
| e.g., Close Rate | Won ÷ (Won + Lost + Pending) | `estimates` table, status field | Percentage, 1 decimal | 34.2% |
| | | | | |

> *Every metric referenced in acceptance criteria, KPI cards, or dashboards MUST have a row in this table. If a metric has multiple valid definitions, call out the chosen one and note alternatives as non-goals.*

## 7. Role-Based Access

> *Required for any flow with role-differentiated UIs. If all roles see the same UI, write "N/A — all roles have identical access."*

| Feature / Section | Franchise Partner | Ops Manager | Sales Consultant | Sales Centre | Crew |
|-------------------|:-:|:-:|:-:|:-:|:-:|
| e.g., Dashboard Overview tab | Visible | Visible | Visible | Hidden | Hidden |
| e.g., Financial KPIs | Visible | Read-Only | Hidden | Hidden | Hidden |
| e.g., Edit Deal button | Visible | Visible | Visible | Disabled | Hidden |
| | | | | | |

> *Use: **Visible** | **Hidden** | **Disabled** | **Read-Only**. Add or remove role columns as needed. Every tab, panel, action button, and data section with role-specific behavior needs a row.*

## 8. Definition of Done & Acceptance Criteria

### 8.1 [Primary Page/Component Name] (`XX-mockup-file.html`)

> *Organize by sub-section within each component. Use checkbox format for every criterion.*

**[Sub-section name]:**

- ☐ Specific, observable criterion
- ☐ Another criterion with exact values where relevant (colors, counts, labels)
- ☐ Behavioral criterion — what happens when the user does X

**Edge value visual behaviors** *(required for any element with a numeric input):*

- ☐ Behavior at **0** (e.g., "Progress bar shows 0% with gray fill")
- ☐ Behavior at **negative** values (e.g., "Display as red text with minus sign")
- ☐ Behavior at **max** (e.g., "Progress bar shows 100% with green fill")
- ☐ Behavior at **over-max** (e.g., "Progress bar caps at 100%, value shows '125%' in text")
- ☐ Behavior at **null/undefined** (e.g., "Show '—' placeholder, no progress bar")

> *For structured specifications, use tables:*

| Column/Field | Content | Details |
|---|---|---|
| | | |

**[Next sub-section]:**

- ☐ ...

### 8.2 [Secondary Component Name]

> *Repeat the pattern. Every major component gets its own numbered section.*

### 8.3 [Modal / Form Component] (`XX-mockup-file.html`)

**Form Fields:**

| Field | Type | Required | Details |
|-------|------|----------|---------|
| | | | |

**[Behavioral rules]:**

- ☐ ...

**Context-Aware Defaults:**

| Created from... | Pre-populated fields |
|-----------------|---------------------|
| | |

**Modal Actions:**

- ☐ Button labels, primary/secondary/tertiary designation

### 8.4 [Feature] in Other Contexts

> *How does this feature appear when embedded in other modules?*

**[Module Name]:**

- ☐ What appears, where, and how it behaves

> *Repeat for each module where this feature surfaces.*

### 8.5 [Complex Behavioral Feature — if applicable]

> *For features with complex trigger logic (like follow-up prompts), give them their own section with:*
> - Trigger conditions
> - UI description
> - Behavioral rules (in priority/evaluation order)
> - Context-specific variations

## 9. Affected Personas & Jobs-to-Be-Done

> *Reference the WOW OS PRD Agent Personas document. List every affected persona, then write JTBD flows for each.*

### Affected Personas

| Persona | Relevance | Primary Job |
|---------|-----------|-------------|
| e.g., Sales Consultant (Estimator) | Primary user | Create follow-up tasks from the field |
| e.g., Franchise Partner | Oversight | Review team task load and overdue items |
| e.g., Ops Manager | Daily management | Monitor task completion across team |
| e.g., Sales Centre | Peripheral | Create tasks when scheduling estimates |

> *Personas NOT affected by this feature: [list with brief reason, e.g., "Crew — no task interaction in v1"]*

### [Persona 1]: Jobs-to-Be-Done

**Job 1: [Short job title]**

**The Job:** When [situation], I want to [motivation], so I can [expected outcome].

**The Trigger:** [What just happened in their day that makes them reach for this feature?]

**The Flow:**
1. [First step — what they see, where they are]
2. [Next step — what they click or do]
3. [Decision point or branch if applicable]
4. [Resolution — what happens, what they see]
5. [Where they go next]

**Success Criteria:** [How does this persona know they succeeded? What does "done" feel like?]

**Pain Point Relief:** "[Exact quote from persona document's pain points list]"

---

**Job 2: [Short job title]**

> *Repeat the pattern. Write 2-4 JTBD flows per affected persona, focusing on the most important and frequent jobs.*

---

### [Persona 2]: Jobs-to-Be-Done

> *Repeat for each affected persona.*

---

### Persona Tradeoffs & Conflicts

> *Call out any cases where what's best for one persona creates friction for another. Describe the tradeoff and the design decision made.*

| Conflict | Persona A Wants | Persona B Wants | Resolution |
|----------|----------------|----------------|------------|
| e.g., Data capture depth | Marketing wants "how did you hear about us" on every task | Sales Centre wants minimal fields during a phone call | Field is optional, surfaced only in Tasks page creation (not call flow) |

## 10. Q&A

> *Pre-answer every question you can anticipate. Format as Q/A pairs. Cover: default behaviors, edge cases, integration behavior, permissions, configuration options.*

**Q: [Anticipated question]?**
A: [Definitive answer with enough detail to start building.]

## 11. Tracking Events

| Event | Trigger | Properties |
|-------|---------|------------|
| `event_name` | When this happens | `property_1`, `property_2`, ... |

## 12. Loading States

### [Component Name]

- ☐ What the user sees while data loads

> *Repeat for each major component.*

## 13. Empty States

### [Context — e.g., "No Tasks (First Time)"]

- ☐ Illustration/icon description
- ☐ Heading text
- ☐ Subtext
- ☐ CTA button/link

> *Repeat for: first-time use, no filter matches, no associated records on parent entity.*

## 14. Error States

### [Failure scenario — e.g., "API Failure — Page Load"]

- ☐ What the user sees
- ☐ Whether previous data is preserved
- ☐ Retry mechanism

> *Repeat for: page load failure, create/edit failure, inline action failure, partial load failure.*

## 15. Navigation Destinations

| Element | Destination |
|---------|-------------|
| [Clickable element] | [Where it goes] |

## 16. Confirmation Modals

### [Action Name]

- ☐ Title
- ☐ Warning icon / styling
- ☐ Message text (with variable interpolation: '[Name]')
- ☐ Conditional notes (e.g., recurring items)
- ☐ Button labels: "Cancel" (secondary), "[Action]" (danger/primary)

## 17. Modal Details

### [Modal Name]

**Dimensions:** [Width]px wide, max [X]vh height, scrollable body

**Field Ordering:**

1. [Field name] ([type], [width])
2. ...

**Footer:** [Button layout left to right]

## 18. Responsive Behavior

### Breakpoints

| Breakpoint | Behavior |
|------------|----------|
| Desktop (>1024px) | |
| Tablet (768–1024px) | |
| Mobile (<768px) | |

### Mobile Adaptations

- ☐ [Component] → [mobile behavior]
- ☐ ...

## 19. Accessibility Requirements

### Keyboard Navigation

- ☐ Tab order: [sequence]
- ☐ Arrow key behavior
- ☐ Enter/Space actions
- ☐ Escape behavior
- ☐ Focus trapping in modals

### Screen Reader Support

- ☐ [Element] announced as: "[text]"
- ☐ ...

### Visual Accessibility

- ☐ Color not sole indicator
- ☐ Minimum contrast ratio
- ☐ Focus indicators
- ☐ ...

### Touch Targets

- ☐ [Element]: minimum [X]px

## 20. Related Documents

- **[PRD Name]** — [Brief description of the relationship and dependency direction]
- ...

## 21. Future Considerations

### Phase 2 Enhancements

- **[Feature]** — Brief description
- ...

### Phase 3 Enhancements

- **[Feature]** — Brief description
- ...

## 22. Revision History

| Date | Author | Changes |
|------|--------|---------|
| | | |
