'use client';

import { useEffect, useRef } from 'react';

import { usePathname } from 'next/navigation';

import { useToast } from '@components/Toast/ToastProvider';

import { beginSignout, setUnauthorizedHandler } from '@/lib/api/auth-handler';

const UnauthorizedListener = () => {
  const pathname = usePathname();
  const { showToast } = useToast();

  const pathRef = useRef(pathname);

  useEffect(() => {
    pathRef.current = pathname;
  }, [pathname]);

  useEffect(() => {
    setUnauthorizedHandler(async () => {
      if (!beginSignout()) return;

      // Deliberately leave the query cache alone: the stale page staying
      // visible under the toast beats blanking to white, and the hard
      // navigation below wipes all in-memory state anyway.

      // Clear the (now-invalid) cookie BEFORE navigating so the proxy doesn't
      // bounce /login back to /overview. Await it so the browser actually
      // processes the Set-Cookie before the next request.
      try {
        await fetch('/api/auth/logout', { method: 'POST' });
      } catch {
        // ignore — best-effort
      }

      if (pathRef.current !== '/login') {
        showToast("You've been signed out.", 'error');
      }
      // Hard navigation guarantees the proxy re-evaluates fresh server-side
      // and clears any client-router state from the (now-invalid) session.
      window.location.href = '/login';
    });
  }, [showToast]);

  return null;
};

export default UnauthorizedListener;
