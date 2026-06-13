---
name: Bug Report
about: Report a broken test, stale selector, or false failure in the test suite
title: "[BUG] "
labels: bug
assignees: ''
---

## Describe the Bug

A clear description of what is broken.

## Failing Test

- **File:** `tests/<category>/<file>.spec.ts`
- **Test name:** 
- **Tag:** `@smoke` / `@navigation` / `@forms` / `@functional` / `@visual` / `@responsive`

## Error Output

```
Paste the Playwright error message here
```

## Steps to Reproduce

1. Run `npm run test:<suite>`
2. Observe failure in `<test name>`

## Expected Behavior

What the test should do.

## Actual Behavior

What actually happens.

## Environment

- OS: 
- Node version: `node --version`
- Playwright version: `npx playwright --version`
- Branch:

## Possible Cause

Is this a stale selector? A site change? A timing issue? If you know, describe it here.

## Screenshots / Traces

Attach the Playwright trace file from `test-results/` if available.
