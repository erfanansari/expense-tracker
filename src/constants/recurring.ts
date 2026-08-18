import type { RecurrenceCalendar, RecurrenceFrequency } from '@/@types/recurring';

/** The frequencies a rule can use. `labelKey` resolves under `constants.frequencies`. */
export const RECURRENCE_FREQUENCIES = [
  { value: 'daily', labelKey: 'daily' },
  { value: 'weekly', labelKey: 'weekly' },
  { value: 'monthly', labelKey: 'monthly' },
  { value: 'yearly', labelKey: 'yearly' },
] as const satisfies readonly { value: RecurrenceFrequency; labelKey: string }[];

export const RECURRENCE_FREQUENCY_VALUES = RECURRENCE_FREQUENCIES.map((f) => f.value) as RecurrenceFrequency[];

export const RECURRENCE_CALENDARS = ['gregorian', 'jalali'] as const satisfies readonly RecurrenceCalendar[];

/**
 * Frequencies whose meaning depends on the calendar. A week is seven days in
 * both systems, so only these two get a calendar toggle in the form — and the
 * engine ignores `calendar` for the rest.
 */
export const CALENDAR_SENSITIVE_FREQUENCIES: readonly RecurrenceFrequency[] = ['monthly', 'yearly'];

export function isCalendarSensitive(frequency: RecurrenceFrequency): boolean {
  return CALENDAR_SENSITIVE_FREQUENCIES.includes(frequency);
}

/** Upper bound on `intervalCount` ("every N periods") — guards the form and the API. */
export const MAX_RECURRENCE_INTERVAL = 99;

/**
 * Most occurrences one rule may post in a single materialization run. A backstop
 * against a daily rule anchored years ago flooding the ledger in one pass; the
 * remainder is picked up on subsequent runs.
 */
export const MAX_OCCURRENCES_PER_RUN = 500;
