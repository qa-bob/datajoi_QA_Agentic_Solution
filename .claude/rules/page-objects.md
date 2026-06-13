---
paths:
  - "src/pages/**/*.ts"
---

# Page Object Rules

- Every page class must extend `BasePage` from `./base.page`
- Import `{ type Page, type Locator }` from `@playwright/test`
- Import `type { SiteConfig }` from `@app-types/site-config.types`
- Declare all element locators as `readonly Locator` properties
- Set locators in the constructor — not in methods
- Constructors must call `super(page, config)` as the first statement
- Methods represent user actions only (navigate, click, fill, open, scroll, type)
- Never put `expect()` assertions inside page object methods
- Never return raw `ElementHandle` — always return `Locator` or typed values
- Prefer role-based and text-based selectors over CSS class selectors when possible
- When CSS class selectors are needed, use `[class*="partial-name"]` to survive design changes
- Never call `page.waitForTimeout()` — use `waitForSelector` or rely on Playwright auto-waiting
