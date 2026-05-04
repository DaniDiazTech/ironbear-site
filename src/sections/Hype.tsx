import { useEffect, useState } from 'react';
import { Counter } from '../components/Counter';
import { HYPE_STATS } from '../data/stats';
import { QUOTES } from '../data/quotes';
import { useReducedMotion } from '../hooks/useReducedMotion';

export function Hype() {
  const reduced = useReducedMotion();
  const [qi, setQi] = useState(0);
  useEffect(() => {
    if (reduced) return;
    const t = setInterval(() => setQi((i) => (i + 1) % QUOTES.length), 3200);
    return () => clearInterval(t);
  }, [reduced]);

  return (
    <section className="ib-hype">
      <div className="ib-page">
        <div className="ib-hype-grid">
          {HYPE_STATS.map((s) => (
            <div key={s.label}>
              <div className="ib-hype-num">
                <Counter to={s.value} format={s.format} />
              </div>
              <div className="ib-hype-label">{s.label}</div>
            </div>
          ))}
        </div>
        <div className="ib-hype-quote">
          <img src="/mascots/ironbear_head_happy.png" alt="" />
          <span key={qi}>{QUOTES[qi]}</span>
        </div>
      </div>
    </section>
  );
}
