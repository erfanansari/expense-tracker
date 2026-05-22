'use client';

import { useEffect, useRef } from 'react';
import type { FC, PropsWithChildren } from 'react';

import { useRouter } from 'next/navigation';

import FullPageLoader from '@components/FullPageLoader';
import { useToast } from '@components/Toast/ToastProvider';

import { useAuth } from '@hooks/use-auth';

const AuthGuard: FC<PropsWithChildren> = ({ children }) => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { showToast } = useToast();
  const firedRef = useRef(false);

  useEffect(() => {
    if (loading || user || firedRef.current) return;
    firedRef.current = true;
    showToast("You've been signed out.", 'error');
    router.replace('/login');
  }, [user, loading, router, showToast]);

  if (loading) return <FullPageLoader />;

  if (!user) return null;

  return <>{children}</>;
};

export default AuthGuard;
