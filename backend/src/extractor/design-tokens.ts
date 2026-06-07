import * as csstree from 'css-tree';

/**
 * Extract CSS custom properties (`--x: y`) declared on :root / html / body.
 *
 * The captured `cssVariables` map is empty for many sites; the authoritative
 * source of a site's design tokens is the `:root` block in its stylesheet text.
 * Returns `{}` on parse failure or when there are no such declarations.
 */
export function extractRootVariables(css: string): Record<string, string> {
  let ast: csstree.CssNode;
  try {
    ast = csstree.parse(css);
  } catch {
    return {};
  }
  const out: Record<string, string> = {};
  csstree.walk(ast, {
    visit: 'Rule',
    enter(rule: csstree.Rule) {
      if (this.atrule) return;
      const selector = rule.prelude ? csstree.generate(rule.prelude) : '';
      if (!/(^|,)\s*(:root|html|body)\s*(,|$)/.test(selector)) return;
      rule.block.children.forEach((node) => {
        if (node.type === 'Declaration' && node.property.startsWith('--')) {
          const value = csstree.generate(node.value).trim();
          if (!(node.property in out)) out[node.property] = value;
        }
      });
    },
  });
  return out;
}

export interface DesignTokensInput {
  cssVariables: Record<string, string>;
  fontImports: string[];
  sourceUrl: string;
  scrapedAt: string;
  /** Full stylesheet text — scanned to fill categories that have no :root tokens. */
  stylesheetCss?: string;
}

const COLOR_TOKEN_RE = /#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})\b|(?:rgba?|hsla?)\([^)]*\)/gi;
const LENGTH_RE = /^-?\d*\.?\d+(?:px|rem|em)$/;

interface ScannedValues {
  colors: string[];
  fontSizes: string[];
  fontFamilies: string[];
  spacing: string[];
  radii: string[];
}

/** Push a value into a frequency counter, ignoring var() references. */
function bump(counts: Map<string, number>, value: string): void {
  const v = value.trim();
  if (!v || v.includes('var(')) return;
  counts.set(v, (counts.get(v) ?? 0) + 1);
}

/** Distinct values ranked by frequency (desc), capped at `limit`. */
function ranked(counts: Map<string, number>, limit: number): string[] {
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, limit).map(([v]) => v);
}

/**
 * Scan a stylesheet for the most-used raw values per category. Used as a
 * fallback for sites that hardcode values instead of defining :root tokens.
 */
export function scanUsedValues(css: string): ScannedValues {
  const colors = new Map<string, number>();
  const fontSizes = new Map<string, number>();
  const fontFamilies = new Map<string, number>();
  const spacing = new Map<string, number>();
  const radii = new Map<string, number>();
  let ast: csstree.CssNode;
  try {
    ast = csstree.parse(css);
  } catch {
    return { colors: [], fontSizes: [], fontFamilies: [], spacing: [], radii: [] };
  }
  csstree.walk(ast, {
    visit: 'Declaration',
    enter(decl: csstree.Declaration) {
      const prop = decl.property.toLowerCase();
      if (prop.startsWith('--')) return;
      const value = csstree.generate(decl.value);
      if (value.includes('var(')) return;
      if (/(^|-)color$|^background$|^fill$|^stroke$|^border$|^outline$/.test(prop)) {
        for (const m of value.matchAll(COLOR_TOKEN_RE)) bump(colors, m[0]);
      } else if (prop === 'font-size') {
        if (LENGTH_RE.test(value.trim())) bump(fontSizes, value.trim());
      } else if (prop === 'font-family') {
        const fam = primaryFamily(value);
        if (fam && !/^(sans-serif|serif|monospace|system-ui|inherit|unset)$/i.test(fam)) bump(fontFamilies, fam);
      } else if (/^(padding|margin|gap)(-(top|right|bottom|left))?$/.test(prop)) {
        for (const tok of value.trim().split(/\s+/)) if (LENGTH_RE.test(tok) && parseFloat(tok) !== 0) bump(spacing, tok);
      } else if (/^border(-[a-z]+)?-radius$/.test(prop) || prop === 'border-radius') {
        for (const tok of value.trim().split(/\s+/)) if (LENGTH_RE.test(tok)) bump(radii, tok);
      }
    },
  });
  return {
    colors: ranked(colors, 16),
    fontSizes: ranked(fontSizes, 12),
    fontFamilies: ranked(fontFamilies, 8),
    spacing: ranked(spacing, 16),
    radii: ranked(radii, 10),
  };
}

const HEX_RE = /^#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;
const FUNC_COLOR_RE = /^(?:rgb|rgba|hsl|hsla)\(/i;
const NAMED_COLORS = new Set([
  'white', 'black', 'transparent', 'currentcolor', 'red', 'green', 'blue',
  'gray', 'grey', 'orange', 'yellow', 'purple', 'pink', 'brown',
]);

function isColorValue(value: string): boolean {
  const v = value.trim().toLowerCase();
  return HEX_RE.test(v) || FUNC_COLOR_RE.test(v) || NAMED_COLORS.has(v);
}

/** A value like '"Bricolage Grotesque", sans-serif' or 'Inter, system-ui'. */
function isFontStack(value: string): boolean {
  return /,\s*(sans-serif|serif|monospace|system-ui|cursive|fantasy|ui-sans-serif|ui-serif)\b/i.test(value)
    || /["'][^"']+["']\s*,/.test(value);
}

/** Strip leading dashes and the category segment so a var becomes a leaf key. */
function cleanKey(varName: string): string {
  let k = varName.replace(/^-+/, '');
  const segments = [
    'font-family', 'font-size', 'font-weight', 'line-height', 'letter-spacing',
    'radius', 'spacing', 'colors', 'color', 'fonts', 'sizes',
  ];
  for (const seg of segments) {
    const idx = k.toLowerCase().lastIndexOf(seg + '--');
    if (idx !== -1) {
      k = k.slice(idx + seg.length + 2);
      break;
    }
  }
  return k.replace(/-{2,}/g, '-').replace(/^-+|-+$/g, '');
}

/** Assign key->value into a map; on collision with a different value, qualify the key. */
function put(map: Record<string, string>, key: string, value: string, fullName: string): void {
  if (!(key in map)) { map[key] = value; return; }
  if (map[key] === value) return;
  const alt = cleanKey(fullName).replace(/-{2,}/g, '-') + '--' + key;
  map[alt in map ? `${alt}-${Object.keys(map).length}` : alt] = value;
}

/** Primary family name parsed from a font-family value (first entry, unquoted). */
function primaryFamily(value: string): string {
  return (value.split(',')[0] ?? '').trim().replace(/^["']|["']$/g, '');
}

const UUID_RE = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;

/**
 * Replace opaque keys (UUID-bearing names like Framer's `token-<uuid>`) with
 * sequential `prefix-N` names. Values are preserved; human-readable keys are
 * left untouched, so a site mixing both keeps its semantic names.
 */
function renameOpaqueKeys(map: Record<string, string>, prefix: string): Record<string, string> {
  const out: Record<string, string> = {};
  let n = 0;
  for (const [key, value] of Object.entries(map)) {
    if (UUID_RE.test(key)) {
      let generated: string;
      do {
        generated = `${prefix}-${++n}`;
      } while (generated in out || generated in map);
      out[generated] = value;
    } else {
      out[key] = value;
    }
  }
  return out;
}

/**
 * Build a portable design-tokens catalog from the site's :root variables.
 *
 * Routes each captured CSS custom property into colors / typography / spacing /
 * radii by name hint + value parsing, with cleaned leaf keys. Unrecognized vars
 * (e.g. easing curves, z-indexes) are dropped to keep the file meaningful.
 * Empty categories are omitted. `fonts[]` pairs each real font family with its
 * @import source URL (or null for system fonts).
 */
export function buildDesignTokens(input: DesignTokensInput): Record<string, unknown> {
  const colors: Record<string, string> = {};
  const fontFamilies: Record<string, string> = {};
  const fontSizes: Record<string, string> = {};
  const fontWeights: Record<string, string> = {};
  const lineHeights: Record<string, string> = {};
  const letterSpacing: Record<string, string> = {};
  const radii: Record<string, string> = {};
  const spacing: Record<string, string> = {};

  for (const [name, rawValue] of Object.entries(input.cssVariables)) {
    const value = rawValue.trim();
    const lname = name.toLowerCase();
    const key = cleanKey(name);
    if (!key) continue;

    if (lname.includes('font-family') || (isFontStack(value) && !isColorValue(value))) {
      put(fontFamilies, key, value, name);
    } else if (lname.includes('font-size')) {
      put(fontSizes, key, value, name);
    } else if (lname.includes('font-weight')) {
      put(fontWeights, key, value, name);
    } else if (lname.includes('line-height')) {
      put(lineHeights, key, value, name);
    } else if (lname.includes('letter-spacing')) {
      put(letterSpacing, key, value, name);
    } else if (lname.includes('radius')) {
      put(radii, key, value, name);
    } else if (/(spacing|gap|padding|margin)/.test(lname)) {
      put(spacing, key, value, name);
    } else if (isColorValue(value)) {
      put(colors, key, value, name);
    }
    // else: unrecognized — dropped to keep the file clean.
  }

  // Fallback: for sites with no :root token system, fill each EMPTY category
  // from a frequency-ranked scan of the stylesheet's hardcoded values.
  if (input.stylesheetCss) {
    const scan = scanUsedValues(input.stylesheetCss);
    const fill = (map: Record<string, string>, values: string[], prefix: string): void => {
      if (Object.keys(map).length > 0) return; // curated tokens win
      values.forEach((v, i) => { map[`${prefix}-${i + 1}`] = v; });
    };
    fill(colors, scan.colors, 'color');
    fill(fontSizes, scan.fontSizes, 'size');
    fill(spacing, scan.spacing, 'space');
    fill(radii, scan.radii, 'radius');
    if (Object.keys(fontFamilies).length === 0) {
      for (const fam of scan.fontFamilies) put(fontFamilies, cleanKey(fam) || fam.toLowerCase(), fam, fam);
    }
  }

  // fonts[]: each distinct font family with its @import source URL. Families
  // come from both the font-family tokens AND the @import URLs directly, so the
  // list works even on sites with no :root token system (older Webflow, etc.).
  const fonts: { family: string; source: string | null }[] = [];
  const seenFamilies = new Set<string>();
  const addFont = (family: string, source: string | null): void => {
    const fam = family.trim();
    if (!fam || seenFamilies.has(fam.toLowerCase())) return;
    if (/^(sans-serif|serif|monospace|system-ui|inherit|unset|cursive|fantasy)$/i.test(fam)) return;
    seenFamilies.add(fam.toLowerCase());
    fonts.push({ family: fam, source });
  };
  for (const value of Object.values(fontFamilies)) {
    const family = primaryFamily(value);
    const needle = family.replace(/\s+/g, '+').toLowerCase();
    const match = input.fontImports.find(imp => imp.toLowerCase().includes(needle));
    addFont(family, match ? (match.match(/https?:\/\/[^)'"\s]+/)?.[0] ?? null) : null);
  }
  // Families declared only via @import (e.g. family=Poppins) — not in any token.
  for (const imp of input.fontImports) {
    const url = imp.match(/https?:\/\/[^)'"\s]+/)?.[0] ?? null;
    for (const m of imp.matchAll(/family=([^:&)'";]+)/gi)) {
      if (!m[1]) continue;
      addFont(decodeURIComponent(m[1]).replace(/\+/g, ' ').trim(), url);
    }
  }

  const typography: Record<string, unknown> = {};
  if (Object.keys(fontFamilies).length) typography.fontFamilies = fontFamilies;
  if (Object.keys(fontSizes).length) typography.fontSizes = fontSizes;
  if (Object.keys(fontWeights).length) typography.fontWeights = fontWeights;
  if (Object.keys(lineHeights).length) typography.lineHeights = lineHeights;
  if (Object.keys(letterSpacing).length) typography.letterSpacing = letterSpacing;

  // Framer (and similar) name color vars with opaque UUIDs; rename those to
  // sequential color-N so the palette has usable keys. Semantic names are kept.
  const cleanColors = renameOpaqueKeys(colors, 'color');

  const out: Record<string, unknown> = {
    meta: { sourceUrl: input.sourceUrl, scrapedAt: input.scrapedAt },
  };
  if (Object.keys(cleanColors).length) out.colors = cleanColors;
  if (Object.keys(typography).length) out.typography = typography;
  if (Object.keys(spacing).length) out.spacing = spacing;
  if (Object.keys(radii).length) out.radii = radii;
  if (fonts.length) out.fonts = fonts;
  return out;
}
