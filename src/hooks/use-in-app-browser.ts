'use client';

import { useSyncExternalStore } from 'react';

import { detectInAppBrowser, type InAppBrowser } from '@utils';

// The result never changes while the page is open, but `useSyncExternalStore`
// demands a referentially stable snapshot — so memoize it, keyed by the user
// agent that produced it.
let cachedUserAgent: string | undefined;
let cachedResult: InAppBrowser | null = null;

const getSnapshot = (): InAppBrowser | null => {
  const userAgent = window.navigator.userAgent;
  if (userAgent === cachedUserAgent) return cachedResult;

  // An installed PWA also runs in a WebView-ish shell, but Google accepts it.
  const isStandalone =
    window.matchMedia?.('(display-mode: standalone)').matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true;

  cachedUserAgent = userAgent;
  cachedResult = isStandalone ? null : detectInAppBrowser(userAgent);

  return cachedResult;
};

// Nothing to subscribe to: the value is fixed for the lifetime of the document.
const subscribe = () => () => {};

// The server can't know, and claiming otherwise would break hydration.
const getServerSnapshot = () => null;

/**
 * Reports whether the page is running inside an app's embedded browser
 * (Telegram, Instagram, …), where Google OAuth is blocked.
 */
export function useInAppBrowser(): InAppBrowser | null {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
