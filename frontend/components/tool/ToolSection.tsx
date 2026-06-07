'use client';

import { useState } from 'react';
import type { Tokens, ApiError, TextStyle, FontEntry } from '@/lib/tokens';
import './tool.css';

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
    <div className="container" id="tool" data-section="tool">
      <div className="hero-decor" aria-hidden="true">
        <svg className="hero-ring ring-a" width="240" height="240" viewBox="0 0 240 240" fill="none">
          <circle cx="120" cy="120" r="60" stroke="#87ed82" strokeOpacity="0.55" />
          <circle cx="120" cy="120" r="90" stroke="#87ed82" strokeOpacity="0.32" />
          <circle cx="120" cy="120" r="119" stroke="#87ed82" strokeOpacity="0.16" />
        </svg>
        <svg className="hero-ring ring-b" width="180" height="180" viewBox="0 0 180 180" fill="none">
          <circle cx="90" cy="90" r="44" stroke="#87ed82" strokeOpacity="0.5" />
          <circle cx="90" cy="90" r="68" stroke="#87ed82" strokeOpacity="0.28" />
          <circle cx="90" cy="90" r="89" stroke="#87ed82" strokeOpacity="0.14" />
        </svg>
      </div>
      <div className="hero-tool">
        <h1 className="hero-title">Extract design tokens from any website</h1>
        <p className="hero-tool-sub">
          Paste a URL and get its colors, typography, spacing, shadows and a full style profile as
          clean JSON — ready to hand to an AI to build from.
        </p>
        <form className="tool-form" onSubmit={handleSubmit}>
          <div className="tool-inputwrap">
            <input
              className="tool-input"
              name="url"
              placeholder="https://example.webflow.io"
              type="url"
              required
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
            <button type="submit" className="tool-submit" disabled={status === 'loading'}>
              Extract
            </button>
          </div>
        </form>
        <div className="tool-hint">Works with Webflow · Framer · any live site.</div>
      </div>

      {status === 'loading' && (
        <div className="te-loading" role="status" aria-live="polite">
          <span className="te-dots" aria-hidden="true">
            <i></i>
            <i></i>
            <i></i>
          </span>
          <span className="te-loading-label">Extracting</span>
        </div>
      )}
      {status === 'error' && error && (
        <p className="te-status error">
          <strong>Couldn&apos;t extract — </strong>
          {error}
        </p>
      )}
      {status === 'done' && data && <Results data={data} />}
    </div>
  );
}

function Results({ data }: { data: Tokens }) {
  const [showRaw, setShowRaw] = useState(false);
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  return (
    <div className="te-results">
      <div className="te-results-head">
        <div>
          <p className="te-results-title">Design tokens</p>
          <span className="te-source">{data.meta?.sourceUrl}</span>
        </div>
        <div className="te-actions">
          <button className="te-btn" onClick={() => setShowRaw((v) => !v)}>
            {showRaw ? 'Visual' : '{ } Raw'}
          </button>
          <button className="te-btn primary" onClick={copy}>
            {copied ? 'Copied!' : 'Copy JSON'}
          </button>
        </div>
      </div>

      {data.warning && <p className="te-status error">{data.warning}</p>}

      {showRaw ? (
        <pre className="te-raw">{JSON.stringify(data, null, 2)}</pre>
      ) : (
        <div className="te-grid">
          {data.styleProfile && <StyleProfileCard p={data.styleProfile} />}
          {data.colorRoles && <SwatchCard title="Color roles" colors={data.colorRoles} />}
          {data.colors && (
            <SwatchCard title={`Palette (${Object.keys(data.colors).length})`} colors={data.colors} full />
          )}
          {data.textStyles && <TextStylesCard styles={data.textStyles} />}
          {data.fonts && data.fonts.length > 0 && <FontsCard fonts={data.fonts} />}
          {data.shadows && <ShadowsCard shadows={data.shadows} />}
          {data.gradients && data.gradients.length > 0 && <GradientsCard gradients={data.gradients} />}
          {data.spacing && <ScaleCard title="Spacing" map={data.spacing} />}
          {data.radii && <ScaleCard title="Radii" map={data.radii} />}
        </div>
      )}
    </div>
  );
}

function StyleProfileCard({ p }: { p: NonNullable<Tokens['styleProfile']> }) {
  const chips = [
    p.brandColor && `brand ${p.brandColor}`,
    p.isDark ? 'dark' : 'light',
    `corners: ${p.cornerStyle}`,
    `density: ${p.density}`,
    `elevation: ${p.elevation}`,
    ...p.vibe,
  ].filter(Boolean) as string[];
  return (
    <section className="te-card full">
      <h3 className="te-card-title">Style profile</h3>
      <div className="te-chips">
        {chips.map((c) => (
          <span key={c} className="te-chip">{c}</span>
        ))}
      </div>
    </section>
  );
}

function SwatchCard({ title, colors, full }: { title: string; colors: Record<string, string>; full?: boolean }) {
  return (
    <section className={`te-card${full ? ' full' : ''}`}>
      <h3 className="te-card-title">{title}</h3>
      <div className="te-swatches">
        {Object.entries(colors).map(([name, value]) => (
          <div key={name}>
            <div className="te-swatch-box" style={{ background: value }} />
            <div className="te-swatch-name">{name}</div>
            <div className="te-swatch-val">{value}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function clampPreview(size: string): string {
  const px = parseFloat(size);
  if (!Number.isNaN(px)) return `${Math.min(px, 34)}px`;
  return size;
}

function TextStylesCard({ styles }: { styles: Record<string, TextStyle> }) {
  return (
    <section className="te-card full">
      <h3 className="te-card-title">Text styles</h3>
      {Object.entries(styles).map(([role, s]) => (
        <div key={role} className="te-type-row">
          <span
            className="te-type-sample"
            style={{
              fontFamily: s.family,
              fontSize: clampPreview(s.size),
              fontWeight: s.weight,
              lineHeight: s.lineHeight ?? undefined,
              letterSpacing: s.letterSpacing ?? undefined,
            }}
          >
            {role}
          </span>
          <span className="te-type-spec">
            {s.family} · {s.size} · {s.weight}
            {s.lineHeight ? ` · lh ${s.lineHeight}` : ''}
            {s.letterSpacing ? ` · ls ${s.letterSpacing}` : ''}
          </span>
        </div>
      ))}
    </section>
  );
}

function FontsCard({ fonts }: { fonts: FontEntry[] }) {
  const max = Math.max(...fonts.map((f) => f.usage), 1);
  return (
    <section className="te-card">
      <h3 className="te-card-title">Fonts</h3>
      {fonts.map((f) => (
        <div key={f.family} className="te-font-row">
          <span className="te-font-name" style={{ fontFamily: f.family }}>{f.family}</span>
          {f.role && <span className="te-font-role">{f.role}</span>}
          <div className="te-bar-track">
            <div className="te-bar-fill" style={{ width: `${(f.usage / max) * 100}%` }} />
          </div>
          <span className="te-font-pct">{f.usage}%</span>
        </div>
      ))}
    </section>
  );
}

function ShadowsCard({ shadows }: { shadows: Record<string, string> }) {
  return (
    <section className="te-card">
      <h3 className="te-card-title">Shadows</h3>
      <div className="te-shadow-grid">
        {Object.entries(shadows).map(([name, value]) => (
          <div key={name} className="te-shadow-item">
            <div className="te-shadow-tile" style={{ boxShadow: value }} />
            <span className="te-shadow-name">{name}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function GradientsCard({ gradients }: { gradients: string[] }) {
  return (
    <section className="te-card">
      <h3 className="te-card-title">Gradients</h3>
      {gradients.map((g, i) => (
        <div key={i}>
          <div className="te-grad" style={{ background: g }} />
          <div className="te-swatch-val">{g}</div>
        </div>
      ))}
    </section>
  );
}

function ScaleCard({ title, map }: { title: string; map: Record<string, string> }) {
  return (
    <section className="te-card">
      <h3 className="te-card-title">{title}</h3>
      <div className="te-chips">
        {Object.entries(map).map(([name, value]) => (
          <span key={name} className="te-chip mono">{name}: {value}</span>
        ))}
      </div>
    </section>
  );
}
