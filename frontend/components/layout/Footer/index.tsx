import './style.css';

export default function Footer() {
  return (
    <footer className="te-footer">
      <div className="container te-footer-inner">
        <a href="#top" className="te-footer-brand" aria-label="Tokn home">
          <span className="brand-wordmark">tokn<span className="brand-dot">.</span></span>
        </a>
        <nav className="te-footer-links">
          <a href="#top">Home</a>
          <a href="#how-it-works">How it works</a>
          <a href="#features">Features</a>
        </nav>
        <span className="te-footer-copy">© Tokn</span>
      </div>
    </footer>
  );
}
