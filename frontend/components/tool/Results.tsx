'use client';

import { useState } from 'react';
import type { Tokens, TextStyle, FontEntry } from '@/lib/tokens';

const CARD =
  'min-w-0 rounded-2xl border border-[rgba(15,23,18,0.08)] bg-white p-[20px_22px] shadow-[0_1px_2px_rgba(15,23,18,0.04)] transition-[box-shadow,border-color] duration-200 hover:border-[rgba(15,23,18,0.12)] hover:shadow-[0_10px_30px_rgba(15,23,18,0.07)]';
const CARD_MASONRY = `${CARD} mb-4 break-inside-avoid`;
const SWATCH_VAL =
  'block overflow-hidden text-ellipsis whitespace-nowrap font-body text-[11px] text-[rgba(15,23,18,0.38)]';
const STATUS_ERROR =
  'mt-4 rounded-xl border border-[color:var(--elements-stroke,#cbcbcb)] bg-[color:var(--hoved-color,#f7f7f7)] px-4 py-3 font-body text-[15px] text-black';

function toggleBtn(active: boolean): string {
  return `cursor-pointer rounded-lg border-none px-3.5 py-[7px] font-main text-[13px] font-medium transition-all duration-150 ${
    active
      ? 'bg-white text-[#11201a] shadow-[0_1px_2px_rgba(15,23,18,0.12)]'
      : 'bg-transparent text-[rgba(15,23,18,0.5)]'
  }`;
}

export default function Results({ data }: { data: Tokens }) {
  const [showRaw, setShowRaw] = useState(false);
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  return (
    <div className="relative z-[1] mt-11 text-left">
      <div className="mb-[22px] flex flex-wrap items-center justify-between gap-4 max-[720px]:gap-3 max-[560px]:flex-col max-[560px]:items-center max-[560px]:gap-3.5">
        <div className="min-w-0 max-[560px]:flex max-[560px]:w-full max-[560px]:flex-col max-[560px]:items-center max-[560px]:text-center">
          <p className="m-0 font-main text-2xl font-semibold tracking-[-0.01em] text-[#11201a]">
            Design tokens
          </p>
          {data.meta?.sourceUrl && (
            <a
              className="mt-[5px] inline-flex max-w-full items-center gap-[7px] overflow-hidden text-ellipsis whitespace-nowrap font-body text-[13px] text-[rgba(15,23,18,0.5)] no-underline hover:text-[#11201a]"
              href={data.meta.sourceUrl}
              target="_blank"
              rel="noreferrer"
            >
              <span className="h-[7px] w-[7px] shrink-0 rounded-full bg-brand shadow-[0_0_0_3px_rgba(135,237,130,0.25)]" />
              {prettyHost(data.meta.sourceUrl)}
            </a>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-2.5">
          <div className="inline-flex gap-0.5 rounded-[10px] bg-[rgba(15,23,18,0.05)] p-[3px]">
            <button className={toggleBtn(!showRaw)} onClick={() => setShowRaw(false)}>Visual</button>
            <button className={toggleBtn(showRaw)} onClick={() => setShowRaw(true)}>{'{ }'} JSON</button>
          </div>
          <button
            className="cursor-pointer rounded-[10px] border border-transparent bg-brand px-4 py-[9px] font-main text-[13px] font-semibold text-[#08240a] transition-[filter,transform] duration-150 hover:brightness-[0.96] active:translate-y-px"
            onClick={copy}
          >
            {copied ? '✓ Copied' : 'Copy JSON'}
          </button>
        </div>
      </div>

      {data.warning && <p className={STATUS_ERROR}>{data.warning}</p>}

      {showRaw ? (
        <pre className="max-h-[620px] overflow-auto rounded-2xl border border-[rgba(15,23,18,0.08)] bg-[#fbfcfb] p-5 font-body text-[12.5px] leading-[1.7] text-[#11201a]">
          {JSON.stringify(data, null, 2)}
        </pre>
      ) : (
        <>
          <div className="flex flex-col gap-4">
            {data.styleProfile && <StyleProfileCard p={data.styleProfile} />}
            {data.colorRoles && <SwatchCard title="Color roles" colors={data.colorRoles} />}
            {data.colors && <SwatchCard title="Palette" colors={data.colors} />}
            {data.textStyles && <TextStylesCard styles={data.textStyles} />}
          </div>

          <div className="mt-4 columns-[296px] gap-x-4">
            {data.fonts && data.fonts.length > 0 && <FontsCard fonts={data.fonts} />}
            {data.shadows && <ShadowsCard shadows={data.shadows} />}
            {data.gradients && data.gradients.length > 0 && <GradientsCard gradients={data.gradients} />}
            {data.spacing && <SpacingCard map={data.spacing} />}
            {data.radii && <RadiiCard map={data.radii} />}
          </div>
        </>
      )}
    </div>
  );
}

/* ---------- shared bits ---------- */

function prettyHost(url: string): string {
  try {
    return new URL(url).host.replace(/^www\./, '');
  } catch {
    return url;
  }
}

function CardHead({ title, count }: { title: string; count?: number }) {
  return (
    <div className="mb-4 flex items-center gap-2.5">
      <h3 className="m-0 flex items-center gap-[9px] font-main text-[13px] font-semibold text-[#11201a] before:h-2 before:w-2 before:rounded-[3px] before:bg-brand before:content-['']">
        {title}
      </h3>
      {count != null && (
        <span className="rounded-full bg-[rgba(15,23,18,0.05)] px-[9px] py-0.5 font-body text-[11px] font-semibold text-[rgba(15,23,18,0.5)]">
          {count}
        </span>
      )}
    </div>
  );
}

function useCopy(): [boolean, (v: string) => void] {
  const [copied, setCopied] = useState(false);
  function run(v: string) {
    navigator.clipboard?.writeText(v);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  }
  return [copied, run];
}

/* ---------- cards ---------- */

function StyleProfileCard({ p }: { p: NonNullable<Tokens['styleProfile']> }) {
  const chips = [
    p.isDark ? 'dark UI' : 'light UI',
    `${p.cornerStyle} corners`,
    `${p.density} density`,
    `${p.elevation} elevation`,
    p.hasGradients ? 'gradients' : null,
    ...p.vibe,
  ].filter(Boolean) as string[];
  return (
    <section className={CARD}>
      <CardHead title="Style profile" />
      <div className="flex flex-wrap items-center gap-2.5">
        {p.brandColor && (
          <span className="inline-flex items-center gap-2 rounded-full bg-[rgba(15,23,18,0.04)] py-1.5 pl-2 pr-3 font-body text-[13px] text-[#11201a]">
            <span
              className="h-[18px] w-[18px] rounded-full shadow-[inset_0_0_0_1px_rgba(0,0,0,0.1)]"
              style={{ background: p.brandColor }}
            />
            {p.brandColor}
          </span>
        )}
        <div className="flex flex-wrap gap-2">
          {chips.map((c) => (
            <span
              key={c}
              className="rounded-lg border border-[rgba(15,23,18,0.08)] bg-white px-3 py-1.5 font-body text-[13px] text-[#11201a]"
            >
              {c}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

function Swatch({ name, value }: { name: string; value: string }) {
  const [copied, run] = useCopy();
  return (
    <button
      type="button"
      className="group block min-w-0 cursor-pointer border-none bg-transparent p-0 text-left"
      onClick={() => run(value)}
      title={`Copy ${value}`}
    >
      <span
        className="relative flex h-[60px] items-end justify-center overflow-hidden rounded-xl shadow-[inset_0_0_0_1px_rgba(15,23,18,0.08)]"
        style={{ background: value }}
      >
        <span className="w-full translate-y-1 bg-[linear-gradient(transparent,rgba(0,0,0,0.42))] pb-[5px] pt-1 text-center font-body text-[11px] font-semibold text-white opacity-0 transition-all duration-150 group-hover:translate-y-0 group-hover:opacity-100">
          {copied ? '✓ Copied' : 'Copy'}
        </span>
      </span>
      <span className="mt-2 block overflow-hidden text-ellipsis whitespace-nowrap font-body text-[12.5px] font-medium text-[#11201a]">
        {name}
      </span>
      <span className={SWATCH_VAL}>{value}</span>
    </button>
  );
}

function SwatchCard({ title, colors }: { title: string; colors: Record<string, string> }) {
  const entries = Object.entries(colors);
  return (
    <section className={CARD}>
      <CardHead title={title} count={entries.length} />
      <div className="grid grid-cols-6 gap-3.5 max-[720px]:gap-2.5 max-[520px]:grid-cols-3">
        {entries.map(([name, value]) => (
          <Swatch key={name} name={name} value={value} />
        ))}
      </div>
    </section>
  );
}

function clampPreview(size: string): string {
  const px = parseFloat(size);
  if (!Number.isNaN(px)) return `${Math.min(px, 30)}px`;
  return size;
}

function TextStylesCard({ styles }: { styles: Record<string, TextStyle> }) {
  const entries = Object.entries(styles);
  return (
    <section className={CARD}>
      <CardHead title="Text styles" count={entries.length} />
      <div className="flex flex-col">
        {entries.map(([role, s]) => (
          <div
            key={role}
            className="flex flex-wrap items-center justify-between gap-3 border-t border-[rgba(15,23,18,0.08)] py-4 first:border-t-0 first:pt-1"
          >
            <span
              className="min-w-0 max-w-full overflow-hidden text-ellipsis text-[#11201a]"
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
            <span className="flex min-w-0 flex-wrap justify-end gap-1.5 max-[520px]:justify-start">
              <SpecChip>{s.family.split(',')[0].replace(/['"]/g, '')}</SpecChip>
              <SpecChip>{s.size}</SpecChip>
              <SpecChip>{s.weight}</SpecChip>
              {s.lineHeight ? <SpecChip>lh&nbsp;{s.lineHeight}</SpecChip> : null}
              {s.letterSpacing ? <SpecChip>{s.letterSpacing}</SpecChip> : null}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

function SpecChip({ children }: { children: React.ReactNode }) {
  return (
    <span className="whitespace-nowrap rounded-md bg-[rgba(15,23,18,0.04)] px-2 py-[3px] font-body text-[11.5px] text-[rgba(15,23,18,0.5)]">
      {children}
    </span>
  );
}

function FontsCard({ fonts }: { fonts: FontEntry[] }) {
  const max = Math.max(...fonts.map((f) => f.usage), 1);
  return (
    <section className={CARD_MASONRY}>
      <CardHead title="Fonts" count={fonts.length} />
      {fonts.map((f) => (
        <div key={f.family} className="mb-4 flex flex-col gap-2 last:mb-0">
          <div className="flex items-center gap-2.5">
            <span
              className="overflow-hidden text-ellipsis whitespace-nowrap text-sm font-medium text-[#11201a]"
              style={{ fontFamily: f.family }}
            >
              {f.family}
            </span>
            {f.role && (
              <span className="shrink-0 rounded-full bg-[rgba(135,237,130,0.28)] px-[9px] py-0.5 font-body text-[11px] font-semibold text-[#0a3d12]">
                {f.role}
              </span>
            )}
            <span className="ml-auto shrink-0 font-body text-xs text-[rgba(15,23,18,0.5)]">{f.usage}%</span>
          </div>
          <div className="h-[7px] overflow-hidden rounded-full bg-[rgba(15,23,18,0.06)]">
            <div
              className="h-full rounded-full bg-[linear-gradient(90deg,#87ed82,#5fd8c4)]"
              style={{ width: `${(f.usage / max) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </section>
  );
}

function ShadowsCard({ shadows }: { shadows: Record<string, string> }) {
  const entries = Object.entries(shadows);
  return (
    <section className={CARD_MASONRY}>
      <CardHead title="Shadows" count={entries.length} />
      <div className="grid grid-cols-3 gap-3.5 rounded-xl border border-[rgba(15,23,18,0.08)] bg-[radial-gradient(rgba(15,23,18,0.05)_1px,transparent_1px)_0_0/12px_12px,#fbfcfb] px-3.5 py-5">
        {entries.map(([name, value]) => (
          <div key={name} className="flex flex-col items-center gap-2.5">
            <div className="h-[46px] w-[46px] rounded-[10px] bg-white" style={{ boxShadow: value }} />
            <span className="font-body text-[11px] text-[rgba(15,23,18,0.5)]">{name}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function GradientsCard({ gradients }: { gradients: string[] }) {
  return (
    <section className={CARD_MASONRY}>
      <CardHead title="Gradients" count={gradients.length} />
      <div className="flex flex-col gap-3">
        {gradients.map((g, i) => (
          <GradientRow key={i} value={g} />
        ))}
      </div>
    </section>
  );
}

function GradientRow({ value }: { value: string }) {
  const [copied, run] = useCopy();
  return (
    <button
      type="button"
      className="group block w-full cursor-pointer border-none bg-transparent p-0 text-left"
      onClick={() => run(value)}
      title="Copy gradient"
    >
      <span
        className="block h-[46px] rounded-[10px] shadow-[inset_0_0_0_1px_rgba(15,23,18,0.08)]"
        style={{ background: value }}
      />
      <span className="mt-1.5 block overflow-hidden text-ellipsis whitespace-nowrap font-body text-[11px] text-[rgba(15,23,18,0.38)] group-hover:text-[#11201a]">
        {copied ? '✓ Copied' : value}
      </span>
    </button>
  );
}

function SpacingCard({ map }: { map: Record<string, string> }) {
  const entries = Object.entries(map);
  const max = Math.max(...entries.map(([, v]) => parseFloat(v) || 0), 1);
  return (
    <section className={CARD_MASONRY}>
      <CardHead title="Spacing" count={entries.length} />
      <div className="flex flex-col gap-3">
        {entries.map(([name, value]) => (
          <div key={name} className="flex items-center gap-3">
            <span className="w-9 shrink-0 font-body text-xs text-[#11201a]">{name}</span>
            <span className="h-2.5 flex-1 overflow-hidden rounded-full bg-[rgba(15,23,18,0.05)]">
              <span
                className="block h-full rounded-full bg-[linear-gradient(90deg,rgba(135,237,130,0.55),#87ed82)]"
                style={{ width: `${Math.max(((parseFloat(value) || 0) / max) * 100, 4)}%` }}
              />
            </span>
            <span className="w-[46px] shrink-0 text-right font-body text-xs text-[rgba(15,23,18,0.5)]">
              {value}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

function RadiiCard({ map }: { map: Record<string, string> }) {
  const entries = Object.entries(map);
  return (
    <section className={CARD_MASONRY}>
      <CardHead title="Radii" count={entries.length} />
      <div className="grid grid-cols-2 gap-4">
        {entries.map(([name, value]) => {
          const px = parseFloat(value);
          const r = Number.isNaN(px) ? value : `${Math.min(px, 26)}px`;
          return (
            <div key={name} className="flex flex-col gap-1.5">
              <div
                className="h-[52px] bg-[linear-gradient(135deg,rgba(135,237,130,0.18),rgba(95,216,196,0.14))] shadow-[inset_0_0_0_1.5px_#87ed82]"
                style={{ borderRadius: r }}
              />
              <span className="font-body text-[12.5px] font-medium text-[#11201a]">{name}</span>
              <span className={SWATCH_VAL}>{value}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
