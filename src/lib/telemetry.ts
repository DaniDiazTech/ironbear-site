// Self-hosted telemetry → Supabase `events` table.
// PII rule: NEVER store raw email or other field values. Use value_length only.

import { getSupabase, isSupabaseConfigured } from './supabase';
import { uuid } from './uuid';
import { captureUtm, getReferrer, type Utm } from './utm';
import { detectDevice } from './device';

const SESSION_KEY = 'ib-session-id';
const FLUSH_INTERVAL_MS = 2000;
const MAX_BATCH = 25;

export type EventName =
  | 'visit'
  | 'scroll_depth'
  | 'cta_click'
  | 'repeated_cta'
  | 'form_started'
  | 'form_step'
  | 'form_field_focus'
  | 'form_field_blur'
  | 'form_field_change'
  | 'form_abandoned'
  | 'form_submitted'
  | 'form_submit_error';

export type EventProps = Record<string, string | number | boolean | null | undefined>;

type QueuedEvent = {
  session_id: string;
  event_name: EventName;
  properties: EventProps;
  path: string;
  referrer: string | null;
  utm: Utm;
  device: 'mobile' | 'desktop';
  viewport_w: number;
  viewport_h: number;
  created_at: string;
};

let sessionId: string | null = null;
let utm: Utm = {};
let device: 'mobile' | 'desktop' = 'desktop';
let queue: QueuedEvent[] = [];
let flushTimer: number | null = null;
let initialized = false;

// Per-session CTA click counts for `repeated_cta`
const ctaClicks = new Map<string, number>();

function getSessionId(): string {
  if (sessionId) return sessionId;
  try {
    const existing = sessionStorage.getItem(SESSION_KEY);
    if (existing) {
      sessionId = existing;
      return sessionId;
    }
  } catch {
    /* ignore */
  }
  sessionId = uuid();
  try {
    sessionStorage.setItem(SESSION_KEY, sessionId);
  } catch {
    /* ignore */
  }
  return sessionId;
}

function buildEvent(name: EventName, props: EventProps = {}): QueuedEvent {
  return {
    session_id: getSessionId(),
    event_name: name,
    properties: props,
    path: window.location.pathname + window.location.search,
    referrer: getReferrer(),
    utm,
    device,
    viewport_w: window.innerWidth,
    viewport_h: window.innerHeight,
    created_at: new Date().toISOString(),
  };
}

async function flush(useBeacon = false): Promise<void> {
  if (queue.length === 0) return;
  const batch = queue.splice(0, MAX_BATCH);
  if (!isSupabaseConfigured) return; // drop silently if not configured

  const url = `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/events`;
  const headers = {
    'Content-Type': 'application/json',
    apikey: import.meta.env.VITE_SUPABASE_ANON_KEY as string,
    Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
    Prefer: 'return=minimal',
  };
  const body = JSON.stringify(batch);

  if (useBeacon && 'sendBeacon' in navigator) {
    try {
      const blob = new Blob([body], { type: 'application/json' });
      // sendBeacon doesn't support custom headers — use a tiny insert RPC instead?
      // Supabase requires apikey header, so beacon won't work for the REST endpoint.
      // Fall through to fetch keepalive below.
      void blob;
    } catch {
      /* ignore */
    }
  }

  try {
    await fetch(url, { method: 'POST', headers, body, keepalive: true });
  } catch {
    // Telemetry must never block UX. Drop the batch on failure.
  }
}

function scheduleFlush(): void {
  if (flushTimer !== null) return;
  flushTimer = window.setTimeout(() => {
    flushTimer = null;
    void flush();
  }, FLUSH_INTERVAL_MS);
}

export function track(name: EventName, props: EventProps = {}): void {
  if (!initialized) return;
  // CTA repeated detection
  if (name === 'cta_click' && typeof props.cta_id === 'string') {
    const id = props.cta_id;
    const prev = ctaClicks.get(id) ?? 0;
    const next = prev + 1;
    ctaClicks.set(id, next);
    props.count_in_session = next;
    queue.push(buildEvent(name, props));
    if (next >= 2) {
      queue.push(buildEvent('repeated_cta', { cta_id: id, count_in_session: next }));
    }
    if (queue.length >= MAX_BATCH) void flush();
    else scheduleFlush();
    return;
  }
  queue.push(buildEvent(name, props));
  if (queue.length >= MAX_BATCH) void flush();
  else scheduleFlush();
}

export function initTelemetry(): void {
  if (initialized) return;
  initialized = true;
  utm = captureUtm();
  device = detectDevice();

  track('visit');

  const onHide = () => {
    void flush(true);
  };
  window.addEventListener('pagehide', onHide);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') onHide();
  });

  // Auto-instrument [data-track="cta:..."] clicks
  document.addEventListener(
    'click',
    (e) => {
      const target = e.target as Element | null;
      if (!target) return;
      const el = target.closest('[data-track]') as HTMLElement | null;
      if (!el) return;
      const raw = el.getAttribute('data-track');
      if (!raw) return;
      // Format: "cta:hero-coach" or just "id"
      const [kind, id] = raw.includes(':') ? raw.split(':', 2) : ['cta', raw];
      if (kind === 'cta') {
        track('cta_click', { cta_id: id });
      }
    },
    { capture: true }
  );
}

export function getCurrentSessionId(): string {
  return getSessionId();
}

export function getCurrentUtm(): Utm {
  return utm;
}

export function getCurrentDevice(): 'mobile' | 'desktop' {
  return device;
}
