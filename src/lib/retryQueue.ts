import { getSupabase, withTimeout } from './supabase';

const KEY = 'iron-bear-waitlist-pending';

export type WaitlistPayload = {
  email: string;
  first_name: string | null;
  role: 'coach' | 'individual';
  hype_answer: string | null;
  session_id: string;
  device: 'mobile' | 'desktop';
  referrer: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_term: string | null;
  utm_content: string | null;
  time_to_submit_ms: number | null;
};

function read(): WaitlistPayload[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function write(items: WaitlistPayload[]): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(items));
  } catch {
    /* ignore */
  }
}

export function enqueue(item: WaitlistPayload): void {
  const items = read();
  // Avoid duplicate emails in the local queue
  if (items.some((i) => i.email === item.email)) return;
  items.push(item);
  write(items);
}

export function pendingCount(): number {
  return read().length;
}

export async function flushPending(): Promise<void> {
  const items = read();
  if (items.length === 0) return;
  const supabase = getSupabase();
  if (!supabase) return;

  const remaining: WaitlistPayload[] = [];
  for (const item of items) {
    try {
      const { error } = await withTimeout(
        Promise.resolve(supabase.from('waitlist').insert(item)),
        8000
      );
      // Duplicate email = already submitted from another tab/device, treat as success
      if (error && error.code !== '23505') {
        remaining.push(item);
      }
    } catch {
      remaining.push(item);
    }
  }
  write(remaining);
}
