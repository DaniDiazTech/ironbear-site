// Hype strip numbers — swap to real values once available.
// TODO(real-data): wire to a Supabase RPC once the beta produces real metrics.
export const HYPE_STATS = [
  { value: 1_400_000, label: 'lbs lifted in beta', format: (n: number) => `${(n / 1_000_000).toFixed(1)}M` },
  { value: 240, label: 'coaches building programs', format: (n: number) => `${n}` },
  { value: 97, label: 'finish week 1', format: (n: number) => `${n}%` },
] as const;
