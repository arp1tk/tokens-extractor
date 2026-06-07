import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createServer, type Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { extractTokens } from '../extract-tokens.js';
import { closeBrowser } from '../browser.js';
import { ExtractError } from '../errors.js';

// A self-contained fixture: a :root token block plus a few hardcoded values.
// No external requests, so the test is hermetic.
const FIXTURE_HTML = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<style>
  :root {
    --color--primary: #1a73e8;
    --font-size--lg: 20px;
    --radius--md: 12px;
    --spacing--lg: 32px;
    --font-family--heading: "Poppins", sans-serif;
  }
  body { font-family: "Poppins", sans-serif; color: #0b1020; background: #ffffff; }
  h1 { font-family: "Bricolage Grotesque", serif; }
  .hero { background: linear-gradient(90deg, #1a73e8, #2700d7); padding: 64px; }
  .card { border-radius: 12px; padding: 32px; background: #f7f8f8; box-shadow: 0 10px 30px rgba(0,0,0,0.15); border: 1px solid #0000001a; }
  .btn { background: #1a73e8; color: #ffffff; border-radius: 12px; padding: 12px 24px; }
</style>
</head>
<body>
  <section class="hero"><h1>Big Heading</h1></section>
  <p class="card">This is a long paragraph of body copy that should dominate the on-page text volume so the body font wins by usage.</p>
  <button class="btn">Click me now</button>
</body>
</html>`;

let server: Server;
let baseUrl: string;

beforeAll(async () => {
  server = createServer((_req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(FIXTURE_HTML);
  });
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const port = (server.address() as AddressInfo).port;
  baseUrl = `http://127.0.0.1:${port}/`;
});

afterAll(async () => {
  await closeBrowser();
  await new Promise<void>((resolve) => server.close(() => resolve()));
});

describe('extractTokens (integration, real browser)', () => {
  it('extracts design tokens from a rendered fixture page', async () => {
    const tokens = (await extractTokens(baseUrl)) as any;

    // meta echoes the source URL
    expect(tokens.meta.sourceUrl).toBe(baseUrl);
    expect(typeof tokens.meta.scrapedAt).toBe('string');

    // :root tokens routed into the right categories
    expect(tokens.colors.primary).toBe('#1a73e8');
    expect(tokens.typography.fontSizes.lg).toBe('20px');
    expect(tokens.radii.md).toBe('12px');
    expect(tokens.spacing.lg).toBe('32px');
    expect(tokens.typography.fontFamilies.heading).toContain('Poppins');

    // fonts[] derived from the font-family token (no @import, so source is null)
    const poppins = tokens.fonts.find((f: any) => f.family === 'Poppins');
    expect(poppins).toBeDefined();
  }, 60000);

  it('annotates fonts with role and usage from the rendered page', async () => {
    const tokens = (await extractTokens(baseUrl)) as any;

    const poppins = tokens.fonts.find((f: any) => f.family === 'Poppins');
    const bricolage = tokens.fonts.find((f: any) => f.family === 'Bricolage Grotesque');

    // body copy dominates → Poppins is the body font with the larger share
    expect(poppins.role).toBe('body');
    // heading-only font, detected from the rendered <h1> even without a token
    expect(bricolage.role).toBe('heading');
    expect(poppins.usage).toBeGreaterThan(bricolage.usage);
    // sorted most-used first
    expect(tokens.fonts[0].family).toBe('Poppins');
  }, 60000);

  it('emits Tier 1 enhancement tokens (colorRoles, textStyles, shadows, gradients, styleProfile)', async () => {
    const tokens = (await extractTokens(baseUrl)) as any;

    // colorRoles
    expect(tokens.colorRoles.background).toContain('255, 255, 255');
    expect(tokens.colorRoles.primary).toContain('26, 115, 232'); // button brand color
    expect(tokens.colorRoles.text).toBeDefined();

    // textStyles
    expect(tokens.textStyles.h1.family).toBe('Bricolage Grotesque');
    expect(tokens.textStyles.body.family).toBe('Poppins');

    // shadows + gradients
    expect(Object.values(tokens.shadows).join(' ')).toContain('30px');
    expect(tokens.gradients[0]).toContain('linear-gradient');

    // styleProfile
    expect(tokens.styleProfile.cornerStyle).toBe('rounded');
    expect(tokens.styleProfile.elevation).toBe('deep');
    expect(tokens.styleProfile.hasGradients).toBe(true);
    expect(tokens.styleProfile.isDark).toBe(false);
    expect(tokens.styleProfile.brandColor).toBeDefined();
  }, 60000);

  it('throws navigation_failed (502) for an unreachable host', async () => {
    // .invalid never resolves — a deterministic DNS failure, no real network used.
    await expect(extractTokens('http://nonexistent.invalid/')).rejects.toMatchObject({
      code: 'navigation_failed',
      status: 502,
    });
    await expect(extractTokens('http://nonexistent.invalid/')).rejects.toBeInstanceOf(ExtractError);
  }, 30000);
});
