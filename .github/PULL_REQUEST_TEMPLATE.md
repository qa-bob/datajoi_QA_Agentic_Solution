## Summary

<!-- Describe what this PR adds, changes, or fixes in 2-3 bullet points -->

- 
- 

## Type of Change

- [ ] New page object (`src/pages/*.page.ts`)
- [ ] New tests (`tests/**/*.spec.ts`)
- [ ] Updated tests / selectors (selector maintenance)
- [ ] Visual baseline update (`__snapshots__/`)
- [ ] Config change (`site.config.json`, `playwright.config.ts`)
- [ ] Infrastructure / CI change
- [ ] Documentation

## Test Coverage

<!-- List the tests added or modified -->

| File | Tests Added | Tags |
|---|---|---|
| `tests/...` | | `@` |

## How to Verify

<!-- Steps a reviewer can follow to confirm this works -->

1. `npm run typecheck` — should pass with zero errors
2. `npm run test:<suite>` — should pass
3. 

## Pre-Merge Checklist

- [ ] `npm run typecheck` passes
- [ ] All new/modified tests pass locally
- [ ] No `page.waitForTimeout()` calls
- [ ] No hardcoded URLs
- [ ] No form submissions in test code
- [ ] Every new `test()` has at least one tag
- [ ] Page object locators are in the constructor, not in test bodies
- [ ] Visual baselines reviewed (if updated)

## Screenshots / Traces

<!-- Attach playwright-report or screenshots if helpful -->
