import { describe, it, expect } from 'vitest';
import { buildDesignTokens, extractRootVariables } from '../design-tokens.js';

describe('extractRootVariables', () => {
  it('collects custom properties from :root and body rules', () => {
    const css = `
      :root { --accent: #451af5; --radius--m: 10px; }
      body { --font-size--l: 18px; color: red; }
      .hero { --not-root: nope; color: blue; }
    `;
    const vars = extractRootVariables(css);
    expect(vars['--accent']).toBe('#451af5');
    expect(vars['--radius--m']).toBe('10px');
    expect(vars['--font-size--l']).toBe('18px');
    // custom properties on non-root selectors are ignored
    expect(vars['--not-root']).toBeUndefined();
  });

  it('returns an empty object for unparseable or var-less CSS', () => {
    expect(extractRootVariables('.x { color: red; }')).toEqual({});
    expect(extractRootVariables('')).toEqual({});
  });
});

const INPUT = {
  sourceUrl: 'https://example.com/',
  scrapedAt: '2026-06-04T00:00:00.000Z',
  fontImports: [
    '@import url(https://fonts.googleapis.com/css?family=Bricolage+Grotesque:regular,500,600);',
  ],
  cssVariables: {
    '--accent': '#451af5',
    '--accent-opacity--8': '#451af514',
    '--white': 'white',
    '--black': 'black',
    '--_fonts---font-family--bricolage-grotesque': '"Bricolage Grotesque", sans-serif',
    '--_fonts---font-size--h1-l': '64px',
    '--_fonts---font-size--l': '18px',
    '--_fonts---font-weight--medium': '500',
    '--_fonts---line-height--l': '136%',
    '--_fonts---letter-spacing--s': '-0.01em',
    '--_sizes---radius--m': '10px',
    '--spacing--section-top-and-bottom': '120px',
    '--easing--smooth': 'cubic-bezier(.4,0,.2,1)',
  },
};

describe('buildDesignTokens', () => {
  it('routes color vars into colors with cleaned keys', () => {
    const t = buildDesignTokens(INPUT) as any;
    expect(t.colors.accent).toBe('#451af5');
    expect(t.colors.white).toBe('white');
    expect(t.colors['accent-opacity-8']).toBe('#451af514');
  });

  it('routes typography vars into the right sub-maps with cleaned keys', () => {
    const t = buildDesignTokens(INPUT) as any;
    expect(t.typography.fontSizes['h1-l']).toBe('64px');
    expect(t.typography.fontSizes.l).toBe('18px');
    expect(t.typography.fontWeights.medium).toBe('500');
    expect(t.typography.lineHeights.l).toBe('136%');
    expect(t.typography.letterSpacing.s).toBe('-0.01em');
    expect(t.typography.fontFamilies['bricolage-grotesque']).toBe('"Bricolage Grotesque", sans-serif');
  });

  it('routes radius and spacing vars', () => {
    const t = buildDesignTokens(INPUT) as any;
    expect(t.radii.m).toBe('10px');
    expect(t.spacing['section-top-and-bottom']).toBe('120px');
  });

  it('builds fonts[] with the matching Google Fonts source URL', () => {
    const t = buildDesignTokens(INPUT) as any;
    const bric = t.fonts.find((f: any) => f.family === 'Bricolage Grotesque');
    expect(bric).toBeDefined();
    expect(bric.source).toContain('fonts.googleapis.com');
    expect(bric.source).toContain('Bricolage+Grotesque');
  });

  it('derives fonts[] from fontImports even when there are no font-family tokens', () => {
    const t = buildDesignTokens({
      sourceUrl: 'https://example.com/',
      scrapedAt: '2026-06-04T00:00:00.000Z',
      cssVariables: { '--accent': '#451af5' },
      fontImports: ['@import url(https://fonts.googleapis.com/css2?family=Poppins:wght@400;600&display=swap);'],
    }) as any;
    const poppins = t.fonts.find((f: any) => f.family === 'Poppins');
    expect(poppins).toBeDefined();
    expect(poppins.source).toContain('Poppins');
  });

  it('drops unrecognized non-color vars (e.g. easing curves)', () => {
    const t = buildDesignTokens(INPUT) as any;
    const all = JSON.stringify(t);
    expect(all).not.toContain('cubic-bezier');
    expect(all).not.toContain('smooth');
  });

  it('omits empty categories entirely', () => {
    const t = buildDesignTokens({
      ...INPUT,
      cssVariables: { '--accent': '#451af5' },
    }) as any;
    expect(t.colors.accent).toBe('#451af5');
    expect(t.radii).toBeUndefined();
    expect(t.spacing).toBeUndefined();
    expect(t.typography).toBeUndefined();
  });

  it('includes meta', () => {
    const t = buildDesignTokens(INPUT) as any;
    expect(t.meta.sourceUrl).toBe('https://example.com/');
    expect(t.meta.scrapedAt).toBe('2026-06-04T00:00:00.000Z');
  });

  it('falls back to a stylesheet scan when a category has no :root tokens', () => {
    const stylesheetCss = `
      .a { color: #ffffff; font-size: 16px; padding: 24px; font-family: Inter, sans-serif; border-radius: 8px; }
      .b { color: #ffffff; font-size: 16px; margin: 24px; }
      .c { color: #111111; font-size: 14px; }
    `;
    const t = buildDesignTokens({
      sourceUrl: 'https://example.com/',
      scrapedAt: '2026-06-04T00:00:00.000Z',
      cssVariables: {}, // no :root tokens
      fontImports: [],
      stylesheetCss,
    }) as any;
    // most-used color (#ffffff x2) ranks first
    expect(Object.values(t.colors)).toContain('#ffffff');
    expect(Object.values(t.colors)).toContain('#111111');
    expect(Object.values(t.typography.fontSizes)).toContain('16px');
    expect(Object.values(t.spacing)).toContain('24px');
    expect(Object.values(t.radii)).toContain('8px');
    expect(t.fonts.find((f: any) => f.family === 'Inter')).toBeDefined();
  });

  it('does NOT scan-fill a category that already has curated tokens', () => {
    const t = buildDesignTokens({
      ...INPUT,
      stylesheetCss: '.x { color: #abcabc; }',
    }) as any;
    // curated colors present → scanned #abcabc must not be added
    expect(Object.values(t.colors)).not.toContain('#abcabc');
    expect(t.colors.accent).toBe('#451af5');
  });

  it('keeps both values on key collision (no silent overwrite)', () => {
    const t = buildDesignTokens({
      ...INPUT,
      cssVariables: { '--a--accent': '#111111', '--b--accent': '#222222' },
    }) as any;
    const vals = Object.values(t.colors);
    expect(vals).toContain('#111111');
    expect(vals).toContain('#222222');
  });

  it('renames opaque (Framer UUID) color keys to sequential color-N, keeping values', () => {
    const t = buildDesignTokens({
      sourceUrl: 'https://example.com/',
      scrapedAt: '2026-06-04T00:00:00.000Z',
      fontImports: [],
      cssVariables: {
        '--accent': '#451af5',
        '--token-6a654daf-6ffe-472a-b0b1-14b903b000a5': '#38e8f5',
        '--token-a3757122-0595-44ef-b8ab-d78b01053cf6': '#032d30',
      },
    }) as any;
    // semantic key is preserved
    expect(t.colors.accent).toBe('#451af5');
    // no UUID-bearing keys remain
    const keys = Object.keys(t.colors);
    expect(keys.some((k) => /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i.test(k))).toBe(false);
    // values survive under generated names
    const vals = Object.values(t.colors);
    expect(vals).toContain('#38e8f5');
    expect(vals).toContain('#032d30');
    expect(keys).toContain('color-1');
  });

  it('keeps the full font source URL even when it contains a semicolon', () => {
    const t = buildDesignTokens({
      sourceUrl: 'https://example.com/',
      scrapedAt: '2026-06-04T00:00:00.000Z',
      cssVariables: {},
      fontImports: ['@import url("https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,400;1,400&display=swap");'],
    }) as any;
    const lato = t.fonts.find((f: any) => f.family === 'Lato');
    expect(lato).toBeDefined();
    expect(lato.source).toContain(';1,400'); // part after the semicolon survived
    expect(lato.source).toContain('display=swap');
  });
});
