import { useCallback, useEffect, useRef } from 'react';
import { track } from '../lib/telemetry';

export type FormState = {
  startedAt: number | null;
  submitted: boolean;
  step: number;
  role: 'coach' | 'individual' | null;
};

export function useFormTelemetry() {
  const stateRef = useRef<FormState>({ startedAt: null, submitted: false, step: 1, role: null });

  const ensureStarted = useCallback(() => {
    if (stateRef.current.startedAt === null) {
      stateRef.current.startedAt = Date.now();
      track('form_started', { role: stateRef.current.role ?? '' });
    }
  }, []);

  const onFieldFocus = useCallback(
    (field: string) => {
      ensureStarted();
      track('form_field_focus', { field });
    },
    [ensureStarted]
  );

  const onFieldBlur = useCallback((field: string, value: string, valid: boolean) => {
    track('form_field_blur', { field, value_length: value.length, valid });
  }, []);

  const onFieldChange = useCallback((field: string, value: string) => {
    track('form_field_change', { field, value_length: value.length });
  }, []);

  const onStep = useCallback((from: number, to: number) => {
    stateRef.current.step = to;
    track('form_step', { from_step: from, to_step: to });
  }, []);

  const setRole = useCallback(
    (role: 'coach' | 'individual') => {
      stateRef.current.role = role;
      ensureStarted();
    },
    [ensureStarted]
  );

  const onSubmitted = useCallback(() => {
    stateRef.current.submitted = true;
    const ms = stateRef.current.startedAt ? Date.now() - stateRef.current.startedAt : null;
    track('form_submitted', {
      role: stateRef.current.role ?? '',
      time_to_submit_ms: ms ?? 0,
    });
  }, []);

  const onSubmitError = useCallback((reason: string) => {
    track('form_submit_error', { reason });
  }, []);

  // Abandon detection: pagehide while form started but not submitted
  useEffect(() => {
    const onHide = () => {
      const s = stateRef.current;
      if (s.startedAt !== null && !s.submitted) {
        track('form_abandoned', {
          last_step: s.step,
          ms_in_form: Date.now() - s.startedAt,
        });
      }
    };
    window.addEventListener('pagehide', onHide);
    return () => window.removeEventListener('pagehide', onHide);
  }, []);

  const getStartedAt = useCallback(() => stateRef.current.startedAt, []);

  return {
    onFieldFocus,
    onFieldBlur,
    onFieldChange,
    onStep,
    setRole,
    onSubmitted,
    onSubmitError,
    getStartedAt,
  };
}
