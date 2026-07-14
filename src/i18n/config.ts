export const LOCALES = ['en', 'fa'] as const;

export type AppLocale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: AppLocale = 'en';

/** Readable by client JS so logged-out visitors can switch language pre-auth. */
export const LOCALE_COOKIE = 'kharji-locale';

export const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

export function isAppLocale(value: unknown): value is AppLocale {
  return typeof value === 'string' && (LOCALES as readonly string[]).includes(value);
}
