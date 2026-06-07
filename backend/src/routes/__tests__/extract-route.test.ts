import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createServer, type Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { app } from '../../app.js';
import { closeBrowser } from '../../extractor/browser.js';

const FIXTURE_HTML = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><style>
  :root { --color--primary: #1a73e8; --font-family--heading: "Poppins", sans-serif; }
  body { font-family: "Poppins", sans-serif; color: #1a73e8; }
</style></head><body><h1>Fixture</h1></body></html>`;

let fixture: Server;
let fixtureUrl: string;

beforeAll(async () => {
  fixture = createServer((_req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(FIXTURE_HTML);
  });
  await new Promise<void>((resolve) => fixture.listen(0, '127.0.0.1', resolve));
  fixtureUrl = `http://127.0.0.1:${(fixture.address() as AddressInfo).port}/`;
});

afterAll(async () => {
  await closeBrowser();
  await new Promise<void>((resolve) => fixture.close(() => resolve()));
});

describe('POST /api/extract', () => {
  it('returns 400 invalid_url when url is missing', async () => {
    const res = await request(app).post('/api/extract').send({});
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('invalid_url');
  });

  it('returns 400 invalid_url for a non-http(s) url', async () => {
    const res = await request(app).post('/api/extract').send({ url: 'ftp://example.com' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('invalid_url');
  });

  it('returns 200 with design tokens for a valid page', async () => {
    const res = await request(app).post('/api/extract').send({ url: fixtureUrl });
    expect(res.status).toBe(200);
    expect(res.body.meta.sourceUrl).toBe(fixtureUrl);
    expect(res.body.colors.primary).toBe('#1a73e8');
    expect(res.body.typography.fontFamilies.heading).toContain('Poppins');
  }, 60000);
});
