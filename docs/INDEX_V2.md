# WOW OS Agent Specs — Compressed v2

## Results

| Metric | Before | After | Change |
|--------|--------|-------|--------|
| Agent specs total | 4,941 lines | 785 lines | **-84%** |
| Per-agent average | 618 lines | 98 lines | **-84%** |
| Per-invocation context | ~618+ lines | ~160 lines (spec + shared) | **-74%** |
| Total system (all files) | 4,941 lines | 1,377 lines | **-72%** |

## Per-Agent Breakdown

| Agent | Before | After | Reduction |
|-------|--------|-------|-----------|
| Cody (Squad of 6) | 870 | 104 | -88% |
| Sally (Orchestrator) | 836 | 112 | -87% |
| Randy (Retro) | 734 | 98 | -87% |
| Tess (Testing) | 669 | 119 | -82% |
| Ian (Architecture) | 666 | 91 | -86% |
| Dora (Design) | 575 | 84 | -85% |
| Paul (PRD) | 333 | 96 | -71% |
| Eddie (Edge Cases) | 258 | 81 | -69% |

## File Structure

```
├── WOW-OS-CONTEXT.md              # Shared context (60 lines) — loaded every invocation
├── Orchestration_Sally_Agent_V2.md # 112 lines (was 836)
├── PRD_Paul_Agent_V2.md           # 96 lines (was 333)
├── EdgeCase_Eddie_Agent_V2.md     # 81 lines (was 258)
├── Designer_Dora_Agent_V1.md      # 84 lines (was 575)
├── Implementation_Agent_Ian_V1.md # 91 lines (was 666)
├── Testing_Tess_Agent_V2.md       # 119 lines (was 669)
├── Coding_Cody_Agent_V1.md        # 104 lines (was 870)
├── Retro_Randy_Agent_V1.md        # 98 lines (was 734)
├── templates/                     # Load on demand (491 lines total)
│   ├── sally-build-cycle-status.md
│   ├── sally-intervention-log.md
│   ├── randy-retro-report.md
│   ├── randy-prompt-audit-log.md
│   ├── randy-improvement-backlog.md
│   ├── tess-testing-report.md
│   ├── dora-design-spec.md
│   ├── dora-design-decision-log.md
│   ├── ian-implementation-brief.md
│   ├── ian-technical-decision.md
│   ├── cody-handoff-report.md
│   └── cody-escalation-report.md
└── reference/
    └── LOADING-GUIDE.md           # When to load which docs
```

## What Was Cut (and where it went)

| Category | Lines Removed | Destination |
|----------|--------------|-------------|
| Embedded templates | ~1,200 | `/templates/` directory (load on demand) |
| Justification prose ("Why This Exists") | ~900 | Stripped — human docs only, not agent config |
| ASCII art diagrams | ~400 | Replaced with 1-line semantic equivalents |
| Extended examples | ~600 | Stripped — one minimal example per mode if needed |
| Duplicated context | ~500 | `WOW-OS-CONTEXT.md` (single source of truth) |
| Over-specified procedures | ~550 | Compressed to semantic shorthand LLMs already understand |

## What Survived (must-keep content)

1. **Hard boundaries** — "NEVER read /tests/", "NEVER auto-merge", "NEVER make scope decisions"
2. **Pipeline-specific conventions** — Red-green contract, franchise data isolation, test isolation boundary, dual Paul+Eddie sign-off
3. **Disambiguation choices** — Server Components default, shadcn extend-don't-replace, cn() for conditional classes, date-fns, Zod, SWR
4. **Decision authority matrices** — Ian decides (technical) vs human decides (product/scope)
5. **Escalation routing** — Who goes to whom, when, with what thresholds

## How to Use

**Per invocation, load:**
1. The agent's compressed spec (~80-120 lines)
2. `WOW-OS-CONTEXT.md` (60 lines)
3. Mode-specific template(s) if entering a mode (20-70 lines each)
4. The actual work artifacts (PRDs, code, test results, etc.)

**Total instructional overhead: ~160-250 lines** vs. previous 618+ lines average.

See `reference/LOADING-GUIDE.md` for the full load-on-demand matrix.
