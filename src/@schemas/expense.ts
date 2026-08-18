import { z } from 'zod';

import type { RecurrenceCalendar, RecurrenceFrequency } from '@/@types/recurring';
import { SUPPORTED_CURRENCY_CODES } from '@/constants/currencies';
import { MAX_RECURRENCE_INTERVAL, RECURRENCE_CALENDARS, RECURRENCE_FREQUENCY_VALUES } from '@/constants/recurring';

import type { Translator } from './fallback-translator';

export const currencyCodeSchema = z.enum(SUPPORTED_CURRENCY_CODES as [string, ...string[]]);

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Repetition is a property of the expense's date, not a separate record the user
 * manages — the same shape Todoist gives a task's due date. `null` means "doesn't
 * repeat", which is also how a user removes an existing repeat.
 */
function createRepeatSchema(t: Translator) {
  return z.object({
    frequency: z.enum(RECURRENCE_FREQUENCY_VALUES as [RecurrenceFrequency, ...RecurrenceFrequency[]]),
    intervalCount: z
      .number()
      .int()
      .min(1, t('zod.recurring.intervalMin'))
      .max(MAX_RECURRENCE_INTERVAL, t('zod.recurring.intervalMax')),
    calendar: z.enum(RECURRENCE_CALENDARS as unknown as [RecurrenceCalendar, ...RecurrenceCalendar[]]),
    endDate: z.string().regex(ISO_DATE, t('zod.recurring.endInvalid')).nullish(),
  });
}

/**
 * The plain object shape, without the cross-field refinement.
 *
 * Kept separate because Zod refuses `.partial()` on a schema carrying
 * refinements, and the update mutation needs exactly that. Prefer
 * `createExpenseSchema` for validation; reach for this only when you need to
 * transform the shape (`.partial()`, `.pick()`, `.extend()`).
 */
export function createExpenseObjectSchema(t: Translator) {
  return z.object({
    date: z.string().min(1, t('zod.expense.dateRequired')),
    categoryId: z.number().int().positive(t('zod.expense.categoryRequired')),
    description: z.string().min(1, t('zod.expense.descriptionRequired')),
    amount: z.number().min(0, t('zod.expense.amountNonNegative')),
    currency: currencyCodeSchema,
    tagIds: z.array(z.number().int()).optional(),
    repeat: createRepeatSchema(t).nullish(),
  });
}

export function createExpenseSchema(t: Translator) {
  return (
    createExpenseObjectSchema(t)
      // An end date before the expense's own date would produce a repeat that can
      // never fire — reject it here rather than storing a dead rule.
      .refine((v) => !v.repeat?.endDate || v.repeat.endDate >= v.date, {
        message: t('zod.recurring.endBeforeStart'),
        path: ['repeat', 'endDate'],
      })
  );
}

export type CreateExpenseSchema = z.infer<ReturnType<typeof createExpenseSchema>>;
export type RepeatSchema = NonNullable<CreateExpenseSchema['repeat']>;
