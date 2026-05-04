export function detectDevice(): 'mobile' | 'desktop' {
  if (typeof window === 'undefined') return 'desktop';
  // Combine pointer + viewport heuristics so a small laptop window doesn't read as mobile.
  const coarse = window.matchMedia?.('(pointer: coarse)').matches;
  const narrow = window.innerWidth < 768;
  return coarse && narrow ? 'mobile' : narrow ? 'mobile' : 'desktop';
}
