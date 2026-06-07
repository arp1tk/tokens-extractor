export interface ColorSample {
  kind: 'text' | 'background' | 'border';
  color: string;
  /** text: visible char count; background: painted area (px²); border: element count. */
  weight: number;
  /** Element is a link/button — used to find the brand/primary color. */
  interactive?: boolean;
}

export interface ColorRoles {
  background?: string;
  surface?: string;
  text?: string;
  muted?: string;
  primary?: string;
  border?: string;
}

interface Rgb {
  r: number;
  g: number;
  b: number;
  a: number;
}

const NEUTRAL_CHROMA = 0.1; // below this a color reads as grey/black/white

export function parseColor(input: string): Rgb | null {
  const s = input.trim().toLowerCase();
  const rgb = s.match(/rgba?\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)(?:[,/\s]+([\d.]+))?\s*\)/);
  if (rgb) {
    return { r: +rgb[1]!, g: +rgb[2]!, b: +rgb[3]!, a: rgb[4] !== undefined ? +rgb[4] : 1 };
  }
  const hex = s.match(/^#([0-9a-f]{3,8})$/);
  if (hex) {
    let h = hex[1]!;
    if (h.length === 3) h = h.split('').map((c) => c + c).join('');
    if (h.length === 6 || h.length === 8) {
      return {
        r: parseInt(h.slice(0, 2), 16),
        g: parseInt(h.slice(2, 4), 16),
        b: parseInt(h.slice(4, 6), 16),
        a: h.length === 8 ? parseInt(h.slice(6, 8), 16) / 255 : 1,
      };
    }
  }
  return null;
}

/** WCAG relative luminance 0..1, or null if unparseable. */
export function relativeLuminance(color: string): number | null {
  const c = parseColor(color);
  if (!c) return null;
  const lin = (v: number): number => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * lin(c.r) + 0.7152 * lin(c.g) + 0.0722 * lin(c.b);
}

/** WCAG contrast ratio between two colors, or null if either is unparseable. */
export function contrastRatio(a: string, b: string): number | null {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  if (la === null || lb === null) return null;
  const [hi, lo] = la >= lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

/** Chroma 0..1 — how colorful (saturated) the color is. */
function chroma(c: Rgb): number {
  const max = Math.max(c.r, c.g, c.b);
  const min = Math.min(c.r, c.g, c.b);
  return (max - min) / 255;
}

function isSaturated(input: string): boolean {
  const c = parseColor(input);
  return c !== null && c.a > 0 && chroma(c) >= NEUTRAL_CHROMA;
}

function isVisible(input: string): boolean {
  const c = parseColor(input);
  return c !== null && c.a > 0;
}

/** Sum weights per color (normalized key), returning originals ranked by weight desc. */
function rankByWeight(samples: ColorSample[]): string[] {
  const weights = new Map<string, number>();
  const original = new Map<string, string>();
  for (const s of samples) {
    if (!isVisible(s.color)) continue;
    const key = s.color.replace(/\s+/g, '').toLowerCase();
    weights.set(key, (weights.get(key) ?? 0) + s.weight);
    if (!original.has(key)) original.set(key, s.color);
  }
  return [...weights.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([key]) => original.get(key)!);
}

/**
 * Classify sampled colors into semantic roles. Pure — operates on usage samples
 * (see captureColorUsage). Roles that can't be determined are omitted.
 */
export function classifyColorRoles(samples: ColorSample[]): ColorRoles {
  const roles: ColorRoles = {};

  const backgrounds = rankByWeight(samples.filter((s) => s.kind === 'background'));
  if (backgrounds[0]) roles.background = backgrounds[0];
  if (backgrounds[1]) roles.surface = backgrounds[1];

  const texts = rankByWeight(samples.filter((s) => s.kind === 'text'));
  if (texts[0]) roles.text = texts[0];

  // muted: the next-most-used text color that is still readable on the page
  // background and less prominent than the main text — skips e.g. white text
  // used on a dark hero (which would otherwise rank second).
  const mainText = texts[0];
  const bg = roles.background;
  if (mainText && bg) {
    const mainContrast = contrastRatio(bg, mainText) ?? Infinity;
    for (const candidate of texts.slice(1)) {
      if (isSaturated(candidate)) continue; // muted is a neutral, not the brand/link color
      const cr = contrastRatio(bg, candidate);
      if (cr !== null && cr >= 2 && cr < mainContrast) {
        roles.muted = candidate;
        break;
      }
    }
  } else if (texts[1]) {
    roles.muted = texts[1];
  }

  const borders = rankByWeight(samples.filter((s) => s.kind === 'border'));
  if (borders[0]) roles.border = borders[0];

  // Primary/brand: most-weighted saturated color, preferring interactive elements.
  const interactiveSaturated = rankByWeight(
    samples.filter((s) => s.interactive && isSaturated(s.color)),
  );
  const anySaturated = rankByWeight(samples.filter((s) => isSaturated(s.color)));
  const primary = interactiveSaturated[0] ?? anySaturated[0];
  if (primary) roles.primary = primary;

  return roles;
}
