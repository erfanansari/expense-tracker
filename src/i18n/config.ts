export const LOCALES = ['en', 'fa'] as const;

export type AppLocale = (typeof LOCALES)[number];

/** Kharji is Farsi-first: everyone gets fa/RTL unless they deliberately pick English. */
export const DEFAULT_LOCALE: AppLocale = 'fa';

/** Readable by client JS so logged-out visitors can switch language pre-auth.
 * Bumped to -v2 when the default flipped to Farsi: the previous cookie has a
 * one-year max-age and is read before the DB, so stale `kharji-locale=en` values
 * would otherwise keep existing users on English for another year. */
export const LOCALE_COOKIE = 'kharji-locale-v2';

export const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

export function isAppLocale(value: unknown): value is AppLocale {
  return typeof value === 'string' && (LOCALES as readonly string[]).includes(value);
}
