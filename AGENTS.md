# AGENTS.md — AI Coding Agent Context

This file provides structured context for AI coding assistants (GitHub Copilot, Claude, GPT, Cursor, etc.) working in this repository.

> Claude Code users: this file is imported by `CLAUDE.md`. You do not need to read it separately — it loads automatically.

---

## Repository Purpose

Automated Playwright + TypeScript test suite for **[datajoi.com](https://www.datajoi.com)** — a data analytics infrastructure platform. Tests cover GUI, functional, and regression scenarios using the **Page Object Model (POM)** design pattern and **Object-Oriented Programming (OOP)** principles.

**Primary constraint:** Tests must never submit forms, create accounts, or log in (unless `auth.required: true` in `site.config.json`).

---

## Key Files Every Agent Should Know

| File | Role |
|---|---|
| `site.config.json` | Source of truth for target URL, feature flags, viewport list |
| `playwright.config.ts` | Playwright projects (desktop, mobile, tablet) and `baseURL` |
| `src/pages/base.page.ts` | `BasePage` — all page objects extend this class |
| `src/fixtures/site.fixture.ts` | Custom Playwright fixtures; all tests import from here |
| `src/types/site-config.types.ts` | TypeScript types for `SiteConfig` |
| `tsconfig.json` | Path aliases: `@pages/*`, `@fixtures/*`, `@utils/*`, `@types/*` |

---

## Architecture

### Page Object Model

```
BasePage
 ├── extends: all page objects
 ├── properties: page (Page), config (SiteConfig), url (string)
 └── methods: navigate(), waitForLoad(), getTitle(), isResponsive(), takeScreenshot()

Each page object:
 ├── location: src/pages/<name>.page.ts
 ├── extends: BasePage
 ├── locators: readonly Locator properties (set in constructor)
 └── methods: user actions only (click, fill, open, scroll)
              — NO expect() calls inside page objects
```

### Test Structure

```
tests/
  smoke/        → @smoke  — site loads, title, HTTPS, no console errors
  navigation/   → @navigation — nav links, routing, mobile menu
  forms/        → @forms  — field validation only, no submission
  functional/   → @functional — business features (pricing, CTA, content)
  visual/       → @visual — toHaveScreenshot() regression
  responsive/   → @responsive — layout at 390px / 768px / 1280px
```

All test files import from `@fixtures/site.fixture`, not from `@playwright/test` directly.

---

## TypeScript Path Aliases

```typescript
import { BasePage } from '@pages/base.page';
import { SiteConfig } from '@app-types/site-config.types';
import { test, expect } from '@fixtures/site.fixture';
import { checkLinks } from '@utils/link-checker';
```

---

## Critical Rules for Code Generation

1. **Never call `page.waitForTimeout()`** — use `waitForSelector`, `waitForLoadState`, or Playwright auto-waiting
2. **Never hardcode the base URL** — use `baseURL` from Playwright config (sourced from `site.config.json`)
3. **Never put `expect()` inside page objects** — assertions belong in test files
4. **Never use `any` type** without an explicit comment
5. **Never submit forms** — test interactions and validation only
6. **Always tag tests** — every `test()` call must include at least one `@smoke`, `@navigation`, `@forms`, `@functional`, `@visual`, or `@responsive` tag
7. **Run `npx tsc --noEmit`** after generating code — verify TypeScript compiles cleanly

---

## Adding a New Page

When a new page is discovered on the site:

1. Create `src/pages/<name>.page.ts` extending `BasePage`
2. Add the fixture to `src/fixtures/site.fixture.ts`
3. Write tests in `tests/<category>/<feature>.spec.ts`
4. Use real selectors from the live HTML — not generic placeholders

### Template

```typescript
import { type Locator } from '@playwright/test';
import { BasePage } from '@pages/base.page';

export class ExamplePage extends BasePage {
  readonly heading: Locator;
  readonly ctaButton: Locator;

  constructor(page: import('@playwright/test').Page, config: import('@app-types/site-config.types').SiteConfig) {
    super(page, config);
    this.heading = page.locator('h1').first();
    this.ctaButton = page.getByRole('link', { name: /get started/i }).first();
  }

  async clickCta(): Promise<void> {
    await this.ctaButton.click();
  }
}
```

---

## Available Slash Commands (Claude Code)

| Command | When to invoke |
|---|---|
| `/generate-full-suite` | Bootstrap full POM + tests from live site analysis |
| `/analyze-site` | Inspect live site, update `site.config.json` |
| `/run-smoke` | Run `@smoke` suite and summarize results |
| `/update-baseline` | Refresh visual regression baselines |
| `/generate-report` | Parse and display test results summary |

---

## Environment Variables

| Variable | Purpose |
|---|---|
| `SITE_URL` | Override target URL without editing `site.config.json` |
| `CI` | Set to `1` in CI; enables `forbidOnly`, `retries: 1`, `workers: 2` |

---

## npm Scripts

```bash
npm test                   # All tests
npm run test:smoke         # @smoke only
npm run test:navigation    # @navigation only
npm run test:forms         # @forms only
npm run test:visual        # @visual only
npm run test:responsive    # @responsive only
npm run baseline           # Update visual baselines
npm run typecheck          # TypeScript check (run before PR)
npm run lint               # ESLint
npm run report             # Open Playwright HTML report
```
