import * as csstree from 'css-tree';

const SHADOW_SCALE = ['sm', 'md', 'lg', 'xl', '2xl', '3xl'];
const NON_SHADOW = new Set(['none', 'unset', 'initial', 'inherit', 'revert', 'revert-layer']);
const MAX_SHADOWS = SHADOW_SCALE.length;
const MAX_GRADIENTS = 8;

/** Approximate elevation: sum of absolute px magnitudes in the shadow value. */
function elevationMetric(value: string): number {
  let total = 0;
  for (const m of value.matchAll(/-?\d*\.?\d+px/g)) total += Math.abs(parseFloat(m[0]));
  return total;
}

/**
 * Scan stylesheet text for distinct `box-shadow` values, drop `none`, keep the
 * most frequent (up to the scale length), and name them sm/md/lg… ascending by
 * elevation. Returns `{}` on parse failure or when none are found.
 */
export function extractShadows(css: string): Record<string, string> {
  let ast: csstree.CssNode;
  try {
    ast = csstree.parse(css);
  } catch {
    return {};
  }

  const counts = new Map<string, number>();
  csstree.walk(ast, {
    visit: 'Declaration',
    enter(decl: csstree.Declaration) {
      const prop = decl.property.toLowerCase();
      if (prop !== 'box-shadow' && prop !== '-webkit-box-shadow') return;
      const value = csstree.generate(decl.value).trim();
      if (!value || NON_SHADOW.has(value.toLowerCase())) return;
      counts.set(value, (counts.get(value) ?? 0) + 1);
    },
  });

  if (counts.size === 0) return {};

  const top = [...counts.entries()]
    .sort((a, b) => b[1] - a[1]) // most frequent first
    .slice(0, MAX_SHADOWS)
    .map(([value]) => value)
    .sort((a, b) => elevationMetric(a) - elevationMetric(b)); // then small -> large

  const out: Record<string, string> = {};
  top.forEach((value, i) => {
    const name = SHADOW_SCALE[i];
    if (name) out[name] = value;
  });
  return out;
}

/**
 * Scan stylesheet text for distinct gradient functions (linear/radial/conic),
 * ranked by frequency. Returns `[]` on parse failure or when none are found.
 */
export function extractGradients(css: string): string[] {
  let ast: csstree.CssNode;
  try {
    ast = csstree.parse(css);
  } catch {
    return [];
  }

  const counts = new Map<string, number>();
  csstree.walk(ast, {
    visit: 'Function',
    enter(node: csstree.FunctionNode) {
      if (!/(^|-)gradient$/i.test(node.name)) return;
      const value = csstree.generate(node).trim();
      counts.set(value, (counts.get(value) ?? 0) + 1);
    },
  });

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, MAX_GRADIENTS)
    .map(([value]) => value);
}
