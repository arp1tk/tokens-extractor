import express from 'express';
import cors from 'cors';
import { extractRouter } from './routes/extract.js';

export const app = express();

// Allow the frontend (different origin) to call this API directly from the
// browser. Set CORS_ORIGIN (e.g. https://app.example.com) to restrict; by
// default any origin is allowed since the API is public and uses no cookies.
app.use(cors({ origin: process.env.CORS_ORIGIN ?? true }));

app.use(express.json());

app.get('/', (_req, res) => {
  res.json({ status: 'running' });
});

app.use('/api', extractRouter);
