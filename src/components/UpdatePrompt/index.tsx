'use client';

import { useEffect, useState } from 'react';

import { useSerwist } from '@serwist/next/react';
import { RefreshCw, X, Zap } from 'lucide-react';

/**
 * Floating "update ready" pill shown when a new service worker takes control
 * mid-session (the SW uses skipWaiting, so by the time `controlling` fires
 * with `isUpdate` the fresh assets are already active — a reload is all
 * that's needed to render them).
 */
const UpdatePrompt = () => {
  const { serwist } = useSerwist();

  const [isVisible, setIsVisible] = useState(false);
  const [isReloading, setIsReloading] = useState(false);

  useEffect(() => {
    if (!serwist) return;

    const onControlling = (event: { isUpdate?: boolean; isExternal?: boolean }) => {
      if (event.isUpdate || event.isExternal) setIsVisible(true);
    };

    serwist.addEventListener('controlling', onControlling);
    return () => serwist.removeEventListener('controlling', onControlling);
  }, [serwist]);

  if (!isVisible) return null;

  const reload = () => {
    setIsReloading(true);
    window.location.reload();
  };

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-auto fixed left-1/2 z-[9999] w-[calc(100vw-2rem)] max-w-sm -translate-x-1/2"
      style={{ bottom: 'max(1.25rem, env(safe-area-inset-bottom))' }}
    >
      <div className="animate-slide-up border-border-subtle bg-background flex items-center gap-3 rounded-2xl border py-3 pr-2 pl-3 shadow-[0_10px_30px_-12px_rgba(0,0,0,0.18),0_4px_8px_-4px_rgba(0,0,0,0.08)]">
        {/* Brand mark with a "fresh" pulse dot */}
        <div className="relative shrink-0">
          <div className="bg-primary flex h-9 w-9 items-center justify-center rounded-xl">
            <Zap className="h-4 w-4 text-white" aria-hidden="true" />
          </div>
          <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5" aria-hidden="true">
            <span className="bg-success absolute inline-flex h-full w-full animate-ping rounded-full opacity-75" />
            <span className="bg-success relative inline-flex h-2.5 w-2.5 rounded-full" />
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-text-primary text-sm font-semibold">Update ready</p>
          <p className="text-text-secondary text-xs">A new version of Kharji is available</p>
        </div>

        <button
          onClick={reload}
          disabled={isReloading}
          className="bg-button-primary-bg text-button-primary-text hover:bg-button-primary-bg-hover flex shrink-0 cursor-pointer items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors duration-200 disabled:cursor-default disabled:opacity-70"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isReloading ? 'animate-spin' : ''}`} aria-hidden="true" />
          Reload
        </button>

        <button
          onClick={() => setIsVisible(false)}
          className="text-action-default hover:bg-action-cancel-bg-hover hover:text-action-cancel-text-hover shrink-0 cursor-pointer rounded-lg p-2 transition-all duration-200"
          title="Dismiss"
          aria-label="Dismiss update notification"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default UpdatePrompt;
