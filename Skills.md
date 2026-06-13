# Skills Reference

Available Claude Code slash commands and skills for this repository.

Invoke any skill by typing `/<name>` in a Claude Code session, or ask Claude to use it by description.

---

## /generate-full-suite

**Location:** `.claude/commands/generate-full-suite.md`
**When to use:** Bootstrapping the test suite from scratch, or after a major site redesign.

Analyzes the live site at the URL in `site.config.json`, then generates:
- Page Object Model classes in `src/pages/`
- Fixture registrations in `src/fixtures/site.fixture.ts`
- Full test suites across all categories (`@smoke`, `@navigation`, `@forms`, `@functional`, `@visual`, `@responsive`)
- Updated `site.config.json` with discovered nav items, description, and industry

**Steps performed:**
1. Reads `site.config.json`
2. Uses `WebFetch` to crawl the homepage and linked pages
3. Plans one page class per discovered page
4. Writes all page object classes with real selectors
5. Writes all test spec files
6. Runs `npx tsc --noEmit` to verify TypeScript
7. Reports a summary of what was built

---

## /analyze-site

**Location:** `.claude/commands/analyze-site.md`
**When to use:** Onboarding a new site, verifying config accuracy after a redesign.

Crawls the live site and produces a fully-populated `site.config.json`. Reports:
- Discovered nav items and their URLs
- Presence of contact form
- Page description and inferred industry
- Issues found (missing meta description, broken links, no `<h1>`, etc.)
- Confidence rating (High / Medium / Low)

**Usage:**
```
/analyze-site
/analyze-site https://www.datajoi.com
```

---

## /run-smoke

**Location:** `.claude/commands/run-smoke.md`
**When to use:** Quick health check after deploying changes or before running the full suite.

Runs `npm run test:smoke`, then displays a formatted pass/fail table. For each failure, shows the error message and a suggested fix.

**Output:**
```
Site: Datajoi (https://www.datajoi.com)
Run: 2026-06-13 10:00:00   Duration: 8.2s

+---------------------------------------------+--------+----------+
| Test                                        | Status | Duration |
+---------------------------------------------+--------+----------+
| site homepage loads successfully            | PASS   | 1.1s     |
| page loads within acceptable time           | PASS   | 3.2s     |
| no critical JavaScript errors on load       | PASS   | 2.4s     |
| site is served over HTTPS                   | PASS   | 0.1s     |
| page has a title and meta description       | PASS   | 0.8s     |
+---------------------------------------------+--------+----------+
Total: 5   Passed: 5   Failed: 0
```

---

## /update-baseline

**Location:** `.claude/commands/update-baseline.md`
**When to use:** After an intentional visual design change has been deployed and verified.

Runs `npm run baseline` (Playwright's `--update-snapshots` flag), lists all updated screenshot files, and reminds you to review images before committing.

**When NOT to use:** Do not run this to silence visual test failures caused by regressions — investigate and fix those instead.

---

## /generate-report

**Location:** `.claude/commands/generate-report.md`
**When to use:** After a full test run, to get a human-readable summary.

Parses `test-results/results.json`, displays a per-suite breakdown, lists all failures with error messages and suggested fixes, and identifies flaky tests.

---

## Subagents

The following Claude Code subagents are registered in `.claude/agents/` and are invoked automatically when Claude needs their capabilities:

| Agent | When Claude uses it |
|---|---|
| `site-analyzer` | Crawling the live site, discovering pages, populating `site.config.json` |
| `test-generator` | Generating site-specific Playwright tests beyond the shared suite |
| `test-runner` | Executing test commands and interpreting results |

---

## Adding a New Skill

1. Create `.claude/commands/<skill-name>.md`
2. Start the file with a `---` YAML frontmatter block:
   ```yaml
   ---
   description: One-line description of when Claude should auto-invoke this skill.
   ---
   ```
3. Write the instructions Claude should follow when the skill runs
4. Add an entry to this `Skills.md` file
5. Add an entry to the `CLAUDE.md` slash commands table
