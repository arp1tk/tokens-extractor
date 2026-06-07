import { describe, it, expect } from 'vitest';
import { buildStyleProfile } from '../style-profile.js';

describe('buildStyleProfile', () => {
  it('derives a light, rounded, airy, gradient profile', () => {
    const p = buildStyleProfile({
      colorRoles: { primary: '#451af5', background: 'rgb(255, 255, 255)', text: 'rgb(11, 16, 32)' },
      radii: { a: '10px', b: '12px', c: '8px' },
      spacing: { x: '32px', y: '40px', z: '24px' },
      shadows: { sm: '0 1px 2px rgba(0,0,0,.1)' },
      gradients: ['linear-gradient(90deg,#451af5,#2700d7)'],
    });
    expect(p.brandColor).toBe('#451af5');
    expect(p.isDark).toBe(false);
    expect(p.cornerStyle).toBe('rounded');
    expect(p.density).toBe('airy');
    expect(p.elevation).toBe('subtle');
    expect(p.hasGradients).toBe(true);
    expect(p.vibe).toEqual(expect.arrayContaining(['rounded', 'spacious', 'vibrant', 'high-contrast']));
  });

  it('derives a dark, sharp, tight, flat profile', () => {
    const p = buildStyleProfile({
      colorRoles: { background: 'rgb(10, 10, 12)', text: 'rgb(240, 240, 240)' },
      radii: {},
      spacing: { a: '8px', b: '10px' },
      shadows: {},
      gradients: [],
    });
    expect(p.isDark).toBe(true);
    expect(p.cornerStyle).toBe('sharp');
    expect(p.density).toBe('tight');
    expect(p.elevation).toBe('flat');
    expect(p.hasGradients).toBe(false);
    expect(p.vibe).toEqual(expect.arrayContaining(['dark', 'minimal', 'compact']));
  });

  it('detects pill corners from 50% / 9999px radii', () => {
    const p = buildStyleProfile({ radii: { pill: '9999px', circle: '50%' } });
    expect(p.cornerStyle).toBe('pill');
  });

  it('handles empty input without throwing', () => {
    const p = buildStyleProfile({});
    expect(p.cornerStyle).toBe('sharp');
    expect(p.density).toBe('balanced');
    expect(p.elevation).toBe('flat');
    expect(p.hasGradients).toBe(false);
    expect(p.brandColor).toBeUndefined();
  });
});
