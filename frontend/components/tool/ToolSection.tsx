'use client';

import { useState } from 'react';
import type { Tokens, ApiError } from '@/lib/tokens';
import HeroDecor from './HeroDecor';
import Results from './Results';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:5000';

type Status = 'idle' | 'loading' | 'done' | 'error';

export default function ToolSection() {
  const [url, setUrl] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [data, setData] = useState<Tokens | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim() || status === 'loading') return;
    setStatus('loading');
    setError(null);
    setData(null);
    try {
      const resp = await fetch(`${BACKEND_URL}/api/extract`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      });
      const json = await resp.json();
      if (!resp.ok) {
        setError((json as ApiError)?.error?.message ?? 'Extraction failed.');
        setStatus('error');
        return;
      }
      setData(json as Tokens);
      setStatus('done');
    } catch {
      setError('Network error — could not reach the API.');
      setStatus('error');
    }
  }

  return (
    <div className="container !pb-12 !pt-24 max-[860px]:!pt-16" id="tool" data-section="tool">
      <HeroDecor busy={status === 'loading' || status === 'done'} />
      <div className="relative z-[1] mx-auto max-w-[780px] text-center">
        <h1 className="hero-title max-[479px]:!text-[30px] max-[479px]:!leading-[1.12] max-[360px]:!text-[26px]">
          Extract design{' '}
          <span className="relative inline-block whitespace-nowrap">
            tokens
            <svg
              className="pointer-events-none absolute -bottom-[0.04em] left-0 h-[0.3em] w-full"
              viewBox="0 0 200 16"
              preserveAspectRatio="none"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M4 10 C 50 3, 95 3, 140 8 C 166 11, 186 11, 196 7"
                stroke="#87ed82"
                strokeWidth="8"
                strokeLinecap="round"
              />
            </svg>
          </span>{' '}
          from any website
        </h1>
        <p className="mx-auto mb-[34px] mt-[18px] max-w-[600px] font-body text-lg leading-[1.6] text-[#000000d9]">
          Paste a URL and get its colors, typography, spacing, shadows and a full style profile as
          clean JSON — ready to hand to an AI to build from.
        </p>
        <form className="w-full" onSubmit={handleSubmit}>
          <div className="flex items-center gap-1.5 rounded-[14px] border border-[color:var(--elements-stroke,#cbcbcb)] bg-white p-1.5 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-[border-color,box-shadow] duration-150 focus-within:border-brand focus-within:shadow-[0_0_0_3px_rgba(135,237,130,0.35)] max-[560px]:flex-col max-[560px]:gap-2.5 max-[560px]:rounded-none max-[560px]:border-0 max-[560px]:bg-transparent max-[560px]:p-0 max-[560px]:shadow-none max-[560px]:focus-within:shadow-none">
            <input
              className="h-[50px] min-w-0 flex-1 border-0 bg-transparent px-4 font-body text-base text-black outline-none placeholder:text-[#00000059] max-[560px]:h-[52px] max-[560px]:w-full max-[560px]:flex-none max-[560px]:rounded-[12px] max-[560px]:border max-[560px]:border-[color:var(--elements-stroke,#cbcbcb)] max-[560px]:bg-white max-[560px]:shadow-[0_1px_2px_rgba(0,0,0,0.04)] max-[560px]:focus:border-brand max-[560px]:focus:shadow-[0_0_0_3px_rgba(135,237,130,0.35)]"
              name="url"
              placeholder="https://example.webflow.io"
              type="url"
              required
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
            <button
              type="submit"
              className="h-[50px] cursor-pointer rounded-[10px] border-none bg-brand px-7 font-main text-base font-semibold text-[#08240a] transition-[filter] duration-150 hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60 max-[560px]:h-[52px] max-[560px]:w-full max-[560px]:rounded-[12px]"
              disabled={status === 'loading'}
            >
              Extract
            </button>
          </div>
        </form>
        <div className="mt-3 font-body text-[13px] text-[#00000073]">
          Works with Webflow · Framer · any live site.
        </div>
      </div>

      {status === 'loading' && (
        <div className="relative z-[1] mt-8 flex items-center justify-center gap-2.5" role="status" aria-live="polite">
          <span className="inline-flex items-center gap-[5px]" aria-hidden="true">
            <i className="h-2.5 w-2.5 animate-te-dot rounded-full bg-brand [animation-delay:-0.32s] motion-reduce:animate-none motion-reduce:opacity-80"></i>
            <i className="h-2.5 w-2.5 animate-te-dot rounded-full bg-brand [animation-delay:-0.16s] motion-reduce:animate-none motion-reduce:opacity-80"></i>
            <i className="h-2.5 w-2.5 animate-te-dot rounded-full bg-brand motion-reduce:animate-none motion-reduce:opacity-80"></i>
          </span>
          <span className="font-body text-[15px] tracking-[0.01em] text-[#00000099]">Extracting</span>
        </div>
      )}
      {status === 'error' && error && (
        <p className="mt-4 rounded-xl border border-[color:var(--elements-stroke,#cbcbcb)] bg-[color:var(--hoved-color,#f7f7f7)] px-4 py-3 font-body text-[15px] text-black">
          <strong>Couldn&apos;t extract — </strong>
          {error}
        </p>
      )}
      {status === 'done' && data && <Results data={data} />}
    </div>
  );
}
