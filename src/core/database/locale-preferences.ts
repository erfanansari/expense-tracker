import type { Client } from '@libsql/client';

import type { AppLocale } from '@/i18n/config';

import { db } from './client';

type Executor = Pick<Client, 'execute'>;

export type CalendarPreference = 'auto' | 'gregorian' | 'jalali';

export interface LocalePreferences {
  locale: AppLocale;
  /** auto = gregorian for en, jalali for fa. */
  calendar: CalendarPreference;
  /** Show the other calendar as a muted caption under dates. */
  secondaryDateCaptions: boolean;
}

const DEFAULTS: LocalePreferences = {
  locale: 'en',
  calendar: 'auto',
  secondaryDateCaptions: true,
};

/** Insert default locale preferences for a new user (idempotent). */
export async function createDefaultLocalePreferences(userId: number, executor: Executor = db): Promise<void> {
  await executor.execute({
    sql: `INSERT OR IGNORE INTO userLocalePreferences (userId, locale, calendar, secondaryDateCaptions)
          VALUES (?, ?, ?, ?)`,
    args: [userId, DEFAULTS.locale, DEFAULTS.calendar, DEFAULTS.secondaryDateCaptions ? 1 : 0],
  });
}

/** Fetch a user's locale preferences, lazy-creating the row if missing. */
export async function getLocalePreferences(userId: number): Promise<LocalePreferences> {
  const existing = await db.execute({
    sql: `SELECT locale, calendar, secondaryDateCaptions FROM userLocalePreferences WHERE userId = ?`,
    args: [userId],
  });

  if (existing.rows.length === 0) {
    await createDefaultLocalePreferences(userId);
    return { ...DEFAULTS };
  }

  const row = existing.rows[0];
  return {
    locale: (row.locale === 'fa' ? 'fa' : 'en') as AppLocale,
    calendar: ((row.calendar as string | null) ?? DEFAULTS.calendar) as CalendarPreference,
    secondaryDateCaptions: Number(row.secondaryDateCaptions) === 1,
  };
}

export async function updateLocalePreferences(
  userId: number,
  patch: Partial<LocalePreferences>
): Promise<LocalePreferences> {
  const fields: string[] = [];
  const args: (number | string)[] = [];

  if (typeof patch.locale === 'string') {
    fields.push('locale = ?');
    args.push(patch.locale);
  }
  if (typeof patch.calendar === 'string') {
    fields.push('calendar = ?');
    args.push(patch.calendar);
  }
  if (typeof patch.secondaryDateCaptions === 'boolean') {
    fields.push('secondaryDateCaptions = ?');
    args.push(patch.secondaryDateCaptions ? 1 : 0);
  }

  if (fields.length > 0) {
    // Ensure the row exists before updating (predates backfill / new user).
    await createDefaultLocalePreferences(userId);
    fields.push('updatedAt = CURRENT_TIMESTAMP');
    args.push(userId);
    await db.execute({
      sql: `UPDATE userLocalePreferences SET ${fields.join(', ')} WHERE userId = ?`,
      args,
    });
  }

  return getLocalePreferences(userId);
}
