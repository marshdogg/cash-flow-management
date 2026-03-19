# WOW OS — Reference Doc Loading Guide

Agent specs are lean by design. Additional context loads on demand — NOT on every invocation.

## Always Loaded (Every Agent Invocation)
- The agent's own spec (~100-200 lines)
- `WOW-OS-CONTEXT.md` (~80 lines)

## Load When Entering a Mode

| Agent + Mode | Load These |
|-------------|-----------|
| Paul: CREATE | `WOW-OS-PRD-Agent-Personas.md` · `PRD_Paul_Template-v2.md` · `Tasks-Flow-PRD-v2-final.md` (reference) |
| Paul: REVIEW | `WOW-OS-PRD-Agent-Personas.md` · The PRD under review |
| Paul: CROSS-REFERENCE | `WOW-OS-PRD-Index.md` · All PRDs being compared |
| Eddie: ANALYZE | `WOW-OS-PRD-Agent-Personas.md` · `Edge-Case-Report-Template.md` · The PRD |
| Eddie: VALIDATE | The updated PRD · Previous Edge Case Report |
| Dora: DESIGN | `templates/dora-design-spec.md` · `templates/dora-design-decision-log.md` · Design system files · Existing prototypes |
| Dora: REVISE | Previous Design Spec + feedback |
| Ian: ARCHITECTURE REVIEW | `templates/ian-implementation-brief.md` · Codebase access |
| Ian: ESCALATION | `templates/ian-technical-decision.md` · Relevant code files |
| Tess: GENERATE | `templates/tess-testing-report.md` · PRD + Design Spec + Prototypes + Implementation Brief |
| Cody-*: BUILD | `templates/cody-handoff-report.md` · PRD + Design Spec + Testing Report + Implementation Brief · Previous Cody's handoff |
| Cody (final): ESCALATION | `templates/cody-escalation-report.md` |
| Randy: FULL RETRO | `templates/randy-retro-report.md` · `templates/randy-prompt-audit-log.md` · `templates/randy-improvement-backlog.md` · All cycle artifacts |
| Sally: ORCHESTRATE | `templates/sally-build-cycle-status.md` · `templates/sally-intervention-log.md` |

## Never Loaded Into Agent Context
- Other agents' specs (agents don't need to read each other's instructions)
- Architecture rationale / design docs explaining "why" the pipeline exists
- Full flow specification PDF (Sally knows the pipeline; agents know their role)
- Previous examples/walkthroughs (agents learn from their spec, not examples)

## Principle
Each invocation should carry ≤500 lines of instructional context:
- Agent spec: ~100-200 lines
- Shared context: ~80 lines
- Mode-specific templates: ~50-100 lines
- Total instructional overhead: ~230-380 lines

The remaining context window is for the ACTUAL WORK: PRDs, design specs, code, test results, etc.
