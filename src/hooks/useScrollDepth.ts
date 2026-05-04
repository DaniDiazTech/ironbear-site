import { useEffect } from 'react';
import { track } from '../lib/telemetry';

const THRESHOLDS = [25, 50, 75, 100];

export function useScrollDepth(): void {
  useEffect(() => {
    const fired = new Set<number>();
    const onScroll = () => {
      const doc = document.documentElement;
      const scrolled = window.scrollY + window.innerHeight;
      const total = doc.scrollHeight;
      if (total <= window.innerHeight) return;
      const pct = Math.min(100, Math.round((scrolled / total) * 100));
      for (const t of THRESHOLDS) {
        if (pct >= t && !fired.has(t)) {
          fired.add(t);
          track('scroll_depth', { depth: t });
        }
      }
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
}
