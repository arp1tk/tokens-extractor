const STEPS = [
  {
    n: '01',
    title: 'Paste a URL',
    body: 'Any live site — Webflow, Framer, or hand-built. We open it in a real browser.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 13a5 5 0 0 0 7.07 0l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
        <path d="M14 11a5 5 0 0 0-7.07 0l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
      </svg>
    ),
  },
  {
    n: '02',
    title: 'We render & analyze',
    body: 'The page is rendered and its CSS distilled into semantic design tokens.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2" />
        <circle cx="12" cy="12" r="3.2" />
      </svg>
    ),
  },
  {
    n: '03',
    title: 'Copy for your AI',
    body: 'Grab the JSON and feed it to an AI to generate a new design in the same style.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3l1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6L12 3Z" />
        <path d="M18.5 14.5l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8.8-2.2Z" />
      </svg>
    ),
  },
];

export default function HowItWorks() {
  return (
    <div
      className="container !pb-[72px] !pt-14 max-[860px]:!pb-12 max-[860px]:!pt-12"
      id="how-it-works"
      data-section="how-it-works"
    >
      <div className="mx-auto mb-[52px] max-w-[680px] text-center">
        <h2 className="title tracking-[-0.02em]">How it works</h2>
        <p className="mt-[14px] font-body text-lg text-[rgba(15,23,18,0.55)]">
          From a URL to a design system in three steps — no setup, no plugins.
        </p>
      </div>
      <div className="mx-auto grid max-w-[1040px] grid-cols-3 gap-6 max-[860px]:max-w-[460px] max-[860px]:grid-cols-1 max-[860px]:gap-[18px]">
        {STEPS.map((s, i) => (
          <div
            key={s.n}
            className="relative overflow-hidden rounded-[20px] border border-[rgba(15,23,18,0.08)] bg-white p-[30px_28px_32px] shadow-[0_1px_2px_rgba(15,23,18,0.04)] transition duration-[220ms] hover:-translate-y-1 hover:border-[rgba(135,237,130,0.6)] hover:shadow-[0_16px_38px_rgba(15,23,18,0.08)]"
          >
            <span
              aria-hidden="true"
              className="pointer-events-none absolute -top-4 right-1.5 select-none font-main text-[104px] font-extrabold leading-none text-[rgba(135,237,130,0.16)]"
            >
              {s.n}
            </span>
            <div className="relative z-[1] mb-[22px] flex h-[46px] w-[46px] items-center justify-center rounded-[13px] bg-[rgba(135,237,130,0.18)] text-[#0a3d12] shadow-[inset_0_0_0_1px_rgba(135,237,130,0.4)]">
              {s.icon}
            </div>
            <div className="relative z-[1] mb-[9px] font-main text-[19px] font-semibold tracking-[-0.01em] text-[#11201a]">
              {s.title}
            </div>
            <p className="relative z-[1] max-w-[30ch] font-body text-[15px] leading-[1.6] text-[rgba(15,23,18,0.58)]">
              {s.body}
            </p>

            {i < STEPS.length - 1 && (
              <span
                aria-hidden="true"
                className="absolute right-[-16px] top-[52px] z-[2] h-[11px] w-[11px] rotate-45 border-r-2 border-t-2 border-brand max-[860px]:bottom-[-13px] max-[860px]:left-1/2 max-[860px]:right-auto max-[860px]:top-auto max-[860px]:-translate-x-1/2 max-[860px]:rotate-[135deg]"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
