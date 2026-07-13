'use client';

import { useEffect } from 'react';
import type { ReactNode } from 'react';

import { useRouter } from 'next/navigation';

import FullPageLoader from '@components/FullPageLoader';

import { useAuth } from '@hooks/use-auth';

/**
 * Sends brand-new users (no onboardedAt) to the welcome screen. Sits inside
 * AuthGuard, so `user` is guaranteed present by the time children render.
 * The demo account never onboards.
 */
const OnboardingGuard = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const { user } = useAuth();

  const needsOnboarding = Boolean(user && !user.onboardedAt && !user.isDemo);

  useEffect(() => {
    if (needsOnboarding) {
      router.replace('/welcome');
    }
  }, [needsOnboarding, router]);

  // Keep the loader up while redirecting — rendering children would flash the
  // empty dashboard the welcome screen exists to prevent.
  if (needsOnboarding) return <FullPageLoader />;

  return <>{children}</>;
};

export default OnboardingGuard;
