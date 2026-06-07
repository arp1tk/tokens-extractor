import { Router, type Request, type Response } from 'express';
import { extractTokens } from '../extractor/extract-tokens.js';
import { ExtractError } from '../extractor/errors.js';

export const extractRouter = Router();

function isHttpUrl(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

extractRouter.post('/extract', async (req: Request, res: Response) => {
  const url = (req.body as { url?: unknown } | undefined)?.url;

  if (!isHttpUrl(url)) {
    res.status(400).json({
      error: { code: 'invalid_url', message: 'Body must include a valid http(s) "url".' },
    });
    return;
  }

  try {
    const tokens = await extractTokens(url);
    res.status(200).json(tokens);
  } catch (err) {
    if (err instanceof ExtractError) {
      res.status(err.status).json({ error: { code: err.code, message: err.message } });
      return;
    }
    res.status(500).json({
      error: { code: 'internal_error', message: 'Failed to extract design tokens.' },
    });
  }
});
