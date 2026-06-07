import type { Page } from 'playwright';
import type { ColorSample } from './color-roles.js';
import type { TextStyleSample } from './text-styles.js';

export interface CapturedSheet {
  href: string;
  content: string;
}

// Browser-side scripts are passed as strings (not functions) so the bundler/
// transpiler never rewrites them — they run verbatim in the page context.
// Ported from the block-scraper extractor.

/**
 * Serialize every same-origin stylesheet via the CSSOM, stripping @keyframes
 * and animation start-state properties (opacity:0, translate/rotate/scale
 * transforms, visibility:hidden) so captured CSS reflects the resting design.
 */
const STYLESHEETS_CSSOM = `(() => {
  const results = [];
  const seen = new Set();
  var inlineIndex = 0;

  for (const sheet of document.styleSheets) {
    var sheetKey = sheet.href || ('inline-' + inlineIndex++);
    if (seen.has(sheetKey)) continue;
    seen.add(sheetKey);

    let cssText = '';
    try {
      for (const rule of sheet.cssRules) {
        if (rule.type === CSSRule.KEYFRAMES_RULE) continue;

        if (rule.style) {
          rule.style.removeProperty('animation');
          rule.style.removeProperty('animation-name');
          rule.style.removeProperty('animation-duration');
          rule.style.removeProperty('animation-delay');
          rule.style.removeProperty('animation-fill-mode');
          rule.style.removeProperty('-webkit-animation');
          rule.style.removeProperty('-webkit-animation-name');

          const opacity = rule.style.getPropertyValue('opacity');
          if (opacity === '0') rule.style.removeProperty('opacity');

          const transform = rule.style.getPropertyValue('transform');
          if (transform && transform !== 'none' && /translate|rotate|scale/.test(transform)) {
            rule.style.removeProperty('transform');
          }
          const webkitTransform = rule.style.getPropertyValue('-webkit-transform');
          if (webkitTransform && webkitTransform !== 'none' && /translate|rotate|scale/.test(webkitTransform)) {
            rule.style.removeProperty('-webkit-transform');
          }

          if (rule.style.getPropertyValue('visibility') === 'hidden') {
            rule.style.removeProperty('visibility');
          }

          if (rule.style.length === 0) continue;
        }

        cssText += rule.cssText + '\\n';
      }
    } catch (e) {
      // Cross-origin sheet — can't read rules, recovered via fetch fallback below.
    }

    if (cssText) results.push({ href: sheet.href || sheetKey, content: cssText });
  }

  return results;
})()`;

/** Collect <link rel="stylesheet"> hrefs (content fetched separately). */
const STYLESHEET_HREFS = `(() => {
  const results = [];
  const seen = new Set();
  document.querySelectorAll('link[rel="stylesheet"]').forEach(link => {
    if (link.href && !seen.has(link.href)) {
      seen.add(link.href);
      results.push({ href: link.href, content: '' });
    }
  });
  return results;
})()`;

/** CDN font <link> hrefs (as @import) plus @font-face rule text. */
const FONT_IMPORTS = `(() => {
  const imports = new Set();
  document.querySelectorAll('link[rel="stylesheet"][href*="fonts.googleapis.com"], link[rel="stylesheet"][href*="fonts.gstatic.com"], link[rel="stylesheet"][href*="use.typekit.net"]').forEach(l => {
    imports.add('@import url("' + l.href + '");');
  });
  try {
    Array.from(document.styleSheets).forEach(sheet => {
      try {
        Array.from(sheet.cssRules || []).forEach(rule => {
          if (rule.type === CSSRule.FONT_FACE_RULE) imports.add(rule.cssText);
        });
      } catch (e) { /* cross-origin sheet */ }
    });
  } catch (e) {}
  return Array.from(imports);
})()`;

/** `--x: y` declarations from :root / html rules across readable stylesheets. */
const CSS_VARIABLES = `(() => {
  const vars = {};
  try {
    Array.from(document.styleSheets).forEach(sheet => {
      try {
        Array.from(sheet.cssRules || []).forEach(rule => {
          if (rule.selectorText === ':root' || rule.selectorText === 'html') {
            const matches = rule.cssText.matchAll(/--([\\w-]+):\\s*([^;]+);/g);
            for (const m of matches) vars['--' + m[1]] = m[2].trim();
          }
        });
      } catch (e) {}
    });
  } catch (e) {}
  return vars;
})()`;

/**
 * Capture all stylesheets. Same-origin sheets are read via the CSSOM; any
 * sheet whose rules are unreadable (cross-origin) is recovered by fetching its
 * href text from within the page context.
 */
export async function captureStylesheets(page: Page): Promise<CapturedSheet[]> {
  const sheets = (await page.evaluate(STYLESHEETS_CSSOM)) as unknown as CapturedSheet[];
  const hrefs = (await page.evaluate(STYLESHEET_HREFS)) as unknown as CapturedSheet[];
  const captured = new Set(sheets.map((s) => s.href));

  for (const entry of hrefs) {
    if (captured.has(entry.href)) continue;
    try {
      const content = (await page.evaluate(
        `fetch(${JSON.stringify(entry.href)}).then(r => r.text()).catch(() => '')`,
      )) as unknown as string;
      if (content) sheets.push({ href: entry.href, content });
    } catch {
      // Could not fetch this sheet — skip it.
    }
  }

  return sheets;
}

export async function captureFontImports(page: Page): Promise<string[]> {
  return (await page.evaluate(FONT_IMPORTS)) as unknown as string[];
}

export interface RawFontUsage {
  family: string;
  bodyChars: number;
  headingChars: number;
  isMono: boolean;
}

/**
 * Walk visible elements and tally, per primary font family, the visible text
 * characters rendered in it — split into heading (h1–h6) vs body — plus whether
 * the computed font is monospace. Only an element's OWN text is counted, so the
 * font actually styling that text gets the credit.
 */
const FONT_USAGE = `(() => {
  const GENERIC = /^(sans-serif|serif|monospace|system-ui|inherit|unset|cursive|fantasy|ui-sans-serif|ui-serif|ui-monospace|-apple-system|blinkmacsystemfont|math|emoji)$/i;
  function primaryFamily(ff) {
    return (ff.split(',')[0] || '').trim().replace(/^["']|["']$/g, '');
  }
  const acc = {};
  const els = document.body ? document.body.querySelectorAll('*') : [];
  for (const el of els) {
    let text = '';
    for (const node of el.childNodes) {
      if (node.nodeType === 3) text += node.nodeValue;
    }
    text = text.replace(/\\s+/g, ' ').trim();
    if (!text) continue;
    if (el.getClientRects().length === 0) continue;
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden' || parseFloat(cs.opacity) === 0) continue;
    const fam = primaryFamily(cs.fontFamily);
    if (!fam || GENERIC.test(fam)) continue;
    const tag = el.tagName.toLowerCase();
    const isHeading = /^h[1-6]$/.test(tag);
    const isMono = /(^|,|\\s)monospace\\b/i.test(cs.fontFamily) || /\\bmono\\b/i.test(fam);
    const key = fam.toLowerCase();
    if (!acc[key]) acc[key] = { family: fam, bodyChars: 0, headingChars: 0, isMono: false };
    if (isHeading) acc[key].headingChars += text.length;
    else acc[key].bodyChars += text.length;
    if (isMono) acc[key].isMono = true;
  }
  return Object.keys(acc).map(k => acc[k]);
})()`;

export async function captureFontUsage(page: Page): Promise<RawFontUsage[]> {
  return (await page.evaluate(FONT_USAGE)) as unknown as RawFontUsage[];
}

/**
 * Sample colors actually painted on the page: text color (weighted by own-text
 * length), background-color (weighted by painted area), and visible border
 * color. Interactive elements (links/buttons) are flagged to help find the
 * brand/primary color.
 */
const COLOR_USAGE = `(() => {
  function isTransparent(c) {
    if (!c) return true;
    const s = c.replace(/\\s/g, '');
    return s === 'transparent' || /,0\\)$/.test(s) && /rgba\\(/.test(s);
  }
  function interactive(el) {
    const tag = el.tagName.toLowerCase();
    if (tag === 'a' || tag === 'button') return true;
    if (tag === 'input') { const t = (el.getAttribute('type') || '').toLowerCase(); if (t === 'submit' || t === 'button') return true; }
    if ((el.getAttribute('role') || '') === 'button') return true;
    return false;
  }
  const out = [];
  // Query from the document root so the <body>/<html> page background is sampled
  // (its own background is not a descendant of body). Non-rendered nodes (head,
  // script, style) have no client rects and are skipped below.
  const els = document.querySelectorAll('*');
  for (const el of els) {
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden' || parseFloat(cs.opacity) === 0) continue;
    if (el.getClientRects().length === 0) continue;
    const inter = interactive(el);
    let text = '';
    for (const n of el.childNodes) { if (n.nodeType === 3) text += n.nodeValue; }
    text = text.replace(/\\s+/g, ' ').trim();
    if (text && !isTransparent(cs.color)) out.push({ kind: 'text', color: cs.color, weight: text.length, interactive: inter });
    if (!isTransparent(cs.backgroundColor)) {
      const r = el.getBoundingClientRect();
      const area = Math.max(0, r.width) * Math.max(0, r.height);
      if (area > 0) out.push({ kind: 'background', color: cs.backgroundColor, weight: area, interactive: inter });
    }
    const bw = parseFloat(cs.borderTopWidth) || parseFloat(cs.borderLeftWidth) || 0;
    if (bw > 0 && cs.borderTopStyle !== 'none' && !isTransparent(cs.borderTopColor)) {
      out.push({ kind: 'border', color: cs.borderTopColor, weight: 1, interactive: inter });
    }
  }
  return out;
})()`;

export async function captureColorUsage(page: Page): Promise<ColorSample[]> {
  return (await page.evaluate(COLOR_USAGE)) as unknown as ColorSample[];
}

/**
 * Read computed type styles for representative elements per role (h1–h6, body
 * paragraphs, links, buttons). The pure layer picks the modal combo per role.
 */
const TEXT_STYLES = `(() => {
  function primaryFamily(ff) { return (ff.split(',')[0] || '').trim().replace(/^["']|["']$/g, ''); }
  function visible(el) {
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden' || parseFloat(cs.opacity) === 0) return false;
    return el.getClientRects().length > 0;
  }
  const out = [];
  function sample(el, role) {
    if (!visible(el)) return;
    const txt = (el.textContent || '').trim();
    if (!txt && el.tagName !== 'INPUT') return;
    const cs = getComputedStyle(el);
    const family = primaryFamily(cs.fontFamily);
    if (!family) return;
    out.push({
      role: role,
      family: family,
      sizePx: parseFloat(cs.fontSize) || 0,
      weight: parseInt(cs.fontWeight, 10) || 400,
      lineHeightPx: cs.lineHeight === 'normal' ? 0 : (parseFloat(cs.lineHeight) || 0),
      letterSpacing: cs.letterSpacing || 'normal',
    });
  }
  ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].forEach(function (tag) {
    document.querySelectorAll(tag).forEach(function (el) { sample(el, tag); });
  });
  document.querySelectorAll('p').forEach(function (el) { sample(el, 'body'); });
  document.querySelectorAll('a').forEach(function (el) { sample(el, 'link'); });
  document.querySelectorAll('button, input[type=submit], input[type=button], [role=button]').forEach(function (el) { sample(el, 'button'); });
  return out;
})()`;

export async function captureTextStyles(page: Page): Promise<TextStyleSample[]> {
  return (await page.evaluate(TEXT_STYLES)) as unknown as TextStyleSample[];
}

export async function captureCssVariables(page: Page): Promise<Record<string, string>> {
  return (await page.evaluate(CSS_VARIABLES)) as unknown as Record<string, string>;
}
