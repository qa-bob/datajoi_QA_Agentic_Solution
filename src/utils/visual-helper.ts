/**
 * src/utils/visual-helper.ts
 *
 * Helpers for visual regression testing: baseline capture and comparison.
 * Wraps Playwright's built-in screenshot comparison with sensible defaults.
 */

import * as fs from 'fs';
import * as path from 'path';
import { type Page, expect } from '@playwright/test';

// ── Viewport size constants ──────────────────────────────────────────────────

export const VIEWPORTS = {
  desktop: { width: 1280, height: 720 },
  mobile: { width: 390, height: 844 },
  tablet: { width: 768, height: 1024 },
} as const;

export type ViewportName = keyof typeof VIEWPORTS;

// ── Default comparison options ───────────────────────────────────────────────

export const DEFAULT_SNAPSHOT_OPTIONS = {
  maxDiffPixels: 500,
  animations: 'disabled',
  caret: 'hide',
} as const;

// ── Baseline capture ─────────────────────────────────────────────────────────

/**
 * Capture a baseline screenshot and save it to snapshotDir.
 * This is used when running `npm run baseline` to establish ground-truth images.
 *
 * @param page        - Playwright Page instance
 * @param name        - Logical name for this screenshot (used as filename)
 * @param snapshotDir - Absolute path to the snapshots directory
 */
export async function captureBaseline(
  page: Page,
  name: string,
  snapshotDir: string
): Promise<void> {
  await fs.promises.mkdir(snapshotDir, { recursive: true });

  const filePath = path.join(snapshotDir, `${name}.png`);
  await page.screenshot({
    path: filePath,
    fullPage: true,
    animations: 'disabled',
  });

  console.log(`[visual-helper] Baseline captured: ${filePath}`);
}

// ── Comparison ───────────────────────────────────────────────────────────────

/**
 * Compare the current page state against a previously captured baseline.
 * Uses Playwright's toHaveScreenshot() under the hood.
 *
 * @param page      - Playwright Page instance
 * @param name      - Name used to locate the baseline file
 * @param threshold - Maximum number of differing pixels (default: 500)
 * @returns true if comparison passes (within threshold)
 */
export async function compareWithBaseline(
  page: Page,
  name: string,
  threshold: number = DEFAULT_SNAPSHOT_OPTIONS.maxDiffPixels
): Promise<boolean> {
  try {
    await expect(page).toHaveScreenshot(`${name}.png`, {
      maxDiffPixels: threshold,
      animations: 'disabled',
      caret: 'hide',
      fullPage: true,
    });
    return true;
  } catch {
    return false;
  }
}

// ── Viewport helper ──────────────────────────────────────────────────────────

/**
 * Set the page viewport to one of the named breakpoints.
 */
export async function setViewport(page: Page, viewport: ViewportName): Promise<void> {
  await page.setViewportSize(VIEWPORTS[viewport]);
}

// ── Animation freeze ─────────────────────────────────────────────────────────

/**
 * Freeze all animations on the page before taking a visual snapshot.
 *
 * Playwright's `animations: 'disabled'` only blocks CSS animations declared
 * with @keyframes. Framer and other JS-driven frameworks animate via the Web
 * Animations API and requestAnimationFrame, which remain active between
 * consecutive Playwright screenshots and cause instability failures.
 *
 * This function:
 * 1. Injects CSS that stops all CSS animations/transitions cold.
 * 2. Calls `.finish()` on every running Web Animation to jump to its end state.
 * 3. Scrolls to the bottom so scroll-triggered entrance effects are complete.
 * 4. Returns to the top and waits for the paint to settle.
 */
export async function freezeAnimations(page: Page): Promise<void> {
  // Step 1: inject CSS to hard-stop all CSS animations and transitions
  await page.addStyleTag({
    content: `
      *, *::before, *::after {
        animation-duration: 0s !important;
        animation-delay: 0s !important;
        transition-duration: 0s !important;
        transition-delay: 0s !important;
      }
    `,
  });

  // Step 2: complete all running Web Animations (Framer's JS-driven transitions).
  // Note: Framer also uses rAF-based loops that survive this — those are handled
  // by raising maxDiffPixelRatio in the toHaveScreenshot options.
  await page.evaluate(() => {
    document.getAnimations().forEach((a) => {
      try { a.finish(); } catch { /* some animations don't support finish() */ }
    });
  });

  // Step 3: scroll to bottom to trigger all scroll-based entrance effects,
  // then return to top so the screenshot captures the full page from the start
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.evaluate(() => window.scrollTo(0, 0));

  // Step 4: brief pause for the final paint after the animation freeze
  await page.waitForTimeout(500);
}

// ── Cookie/banner dismissal ──────────────────────────────────────────────────

/**
 * Attempt to dismiss common cookie consent banners before capturing screenshots.
 * No-op if no banner is found.
 */
export async function dismissCookieBanner(page: Page): Promise<void> {
  const selectors = [
    'button[id*="cookie" i]',
    'button[class*="cookie" i]',
    'button[aria-label*="accept" i]',
    'button[aria-label*="agree" i]',
    '[data-testid*="cookie-accept"]',
    'button:has-text("Accept")',
    'button:has-text("Accept All")',
    'button:has-text("I Agree")',
    'button:has-text("Got it")',
  ];

  for (const selector of selectors) {
    try {
      const btn = page.locator(selector).first();
      if (await btn.isVisible({ timeout: 1_000 })) {
        await btn.click();
        await page.waitForTimeout(300);
        return;
      }
    } catch {
      // Not found — try next selector
    }
  }
}
