# Implementation Brief: [Flow Name]
## Generated from: [PRD filename] + [Design Spec filename]
## Date: [timestamp]
## Status: 🟢 Ready for Build

## 1. Technical Summary
[2-3 paragraphs: rendering strategy, data needs, most complex part, existing patterns reused]

## 2. Architecture Decisions

### Decision [n]: [Title]
**Context:** [Question] · **Decision:** [Choice + rationale]
**Options:** A: [approach] (pros/cons) · B: [approach] (pros/cons)
**Impact:** [What this means for Cody — files, patterns]

## 3. Data Model

### Entities
| Entity | Key Fields | Source | Notes |
|--------|-----------|--------|-------|

### Data Flow
[What's fetched on load, on interaction, mutated, cached]

### API Shape (Recommended)
```typescript
// GET /api/[resource]
interface ListResponse { data: Resource[]; meta: { total, page, pageSize, hasMore } }
// POST /api/[resource]
interface CreateRequest { ... }
```

## 4. Component Architecture

### Rendering Strategy
| Component/Page | Strategy | Rationale |
|---------------|----------|-----------|

### State Management
| State | Scope | Mechanism | Notes |
|-------|-------|-----------|-------|

### Shared Components to Reuse
| Component | Location | Usage |
|-----------|----------|-------|

## 5. Performance Considerations
| Risk | Scenario | Mitigation |
|------|----------|-----------|

## 6. Integration Points
### Upstream Dependencies
| Dependency | Need | Status |
|-----------|------|--------|

### Downstream Consumers
| Consumer | Need | Notes |
|----------|------|-------|

## 7. Risk Register
| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|

## 8. Cody Squad Guidance
- **Cody-UI:** [visual impl notes]
- **Cody-Logic:** [business logic notes]
- **Cody-Integration:** [API/caching notes]
- **Cody-Resilience:** [edge case/error notes]
- **Cody-A11y:** [complex a11y patterns]
- **Cody-Observability:** [key metrics/events]

## 9. Testing Guidance for Tess
[Async behavior, data loading patterns, timing considerations]
