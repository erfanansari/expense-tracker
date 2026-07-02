'use client';

import { useEffect } from 'react';
import type { FC, PropsWithChildren } from 'react';

import { useRouter } from 'next/navigation';

import FullPageLoader from '@components/FullPageLoader';

import { useAuth } from '@hooks/use-auth';

const GuestGuard: FC<PropsWithChildren> = ({ children }) => {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Single owner of the post-auth redirect: login/signup just set the `me`
  // query data and this effect navigates, honoring the ?rp= return path.
  useEffect(() => {
    if (loading || !user) return;
    const rp = new URLSearchParams(window.location.search).get('rp');
    router.replace(rp && rp.startsWith('/') ? rp : '/overview');
  }, [user, loading, router]);

  if (loading) return <FullPageLoader />;

  // Authenticated: keep the loader up while the redirect above runs —
  // returning null flashes a bare white page between login and /overview.
  if (user) return <FullPageLoader />;

  return <>{children}</>;
};

export default GuestGuard;
