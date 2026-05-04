import { useEffect, useState } from 'react';
import { useInView } from '../hooks/useInView';
import { useReducedMotion } from '../hooks/useReducedMotion';

type Props = {
  to: number;
  durationMs?: number;
  format?: (n: number) => string;
  className?: string;
};

export function Counter({ to, durationMs = 1400, format, className }: Props) {
  const reduced = useReducedMotion();
  const [ref, inView] = useInView<HTMLSpanElement>(0.4);
  const [n, setN] = useState(reduced ? to : 0);

  useEffect(() => {
    if (reduced) {
      setN(to);
      return;
    }
    if (!inView) return;
    let raf = 0;
    const start = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / durationMs);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(Math.round(to * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, to, durationMs, reduced]);

  return (
    <span ref={ref} className={className}>
      {format ? format(n) : n.toLocaleString()}
    </span>
  );
}
