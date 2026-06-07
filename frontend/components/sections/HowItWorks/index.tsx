import './style.css';

const STEPS = [
  { n: '1', title: 'Paste a URL', body: 'Any live site — Webflow, Framer, or hand-built. We open it in a real browser.' },
  { n: '2', title: 'We render & analyze', body: 'The page is rendered and its CSS distilled into semantic design tokens.' },
  { n: '3', title: 'Copy for your AI', body: 'Grab the JSON and feed it to an AI to generate a new design in the same style.' },
];

export default function HowItWorks() {
  return (
    <div className="container" id="how-it-works" data-section="how-it-works">
      <div className="hiw-head">
        <h2 className="title">How it works</h2>
        <p className="hiw-sub">From any URL to a structured design system in three steps.</p>
      </div>
      <div className="hiw-grid">
        {STEPS.map((s) => (
          <div className="hiw-step" key={s.n}>
            <div className="hiw-num">{s.n}</div>
            <div className="hiw-step-title">{s.title}</div>
            <p className="hiw-step-body">{s.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
