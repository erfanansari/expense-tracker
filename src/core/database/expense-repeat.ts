/**
 * Keeps the `recurringExpenses` row in sync with an expense's `repeat` field.
 *
 * The user never manages rules directly — repetition is a property of the
 * expense's date, so a rule is created, updated or deleted purely as a
 * side-effect of saving the expense that owns it.
 */
import type { InValue } from '@libsql/client';

import { countOccurrencesBefore, nextDueDateFor } from '@core/recurring/schedule';

import { todayInTimeZone } from '@utils';

import type { ExpenseRepeat, RecurrenceRule } from '@/@types/recurring';

import { db } from './client';

interface SyncArgs {
  userId: number;
  expenseId: number;
  /** The expense's own date — the rule's anchor. */
  date: string;
  categoryId: number;
  description: string;
  amount: number;
  currency: string;
  tagIds?: number[];
  /** The account future occurrences should be paid from. Part of the template,
   * like amount and description — so auto-posted rent moves the balance too. */
  paidFromAssetId?: number | null;
  /** `endDate` arrives from Zod's `.nullish()`, so undefined and null both mean
   * "no end date" — normalized to null on the way into the rule. */
  repeat: RepeatInput | null | undefined;
  /** The rule this expense already belongs to, if any. */
  existingRecurringId: number | null;
}

type RepeatInput = Omit<ExpenseRepeat, 'endDate'> & { endDate?: string | null };

function toRule(repeat: RepeatInput, anchorDate: string): RecurrenceRule {
  return {
    frequency: repeat.frequency,
    intervalCount: repeat.intervalCount,
    calendar: repeat.calendar,
    anchorDate,
    endDate: repeat.endDate ?? null,
  };
}

async function copyTags(recurringId: number, tagIds: number[] | undefined): Promise<void> {
  await db.execute({ sql: 'DELETE FROM recurringExpenseTags WHERE recurringId = ?', args: [recurringId] });
  for (const tagId of tagIds ?? []) {
    await db.execute({
      sql: 'INSERT OR IGNORE INTO recurringExpenseTags (recurringId, tagId) VALUES (?, ?)',
      args: [recurringId, tagId],
    });
  }
}

/**
 * Reconcile an expense's repeat with the database.
 *
 * - repeat set, no rule yet → create one anchored on this expense's date
 * - repeat set, rule exists → update it (and re-baseline if the schedule moved)
 * - repeat cleared, rule exists → delete the rule
 *
 * Returns the rule id the expense should point at, or null.
 */
export async function syncExpenseRepeat(args: SyncArgs): Promise<number | null> {
  const { userId, expenseId, date, repeat, existingRecurringId } = args;

  // ── Repeat removed ────────────────────────────────────────────────────────
  if (!repeat) {
    if (existingRecurringId !== null) {
      // Expenses already posted survive — expenses.recurringId is
      // ON DELETE SET NULL, because that's money actually spent.
      await db.execute({
        sql: 'DELETE FROM recurringExpenses WHERE id = ? AND userId = ?',
        args: [existingRecurringId, userId],
      });
    }
    return null;
  }

  const rule = toRule(repeat, date);
  const today = todayInTimeZone();

  // ── Existing rule: update in place ────────────────────────────────────────
  if (existingRecurringId !== null) {
    const current = await db.execute({
      sql: `SELECT frequency, intervalCount, calendar, anchorDate, postedCount
            FROM recurringExpenses WHERE id = ? AND userId = ?`,
      args: [existingRecurringId, userId],
    });

    if (current.rows.length > 0) {
      const row = current.rows[0];
      const scheduleMoved =
        row.frequency !== rule.frequency ||
        row.intervalCount !== rule.intervalCount ||
        row.calendar !== rule.calendar ||
        row.anchorDate !== rule.anchorDate;

      // Editing the amount or description just changes what future occurrences
      // will say. Editing the schedule invalidates postedCount, so re-baseline
      // to "occurrences elapsed under the new schedule" — that resumes from
      // today instead of retro-posting a history that never happened.
      const postedCount = scheduleMoved ? countOccurrencesBefore(rule, today) : (row.postedCount as number);

      await db.execute({
        sql: `UPDATE recurringExpenses
              SET categoryId = ?, description = ?, amount = ?, currency = ?, paidFromAssetId = ?,
                  frequency = ?, intervalCount = ?, calendar = ?, anchorDate = ?, endDate = ?,
                  postedCount = ?, nextDueDate = ?, updatedAt = CURRENT_TIMESTAMP
              WHERE id = ? AND userId = ?`,
        args: [
          args.categoryId,
          args.description,
          args.amount,
          args.currency,
          args.paidFromAssetId ?? null,
          rule.frequency,
          rule.intervalCount,
          rule.calendar,
          rule.anchorDate,
          rule.endDate,
          postedCount,
          nextDueDateFor(rule, postedCount),
          existingRecurringId,
          userId,
        ],
      });
      await copyTags(existingRecurringId, args.tagIds);
      return existingRecurringId;
    }
    // Rule vanished underneath us — fall through and create a fresh one.
  }

  // ── New rule ──────────────────────────────────────────────────────────────
  // postedCount starts at 1: the expense being saved right now *is* occurrence
  // #0, so the schedule must resume at #1 or the same date would post twice.
  const postedCount = 1;

  const inserted = await db.execute({
    sql: `INSERT INTO recurringExpenses
            (userId, categoryId, description, amount, currency, paidFromAssetId, frequency, intervalCount,
             calendar, anchorDate, endDate, postedCount, nextDueDate)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          RETURNING id`,
    args: [
      userId,
      args.categoryId,
      args.description,
      args.amount,
      args.currency,
      args.paidFromAssetId ?? null,
      rule.frequency,
      rule.intervalCount,
      rule.calendar,
      rule.anchorDate,
      rule.endDate,
      postedCount,
      nextDueDateFor(rule, postedCount),
    ],
  });

  const recurringId = inserted.rows[0].id as number;
  await copyTags(recurringId, args.tagIds);

  await db.execute({
    sql: 'UPDATE expenses SET recurringId = ? WHERE id = ? AND user_id = ?',
    args: [recurringId, expenseId, userId],
  });

  return recurringId;
}

/** Map of expenseId -> the repeat behind it, for joining into expense lists. */
export async function fetchRepeatsForExpenses(expenseIds: InValue[]): Promise<Record<number, ExpenseRepeat>> {
  const map: Record<number, ExpenseRepeat> = {};
  if (expenseIds.length === 0) return map;

  const placeholders = expenseIds.map(() => '?').join(',');
  const result = await db.execute({
    sql: `SELECT e.id AS expenseId, r.frequency, r.intervalCount, r.calendar, r.endDate
          FROM expenses e
          JOIN recurringExpenses r ON e.recurringId = r.id
          WHERE e.id IN (${placeholders})`,
    args: expenseIds,
  });

  for (const row of result.rows) {
    map[row.expenseId as number] = {
      frequency: row.frequency as ExpenseRepeat['frequency'],
      intervalCount: row.intervalCount as number,
      calendar: row.calendar as ExpenseRepeat['calendar'],
      endDate: (row.endDate as string | null) ?? null,
    };
  }
  return map;
}
