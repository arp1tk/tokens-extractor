export interface TextStyleSample {
  role: string; // 'h1'..'h6' | 'body' | 'link' | 'button'
  family: string;
  sizePx: number;
  weight: number;
  lineHeightPx: number; // 0 when 'normal'/unresolved
  letterSpacing: string; // computed, e.g. 'normal' | '-0.16px'
}

export interface TextStyle {
  family: string;
  size: string;
  weight: number;
  lineHeight?: number; // unitless ratio
  letterSpacing?: string;
}

function meaningfulSpacing(value: string): boolean {
  const v = value.trim().toLowerCase();
  return v !== '' && v !== 'normal' && parseFloat(v) !== 0;
}

/**
 * Build one composite text recipe per role from per-element computed samples.
 * For each role the most common (family,size,weight,lineHeight,letterSpacing)
 * combination wins; ties break toward the larger size. Pure / unit-testable.
 */
export function buildTextStyles(samples: TextStyleSample[]): Record<string, TextStyle> {
  const byRole = new Map<string, TextStyleSample[]>();
  for (const sample of samples) {
    const list = byRole.get(sample.role);
    if (list) list.push(sample);
    else byRole.set(sample.role, [sample]);
  }

  const out: Record<string, TextStyle> = {};
  for (const [role, list] of byRole) {
    const chosen = modalSample(list);
    if (!chosen) continue;

    const style: TextStyle = {
      family: chosen.family,
      size: `${chosen.sizePx}px`,
      weight: chosen.weight,
    };
    if (chosen.lineHeightPx > 0 && chosen.sizePx > 0) {
      style.lineHeight = Math.round((chosen.lineHeightPx / chosen.sizePx) * 100) / 100;
    }
    if (meaningfulSpacing(chosen.letterSpacing)) {
      style.letterSpacing = chosen.letterSpacing;
    }
    out[role] = style;
  }
  return out;
}

/** Most frequent combo; ties resolved by larger font size. */
function modalSample(list: TextStyleSample[]): TextStyleSample | null {
  const counts = new Map<string, number>();
  const rep = new Map<string, TextStyleSample>();
  for (const s of list) {
    const key = `${s.family}|${s.sizePx}|${s.weight}|${s.lineHeightPx}|${s.letterSpacing}`;
    counts.set(key, (counts.get(key) ?? 0) + 1);
    if (!rep.has(key)) rep.set(key, s);
  }
  let best: TextStyleSample | null = null;
  let bestCount = 0;
  for (const [key, count] of counts) {
    const sample = rep.get(key)!;
    if (count > bestCount || (count === bestCount && best !== null && sample.sizePx > best.sizePx)) {
      best = sample;
      bestCount = count;
    }
  }
  return best;
}
