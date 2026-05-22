'use client';

import { useEffect, useRef } from 'react';
import type { FC, PropsWithChildren } from 'react';

import { useRouter } from 'next/navigation';

import FullPageLoader from '@components/FullPageLoader';
import { useToast } from '@components/Toast/ToastProvider';

import { useAuth } from '@hooks/use-auth';

import { consumeSignoutToastSuppression } from '@/lib/api/auth-handler';

const AuthGuard: FC<PropsWithChildren> = ({ children }) => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { showToast } = useToast();
  const firedRef = useRef(false);

  useEffect(() => {
    if (loading || user || firedRef.current) return;
    firedRef.current = true;
    const suppressed = consumeSignoutToastSuppression();
    if (!suppressed) {
      showToast("You've been signed out.", 'error');
    }
    // Clear the (possibly stale/invalid) cookie before redirect so proxy.ts
    // doesn't bounce /login back to /overview. Skip when an intentional
    // logout already cleared it — calling again is harmless but wasteful.
    if (suppressed) {
      router.replace('/login');
    } else {
      void fetch('/api/auth/logout', { method: 'POST' })
        .catch(() => {})
        .finally(() => {
          router.replace('/login');
        });
    }
  }, [user, loading, router, showToast]);

  if (loading) return <FullPageLoader />;

  if (!user) return null;

  return <>{children}</>;
};

export default AuthGuard;
