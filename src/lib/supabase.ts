import { createClient, SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const isSupabaseConfigured = Boolean(url && anonKey);

let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (!isSupabaseConfigured) return null;
  if (!client) {
    client = createClient(url!, anonKey!, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return client;
}

export async function supabaseHealthcheck(timeoutMs = 4000): Promise<boolean> {
  if (!isSupabaseConfigured) return false;
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), timeoutMs);
    // Hit a public-readable view so the browser logs a clean 200 instead of
    // a noisy 401 from /rest/v1/. v_waitlist_counts is granted to anon.
    const res = await fetch(`${url}/rest/v1/v_waitlist_counts?select=role&limit=1`, {
      method: 'GET',
      headers: {
        apikey: anonKey!,
        Authorization: `Bearer ${anonKey!}`,
      },
      signal: ctrl.signal,
    });
    clearTimeout(t);
    return res.ok;
  } catch {
    return false;
  }
}

export function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error('timeout')), ms);
    p.then((v) => {
      clearTimeout(t);
      resolve(v);
    }).catch((e) => {
      clearTimeout(t);
      reject(e);
    });
  });
}
