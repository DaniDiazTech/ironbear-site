import { useEffect, useState } from 'react';
import { Logo } from '../components/Logo';

export function TopBar({ onWaitlistClick }: { onWaitlistClick?: () => void }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return (
    <header className={`ib-topbar ${scrolled ? 'scrolled' : ''}`}>
      <Logo />
      <nav className="ib-topbar-actions">
        <a href="#two-paths" className="ib-link-ghost" data-track="cta:nav-coaches">
          Coaches
        </a>
        <a
          href="#waitlist"
          className="ib-btn ib-btn-primary ib-btn-sm"
          data-track="cta:nav-join"
          onClick={onWaitlistClick}
        >
          Join the waitlist →
        </a>
      </nav>
    </header>
  );
}
