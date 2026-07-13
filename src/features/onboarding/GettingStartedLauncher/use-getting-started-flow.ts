import { useCallback, useEffect, useRef, useState } from 'react';

export type StepKey = 'expense' | 'income' | 'asset';

export const STEP_ORDER: StepKey[] = ['expense', 'income', 'asset'];

/** Counts per step; undefined = still loading. */
export type StepCounts = Record<StepKey, number | undefined>;

export type FlowState =
  | { kind: 'collapsed' }
  | { kind: 'open' }
  /** A step just completed live — celebrate it and suggest the next one. */
  | { kind: 'suggesting'; completed: StepKey; next: StepKey }
  /** All steps just completed live — the one honest celebration. */
  | { kind: 'completing' }
  /** Celebration played out — never render again this session. */
  | { kind: 'finished' };

const COLLAPSED_KEY = 'kharji-getting-started-collapsed';
/** How long the completion celebration stays before the launcher retires. */
export const COMPLETION_MS = 6000;

function nextIncomplete(counts: StepCounts, after: StepKey): StepKey | null {
  // First incomplete step in canonical order, preferring ones after the
  // completed step but wrapping so earlier skipped steps still get suggested.
  const start = STEP_ORDER.indexOf(after);
  for (let offset = 1; offset <= STEP_ORDER.length; offset++) {
    const step = STEP_ORDER[(start + offset) % STEP_ORDER.length];
    if ((counts[step] ?? 0) === 0) return step;
  }
  return null;
}

/**
 * State machine for the chained getting-started flow. Detects live step
 * completions (a count crossing 0 → ≥1 between two LOADED snapshots — never
 * on initial hydration) and advances collapsed/open/suggesting/completing.
 */
export function useGettingStartedFlow(counts: StepCounts) {
  const [state, setState] = useState<FlowState>({ kind: 'collapsed' });
  const prevCounts = useRef<StepCounts>({ expense: undefined, income: undefined, asset: undefined });

  // Initial expanded/collapsed comes from localStorage (rAF: avoids
  // setState-in-effect cascades and SSR/localStorage mismatch).
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setState((current) =>
        current.kind === 'collapsed' && localStorage.getItem(COLLAPSED_KEY) !== '1' ? { kind: 'open' } : current
      );
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  // Crossing detection
  useEffect(() => {
    const prev = prevCounts.current;
    const completedNow = STEP_ORDER.filter(
      (step) => prev[step] !== undefined && prev[step] === 0 && (counts[step] ?? 0) > 0
    );

    // Only remember loaded values — undefined must never count as a baseline
    for (const step of STEP_ORDER) {
      if (counts[step] !== undefined) prevCounts.current[step] = counts[step];
    }

    if (completedNow.length === 0) return;

    setState((current) => {
      if (current.kind === 'finished') return current;
      const allDone = STEP_ORDER.every((step) => (counts[step] ?? 0) > 0);
      if (allDone) return { kind: 'completing' };
      const completed = completedNow[completedNow.length - 1];
      const next = nextIncomplete(counts, completed);
      return next ? { kind: 'suggesting', completed, next } : { kind: 'completing' };
    });
  }, [counts]);

  // Celebration plays, then the launcher retires for the session
  useEffect(() => {
    if (state.kind !== 'completing') return;
    const timer = setTimeout(() => setState({ kind: 'finished' }), COMPLETION_MS);
    return () => clearTimeout(timer);
  }, [state.kind]);

  const toggle = useCallback(() => {
    setState((current) => {
      if (current.kind === 'open' || current.kind === 'suggesting') {
        localStorage.setItem(COLLAPSED_KEY, '1');
        return { kind: 'collapsed' };
      }
      if (current.kind === 'collapsed') {
        localStorage.setItem(COLLAPSED_KEY, '0');
        return { kind: 'open' };
      }
      return current;
    });
  }, []);

  const later = useCallback(() => {
    setState((current) => {
      if (current.kind !== 'suggesting') return current;
      localStorage.setItem(COLLAPSED_KEY, '1');
      return { kind: 'collapsed' };
    });
  }, []);

  return { state, toggle, later };
}
