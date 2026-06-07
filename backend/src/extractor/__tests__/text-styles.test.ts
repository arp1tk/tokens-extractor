import { describe, it, expect } from 'vitest';
import { buildTextStyles, type TextStyleSample } from '../text-styles.js';

const s = (over: Partial<TextStyleSample>): TextStyleSample => ({
  role: 'body',
  family: 'Inter',
  sizePx: 16,
  weight: 400,
  lineHeightPx: 0,
  letterSpacing: 'normal',
  ...over,
});

describe('buildTextStyles', () => {
  it('builds a recipe per role with unitless line-height', () => {
    const samples: TextStyleSample[] = [
      s({ role: 'h1', family: 'Bricolage Grotesque', sizePx: 64, weight: 700, lineHeightPx: 70.4 }),
      s({ role: 'h1', family: 'Bricolage Grotesque', sizePx: 64, weight: 700, lineHeightPx: 70.4 }),
      s({ role: 'body', family: 'Inter', sizePx: 18, weight: 400, lineHeightPx: 28.8 }),
      s({ role: 'body', family: 'Inter', sizePx: 18, weight: 400, lineHeightPx: 28.8 }),
    ];
    const t = buildTextStyles(samples);
    expect(t.h1).toEqual({ family: 'Bricolage Grotesque', size: '64px', weight: 700, lineHeight: 1.1 });
    expect(t.body!.lineHeight).toBe(1.6);
  });

  it('picks the most common combo per role (mode)', () => {
    const samples: TextStyleSample[] = [
      s({ role: 'h2', sizePx: 48, weight: 600 }),
      s({ role: 'h2', sizePx: 48, weight: 600 }),
      s({ role: 'h2', sizePx: 48, weight: 600 }),
      s({ role: 'h2', sizePx: 30, weight: 600 }),
    ];
    expect(buildTextStyles(samples).h2!.size).toBe('48px');
  });

  it('includes letterSpacing only when meaningful', () => {
    const t = buildTextStyles([
      s({ role: 'link', sizePx: 16, weight: 500, letterSpacing: '-0.16px' }),
      s({ role: 'h3', sizePx: 24, weight: 600, letterSpacing: 'normal' }),
    ]);
    expect(t.link!.letterSpacing).toBe('-0.16px');
    expect(t.h3!.letterSpacing).toBeUndefined();
  });

  it('omits lineHeight when not resolvable', () => {
    const t = buildTextStyles([s({ role: 'body', sizePx: 16, lineHeightPx: 0 })]);
    expect(t.body!.lineHeight).toBeUndefined();
  });

  it('returns an empty object for no samples', () => {
    expect(buildTextStyles([])).toEqual({});
  });
});
