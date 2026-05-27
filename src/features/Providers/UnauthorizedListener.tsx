'use client';

import { useEffect, useRef } from 'react';

import { usePathname } from 'next/navigation';

import { useQueryClient } from '@tanstack/react-query';

import { useToast } from '@components/Toast/ToastProvider';

import { setUnauthorizedHandler } from '@/lib/api/auth-handler';
import { queryKeys } from '@/lib/query-keys';

const UnauthorizedListener = () => {
  const pathname = usePathname();
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  const pathRef = useRef(pathname);
  const firedRef = useRef(false);

  useEffect(() => {
    pathRef.current = pathname;
  }, [pathname]);

  useEffect(() => {
    setUnauthorizedHandler(async () => {
      if (firedRef.current) return;
      firedRef.current = true;

      queryClient.setQueryData(queryKeys.auth.me(), null);
      queryClient.clear();

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
  }, [queryClient, showToast]);

  return null;
};

export default UnauthorizedListener;
