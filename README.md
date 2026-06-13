# Datajoi QA Agentic Solution

Playwright + TypeScript regression test suite for [datajoi.com](https://www.datajoi.com), built with the **Page Object Model (POM)** design pattern and **Object-Oriented Programming (OOP)** principles. Structured for agentic execution by Claude Code.

---

## Purpose

This repository contains a fully automated GUI, functional, and regression test suite that covers every discoverable feature of the Datajoi website — without requiring account creation, login, or form submission.

| Coverage Area | Description |
|---|---|
| Smoke | Site reachability, HTTPS, page title, console errors |
| Navigation | Nav links, routing, mobile menu, footer |
| Forms | Field validation, accessibility (no submission) |
| Functional | Business features: CTAs, pricing, content sections |
| Visual | Screenshot regression across viewports |
| Responsive | Layout at mobile (390px), tablet (768px), desktop (1280px) |

---

## Architecture

### Page Object Model (POM)

Every page or major section maps to a TypeScript class in `src/pages/`. Tests never use raw `page.locator()` calls — all selectors live inside page objects.

```
BasePage (src/pages/base.page.ts)
 ├── HomePage          (home.page.ts)
 ├── NavigationPage    (navigation.page.ts)
 ├── ContactFormPage   (contact.page.ts)
 └── <DiscoveredPage>  (<name>.page.ts)
```

### OOP Conventions

- Page classes **extend** `BasePage`
- Locators are `readonly Locator` properties defined in the constructor
- Methods represent **user actions** (navigate, click, fill) — never assertions
- `expect()` calls belong in test files only

### Custom Fixtures

`src/fixtures/site.fixture.ts` extends Playwright's `test` object to inject page objects and the loaded `SiteConfig`. All test files import `{ test, expect }` from this fixture, not from `@playwright/test` directly.

---

## Setup

### Prerequisites

- Node.js 18 or higher
- npm 9 or higher
- Git

### Installation

```bash
# 1. Clone the repository
git clone <repo-url>
cd datajoi_QA_Agentic_Solution

# 2. Install dependencies
npm install

# 3. Install Playwright browsers
npx playwright install

# 4. (Optional) Copy environment file
cp .env.example .env
```

### Configuration

Site target is controlled by `site.config.json` in the project root:

```json
{
  "name": "Datajoi",
  "url": "https://www.datajoi.com",
  "hasContactForm": true,
  "viewports": ["desktop", "mobile", "tablet"],
  "skipVisual": false,
  "skipForms": false
}
```

Override the target URL at runtime without editing the config:

```bash
SITE_URL=https://staging.datajoi.com npm test
```

---

## Running Tests

```bash
# All tests
npm test

# By category
npm run test:smoke          # @smoke — fast availability checks
npm run test:navigation     # @navigation — links and routing
npm run test:forms          # @forms — form validation
npm run test:visual         # @visual — screenshot regression
npm run test:responsive     # @responsive — viewport layouts

# Interactive UI mode
npm run test:headed

# Update visual baselines after intentional design changes
npm run baseline

# View HTML report
npm run report

# Type check (run before every PR)
npm run typecheck

# Lint
npm run lint
```

### CI

Tests run automatically on every push and pull request via GitHub Actions (`.github/workflows/playwright.yml`). The full matrix runs against Chromium desktop, mobile Chrome, and tablet viewports.

---

## Project Structure

```
datajoi_QA_Agentic_Solution/
├── site.config.json          # Target site URL and feature flags
├── playwright.config.ts      # Playwright projects (desktop/mobile/tablet)
├── global-setup.ts           # Pre-run reachability check
├── CLAUDE.md                 # Claude Code project instructions
├── AGENTS.md                 # AI coding agent context (imported by CLAUDE.md)
├── Skills.md                 # Available slash commands / skills reference
│
├── src/
│   ├── pages/
│   │   ├── base.page.ts      # BasePage — shared navigation and utilities
│   │   ├── home.page.ts      # HomePage
│   │   ├── navigation.page.ts
│   │   ├── contact.page.ts
│   │   └── *.page.ts         # One class per discovered page
│   ├── fixtures/
│   │   └── site.fixture.ts   # Custom test + page object fixtures
│   ├── utils/
│   │   ├── link-checker.ts   # HTTP link validation helper
│   │   └── visual-helper.ts  # Screenshot comparison utilities
│   └── types/
│       └── site-config.types.ts
│
├── tests/
│   ├── smoke/                # @smoke — reachability and load tests
│   ├── navigation/           # @navigation — links, routing, menus
│   ├── forms/                # @forms — field validation (no submission)
│   ├── functional/           # @functional — business logic tests
│   ├── visual/               # @visual — screenshot regression
│   └── responsive/           # @responsive — viewport layout checks
│
├── .claude/
│   ├── agents/               # Claude Code subagent definitions
│   ├── commands/             # Slash commands (/analyze-site, /run-smoke, etc.)
│   ├── rules/                # Path-scoped coding rules
│   ├── settings.json         # Claude Code project permissions
│   └── hooks/                # Pre/post-run shell hooks
│
├── .github/
│   ├── workflows/            # GitHub Actions CI pipelines
│   ├── ISSUE_TEMPLATE/       # Bug report and test request templates
│   ├── PULL_REQUEST_TEMPLATE.md
│   ├── CONTRIBUTING.md       # Contributor guide
│   └── copilot-instructions.md
│
└── __snapshots__/            # Visual regression baselines (gitignored by default)
```

---

## Claude Code Slash Commands

These skills are available when working with Claude Code in this repository:

| Command | Description |
|---|---|
| `/generate-full-suite` | Analyze datajoi.com and generate complete POM + test suite |
| `/analyze-site` | Inspect live site structure and update `site.config.json` |
| `/run-smoke` | Run `@smoke` tests and display a formatted pass/fail summary |
| `/update-baseline` | Capture new visual regression baselines after design changes |
| `/generate-report` | Parse results and display a structured test summary |

See `Skills.md` for full descriptions and usage.

---

## Contributor Rules

### Branching

- Branch from `main`
- Use descriptive branch names: `feat/pricing-tests`, `fix/contact-form-selector`, `chore/update-baseline`
- Open a pull request against `main` using the PR template in `.github/PULL_REQUEST_TEMPLATE.md`

### Writing Tests

1. Read `site.config.json` for the URL and feature flags
2. Use `WebFetch` (or inspect the live site) before writing selectors
3. Write real selectors based on actual HTML — no generic placeholders
4. Create or update the page object class in `src/pages/` first
5. Write tests that use page objects — no raw `page.locator()` in test bodies
6. Tag every test with at least one of: `@smoke`, `@navigation`, `@forms`, `@functional`, `@visual`, `@responsive`
7. Run `npm run typecheck` before opening a PR

### Absolute Rules (never violate)

- **Never submit a form** — test field interactions and validation only
- **Never create accounts or log in** (unless `auth.required: true` in config)
- **Never hardcode the base URL** — use `baseURL` from Playwright config
- **Never put `expect()` inside a page object method**
- **Never use `page.waitForTimeout()`** — use `waitForSelector` or Playwright auto-waiting
- **Never use `any` type** without an explicit comment justifying it

### Code Style

- TypeScript strict mode is always enabled
- All page object properties must be typed as `readonly Locator`
- Use `async/await` throughout — no `.then()` chains
- Keep test descriptions human-readable: `'pricing page shows three plan tiers'`

---

## Reporting Issues

Use the GitHub Issue templates in `.github/ISSUE_TEMPLATE/`:
- **Bug Report** — for broken tests or selector failures
- **Test Request** — to request new test coverage for a feature

---

## Tech Stack

| Tool | Version | Purpose |
|---|---|---|
| [Playwright](https://playwright.dev/) | ^1.44 | Browser automation |
| TypeScript | ^5.4 | Strongly typed test code |
| Node.js | 18+ | Runtime |
| GitHub Actions | — | CI/CD |
| Claude Code | latest | Agentic test generation and maintenance |
