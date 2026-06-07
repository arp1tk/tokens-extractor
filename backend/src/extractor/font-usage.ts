export interface FontUsageSample {
  /** Primary font family as resolved by the browser (generics already excluded). */
  family: string;
  /** Visible characters of non-heading text rendered in this family. */
  bodyChars: number;
  /** Visible characters of heading (h1–h6) text rendered in this family. */
  headingChars: number;
  /** Whether the computed font is monospace. */
  isMono: boolean;
}

export type FontRole = 'body' | 'heading' | 'accent' | 'mono' | null;

export interface FontEntry {
  family: string;
  source: string | null;
}

export interface EnrichedFont extends FontEntry {
  role: FontRole;
  usage: number; // integer percentage of on-page text volume
}

interface Agg {
  family: string;
  bodyChars: number;
  headingChars: number;
  isMono: boolean;
}

const ROLE_RANK: Record<Exclude<FontRole, null> | 'null', number> = {
  body: 0,
  heading: 1,
  accent: 2,
  mono: 3,
  null: 4,
};

/**
 * Merge rendered-usage samples into the fonts list, assigning each font a role
 * (body / heading / accent / mono) and a usage percentage, sorted most-used
 * first. Fonts rendered but missing from `fonts` are appended (source null);
 * fonts listed but never rendered get usage 0 / role null.
 */
export function classifyFontUsage(fonts: FontEntry[], samples: FontUsageSample[]): EnrichedFont[] {
  // Aggregate samples case-insensitively (a family may appear more than once).
  const byKey = new Map<string, Agg>();
  for (const s of samples) {
    const fam = s.family.trim();
    if (!fam) continue;
    const key = fam.toLowerCase();
    const existing = byKey.get(key);
    if (existing) {
      existing.bodyChars += s.bodyChars;
      existing.headingChars += s.headingChars;
      existing.isMono = existing.isMono || s.isMono;
    } else {
      byKey.set(key, { family: fam, bodyChars: s.bodyChars, headingChars: s.headingChars, isMono: s.isMono });
    }
  }

  const aggs = [...byKey.values()];
  const total = aggs.reduce((sum, a) => sum + a.bodyChars + a.headingChars, 0);

  // Body font: most non-heading text. Fall back to most total text (heading-only pages).
  const bodyKey = pickMax(aggs, (a) => a.bodyChars) ?? pickMax(aggs, (a) => a.bodyChars + a.headingChars);

  // Heading font: most heading text among families distinct from the body font.
  const headingKey = pickMax(
    aggs.filter((a) => a.family.toLowerCase() !== bodyKey && a.headingChars > 0 && !a.isMono),
    (a) => a.headingChars,
  );

  const roleFor = (key: string): FontRole => {
    const agg = byKey.get(key);
    if (!agg) return null;
    const chars = agg.bodyChars + agg.headingChars;
    if (chars === 0) return null;
    if (agg.isMono) return 'mono';
    if (key === bodyKey) return 'body';
    if (key === headingKey) return 'heading';
    return 'accent';
  };

  const usageFor = (key: string): number => {
    const agg = byKey.get(key);
    if (!agg || total === 0) return 0;
    return Math.round((100 * (agg.bodyChars + agg.headingChars)) / total);
  };

  const result: EnrichedFont[] = [];
  const usedKeys = new Set<string>();

  // Listed fonts first, preserving their canonical name/source.
  for (const f of fonts) {
    const key = f.family.trim().toLowerCase();
    usedKeys.add(key);
    result.push({ family: f.family, source: f.source, role: roleFor(key), usage: usageFor(key) });
  }

  // Rendered families not present in the list — append with no source.
  for (const agg of aggs) {
    const key = agg.family.toLowerCase();
    if (usedKeys.has(key)) continue;
    result.push({ family: agg.family, source: null, role: roleFor(key), usage: usageFor(key) });
  }

  // Sort most-used first; ties broken by role importance.
  result.sort((a, b) => {
    if (b.usage !== a.usage) return b.usage - a.usage;
    return ROLE_RANK[a.role ?? 'null'] - ROLE_RANK[b.role ?? 'null'];
  });

  return result;
}

/** Key (lowercased family) of the aggregate with the max score, or null if none > 0. */
function pickMax(aggs: Agg[], score: (a: Agg) => number): string | null {
  let bestKey: string | null = null;
  let best = 0;
  for (const a of aggs) {
    const s = score(a);
    if (s > best) {
      best = s;
      bestKey = a.family.toLowerCase();
    }
  }
  return bestKey;
}
