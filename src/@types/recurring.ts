/** How often a repeat fires. `calendar` only changes the meaning of monthly/yearly. */
export type RecurrenceFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly';

/** Which calendar the recurrence walks. See RecurrenceRule.calendar. */
export type RecurrenceCalendar = 'gregorian' | 'jalali';

/** Everything the occurrence engine needs, and nothing else — no money, no
 * category. Keeps the pure schedule math independent of the expense it belongs to. */
export interface RecurrenceRule {
  frequency: RecurrenceFrequency;
  intervalCount: number;
  calendar: RecurrenceCalendar;
  /** yyyy-MM-dd — occurrence #0, and the day-of-month the schedule returns to. */
  anchorDate: string;
  /** yyyy-MM-dd, or null to run forever. */
  endDate: string | null;
}

/**
 * The repeat attached to an expense, as the UI sees it.
 *
 * Deliberately omits `anchorDate` — the expense's own `date` is the anchor, which
 * is what makes repetition feel like a property of the date rather than a
 * separate thing to configure.
 */
export interface ExpenseRepeat {
  frequency: RecurrenceFrequency;
  intervalCount: number;
  calendar: RecurrenceCalendar;
  endDate: string | null;
}
