'use client';

import { useEffect, useRef } from 'react';

import { usePathname, useRouter } from 'next/navigation';

import { useQueryClient } from '@tanstack/react-query';

import { useToast } from '@components/Toast/ToastProvider';

import { setUnauthorizedHandler } from '@/lib/api/auth-handler';
import { queryKeys } from '@/lib/query-keys';

const RESET_MS = 1500;

const UnauthorizedListener = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  const pathRef = useRef(pathname);
  const firedRef = useRef(false);

  useEffect(() => {
    pathRef.current = pathname;
  }, [pathname]);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      if (firedRef.current) return;
      firedRef.current = true;

      queryClient.setQueryData(queryKeys.auth.me(), null);
      queryClient.clear();

      // Clear the (now-invalid) cookie so proxy doesn't bounce /login back to /overview.
      void fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});

      if (pathRef.current !== '/login') {
        showToast("You've been signed out.", 'error');
        router.replace('/login');
      }

      setTimeout(() => {
        firedRef.current = false;
      }, RESET_MS);
    });
  }, [queryClient, router, showToast]);

  return null;
};

export default UnauthorizedListener;
