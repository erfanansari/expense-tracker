/**
 * Turns due recurring rules into real expense rows.
 *
 * Called from two places:
 *   1. the daily cron (`/api/cron/reports`), for every user;
 *   2. lazily on the read path (`GET /api/expenses`, `GET /api/recurring`) for
 *      the current user, so someone opening the app before the cron fires still
 *      sees today's rent.
 *
 * Those two can race. They don't corrupt anything: the partial unique index
 * `idxExpenseRecurringOnce` makes a duplicate insert a no-op, and `postedCount`
 * advances on the "already exists" path too, so the rule still moves forward.
 */
import { db } from '@core/database/client';
import { applyFundingToExpense } from '@core/database/expense-funding';
import { getEntryRateOn } from '@core/rates';

import { todayInTimeZone } from '@utils';

import type { RecurrenceRule } from '@/@types/recurring';
import { MAX_OCCURRENCES_PER_RUN } from '@/constants/recurring';

import { dueOccurrences, nextDueDateFor } from './schedule';

export interface MaterializeSummary {
  /** Rules that had at least one occurrence owed. */
  rulesProcessed: number;
  /** Expense rows actually inserted. */
  expensesCreated: number;
  /** Occurrences skipped because no exchange rate was available yet. */
  rateBlocked: number;
  /** Generated expenses that moved an account balance. */
  fundingApplied: number;
  /** Generated expenses whose rule named an account we couldn't deduct from
   *  (deleted, no longer spendable, no rate). The expense still posted. */
  fundingSkipped: number;
}

interface RuleRow {
  id: number;
  userId: number;
  categoryId: number;
  description: string;
  amount: number;
  currency: string;
  paidFromAssetId: number | null;
  frequency: string;
  intervalCount: number;
  calendar: string;
  anchorDate: string;
  endDate: string | null;
  postedCount: number;
}

function toRecurrenceRule(row: RuleRow): RecurrenceRule {
  return {
    frequency: row.frequency as RecurrenceRule['frequency'],
    intervalCount: row.intervalCount,
    calendar: row.calendar as RecurrenceRule['calendar'],
    anchorDate: row.anchorDate,
    endDate: row.endDate,
  };
}

async function loadRuleTagIds(recurringId: number): Promise<number[]> {
  const res = await db.execute({
    sql: 'SELECT tagId FROM recurringExpenseTags WHERE recurringId = ?',
    args: [recurringId],
  });
  return res.rows.map((r) => r.tagId as number);
}

/**
 * Insert one generated expense. Returns its id, or null when a row for this
 * (rule, date) already exists — the caller still advances `postedCount`, because
 * "already posted" and "just posted" are the same outcome as far as the schedule
 * is concerned.
 */
async function insertGeneratedExpense(
  row: RuleRow,
  date: string,
  entryRate: number,
  tagIds: number[]
): Promise<number | null> {
  const result = await db.execute({
    sql: `INSERT INTO expenses (user_id, date, category_id, description, amount, currency, entryRate, recurringId, paidFromAssetId)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
          -- The conflict target must repeat the partial index's WHERE clause,
          -- or SQLite refuses to match it to any unique constraint.
          ON CONFLICT(recurringId, date) WHERE recurringId IS NOT NULL DO NOTHING
          RETURNING id`,
    args: [
      row.userId,
      date,
      row.categoryId,
      row.description,
      row.amount,
      row.currency,
      entryRate,
      row.id,
      row.paidFromAssetId,
    ],
  });

  const expenseId = result.rows[0]?.id as number | undefined;
  if (expenseId === undefined) return null;

  for (const tagId of tagIds) {
    await db.execute({
      sql: 'INSERT OR IGNORE INTO expense_tags (expense_id, tag_id) VALUES (?, ?)',
      args: [expenseId, tagId],
    });
  }

  return expenseId;
}

/**
 * Deduct a generated expense from the account its rule names.
 *
 * ── Why this is a separate write from the INSERT above ────────────────────
 * It looks like a missed optimization; it is the double-deduct guarantee.
 *
 * `insertGeneratedExpense` is a single atomic statement whose `ON CONFLICT …
 * DO NOTHING RETURNING id` yields an id only to whichever caller actually
 * created the row. The daily cron and the lazy read-path materializer race
 * freely on the 1st of the month; exactly one of them wins, and funding hangs
 * off that win. Folding the balance update into the same batch would break it,
 * because a batch's statements are unconditional — the conflict would no-op the
 * insert while the asset UPDATE still ran, deducting twice.
 *
 * The cost is a crash window leaving the expense with `paidFromAssetId` set and
 * `paidFromDelta` NULL: chosen but not applied. That is safe, detectable with
 * one query, and self-repairing the next time the expense is edited.
 *
 * A funding failure must never abort the run. Losing an occurrence is worse
 * than posting one whose balance needs a nudge — the expense is the money, the
 * balance is bookkeeping the user can correct.
 */
async function fundGeneratedExpense(
  row: RuleRow,
  expenseId: number,
  entryRate: number,
  summary: MaterializeSummary
): Promise<void> {
  if (row.paidFromAssetId === null) return;

  try {
    const plan = await applyFundingToExpense({
      userId: row.userId,
      expenseId,
      assetId: row.paidFromAssetId,
      expense: { amount: row.amount, currency: row.currency, entryRate },
    });

    if (plan.ok) {
      summary.fundingApplied += 1;
    } else {
      summary.fundingSkipped += 1;
      console.warn(`[recurring] rule ${row.id}: no deduction for expense ${expenseId} (${plan.reason})`);
    }
  } catch (error) {
    summary.fundingSkipped += 1;
    console.error(`[recurring] rule ${row.id}: funding expense ${expenseId} failed:`, error);
  }
}

/**
 * Post every occurrence owed as of today.
 *
 * Scoped to one user when `userId` is given (the read path), otherwise every
 * user (the cron). Cheap when nothing is due: one indexed query that returns no
 * rows.
 *
 * "Today" is resolved in the app's fixed zone (Tehran) rather than UTC — expense
 * dates carry no timezone, and the cron runs at 09:00 UTC, so a UTC "today"
 * would put a 1st-of-month rule on the wrong local day.
 */
export async function materializeDueExpenses(userId?: number): Promise<MaterializeSummary> {
  const today = todayInTimeZone();
  const summary: MaterializeSummary = {
    rulesProcessed: 0,
    expensesCreated: 0,
    rateBlocked: 0,
    fundingApplied: 0,
    fundingSkipped: 0,
  };

  // Exhausted rules (next occurrence past their end date) are filtered out in
  // SQL rather than skipped in JS, so they stop being re-read every single run.
  const result = await db.execute({
    sql: `SELECT id, userId, categoryId, description, amount, currency, paidFromAssetId,
                 frequency, intervalCount, calendar, anchorDate, endDate, postedCount
          FROM recurringExpenses
          WHERE paused = 0
            AND nextDueDate <= ?
            AND (endDate IS NULL OR nextDueDate <= endDate)
            ${userId !== undefined ? 'AND userId = ?' : ''}`,
    args: userId !== undefined ? [today, userId] : [today],
  });

  // One rate lookup per (currency, date) pair per run, not per occurrence.
  const rateCache = new Map<string, number | null>();
  const rateFor = async (currency: string, date: string): Promise<number | null> => {
    const key = `${currency}:${date}`;
    if (!rateCache.has(key)) rateCache.set(key, await getEntryRateOn(currency, date));
    return rateCache.get(key) ?? null;
  };

  for (const raw of result.rows) {
    const row = raw as unknown as RuleRow;
    const rule = toRecurrenceRule(row);
    const owed = dueOccurrences(rule, row.postedCount, today, MAX_OCCURRENCES_PER_RUN);
    if (owed.length === 0) continue;

    summary.rulesProcessed += 1;

    const tagIds = await loadRuleTagIds(row.id);
    let postedCount = row.postedCount;
    let lastPostedDate: string | null = null;

    for (const date of owed) {
      const entryRate = await rateFor(row.currency, date);
      if (entryRate === null) {
        // No rate for this currency yet. Stop without advancing, so the
        // occurrence is retried on the next run rather than silently lost.
        summary.rateBlocked += 1;
        break;
      }

      try {
        const expenseId = await insertGeneratedExpense(row, date, entryRate, tagIds);
        if (expenseId !== null) {
          summary.expensesCreated += 1;
          await fundGeneratedExpense(row, expenseId, entryRate, summary);
        }
      } catch (error) {
        // A single bad occurrence must not abort the rest of the batch.
        console.error(`[recurring] rule ${row.id} failed to post ${date}:`, error);
        break;
      }

      postedCount += 1;
      lastPostedDate = date;
    }

    if (postedCount === row.postedCount) continue;

    await db.execute({
      sql: `UPDATE recurringExpenses
            SET postedCount = ?, nextDueDate = ?, lastPostedDate = ?, updatedAt = CURRENT_TIMESTAMP
            WHERE id = ?`,
      args: [postedCount, nextDueDateFor(rule, postedCount), lastPostedDate, row.id],
    });
  }

  return summary;
}

/**
 * Read-path wrapper: never let a scheduling hiccup break a page load. The cron
 * is the reliable path; this is the "see it immediately" convenience on top.
 */
export async function materializeDueExpensesSafely(userId: number): Promise<void> {
  try {
    await materializeDueExpenses(userId);
  } catch (error) {
    console.error('[recurring] lazy catch-up failed:', error);
  }
}
