'use client';

import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'kharji-last-account';

/**
 * Remembers which account you last paid from, so the expense form arrives
 * pre-filled instead of asking the same question every time.
 *
 * Plain localStorage behind a `useEffect`, matching `use-getting-started-flow`.
 * A zustand `persist` store would work too, but this codebase has no `persist`
 * middleware anywhere yet, and adopting it here would need `skipHydration` plus
 * a manual rehydrate to avoid an SSR mismatch — more machinery than one id
 * warrants. Reading in an effect means the first paint is always the
 * server-rendered "nothing selected", which is exactly what avoids the mismatch.
 */
export function useLastAccount(): { lastAccountId: number | null; rememberAccount: (id: number | null) => void } {
  const [lastAccountId, setLastAccountId] = useState<number | null>(null);

  // Read behind a rAF, matching use-getting-started-flow: it keeps the first
  // paint identical to the server's (no hydration mismatch) and avoids the
  // cascading re-render that a synchronous setState in an effect causes.
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = raw === null ? NaN : Number(raw);
      if (Number.isInteger(parsed) && parsed > 0) setLastAccountId(parsed);
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  const rememberAccount = useCallback((id: number | null) => {
    setLastAccountId(id);
    if (id === null) localStorage.removeItem(STORAGE_KEY);
    else localStorage.setItem(STORAGE_KEY, String(id));
  }, []);

  return { lastAccountId, rememberAccount };
}
