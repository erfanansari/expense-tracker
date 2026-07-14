import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import { z } from 'zod';

import { validateBody, withAuth } from '@core/api/utils';
import type { LocalePreferences } from '@core/database/locale-preferences';
import { getLocalePreferences, updateLocalePreferences } from '@core/database/locale-preferences';

import { DEFAULT_LOCALE, isAppLocale, LOCALE_COOKIE, LOCALE_COOKIE_MAX_AGE, LOCALES } from '@/i18n/config';

const updateSchema = z
  .object({
    locale: z.enum(LOCALES).optional(),
    calendar: z.enum(['auto', 'gregorian', 'jalali']).optional(),
    secondaryDateCaptions: z.boolean().optional(),
  })
  .refine((v) => v.locale !== undefined || v.calendar !== undefined || v.secondaryDateCaptions !== undefined, {
    message: 'Provide at least one field to update.',
  });

/** The cookie is what SSR reads; keep it in lockstep with the DB preference. */
function withLocaleCookie(response: NextResponse, prefs: LocalePreferences): NextResponse {
  response.cookies.set(LOCALE_COOKIE, prefs.locale, {
    path: '/',
    maxAge: LOCALE_COOKIE_MAX_AGE,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });
  return response;
}

export const GET = withAuth(async (user) => {
  const cookieLocale = (await cookies()).get(LOCALE_COOKIE)?.value;
  // First-ever read for this user (e.g. the onboarding wizard's initial
  // fetch): seed the row from whatever locale they were already browsing in
  // (the same cookie the signup/landing switcher writes) instead of silently
  // defaulting to English and then overwriting their cookie to match.
  const fallbackLocale = isAppLocale(cookieLocale) ? cookieLocale : DEFAULT_LOCALE;
  const prefs = await getLocalePreferences(user.userId, fallbackLocale);
  const response = NextResponse.json(prefs);
  // Re-sync the cookie when it drifted (new device, cleared cookies).
  if (cookieLocale !== prefs.locale) withLocaleCookie(response, prefs);
  return response;
}, 'LocalizationGET');

export const PUT = withAuth(async (user, request) => {
  const body = await request.json();
  const parsed = validateBody(updateSchema, body);
  if (parsed instanceof NextResponse) return parsed;

  const prefs = await updateLocalePreferences(user.userId, parsed.data);
  return withLocaleCookie(NextResponse.json(prefs), prefs);
}, 'LocalizationPUT');
