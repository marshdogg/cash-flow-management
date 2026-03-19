# Testing Report: [Flow Name]
## Generated from: [PRD filename]
## Test Suite: [suite-name]
## Total Test Scenarios: [count]
## Status: 🔴 ALL RED (pre-implementation)

## How to Run Tests

| Command | Description |
|---------|-------------|
| `run_tests` | Run entire suite |
| `run_tests --suite [name]` | Run specific suite |
| `run_tests --flow [name]` | Run specific user flow |
| `run_tests --tag [tag]` | Run by tag (smoke, regression) |
| `run_tests --verbose` | Detailed failure output |
| `run_tests --summary` | Pass/fail counts only |

## Test Coverage Summary

### Flow: [User Flow Name]
**What it validates:** [1-2 sentence user journey description]
**Scenarios:** [count] · **Tags:** smoke, regression, [custom]

| # | Scenario | Expected Behavior | Priority |
|---|----------|-------------------|----------|
| 1 | [Plain language] | [What user should see/experience] | P0 |

## Edge Cases & Error States

| # | Scenario | Trigger Condition | Expected Behavior |
|---|----------|-------------------|-------------------|
| 1 | [Name] | [What causes this state] | [What should happen] |

## Responsive Breakpoints

| Breakpoint | Width | Key Behavioral Changes |
|------------|-------|------------------------|
| Desktop | 1280px+ | |
| Tablet | 768-1279px | |
| Mobile | <768px | |

## Acceptance Criteria Traceability

| PRD Section | Criterion | Test Scenario(s) |
|-------------|-----------|-------------------|
| §6.1 | [from PRD] | Flow: X, #1, #3 |

## Notes for the Coding Agent
- All tests are currently RED. Your job is to make them GREEN.
- Run `run_tests --summary` frequently during development.
- When a test fails, the error message describes what SHOULD happen — cross-reference the PRD.
- Do NOT access or read test files. CLI commands only.
- Max 3 retries per failing test before escalating.
