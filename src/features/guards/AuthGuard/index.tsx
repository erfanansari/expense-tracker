'use client';

import { useEffect } from 'react';
import type { FC, PropsWithChildren } from 'react';

import { beginSignout } from '@core/client/auth-handler';

import FullPageLoader from '@components/FullPageLoader';

import { useAuth } from '@hooks/use-auth';

import { useToast } from '@stores/toast';

const AuthGuard: FC<PropsWithChildren> = ({ children }) => {
  const { user, loading } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    if (loading || user) return;

    // Another path (manual logout, the global 401 listener) already owns this
    // signout — it will toast and navigate; we just keep the loader on screen.
    if (!beginSignout()) return;

    showToast("You've been signed out.", 'error');

    // The cookie may still be present but invalid (expired JWT). Clear it
    // first so the proxy doesn't bounce /login back to /overview, then
    // hard-navigate so the proxy re-evaluates the cookie state fresh
    // server-side. router.replace has been observed to leave the dashboard
    // stuck on a blank screen when the client router state and the cookie
    // state disagree during a logout transition.
    void fetch('/api/auth/sign-out', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{}',
    })
      .catch(() => {})
      .finally(() => {
        window.location.href = '/login';
      });
  }, [user, loading, showToast]);

  // Keep the loader up while signed out and redirecting — returning null here
  // paints a bare white page for the whole cookie-clear + navigation window.
  if (loading || !user) return <FullPageLoader />;

  return <>{children}</>;
};

export default AuthGuard;
