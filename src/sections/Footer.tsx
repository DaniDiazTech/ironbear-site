import { Logo } from '../components/Logo';
import { ThemeToggle } from '../components/ThemeToggle';

export function Footer() {
  return (
    <footer className="ib-footer">
      <div className="ib-page">
        <div className="ib-footer-row">
          <Logo />
          <div style={{ flex: 1, textAlign: 'center', fontStyle: 'italic' }}>
            Built for the work you put in.
          </div>
          <a href="mailto:hello@ironbear.app">hello@ironbear.app</a>
        </div>
        <div className="ib-footer-row" style={{ justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <a href="#privacy">Privacy</a>
            <a href="#terms">Terms</a>
            <a href="#twitter" aria-label="Twitter">Twitter</a>
            <a href="#instagram" aria-label="Instagram">Instagram</a>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span>© {new Date().getFullYear()} Iron Bear</span>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </footer>
  );
}
