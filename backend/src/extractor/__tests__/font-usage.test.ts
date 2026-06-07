import { describe, it, expect } from 'vitest';
import { classifyFontUsage, type FontUsageSample } from '../font-usage.js';

type Font = { family: string; source: string | null };

describe('classifyFontUsage', () => {
  it('labels a distinct body and heading font with usage %', () => {
    const fonts: Font[] = [
      { family: 'Inter', source: 'i' },
      { family: 'Bricolage Grotesque', source: 'b' },
    ];
    const samples: FontUsageSample[] = [
      { family: 'Inter', bodyChars: 800, headingChars: 0, isMono: false },
      { family: 'Bricolage Grotesque', bodyChars: 0, headingChars: 200, isMono: false },
    ];
    const out = classifyFontUsage(fonts, samples);

    // sorted most-used first
    expect(out[0]!.family).toBe('Inter');
    expect(out[0]!.role).toBe('body');
    expect(out[0]!.usage).toBe(80);
    const bric = out.find((f) => f.family === 'Bricolage Grotesque')!;
    expect(bric.role).toBe('heading');
    expect(bric.usage).toBe(20);
    expect(bric.source).toBe('b'); // source preserved
  });

  it('reports a single font used everywhere as body ~100% with no heading role', () => {
    const out = classifyFontUsage(
      [{ family: 'Inter', source: 'i' }],
      [{ family: 'Inter', bodyChars: 900, headingChars: 100, isMono: false }],
    );
    expect(out).toHaveLength(1);
    expect(out[0]!.role).toBe('body');
    expect(out[0]!.usage).toBe(100);
  });

  it('labels a monospace family as mono', () => {
    const out = classifyFontUsage(
      [
        { family: 'Inter', source: 'i' },
        { family: 'JetBrains Mono', source: 'j' },
      ],
      [
        { family: 'Inter', bodyChars: 950, headingChars: 0, isMono: false },
        { family: 'JetBrains Mono', bodyChars: 50, headingChars: 0, isMono: true },
      ],
    );
    expect(out.find((f) => f.family === 'Inter')!.role).toBe('body');
    expect(out.find((f) => f.family === 'JetBrains Mono')!.role).toBe('mono');
  });

  it('labels a low-share non-heading family as accent', () => {
    const out = classifyFontUsage(
      [
        { family: 'Inter', source: 'i' },
        { family: 'Bricolage Grotesque', source: 'b' },
        { family: 'Caveat', source: 'c' },
      ],
      [
        { family: 'Inter', bodyChars: 900, headingChars: 0, isMono: false },
        { family: 'Bricolage Grotesque', bodyChars: 0, headingChars: 80, isMono: false },
        { family: 'Caveat', bodyChars: 20, headingChars: 0, isMono: false },
      ],
    );
    expect(out.find((f) => f.family === 'Caveat')!.role).toBe('accent');
  });

  it('marks a listed-but-never-rendered font as usage 0, role null', () => {
    const out = classifyFontUsage(
      [
        { family: 'Inter', source: 'i' },
        { family: 'Ghost', source: 'g' },
      ],
      [{ family: 'Inter', bodyChars: 100, headingChars: 0, isMono: false }],
    );
    const ghost = out.find((f) => f.family === 'Ghost')!;
    expect(ghost.usage).toBe(0);
    expect(ghost.role).toBeNull();
  });

  it('adds a rendered font that was not in the fonts list (source null)', () => {
    const out = classifyFontUsage(
      [],
      [{ family: 'Arial', bodyChars: 100, headingChars: 0, isMono: false }],
    );
    expect(out).toHaveLength(1);
    expect(out[0]!.family).toBe('Arial');
    expect(out[0]!.source).toBeNull();
    expect(out[0]!.role).toBe('body');
    expect(out[0]!.usage).toBe(100);
  });

  it('matches families case-insensitively when merging', () => {
    const out = classifyFontUsage(
      [{ family: 'Inter', source: 'i' }],
      [{ family: 'inter', bodyChars: 100, headingChars: 0, isMono: false }],
    );
    expect(out).toHaveLength(1);
    expect(out[0]!.family).toBe('Inter'); // keeps the canonical cased name from fonts[]
    expect(out[0]!.usage).toBe(100);
    expect(out[0]!.source).toBe('i');
  });
});
