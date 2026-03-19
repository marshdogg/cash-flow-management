# WOW OS — Shared Agent Context

All agents share this context. Do NOT duplicate into individual specs.

## Business
WOW 1 DAY PAINTING — franchise-based residential/commercial painting company. WOW OS replaces Salesforce + PaintScout for franchise operations. Data is franchise-scoped; users see only their franchise's data.

## Tech Stack
Next.js 14 (App Router) · TypeScript (strict) · Tailwind CSS · shadcn/ui · Playwright (E2E) · SWR for client data · Server Components by default · CI/CD with manual merge gates

## Modules
Dashboard · Funnel · Customers · Projects · Calendar · Technicians · Customer Care · Settings · Online Booking Engine · Tasks

## Personas (quick ref)

| # | Persona | Type | Core Focus |
|---|---------|------|------------|
| 1 | Franchise Partner (FP) | External | P&L owner, single command center |
| 2 | Ops Manager | External | Day-to-day ops, exception management |
| 3 | Sales Consultant (Estimator) | External | Field sales, follow-up discipline |
| 4 | Project Manager (PM) | External | Bridge "sold" to "paid", on-time delivery |
| 5 | Crew (Painters) | External | Job execution, minimal system interaction |
| 6 | Operations (FOMs & VP Ops) | Internal | Franchise coaching, network health |
| 7 | Legal | Internal | Compliance, audit trails |
| 8 | Marketing | Internal | Lead gen, full-funnel attribution |
| 9 | Sales Centre | Internal | Inbound calls, lead capture, routing |
| 10 | Admin | Internal | System config, user management |

Full persona detail: see `WOW-OS-PRD-Agent-Personas.md`

## Pipeline (12 phases)
Intake → Paul (PRD) → Eddie (Edge Cases) → Paul⟷Eddie loop → Dora (Design) → Paul+Eddie design review → Ian (Architecture) → Tess (Tests) → Cody Squad (Build) → Test/Fix loop → Full E2E → Deploy → Randy (Retro)

## Terminology
- Franchise Partner, not franchisee
- Funnel, not pipeline
- Deal, not opportunity  
- Technician, not painter (in system)
- Estimator = Sales Consultant

## Coding Conventions

**File naming:** PascalCase components · camelCase hooks/utils · SCREAMING_SNAKE constants  
**Structure:** `/src/components/[feature]/` · `/src/hooks/` · `/src/lib/` · `/src/types/` · `/src/app/api/`  
**Patterns:** shadcn/ui extend-don't-replace · Tailwind only (no CSS modules) · Server Components default · Zod validation · date-fns for dates · cn() for conditional classes  
**i18n:** English + French Canadian

## Configuration Thresholds

| Parameter | Default |
|-----------|---------|
| MAX_PAUL_EDDIE_ITERATIONS | 3 |
| ESCALATE_PAUL_EDDIE_AFTER | 2 (same issue) |
| MAX_DESIGN_REVIEW_ITERATIONS | 3 |
| MAX_TEST_FIX_CYCLES | 5 |
| MAX_PER_TEST_RETRIES | 3 |
| ROUTE_TECH_TO_IAN | true |
| REQUIRE_DUAL_DESIGN_SIGNOFF | true |
| AUTO_MERGE | false (always) |
| REQUIRE_FULL_E2E | true (always) |
