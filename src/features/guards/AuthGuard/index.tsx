'use client';

import { useEffect, useRef } from 'react';
import type { FC, PropsWithChildren } from 'react';

import FullPageLoader from '@components/FullPageLoader';
import { useToast } from '@components/Toast/ToastProvider';

import { useAuth } from '@hooks/use-auth';

import { consumeSignoutToastSuppression } from '@/lib/api/auth-handler';

const AuthGuard: FC<PropsWithChildren> = ({ children }) => {
  const { user, loading } = useAuth();
  const { showToast } = useToast();
  const firedRef = useRef(false);

  useEffect(() => {
    if (loading || user || firedRef.current) return;
    firedRef.current = true;
    const suppressed = consumeSignoutToastSuppression();
    if (!suppressed) {
      showToast("You've been signed out.", 'error');
    }

    const redirect = () => {
      // Hard navigation guarantees the proxy re-evaluates the cookie state
      // fresh server-side. router.replace has been observed to leave the
      // dashboard stuck on a blank screen when the client router state and
      // the cookie state disagree during a logout transition.
      window.location.href = '/login';
    };

    if (suppressed) {
      // Intentional logout already deleted the cookie — just redirect.
      redirect();
    } else {
      // Cookie may still be present but invalid (expired JWT). Clear it first
      // so the proxy doesn't bounce /login back to /overview.
      void fetch('/api/auth/logout', { method: 'POST' })
        .catch(() => {})
        .finally(redirect);
    }
  }, [user, loading, showToast]);

  if (loading) return <FullPageLoader />;

  if (!user) return null;

  return <>{children}</>;
};

export default AuthGuard;
