import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { RoleToggle } from '../components/RoleToggle';
import { StepDots } from '../components/StepDots';
import { ConfettiKettlebells } from '../components/ConfettiKettlebells';
import { useFormTelemetry } from '../hooks/useFormTelemetry';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { getSupabase, supabaseHealthcheck, withTimeout } from '../lib/supabase';
import { enqueue, flushPending, type WaitlistPayload } from '../lib/retryQueue';
import {
  COACH_HYPE_OPTIONS,
  INDIVIDUAL_HYPE_OPTIONS,
  WaitlistFormSchema,
  type Role,
} from '../schema-types/waitlist';
import { getCurrentDevice, getCurrentSessionId, getCurrentUtm, track } from '../lib/telemetry';
import { getReferrer } from '../lib/utm';

type Step = 1 | 2 | 3;
type View = 'form' | 'success' | 'error';

export type WaitlistAPI = {
  setRole: (role: Role) => void;
};

type Props = {
  preselectedRole: Role | null;
  apiRef?: React.MutableRefObject<WaitlistAPI | null>;
};

const MIN_SUBMIT_MS = 800;

function MascotForState({ state, role }: { state: View; step: Step; role: Role | null }) {
  let src = '/mascots/ironbear_head_happy.png';
  if (state === 'success') src = '/mascots/ironbear_head_excited.png';
  else if (state === 'error') src = '/mascots/ironbear_head_sad.png';
  else if (role === 'coach') src = '/mascots/ironbear_pointing_up.png';
  else if (role === 'individual') src = '/mascots/ironbear_barbell_overhead.png';
  return <img className="ib-waitlist-mascot" src={src} alt="" key={src} />;
}

function FormFallback() {
  return (
    <div className="ib-warning">
      <img src="/mascots/ironbear_head_sad.png" alt="" />
      <h3>Signups are taking a breather.</h3>
      <p>Something went wrong rendering the form. Try refreshing — or come back in a few minutes.</p>
    </div>
  );
}

export function Waitlist({ preselectedRole, apiRef }: Props) {
  return (
    <section id="waitlist" className="ib-waitlist">
      <div className="ib-page">
        <div className="ib-section-head">
          <span className="ib-eyebrow">The waitlist</span>
          <h2 className="ib-section-title">Get on the list.</h2>
          <p className="ib-section-sub">Email is all we need. We’ll add you to your cohort and email you the moment training opens.</p>
        </div>
        <ErrorBoundary fallback={<div className="ib-waitlist-card">{FormFallback()}</div>}>
          <WaitlistInner preselectedRole={preselectedRole} apiRef={apiRef} />
        </ErrorBoundary>
      </div>
    </section>
  );
}

function WaitlistInner({ preselectedRole, apiRef }: Props) {
  const reduced = useReducedMotion();
  const [step, setStep] = useState<Step>(1);
  const [view, setView] = useState<View>('form');
  const [role, setRoleState] = useState<Role | null>(preselectedRole);
  const [email, setEmail] = useState('');
  const [emailValid, setEmailValid] = useState<boolean | null>(null);
  const [firstName, setFirstName] = useState('');
  const [hype, setHype] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [serviceUnavailable, setServiceUnavailable] = useState(false);
  const [queuePosition, setQueuePosition] = useState<number | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [confetti, setConfetti] = useState(false);
  const tel = useFormTelemetry();
  const cardRef = useRef<HTMLDivElement>(null);

  // Expose imperative API for hero/two-paths CTAs to set role + scroll
  useEffect(() => {
    if (!apiRef) return;
    apiRef.current = {
      setRole(r: Role) {
        setRoleState(r);
        tel.setRole(r);
        // Auto-advance to step 2 if we're at step 1
        setStep((s) => (s === 1 ? 2 : s));
      },
    };
  }, [apiRef, tel]);

  // React to external preselect changes
  useEffect(() => {
    if (preselectedRole && preselectedRole !== role) {
      setRoleState(preselectedRole);
      tel.setRole(preselectedRole);
      setStep((s) => (s === 1 ? 2 : s));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preselectedRole]);

  // Healthcheck on mount; flush retry queue
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const ok = await supabaseHealthcheck();
      if (!cancelled && !ok) setServiceUnavailable(true);
    })();
    flushPending().catch(() => {
      /* ignore */
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const hypeOptions = useMemo(
    () =>
      role === 'coach'
        ? (COACH_HYPE_OPTIONS as readonly string[])
        : role === 'individual'
        ? (INDIVIDUAL_HYPE_OPTIONS as readonly string[])
        : [],
    [role]
  );
  const hypePrompt =
    role === 'coach'
      ? 'How many clients are you coaching today?'
      : 'What’s your goal right now?';

  const goToStep = (next: Step) => {
    tel.onStep(step, next);
    setStep(next);
  };

  const onPickRole = (r: Role) => {
    setRoleState(r);
    tel.setRole(r);
    setTimeout(() => goToStep(2), 240);
  };

  const validateEmail = (v: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

  const continueFromEmail = () => {
    const ok = validateEmail(email);
    setEmailValid(ok);
    if (!ok) return;
    goToStep(3);
  };

  const submit = async () => {
    if (!role) return;
    const parsed = WaitlistFormSchema.safeParse({
      email,
      first_name: firstName || undefined,
      role,
      hype_answer: hype || undefined,
    });
    if (!parsed.success) {
      setEmailValid(false);
      goToStep(2);
      return;
    }

    setSubmitting(true);
    const startedAt = tel.getStartedAt() ?? Date.now();
    const utm = getCurrentUtm();
    const payload: WaitlistPayload = {
      email: parsed.data.email,
      first_name: parsed.data.first_name ?? null,
      role: parsed.data.role,
      hype_answer: parsed.data.hype_answer ?? null,
      session_id: getCurrentSessionId(),
      device: getCurrentDevice(),
      referrer: getReferrer(),
      utm_source: utm.utm_source ?? null,
      utm_medium: utm.utm_medium ?? null,
      utm_campaign: utm.utm_campaign ?? null,
      utm_term: utm.utm_term ?? null,
      utm_content: utm.utm_content ?? null,
      time_to_submit_ms: Date.now() - startedAt,
    };

    const minWait = new Promise((r) => setTimeout(r, MIN_SUBMIT_MS));
    const supabase = getSupabase();
    let success = false;
    let dupe = false;
    try {
      if (!supabase) throw new Error('not-configured');
      // No .select() — our RLS grants INSERT only, not SELECT. Asking for a
      // RETURNING row would make PostgREST reject the request with 401.
      const result = await withTimeout(
        Promise.resolve(supabase.from('waitlist').insert(payload)),
        8000
      );
      if (result.error) {
        if (result.error.code === '23505') {
          dupe = true;
          success = true;
        } else {
          throw new Error(result.error.message || 'insert-failed');
        }
      } else {
        success = true;
      }
    } catch (e) {
      success = false;
    }
    await minWait;

    if (!success) {
      enqueue(payload);
      tel.onSubmitError('insert-failed');
      setView('error');
      setSubmitting(false);
      return;
    }

    // Fetch queue position from the public counts view (best-effort)
    let position: number | null = null;
    try {
      if (supabase) {
        const { data } = await supabase
          .from('v_waitlist_counts')
          .select('role, count');
        if (data) {
          const row = (data as Array<{ role: Role; count: number }>).find((r) => r.role === payload.role);
          if (row) position = Number(row.count);
        }
      }
    } catch {
      /* ignore */
    }
    setQueuePosition(position);
    tel.onSubmitted();
    setView('success');
    setConfetti(true);
    setSubmitting(false);
    if (dupe) {
      setToast("You're already on the list — we’ll be in touch.");
      setTimeout(() => setToast(null), 2400);
    }
  };

  const reset = () => {
    setView('form');
    setSubmitting(false);
  };

  const share = (where: 'x' | 'copy') => {
    const url = typeof window !== 'undefined' ? window.location.origin : 'https://ironbear.app';
    const text = "I'm on the Iron Bear waitlist. Train heavier. Train smarter. Together.";
    if (where === 'x') {
      const u = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
      window.open(u, '_blank', 'noopener');
      track('cta_click', { cta_id: 'share-x' });
    } else {
      navigator.clipboard?.writeText(url).catch(() => undefined);
      setToast('Copied!');
      setTimeout(() => setToast(null), 1800);
      track('cta_click', { cta_id: 'share-copy' });
    }
  };

  const transition = reduced
    ? { duration: 0 }
    : { type: 'spring' as const, stiffness: 260, damping: 26 };

  return (
    <>
      <div className="ib-waitlist-card" ref={cardRef}>
        <MascotForState state={view} step={step} role={role} />

        {view === 'form' && (
          <>
            <StepDots current={step} total={3} />

            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step-1"
                  initial={reduced ? false : { opacity: 0, y: 10 }}
                  animate={reduced ? undefined : { opacity: 1, y: 0 }}
                  exit={reduced ? undefined : { opacity: 0, y: -10 }}
                  transition={transition}
                >
                  <h3 className="ib-form-h2">First — who are you?</h3>
                  <p className="ib-form-sub">Pick your path. Your cohort, content and onboarding adapt.</p>
                  <RoleToggle value={role} onChange={onPickRole} />
                </motion.div>
              )}
              {step === 2 && (
                <motion.div
                  key="step-2"
                  initial={reduced ? false : { opacity: 0, y: 10 }}
                  animate={reduced ? undefined : { opacity: 1, y: 0 }}
                  exit={reduced ? undefined : { opacity: 0, y: -10 }}
                  transition={transition}
                >
                  <h3 className="ib-form-h2">Where should we email you?</h3>
                  <p className="ib-form-sub">We’ll only email when your cohort opens. No newsletter spam.</p>
                  <div className="ib-field">
                    <label htmlFor="ib-email">Email</label>
                    <input
                      id="ib-email"
                      type="email"
                      autoComplete="email"
                      inputMode="email"
                      placeholder="you@gym.com"
                      className={`ib-input ${emailValid === false ? 'invalid' : ''}`}
                      value={email}
                      onFocus={() => tel.onFieldFocus('email')}
                      onBlur={(e) => {
                        const ok = validateEmail(e.target.value);
                        setEmailValid(e.target.value === '' ? null : ok);
                        tel.onFieldBlur('email', e.target.value, ok);
                      }}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        tel.onFieldChange('email', e.target.value);
                        if (emailValid === false && validateEmail(e.target.value)) setEmailValid(true);
                      }}
                    />
                    {emailValid === false && <span className="ib-help error">Enter a valid email</span>}
                    {emailValid === true && <span className="ib-help ok">Looks good ✓</span>}
                  </div>
                  <div className="ib-field">
                    <label htmlFor="ib-name">First name (optional)</label>
                    <input
                      id="ib-name"
                      type="text"
                      autoComplete="given-name"
                      maxLength={32}
                      placeholder="What should we call you?"
                      className="ib-input"
                      value={firstName}
                      onFocus={() => tel.onFieldFocus('first_name')}
                      onBlur={(e) => tel.onFieldBlur('first_name', e.target.value, true)}
                      onChange={(e) => {
                        setFirstName(e.target.value);
                        tel.onFieldChange('first_name', e.target.value);
                      }}
                    />
                  </div>
                  <div className="ib-form-actions">
                    <button className="ib-link-ghost" type="button" onClick={() => goToStep(1)}>
                      ← Back
                    </button>
                    <button
                      className="ib-btn ib-btn-primary"
                      type="button"
                      disabled={!validateEmail(email)}
                      onClick={continueFromEmail}
                      data-track="cta:form-continue"
                    >
                      Continue →
                    </button>
                  </div>
                </motion.div>
              )}
              {step === 3 && (
                <motion.div
                  key="step-3"
                  initial={reduced ? false : { opacity: 0, y: 10 }}
                  animate={reduced ? undefined : { opacity: 1, y: 0 }}
                  exit={reduced ? undefined : { opacity: 0, y: -10 }}
                  transition={transition}
                >
                  <h3 className="ib-form-h2">{hypePrompt}</h3>
                  <p className="ib-form-sub">One more — helps us tailor your cohort.</p>
                  <div className="ib-chip-row">
                    {hypeOptions.map((opt) => (
                      <button
                        type="button"
                        key={opt}
                        className={`ib-chip ib-chip-selectable ${hype === opt ? 'selected' : ''}`}
                        onClick={() => {
                          setHype(opt);
                          tel.onFieldChange('hype_answer', opt);
                        }}
                        data-track={`cta:hype-${opt}`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                  {submitting && <div className="ib-loading-bar" aria-hidden />}
                  <div className="ib-form-actions">
                    <button className="ib-link-ghost" type="button" onClick={() => goToStep(2)} disabled={submitting}>
                      ← Back
                    </button>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button
                        className="ib-link-ghost"
                        type="button"
                        onClick={() => {
                          setHype(null);
                          submit();
                        }}
                        disabled={submitting}
                        data-track="cta:form-skip"
                      >
                        Skip — submit anyway
                      </button>
                      <button
                        className="ib-btn ib-btn-primary"
                        type="button"
                        onClick={submit}
                        disabled={submitting}
                        data-track="cta:form-submit"
                      >
                        {submitting ? 'Saving…' : "I'm in →"}
                      </button>
                    </div>
                  </div>
                  {serviceUnavailable && (
                    <p className="ib-help error" style={{ marginTop: 10 }}>
                      Heads up — our signup service looks unreachable right now. We’ll save your details locally and retry.
                    </p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}

        {view === 'success' && (
          <div className="ib-success">
            <img src="/mascots/ironbear_head_excited.png" alt="" />
            <h2>You're in.</h2>
            <p style={{ color: 'var(--ib-text-muted)', maxWidth: 380, margin: 0 }}>
              We’ll email you when training opens. Until then, keep moving heavy things.
            </p>
            {queuePosition !== null && (
              <div className="ib-queue">
                <span className="label">Your spot in the {role} queue</span>
                <span className="num">#{queuePosition}</span>
              </div>
            )}
            <div className="ib-share-row">
              <button className="ib-btn ib-btn-ghost ib-btn-sm" type="button" onClick={() => share('x')} data-track="cta:share-x">
                Share on X
              </button>
              <button className="ib-btn ib-btn-ghost ib-btn-sm" type="button" onClick={() => share('copy')} data-track="cta:share-copy">
                Copy link
              </button>
            </div>
          </div>
        )}

        {view === 'error' && (
          <div className="ib-warning">
            <img src="/mascots/ironbear_head_sad.png" alt="" />
            <h3>Signups are taking a breather.</h3>
            <p>
              We saved your details locally and will retry automatically. You can also try again in a few minutes.
            </p>
            <button className="ib-btn ib-btn-primary" type="button" onClick={reset} data-track="cta:retry">
              Try again now
            </button>
            <p style={{ fontSize: 12, color: 'var(--ib-text-soft)', marginTop: 4 }}>
              Saved locally on this device.
            </p>
          </div>
        )}
      </div>

      <ConfettiKettlebells fire={confetti} />
      {toast && <div className="ib-toast">{toast}</div>}
    </>
  );
}
