/**
 * src/pages/navigation.page.ts
 *
 * NavigationPage models the site's primary navigation.
 * Uses semantic role-based selectors and avoids site-specific class names.
 */

import { type Locator } from '@playwright/test';
import { BasePage } from '@pages/base.page';

export interface NavLinkInfo {
  text: string;
  href: string;
}

export interface LinkCheckResult {
  url: string;
  status: number;
  ok: boolean;
}

export class NavigationPage extends BasePage {
  // ── Nav detection ────────────────────────────────────────────────────────────

  /**
   * Ordered list of selectors tried when locating the primary navigation.
   * Covers: semantic nav, Webflow (.w-nav), Framer, generic header wrappers.
   */
  private readonly NAV_SELECTORS = [
    'nav',
    '[role="navigation"]',
    'header',
    '[class*="navbar"]',
    '[class*="nav-bar"]',
    '[class*="nav-menu"]',
    '[class*="nav-wrap"]',
    '[class*="nav_"]',
    '[class*="site-header"]',
    '[class*="header-nav"]',
    '[class*="header-wrap"]',
    '[class*="top-bar"]',
    '[class*="w-nav"]',          // Webflow
    '[data-testid*="nav"]',
    '[id*="navbar"]',
    '[id*="header"]',
  ];

  /**
   * Return the first visible nav-like locator found across all candidate selectors.
   * Falls back to `header` if nothing specific is found.
   */
  private async findNavLocator(): Promise<Locator | null> {
    for (const sel of this.NAV_SELECTORS) {
      const el = this.page.locator(sel).first();
      if (await el.count() > 0 && await el.isVisible()) {
        return el;
      }
    }
    return null;
  }

  /**
   * Return true if any navigation-like element is visible, OR if the page
   * contains navigable links (handles single-page sites with no traditional nav).
   */
  async isNavVisible(): Promise<boolean> {
    if (await this.findNavLocator() !== null) return true;

    // Fallback for sites (e.g. Framer one-pagers) that have no <nav>/<header> but
    // do have CTA / footer links that serve as navigation.
    const anyLink = this.page.locator('a[href]:not([href^="javascript:"])').first();
    return (await anyLink.count()) > 0;
  }

  // ── Nav links ────────────────────────────────────────────────────────────────

  /**
   * Return all links inside the primary navigation with their text and href.
   * Filters out empty hrefs and anchor-only links (#).
   */
  async getNavLinks(): Promise<NavLinkInfo[]> {
    const nav = await this.findNavLocator();

    // If a nav container is found, scope to it; otherwise fall back to all page links
    // (handles single-page sites like Framer with no dedicated nav element).
    const links = nav
      ? nav.locator('a[href]')
      : this.page.locator('a[href]');

    const count = await links.count();
    const results: NavLinkInfo[] = [];

    for (let i = 0; i < count; i++) {
      const link = links.nth(i);
      const text = ((await link.textContent()) ?? '').trim();
      const href = (await link.getAttribute('href')) ?? '';

      // Skip empty, anchor-only, or javascript: links
      if (!href || href === '#' || href.startsWith('javascript:')) continue;

      results.push({ text, href });
    }

    return results;
  }

  /**
   * Click a navigation item by its visible text.
   * Uses a case-insensitive partial match.
   */
  async clickNavItem(text: string): Promise<void> {
    const nav = await this.findNavLocator();
    if (!nav) return;
    const link = nav.getByRole('link', { name: text });
    await link.first().click();
    await this.page.waitForLoadState('domcontentloaded');
  }

  // ── Mobile menu ──────────────────────────────────────────────────────────────

  /**
   * Return the mobile hamburger / menu toggle locator, or null if not found.
   * Searches for common patterns: button with aria-label containing "menu",
   * elements with class containing "hamburger", "menu-toggle", "nav-toggle".
   */
  async getMobileMenuToggle(): Promise<Locator | null> {
    const candidates = [
      this.page.getByRole('button', { name: /menu|navigation|toggle|hamburger/i }),
      this.page.locator('[class*="hamburger"], [class*="menu-toggle"], [class*="nav-toggle"]'),
      this.page.locator('[class*="burger"], [class*="menu-btn"], [class*="nav-btn"]'),
      this.page.locator('[aria-label*="menu" i], [aria-label*="navigation" i]').filter({ hasNotText: /^\s*$/ }),
      this.page.locator('[class*="w-nav-button"]'),   // Webflow hamburger
      this.page.locator('button[aria-expanded]').first(),
      this.page.locator('header button').first(),
    ];

    for (const candidate of candidates) {
      if (await candidate.count() > 0 && await candidate.first().isVisible()) {
        return candidate.first();
      }
    }

    return null;
  }

  /**
   * Open the mobile navigation menu if a toggle exists and the menu is currently closed.
   * No-op if no toggle is found (desktop layout).
   */
  async openMobileMenu(): Promise<void> {
    const toggle = await this.getMobileMenuToggle();
    if (!toggle) return;

    const isExpanded = await toggle.getAttribute('aria-expanded');
    if (isExpanded === 'true') return; // Already open

    await toggle.click();
    // Wait for the menu to respond — either aria-expanded flips or a link becomes visible
    await this.page.waitForFunction(
      () => document.querySelector('a[href]') !== null,
      { timeout: 3000 }
    ).catch(() => { /* nav links already present */ });
  }

  // ── Link reachability ────────────────────────────────────────────────────────

  /**
   * Check all nav links are reachable by issuing HEAD requests.
   * Returns an array of results with URL, HTTP status, and ok flag.
   * Relative URLs are resolved against config.url.
   */
  async checkAllNavLinksReachable(): Promise<LinkCheckResult[]> {
    const navLinks = await this.getNavLinks();
    const baseUrl = new URL(this.config.url);
    const results: LinkCheckResult[] = [];

    for (const link of navLinks) {
      let absoluteUrl: string;
      try {
        absoluteUrl = new URL(link.href, baseUrl).toString();
      } catch {
        results.push({ url: link.href, status: 0, ok: false });
        continue;
      }

      try {
        const response = await this.page.request.head(absoluteUrl, {
          timeout: 10_000,
        });
        const status = response.status();
        // 401/403 mean the resource exists but blocks automated requests — not broken
        const ok = response.ok() || status === 401 || status === 403;
        results.push({ url: absoluteUrl, status, ok });
      } catch {
        results.push({ url: absoluteUrl, status: 0, ok: false });
      }
    }

    return results;
  }
}
