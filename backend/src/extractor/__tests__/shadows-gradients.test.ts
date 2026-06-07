import { describe, it, expect } from 'vitest';
import { extractShadows, extractGradients } from '../shadows-gradients.js';

describe('extractShadows', () => {
  it('collects distinct box-shadows, drops none, names by elevation', () => {
    const css = `
      .a { box-shadow: 0 1px 2px rgba(0,0,0,0.1); }
      .b { box-shadow: 0 1px 2px rgba(0,0,0,0.1); }
      .c { box-shadow: 0 10px 30px rgba(0,0,0,0.2); }
      .d { box-shadow: none; }
      .e { box-shadow: unset; }
      .f { box-shadow: inherit; }
    `;
    const sh = extractShadows(css);
    expect(Object.keys(sh)).toEqual(['sm', 'md']); // sorted small -> large elevation
    expect(sh.sm).toContain('2px');
    expect(sh.md).toContain('30px');
    // CSS global keywords are not real shadows
    const values = Object.values(sh);
    expect(values).not.toContain('none');
    expect(values).not.toContain('unset');
    expect(values).not.toContain('inherit');
  });

  it('returns an empty object when there are no shadows or CSS is unparseable', () => {
    expect(extractShadows('.x { color: red; }')).toEqual({});
    expect(extractShadows('')).toEqual({});
  });
});

describe('extractGradients', () => {
  it('collects distinct gradients ranked by frequency', () => {
    const css = `
      .a { background: linear-gradient(90deg, #451af5, #2700d7); }
      .b { background-image: linear-gradient(90deg, #451af5, #2700d7); }
      .c { background: radial-gradient(circle, #fff, #000); }
    `;
    const g = extractGradients(css);
    expect(g).toHaveLength(2);
    expect(g[0]).toContain('linear-gradient'); // appears twice -> first
    expect(g.some((x) => x.includes('radial-gradient'))).toBe(true);
  });

  it('returns an empty array when there are no gradients', () => {
    expect(extractGradients('.x { background: #fff; }')).toEqual([]);
  });
});
