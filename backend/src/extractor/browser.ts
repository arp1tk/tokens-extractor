import { chromium, type Browser } from 'playwright';

/**
 * A single Chromium instance, launched lazily on first use and kept warm so we
 * don't pay the ~1s launch cost on every request. Each request opens its own
 * context/page (see extract-tokens.ts) and closes it when done.
 */
let browserPromise: Promise<Browser> | null = null;

export async function getBrowser(): Promise<Browser> {
  if (!browserPromise) {
    browserPromise = chromium
      .launch({
        headless: true,
        // Required to launch Chromium inside a container (Render/Docker), where
        // the kernel sandbox isn't available and /dev/shm is tiny.
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
      })
      .catch((err: unknown) => {
        // Reset so a failed launch can be retried on the next request.
        browserPromise = null;
        throw err;
      });
  }
  return browserPromise;
}

/** Close the shared browser (used on shutdown and in tests). */
export async function closeBrowser(): Promise<void> {
  if (!browserPromise) return;
  const pending = browserPromise;
  browserPromise = null;
  const browser = await pending.catch(() => null);
  if (browser) await browser.close();
}
