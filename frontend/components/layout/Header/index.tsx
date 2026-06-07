'use client';

import { useState } from 'react';
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'motion/react';

const NAV_ITEMS = [
  { name: 'Home', link: '/' },
  { name: 'How it works', link: '#how-it-works' },
  { name: 'Features', link: '#features' },
];

function Logo() {
  return (
    <a href="/" aria-label="Tokn home" className="relative z-20 shrink-0 px-2">
      <span className="brand-wordmark">
        tokn<span className="brand-dot">.</span>
      </span>
    </a>
  );
}

export default function Header() {
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useMotionValueEvent(scrollY, 'change', (latest) => setScrolled(latest > 80));

  return (
    <div className="z-50 w-full pt-3" style={{ position: 'sticky', top: 0 }}>
      {/* Desktop */}
      <motion.div
        animate={{ width: scrolled ? '66%' : '100%', y: scrolled ? 12 : 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 50 }}
        style={{ minWidth: scrolled ? 780 : undefined }}
        className={[
          'relative z-[60] mx-auto hidden max-w-7xl items-center justify-between rounded-full px-5 py-2.5 transition-[background-color,box-shadow,backdrop-filter] duration-300 lg:flex',
          scrolled
            ? 'bg-white/80 shadow-[0_8px_30px_rgba(0,0,0,0.08)] backdrop-blur-md'
            : 'bg-transparent',
        ].join(' ')}
      >
        <Logo />
        <nav className="flex items-center gap-1">
          {NAV_ITEMS.map((it) => (
            <a
              key={it.name}
              href={it.link}
              className="rounded-full px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-black/5 hover:text-black"
            >
              {it.name}
            </a>
          ))}
        </nav>
        <a
          href="#tool"
          className="shrink-0 rounded-full bg-[#87ed82] px-5 py-2 text-sm font-semibold text-[#08240a] transition hover:brightness-95"
        >
          Extract tokens
        </a>
      </motion.div>

      {/* Mobile */}
      <motion.div
        animate={{ width: scrolled ? '92%' : '100%', y: scrolled ? 10 : 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 50 }}
        className={[
          'mx-auto flex flex-col px-4 py-3 transition-[background-color,box-shadow,backdrop-filter] duration-300 lg:hidden',
          scrolled
            ? 'rounded-2xl bg-white/85 shadow-[0_8px_30px_rgba(0,0,0,0.08)] backdrop-blur-md'
            : 'bg-transparent',
        ].join(' ')}
      >
        <div className="flex w-full items-center justify-between">
          <Logo />
          <button
            aria-label="Toggle menu"
            onClick={() => setOpen((o) => !o)}
            className="p-2 text-black"
          >
            {open ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="mt-3 flex w-full flex-col gap-1 rounded-xl bg-white p-3 shadow-[0_8px_30px_rgba(0,0,0,0.1)]"
            >
              {NAV_ITEMS.map((it) => (
                <a
                  key={it.name}
                  href={it.link}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-2 text-sm text-neutral-700 hover:bg-black/5"
                >
                  {it.name}
                </a>
              ))}
              <a
                href="#tool"
                onClick={() => setOpen(false)}
                className="mt-1 rounded-lg bg-[#87ed82] px-3 py-2 text-center text-sm font-semibold text-[#08240a]"
              >
                Extract tokens
              </a>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

function MenuIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}
