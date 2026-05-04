export type Utm = {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
};

const KEY = 'ib-utm';

export function captureUtm(): Utm {
  try {
    const stored = sessionStorage.getItem(KEY);
    if (stored) return JSON.parse(stored) as Utm;
  } catch {
    /* ignore */
  }
  const params = new URLSearchParams(window.location.search);
  const out: Utm = {};
  for (const k of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'] as const) {
    const v = params.get(k);
    if (v) out[k] = v.slice(0, 80);
  }
  try {
    sessionStorage.setItem(KEY, JSON.stringify(out));
  } catch {
    /* ignore */
  }
  return out;
}

export function getReferrer(): string | null {
  try {
    return document.referrer ? document.referrer.slice(0, 200) : null;
  } catch {
    return null;
  }
}
