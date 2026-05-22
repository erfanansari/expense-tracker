'use client';

import { useEffect } from 'react';
import type { FC, PropsWithChildren } from 'react';

import { useRouter } from 'next/navigation';

import FullPageLoader from '@components/FullPageLoader';

import { useAuth } from '@hooks/use-auth';

const GuestGuard: FC<PropsWithChildren> = ({ children }) => {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading || !user) return;
    const rp = new URLSearchParams(window.location.search).get('rp');
    router.replace(rp && rp.startsWith('/') ? rp : '/overview');
  }, [user, loading, router]);

  if (loading) return <FullPageLoader />;

  if (user) return null;

  return <>{children}</>;
};

export default GuestGuard;
