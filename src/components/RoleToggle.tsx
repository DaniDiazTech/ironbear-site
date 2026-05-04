import { motion } from 'framer-motion';
import type { Role } from '../schema-types/waitlist';

type Props = {
  value: Role | null;
  onChange: (r: Role) => void;
};

export function RoleToggle({ value, onChange }: Props) {
  const handle = (r: Role) => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate?.(15);
      } catch {
        /* ignore */
      }
    }
    onChange(r);
  };
  return (
    <div className="ib-role-toggle" role="radiogroup" aria-label="Are you a coach or do you lift?">
      {value && (
        <motion.span
          className="pill"
          layoutId="ib-role-pill"
          transition={{ type: 'spring', stiffness: 260, damping: 24 }}
          style={{ left: value === 'coach' ? 6 : 'calc(50% + 0px)' }}
          aria-hidden
        />
      )}
      <button
        type="button"
        className={value === 'coach' ? 'selected' : ''}
        onClick={() => handle('coach')}
        role="radio"
        aria-checked={value === 'coach'}
        data-track="cta:role-coach"
      >
        I'm a coach
      </button>
      <button
        type="button"
        className={value === 'individual' ? 'selected' : ''}
        onClick={() => handle('individual')}
        role="radio"
        aria-checked={value === 'individual'}
        data-track="cta:role-individual"
      >
        I lift
      </button>
    </div>
  );
}
