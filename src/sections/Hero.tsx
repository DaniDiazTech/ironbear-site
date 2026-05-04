import { motion } from 'framer-motion';
import { BarbellGrid } from '../components/BarbellGrid';
import { LiveCount } from '../components/LiveCount';
import { Marquee } from '../components/Marquee';
import { useReducedMotion } from '../hooks/useReducedMotion';

const LIFTS = [
  'DEADLIFT', 'BACK SQUAT', 'BENCH PRESS', 'OVERHEAD PRESS', 'FRONT SQUAT',
  'BARBELL ROW', 'CLEAN', 'SNATCH', 'PULL-UP', 'ROMANIAN DEADLIFT',
  'INCLINE BENCH', 'HIP THRUST', 'PUSH PRESS', 'JERK', 'GOOD MORNING',
];

export function Hero({ onPickRole }: { onPickRole: (role: 'coach' | 'individual') => void }) {
  const reduced = useReducedMotion();
  const linesText = ['Train heavier.', 'Train smarter.', 'Together.'];

  return (
    <section className="ib-hero">
      <BarbellGrid />
      <div className="ib-page ib-hero-grid">
        <div>
          <span className="ib-eyebrow">For coaches & people who lift</span>
          <h1 className="ib-hero-headline">
            {linesText.map((line, li) => {
              const words = line.split(' ');
              return (
                <span className="line" key={li}>
                  {words.map((w, wi) => {
                    const isUnderlined = w === 'Together.';
                    const delay = reduced ? 0 : 0.06 * (li * 3 + wi) + 0.05;
                    const initial = reduced ? false : { opacity: 0, y: 22 };
                    const animate = reduced ? undefined : { opacity: 1, y: 0 };
                    return (
                      <motion.span
                        className={`word ${isUnderlined ? 'underlined' : ''}`}
                        initial={initial}
                        animate={animate}
                        transition={{ duration: 0.55, ease: [0.16, 0.84, 0.32, 1], delay }}
                        key={`${li}-${wi}`}
                      >
                        {w}
                        {isUnderlined && (
                          <svg viewBox="0 0 320 18" preserveAspectRatio="none" aria-hidden>
                            <motion.path
                              d="M4 12 Q 80 2, 160 9 T 316 8"
                              fill="none"
                              stroke="var(--ib-primary)"
                              strokeWidth="5"
                              strokeLinecap="round"
                              initial={reduced ? false : { pathLength: 0 }}
                              animate={reduced ? undefined : { pathLength: 1 }}
                              transition={{ duration: 0.7, ease: 'easeOut', delay: reduced ? 0 : 0.9 }}
                            />
                          </svg>
                        )}
                      </motion.span>
                    );
                  })}
                </span>
              );
            })}
          </h1>
          <p className="ib-hero-sub">
            The coaching platform built for serious lifters and the coaches who push them. Limited beta opening soon — get on the list.
          </p>
          <div className="ib-hero-ctas">
            <a
              href="#waitlist"
              className="ib-btn ib-btn-primary"
              data-track="cta:hero-coach"
              onClick={() => onPickRole('coach')}
            >
              I'm a coach →
            </a>
            <a
              href="#waitlist"
              className="ib-btn ib-btn-ghost"
              data-track="cta:hero-individual"
              onClick={() => onPickRole('individual')}
            >
              I lift →
            </a>
          </div>
          <LiveCount />
        </div>

        <div className="ib-hero-mascot-wrap">
          <div className="ib-plate-orbit">
            <span className="ib-plate p1">PR</span>
            <span className="ib-plate p2">1RM</span>
            <span className="ib-plate p3">RPE</span>
            <span className="ib-plate p4">%</span>
          </div>
          <img
            className="ib-hero-mascot"
            src="/mascots/ironbear_barbell_deadlift.png"
            alt="Iron Bear deadlifting"
          />
          <div className="ib-floating-chips">
            <span className="ib-chip ib-chip-soft ib-floating-chip fc1">PR tracking</span>
            <span className="ib-chip ib-chip-soft ib-floating-chip fc2">AI programs</span>
            <span className="ib-chip ib-chip-soft ib-floating-chip fc3">Real coaches</span>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 'clamp(48px, 8vw, 96px)' }}>
        <Marquee items={LIFTS} />
      </div>
    </section>
  );
}
