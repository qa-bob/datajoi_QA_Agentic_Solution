# Contributing to Datajoi QA Agentic Solution

Thank you for contributing to this test suite. This guide covers everything you need to get up and running and the rules you must follow to keep the suite healthy.

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+
- Git

### Setup

```bash
git clone <repo-url>
cd datajoi_QA_Agentic_Solution
npm install
npx playwright install
```

### Verify your setup

```bash
npm run typecheck          # Must pass with zero errors
npm run test:smoke         # Must pass all 5 smoke tests
```

---

## Branching Strategy

| Branch type | Naming convention | Example |
|---|---|---|
| New tests | `feat/<area>-tests` | `feat/pricing-tests` |
| Fix broken selector | `fix/<page>-selector` | `fix/contact-form-selector` |
| Update baselines | `chore/update-baseline` | `chore/update-baseline` |
| Config change | `chore/<description>` | `chore/update-playwright-version` |

All branches must target `main`. Direct pushes to `main` are blocked.

---

## Workflow

1. **Create a branch** from the latest `main`
2. **Inspect the live site** before writing selectors (`WebFetch` or browser DevTools)
3. **Write/update the page object** in `src/pages/` before writing tests
4. **Write tests** that use the page object — not raw `page.locator()` calls
5. **Run the relevant test suite** locally to confirm pass
6. **Run TypeScript check:** `npm run typecheck`
7. **Open a pull request** using the PR template

---

## Code Rules

### Page Objects (`src/pages/`)

- Extend `BasePage` from `./base.page`
- Declare all locators as `readonly Locator` properties set in the constructor
- Methods represent user actions only (click, fill, navigate, scroll)
- **Never put `expect()` inside a page object method**
- Use role-based selectors (`getByRole`, `getByLabel`) over CSS class selectors when possible
- When using CSS, prefer `[class*="partial-name"]` to survive minor class name changes

### Tests (`tests/`)

- Import `{ test, expect }` from `@fixtures/site.fixture` — not from `@playwright/test`
- Tag every `test()` with at least one of: `@smoke`, `@navigation`, `@forms`, `@functional`, `@visual`, `@responsive`
- Never hardcode the base URL — use `baseURL` or `siteConfig.url`
- Never use `page.waitForTimeout()` — use `waitForSelector` or Playwright auto-waiting
- Never submit forms — test field validation only
- Never create accounts or log in

### TypeScript

- Strict mode is always on — no `any` without a comment explaining why
- Path aliases are configured in `tsconfig.json`: `@pages/*`, `@fixtures/*`, `@utils/*`, `@types/*`
- All page object properties must be typed

---

## Test Tagging Reference

| Tag | Purpose |
|---|---|
| `@smoke` | Fast availability checks — site loads, HTTPS, title, no console errors |
| `@navigation` | Nav links, routing, mobile menu, footer links |
| `@forms` | Form field validation, accessibility, character limits (no submission) |
| `@functional` | Business features: pricing plans, CTAs, content sections, accordions |
| `@visual` | `toHaveScreenshot()` regression against stored baselines |
| `@responsive` | Layout checks at 390px (mobile), 768px (tablet), 1280px (desktop) |

---

## Visual Regression

Visual tests compare against stored baselines in `__snapshots__/`. New baselines must be captured before visual tests can pass:

```bash
npm run baseline
```

**Before committing updated baselines:**
1. Open each updated screenshot and visually verify it looks correct
2. Only commit baselines that reflect intentional design changes — not regressions
3. Use the pull request description to explain what changed visually and why

---

## Pull Request Checklist

Before marking a PR ready for review:

- [ ] `npm run typecheck` passes with zero errors
- [ ] All new/modified tests pass locally
- [ ] No `page.waitForTimeout()` calls added
- [ ] No hardcoded URLs
- [ ] No form submissions
- [ ] Each new test has at least one tag
- [ ] Page object follows POM conventions (locators in constructor, no assertions in methods)
- [ ] PR description explains what was added/changed and why

---

## Reporting Issues

Use the GitHub Issue templates:
- **Bug Report** — for a broken test, stale selector, or false failure
- **Test Request** — to request coverage for a newly discovered feature

---

## Claude Code Shortcuts

If you use Claude Code in this repo, these slash commands accelerate common tasks:

| Command | What it does |
|---|---|
| `/analyze-site` | Inspect datajoi.com and refresh `site.config.json` |
| `/generate-full-suite` | Regenerate the full POM + test suite from scratch |
| `/run-smoke` | Run smoke tests and get a formatted summary |
| `/update-baseline` | Capture new visual baselines after a design change |
| `/generate-report` | Parse and display the full test results summary |
