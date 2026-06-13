---
paths:
  - "tests/**/*.spec.ts"
  - "tests/**/*.test.ts"
---

# Playwright Test Rules

- Import `{ test, expect }` from `@fixtures/site.fixture`, never from `@playwright/test` directly
- Tag every `test()` with at least one of: `@smoke`, `@navigation`, `@forms`, `@functional`, `@visual`, `@responsive`
- Never use `page.waitForTimeout()` — use `waitForSelector`, `waitForLoadState`, or Playwright's built-in auto-waiting
- Never hardcode URLs — use `baseURL` from the Playwright config (sourced from `site.config.json`) or `siteConfig.url` from the fixture
- Never submit forms — interact with fields and validate only
- Never create accounts, log in, or enter real credentials
- Keep each test independent — no shared mutable state between tests
- `test.describe` blocks should be named `'<FeatureName> @<tag>'` to make grep filtering work
- Use `test.beforeEach` for shared navigation setup within a describe block
- Add `{ timeout: 10_000 }` to `expect()` calls that wait for network-driven content
