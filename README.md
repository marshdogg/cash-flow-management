# WOW OS Agentic Development Pipeline

8 specialized AI agents orchestrated across 13 phases to take a feature from draft PRD to deployed code.

## Pipeline
Intake → PRD (Paul) → Edge Cases (Eddie) → Paul/Eddie Loop → Design (Dora) → Design Review → Architecture (Ian) → Tests (Tess) → Build (Cody Squad) → Test/Fix → Full E2E → Deploy → Retro (Randy)

## Usage with Claude Code
Clone this repo and run Claude Code from the root. It reads CLAUDE.md automatically.

## File Structure
- `agents/` — Agent specifications
- `templates/` — Output templates (load on demand)
- `docs/` — Shared context, personas, guides
- `reference/` — Example PRDs
