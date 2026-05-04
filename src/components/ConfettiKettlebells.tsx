import { useEffect, useState } from 'react';
import { useReducedMotion } from '../hooks/useReducedMotion';

const ICONS = ['🏋️', '💪', '🥇', '🔥', '⚡', '🏅'];

type Props = { fire: boolean };

export function ConfettiKettlebells({ fire }: Props) {
  const reduced = useReducedMotion();
  const [pieces, setPieces] = useState<Array<{ id: number; left: number; delay: number; rotate: number; icon: string }>>([]);

  useEffect(() => {
    if (!fire || reduced) return;
    const arr = Array.from({ length: 30 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 400,
      rotate: Math.random() * 360,
      icon: ICONS[i % ICONS.length],
    }));
    setPieces(arr);
    const t = setTimeout(() => setPieces([]), 2600);
    return () => clearTimeout(t);
  }, [fire, reduced]);

  if (pieces.length === 0) return null;
  return (
    <div className="ib-confetti" aria-hidden>
      {pieces.map((p) => (
        <span
          key={p.id}
          style={{
            left: `${p.left}%`,
            animationDelay: `${p.delay}ms`,
            transform: `rotate(${p.rotate}deg)`,
          }}
        >
          {p.icon}
        </span>
      ))}
    </div>
  );
}
