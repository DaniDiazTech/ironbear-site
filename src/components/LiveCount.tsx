import { useEffect, useState } from 'react';
import { getSupabase } from '../lib/supabase';
import { Counter } from './Counter';

type Counts = { coach: number; individual: number };
const FALLBACK: Counts = { coach: 87, individual: 412 };
const CACHE_KEY = 'ib-live-counts';
const CACHE_TTL_MS = 30_000;

export function LiveCount() {
  const [counts, setCounts] = useState<Counts>(FALLBACK);

  useEffect(() => {
    let cancelled = false;
    const cached = (() => {
      try {
        const raw = sessionStorage.getItem(CACHE_KEY);
        if (!raw) return null;
        const { ts, value } = JSON.parse(raw);
        if (Date.now() - ts < CACHE_TTL_MS) return value as Counts;
      } catch {
        return null;
      }
      return null;
    })();
    if (cached) setCounts(cached);

    const supabase = getSupabase();
    if (!supabase) return;
    supabase
      .from('v_waitlist_counts')
      .select('role, count')
      .then(({ data, error }) => {
        if (cancelled || error || !data) return;
        const out: Counts = { coach: 0, individual: 0 };
        for (const row of data as Array<{ role: 'coach' | 'individual'; count: number }>) {
          out[row.role] = Number(row.count) || 0;
        }
        // Display nicer "early hype" floor
        const display = {
          coach: Math.max(out.coach, FALLBACK.coach),
          individual: Math.max(out.individual, FALLBACK.individual),
        };
        setCounts(display);
        try {
          sessionStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), value: display }));
        } catch {
          /* ignore */
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="ib-hero-livecount" aria-live="polite">
      <span className="dot" aria-hidden />
      <span>
        <Counter to={counts.coach} className="num" /> coaches&nbsp;·&nbsp;
        <Counter to={counts.individual} className="num" /> lifters already on the list
      </span>
    </div>
  );
}
