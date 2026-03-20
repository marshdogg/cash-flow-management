# WOW OS Agentic Development Pipeline

## What This Repo Contains
This is a multi-agent product development pipeline for WOW OS — a franchise management platform for WOW 1 DAY PAINTING. The pipeline uses 8 specialized AI agents orchestrated in a 13-phase sequence to go from draft PRD to deployed feature.

## Shared Context
**Always load first:** `docs/WOW_OS_CONTEXT_V2.md` — tech stack, modules, personas, terminology, coding conventions, configuration thresholds. Every agent needs this.

## Agent Specs
All agent specifications are in `/agents/`.

| Agent | File | Role |
|-------|------|------|
| Sally | `Orchestration_Sally_Agent_V3.md` | Pipeline orchestrator |
| PRD Paul | `PRD_Paul_Agent_V3.md` | PRD author |
| Edge Case Eddie | `EdgeCase_Eddie_Agent_V3.md` | QA analyst |
| Dora | `Designer_Dora_Agent_V2.md` | Designer |
| Ian | `Implementation_Agent_Ian_V2.md` | Architecture |
| Tess | `Testing_Tess_Agent_V3.md` | Testing |
| Cody Squad | `Coding_Cody_Agent_V2.md` | 6 coding sub-agents |
| Randy | `Retro_Randy_Agent_V2.md` | Retrospective |

## Pipeline (13 Phases)
Intake → PRD → Edge Cases → Paul/Eddie Loop → Design → Design Review → Architecture → Tests → Build → Test/Fix → Full E2E → Deploy → Retro

## Templates
Output templates are in `/templates/`. Load on demand per the Loading Guide.

## Reference Docs
- `docs/WOW_OS_CONTEXT_V2.md` — Shared context (load every invocation)
- `docs/WOW_OS_Personas_For_PRD_V2.md` — Full persona details
- `docs/LOADING_GUIDE_V2.md` — What to load when
- `reference/Tasks_Flow_PRD_V2-final.md` — Gold standard example PRD

## When Acting as an Agent
1. Load `docs/WOW_OS_CONTEXT_V2.md` first
2. Load the agent spec from `/agents/`
3. Load mode-specific templates from `/templates/` as needed
4. Consult `docs/LOADING_GUIDE_V2.md` for what else to load
5. Follow the spec exactly

## Key Rules
- Sequential phases only — never skip
- Test isolation: Cody never sees test source code
- Dual sign-off: Paul AND Eddie approve designs
- Never auto-merge — human approval required
- Technical escalations route to Ian before humans

## Design Context

### Users
- **Franchise Partners**: Individual WOW 1 DAY PAINTING franchise owners checking their own cash position, typically during their weekly ritual at a desk.
- **Franchise Operations Managers (FOMs)**: Overseeing multiple franchises, reviewing and comparing cash health across locations.
- Both are primary audiences with equal importance.

### Brand Personality
**Calm, trustworthy, composed** — like a reliable financial advisor. No drama, no flash. Confidence through clarity.
Three words: **Steady. Clear. Capable.**

### Aesthetic Direction
- Warm neutrals, natural greens (brand: #8BC34A), light backgrounds
- Light mode. Tan (#f7f6f3) and blue-gray (#f4f6f9) backgrounds
- Anti-reference: Generic SaaS dashboards — cookie-cutter card grids, interchangeable B2B tool aesthetic

### Design Principles
1. **Clarity over cleverness**: Every element communicates, not decorates
2. **Hierarchy through restraint**: Size, weight, and spacing guide the eye — not color splashes
3. **Consistency breeds trust**: Identical patterns for identical actions
4. **Calm density**: Useful information without overwhelm
5. **Earned color**: Color reserved for meaning — health status, categories, primary actions
