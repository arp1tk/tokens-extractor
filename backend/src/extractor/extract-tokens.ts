import type { Page } from 'playwright';
import { getBrowser } from './browser.js';
import {
  captureStylesheets,
  captureFontImports,
  captureCssVariables,
  captureFontUsage,
  captureColorUsage,
  captureTextStyles,
} from './capture.js';
import { buildDesignTokens, extractRootVariables } from './design-tokens.js';
import { classifyFontUsage, type FontEntry } from './font-usage.js';
import { classifyColorRoles } from './color-roles.js';
import { buildTextStyles } from './text-styles.js';
import { extractShadows, extractGradients } from './shadows-gradients.js';
import { buildStyleProfile } from './style-profile.js';
import { ExtractError } from './errors.js';

const NAV_TIMEOUT_MS = 30000;
const SETTLE_MS = 2000;

/**
 * MVP concurrency control: serialize extractions so we never open more than one
 * page at a time. Replace with a small pool later if throughput matters.
 */
let queue: Promise<unknown> = Promise.resolve();
function runExclusive<T>(fn: () => Promise<T>): Promise<T> {
  const result = queue.then(fn, fn);
  queue = result.then(
    () => undefined,
    () => undefined,
  );
  return result;
}

/**
 * Render `url` in a real browser, capture its CSS, and distill a portable
 * design-tokens catalog (the buildDesignTokens output). Throws ExtractError for
 * known failure modes (navigation timeout, no readable CSS).
 */
export function extractTokens(url: string): Promise<Record<string, unknown>> {
  return runExclusive(() => extractOnce(url));
}

async function extractOnce(url: string): Promise<Record<string, unknown>> {
  const browser = await getBrowser();
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  try {
    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: NAV_TIMEOUT_MS });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      if (/timeout/i.test(message)) {
        throw new ExtractError('navigation_timeout', 504, `Navigation to ${url} timed out`);
      }
      // DNS failure, connection refused, TLS error, etc. — the URL is well-formed
      // but the page could not be loaded.
      throw new ExtractError('navigation_failed', 502, `Could not load ${url}: ${message.split('\n')[0]}`);
    }

    await page.waitForTimeout(SETTLE_MS);
    await autoScroll(page);

    const [stylesheets, fontImports, cssVariables, fontUsage, colorUsage, textStyleSamples] =
      await Promise.all([
        captureStylesheets(page),
        captureFontImports(page),
        captureCssVariables(page),
        captureFontUsage(page),
        captureColorUsage(page),
        captureTextStyles(page),
      ]);

    if (stylesheets.length === 0) {
      throw new ExtractError('no_css', 422, `No readable stylesheets found at ${url}`);
    }

    const allSheetCss = stylesheets.map((s) => s.content).join('\n');
    const rootVars: Record<string, string> = {};
    for (const sheet of stylesheets) Object.assign(rootVars, extractRootVariables(sheet.content));
    Object.assign(rootVars, cssVariables); // captured map wins on conflict

    const tokens = buildDesignTokens({
      cssVariables: rootVars,
      fontImports,
      sourceUrl: url,
      scrapedAt: new Date().toISOString(),
      stylesheetCss: allSheetCss,
    });

    // Annotate fonts with on-page usage (role + share) from the rendered sample.
    const baseFonts = (Array.isArray(tokens.fonts) ? tokens.fonts : []) as FontEntry[];
    const enrichedFonts = classifyFontUsage(baseFonts, fontUsage);
    if (enrichedFonts.length) tokens.fonts = enrichedFonts;

    // Tier 1 AI-enhancement tokens (all additive).
    const colorRoles = classifyColorRoles(colorUsage);
    if (Object.keys(colorRoles).length) tokens.colorRoles = colorRoles;

    const textStyles = buildTextStyles(textStyleSamples);
    if (Object.keys(textStyles).length) tokens.textStyles = textStyles;

    const shadows = extractShadows(allSheetCss);
    if (Object.keys(shadows).length) tokens.shadows = shadows;

    const gradients = extractGradients(allSheetCss);
    if (gradients.length) tokens.gradients = gradients;

    const styleProfile = buildStyleProfile({
      colorRoles,
      radii: tokens.radii as Record<string, string> | undefined,
      spacing: tokens.spacing as Record<string, string> | undefined,
      shadows,
      gradients,
    });
    tokens.styleProfile = styleProfile;

    const categories = Object.keys(tokens).filter((k) => k !== 'meta');
    if (categories.length === 0) {
      tokens.warning = 'No design tokens could be extracted from this site.';
    }

    return tokens;
  } finally {
    await context.close();
  }
}

/** Scroll to the bottom in steps to trigger lazy-loaded styles/fonts. */
async function autoScroll(page: Page): Promise<void> {
  await page.evaluate(`(async () => {
    await new Promise((resolve) => {
      let total = 0;
      const step = 600;
      const timer = setInterval(() => {
        window.scrollBy(0, step);
        total += step;
        if (total >= document.body.scrollHeight) {
          clearInterval(timer);
          resolve(undefined);
        }
      }, 80);
    });
  })()`);
  await page.waitForTimeout(300);
}
