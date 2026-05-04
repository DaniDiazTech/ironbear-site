// A faint repeating pattern of barbell silhouettes, painted as an inline SVG
// pattern so it scales without bandwidth cost. Sits behind the hero copy.
export function BarbellGrid() {
  return (
    <svg className="ib-barbell-grid" aria-hidden>
      <defs>
        <symbol id="ib-barbell" viewBox="0 0 120 120">
          {/* bar */}
          <rect x="14" y="56" width="92" height="6" rx="2" fill="currentColor" />
          {/* inner plates */}
          <rect x="22" y="44" width="6" height="32" rx="1.5" fill="currentColor" />
          <rect x="92" y="44" width="6" height="32" rx="1.5" fill="currentColor" />
          {/* outer plates */}
          <rect x="32" y="38" width="10" height="44" rx="2" fill="currentColor" />
          <rect x="78" y="38" width="10" height="44" rx="2" fill="currentColor" />
          {/* end caps */}
          <circle cx="14" cy="59" r="3.2" fill="currentColor" />
          <circle cx="106" cy="59" r="3.2" fill="currentColor" />
        </symbol>
        <pattern id="ib-barbell-pat" x="0" y="0" width="120" height="120" patternUnits="userSpaceOnUse" patternTransform="rotate(-12)">
          <use href="#ib-barbell" x="0" y="0" width="120" height="120" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#ib-barbell-pat)" style={{ color: 'var(--ib-text)', opacity: 0.06 }} />
    </svg>
  );
}
