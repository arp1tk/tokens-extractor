export default function Footer() {
  return (
    <footer className="mt-10 border-t border-[color:var(--elements-stroke,#cbcbcb)]">
      <div className="container flex flex-wrap items-center justify-between gap-5 py-8">
        <a href="#top" aria-label="Tokn home">
          <span className="font-main text-2xl font-bold leading-none tracking-[-0.03em] text-black">
            tokn<span className="text-brand">.</span>
          </span>
        </a>
        <nav className="flex gap-3" aria-label="Social links">
          <a
            href="https://github.com/arp1tk"
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[color:var(--elements-stroke,#cbcbcb)] text-[rgba(15,23,18,0.6)] transition duration-150 hover:-translate-y-0.5 hover:border-brand hover:bg-[rgba(135,237,130,0.18)] hover:text-[#08240a]"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.54-3.88-1.54-.53-1.34-1.29-1.7-1.29-1.7-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.2 1.77 1.2 1.03 1.77 2.71 1.26 3.37.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.79 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.42-2.69 5.39-5.25 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5Z" />
            </svg>
          </a>
          <a
            href="https://www.linkedin.com/in/arpit-kukreti-4a3824302/"
            target="_blank"
            rel="noreferrer"
            aria-label="LinkedIn"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[color:var(--elements-stroke,#cbcbcb)] text-[rgba(15,23,18,0.6)] transition duration-150 hover:-translate-y-0.5 hover:border-brand hover:bg-[rgba(135,237,130,0.18)] hover:text-[#08240a]"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29ZM5.34 7.43a2.07 2.07 0 1 1 0-4.14 2.07 2.07 0 0 1 0 4.14ZM7.12 20.45H3.55V9h3.57v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0Z" />
            </svg>
          </a>
        </nav>
        <span className="font-body text-sm text-black/50">© Tokn · Built by Arpit Kukreti</span>
      </div>
    </footer>
  );
}
