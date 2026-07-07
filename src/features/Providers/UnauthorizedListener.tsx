'use client';

import { useEffect } from 'react';

import { beginSignout, setUnauthorizedHandler } from '@core/client/auth-handler';

import toastStore from '@stores/toast';

const UnauthorizedListener = () => {
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

      if (window.location.pathname !== '/login') {
        toastStore.getState().showToast("You've been signed out.", 'error');
      }
      // Hard navigation guarantees the proxy re-evaluates fresh server-side
      // and clears any client-router state from the (now-invalid) session.
      window.location.href = '/login';
    });
  }, []);

  return null;
};

export default UnauthorizedListener;
