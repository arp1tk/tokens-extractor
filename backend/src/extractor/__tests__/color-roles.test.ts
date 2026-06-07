import { describe, it, expect } from 'vitest';
import { classifyColorRoles, type ColorSample } from '../color-roles.js';

describe('classifyColorRoles', () => {
  it('assigns background/surface/text/muted/border/primary roles', () => {
    const samples: ColorSample[] = [
      { kind: 'text', color: 'rgb(11, 16, 32)', weight: 1000 }, // dominant dark text
      { kind: 'text', color: 'rgb(134, 134, 131)', weight: 200 }, // muted grey text
      { kind: 'background', color: 'rgb(255, 255, 255)', weight: 500000 }, // page bg
      { kind: 'background', color: 'rgb(247, 248, 248)', weight: 100000 }, // card surface
      { kind: 'border', color: 'rgba(0, 0, 0, 0.1)', weight: 50 },
      { kind: 'background', color: 'rgb(69, 26, 245)', weight: 3000, interactive: true }, // button bg (brand)
    ];
    const roles = classifyColorRoles(samples);
    expect(roles.text).toBe('rgb(11, 16, 32)');
    expect(roles.muted).toBe('rgb(134, 134, 131)');
    expect(roles.background).toBe('rgb(255, 255, 255)');
    expect(roles.surface).toBe('rgb(247, 248, 248)');
    expect(roles.border).toBe('rgba(0, 0, 0, 0.1)');
    expect(roles.primary).toBe('rgb(69, 26, 245)'); // saturated, on interactive element
  });

  it('derives primary from a saturated link color when no button background exists', () => {
    const roles = classifyColorRoles([
      { kind: 'text', color: 'rgb(11, 16, 32)', weight: 1000 },
      { kind: 'background', color: 'rgb(255, 255, 255)', weight: 9000 },
      { kind: 'text', color: 'rgb(69, 26, 245)', weight: 80, interactive: true }, // link
    ]);
    expect(roles.primary).toBe('rgb(69, 26, 245)');
  });

  it('muted = a readable neutral secondary, never white-on-dark or a saturated link color', () => {
    const roles = classifyColorRoles([
      { kind: 'background', color: 'rgb(255, 255, 255)', weight: 500000 },
      { kind: 'text', color: 'rgb(11, 16, 32)', weight: 1000 }, // main dark text
      { kind: 'text', color: 'rgb(255, 255, 255)', weight: 300 }, // white text on a dark hero — excluded
      { kind: 'text', color: 'rgb(69, 26, 245)', weight: 400 }, // saturated link color — excluded
      { kind: 'text', color: 'rgb(134, 134, 131)', weight: 200 }, // grey muted text — chosen
    ]);
    expect(roles.text).toBe('rgb(11, 16, 32)');
    expect(roles.muted).toBe('rgb(134, 134, 131)');
  });

  it('omits muted when there is no readable neutral secondary text color', () => {
    const roles = classifyColorRoles([
      { kind: 'background', color: 'rgb(255, 255, 255)', weight: 500000 },
      { kind: 'text', color: 'rgb(11, 16, 32)', weight: 1000 },
      { kind: 'text', color: 'rgb(69, 26, 245)', weight: 400 }, // only other text is the saturated link
    ]);
    expect(roles.muted).toBeUndefined();
  });

  it('ignores fully transparent colors', () => {
    const roles = classifyColorRoles([
      { kind: 'background', color: 'rgba(0, 0, 0, 0)', weight: 999999 },
      { kind: 'background', color: 'rgb(255, 255, 255)', weight: 100 },
      { kind: 'text', color: 'rgb(0, 0, 0)', weight: 100 },
    ]);
    expect(roles.background).toBe('rgb(255, 255, 255)');
  });

  it('returns an empty object for no samples', () => {
    expect(classifyColorRoles([])).toEqual({});
  });
});
