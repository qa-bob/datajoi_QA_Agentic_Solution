# GitHub Copilot Instructions

Context for GitHub Copilot and other AI coding assistants working in this repository.

---

## Repository

Playwright + TypeScript regression test suite for **[datajoi.com](https://www.datajoi.com)** — a data analytics infrastructure platform. Uses the **Page Object Model (POM)** design pattern with **TypeScript strict mode**.

---

## Architecture

### Page Object Model

- All element locators live in **page object classes** in `src/pages/`
- Page objects extend `BasePage` (`src/pages/base.page.ts`)
- Constructors accept `(page: Page, config: SiteConfig)` and call `super(page, config)`
- Locators are `readonly Locator` properties set in the constructor body
- Methods represent user actions — **never put `expect()` in a page object**

### Tests

- All test files import `{ test, expect }` from `@fixtures/site.fixture` — not `@playwright/test`
- Every test must include at least one tag: `@smoke`, `@navigation`, `@forms`, `@functional`, `@visual`, or `@responsive`
- `baseURL` is read from `playwright.config.ts`, which reads from `site.config.json` — never hardcode it

### TypeScript Path Aliases

```typescript
import { BasePage } from '@pages/base.page';
import { SiteConfig, loadSiteConfig } from '@app-types/site-config.types';
import { test, expect } from '@fixtures/site.fixture';
import { checkLinks } from '@utils/link-checker';
```

---

## Code Generation Rules

When Copilot suggests code in this repository:

1. **`page.waitForTimeout()`** — never suggest this. Use `waitForSelector`, `waitForLoadState`, or Playwright auto-waiting.
2. **Hardcoded URLs** — never suggest `await page.goto('https://...')`. Use `baseURL` or `siteConfig.url`.
3. **`expect()` in page objects** — never suggest assertions inside `src/pages/` files.
4. **Form submission** — never suggest clicking a submit button or calling `.submit()` on a form.
5. **`any` type** — avoid unless there is no typed alternative.
6. **Raw locators in tests** — suggest `homePage.ctaButton` (page object property) not `page.locator('.cta-btn')` in test bodies.

---

## File Patterns

| Pattern | Purpose |
|---|---|
| `src/pages/*.page.ts` | Page object classes |
| `src/fixtures/site.fixture.ts` | Custom test fixtures — edit to add new page objects |
| `tests/**/*.spec.ts` | Test files |
| `site.config.json` | Target URL and feature flags |
| `playwright.config.ts` | Playwright project configuration |

---

## npm Scripts

```bash
npm test                 # All tests
npm run test:smoke       # @smoke tag
npm run typecheck        # TypeScript check — run before PR
npm run baseline         # Update visual regression baselines
```

---

## Non-Negotiable Constraints

- Do not submit forms
- Do not create accounts or enter credentials
- Do not hardcode `https://www.datajoi.com` in code
- Do not add assertions inside page object methods
- Do not use `page.waitForTimeout()`
