import { cache } from 'react';

import { cookies, headers } from 'next/headers';

import { auth } from '@core/auth/auth';
import { getLocalePreferences } from '@core/database/locale-preferences';

import { type AppLocale, DEFAULT_LOCALE, isAppLocale, LOCALE_COOKIE } from '@/i18n/config';

/**
 * Resolve the UI locale for the current request.
 * Cookie first (steady state: zero DB reads), then the DB preference for
 * signed-in users on a fresh device, then Farsi.
 */
export const getUserLocale = cache(async (): Promise<AppLocale> => {
  const store = await cookies();
  const cookieLocale = store.get(LOCALE_COOKIE)?.value;
  if (isAppLocale(cookieLocale)) return cookieLocale;

  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return DEFAULT_LOCALE;

    const prefs = await getLocalePreferences(Number(session.user.id));
    return prefs.locale;
  } catch {
    return DEFAULT_LOCALE;
  }
});
