import { relativeLuminance, contrastRatio, type ColorRoles } from './color-roles.js';

export interface StyleProfileInput {
  colorRoles?: ColorRoles | undefined;
  radii?: Record<string, string> | undefined;
  spacing?: Record<string, string> | undefined;
  shadows?: Record<string, string> | undefined;
  gradients?: string[] | undefined;
}

export interface StyleProfile {
  brandColor?: string;
  isDark: boolean;
  cornerStyle: 'sharp' | 'rounded' | 'pill';
  density: 'tight' | 'balanced' | 'airy';
  elevation: 'flat' | 'subtle' | 'deep';
  hasGradients: boolean;
  vibe: string[];
}

function pxValues(map: Record<string, string> | undefined): number[] {
  if (!map) return [];
  const out: number[] = [];
  for (const v of Object.values(map)) {
    const m = v.trim().match(/^(-?\d*\.?\d+)px$/);
    if (m) out.push(parseFloat(m[1]!));
  }
  return out;
}

function median(values: number[]): number | null {
  const positive = values.filter((v) => v > 0).sort((a, b) => a - b);
  if (positive.length === 0) return null;
  const mid = Math.floor(positive.length / 2);
  return positive.length % 2 ? positive[mid]! : (positive[mid - 1]! + positive[mid]!) / 2;
}

function cornerStyleFrom(radii: Record<string, string> | undefined): StyleProfile['cornerStyle'] {
  if (!radii || Object.keys(radii).length === 0) return 'sharp';
  const hasPill = Object.values(radii).some((v) => /^(50%|9999px|9999rem)$/i.test(v.trim()) || parseFloat(v) >= 999);
  const med = median(pxValues(radii));
  if (med === null) return hasPill ? 'pill' : 'sharp';
  if (hasPill) return 'pill';
  if (med < 4) return 'sharp';
  if (med >= 24) return 'pill';
  return 'rounded';
}

function densityFrom(spacing: Record<string, string> | undefined): StyleProfile['density'] {
  const med = median(pxValues(spacing));
  if (med === null) return 'balanced';
  if (med < 14) return 'tight';
  if (med >= 28) return 'airy';
  return 'balanced';
}

function elevationFrom(shadows: Record<string, string> | undefined): StyleProfile['elevation'] {
  if (!shadows || Object.keys(shadows).length === 0) return 'flat';
  let maxPx = 0;
  for (const v of Object.values(shadows)) {
    for (const m of v.matchAll(/(\d*\.?\d+)px/g)) maxPx = Math.max(maxPx, parseFloat(m[1]!));
  }
  return maxPx >= 24 ? 'deep' : 'subtle';
}

/**
 * Derive a compact, mostly-objective design "brief" from the assembled tokens.
 * Pure — takes already-computed token groups, no DOM/CSS. The `vibe` adjectives
 * come from a controlled vocabulary mapped directly off the objective signals.
 */
export function buildStyleProfile(input: StyleProfileInput): StyleProfile {
  const cornerStyle = cornerStyleFrom(input.radii);
  const density = densityFrom(input.spacing);
  const elevation = elevationFrom(input.shadows);
  const hasGradients = (input.gradients?.length ?? 0) > 0;

  const bg = input.colorRoles?.background;
  const bgLum = bg ? relativeLuminance(bg) : null;
  const isDark = bgLum !== null && bgLum < 0.5;

  const profile: StyleProfile = {
    isDark,
    cornerStyle,
    density,
    elevation,
    hasGradients,
    vibe: [],
  };
  if (input.colorRoles?.primary) profile.brandColor = input.colorRoles.primary;

  // Controlled-vocabulary vibe, derived from the objective signals above.
  const vibe: string[] = [];
  if (isDark) vibe.push('dark');
  if (cornerStyle === 'sharp') vibe.push('minimal');
  else vibe.push('rounded');
  if (density === 'airy') vibe.push('spacious');
  else if (density === 'tight') vibe.push('compact');
  if (elevation === 'deep') vibe.push('layered');
  if (hasGradients) vibe.push('vibrant');

  const text = input.colorRoles?.text;
  if (bg && text) {
    const ratio = contrastRatio(bg, text);
    if (ratio !== null && ratio >= 7) vibe.push('high-contrast');
  }

  profile.vibe = [...new Set(vibe)].slice(0, 5);
  return profile;
}
