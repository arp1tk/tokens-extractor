import { app } from './app.js';
import { closeBrowser } from './extractor/browser.js';

const PORT = Number(process.env.PORT) || 5000;

const server = app.listen(PORT, () => {
  console.log(`token-extractor API listening on http://localhost:${PORT}`);
});

// Clean up the shared browser on shutdown.
async function shutdown(signal: string): Promise<void> {
  console.log(`\n${signal} received — shutting down...`);
  server.close();
  await closeBrowser();
  process.exit(0);
}

process.on('SIGINT', () => void shutdown('SIGINT'));
process.on('SIGTERM', () => void shutdown('SIGTERM'));
