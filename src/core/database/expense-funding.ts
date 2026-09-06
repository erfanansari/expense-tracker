/**
 * Moves an account's balance when an expense is paid out of it.
 *
 * Funding is a side-effect of saving an expense, never something the user
 * manages on its own — the same shape as `expense-repeat.ts`. What it exposes
 * is a *planner* plus *statement builders* rather than self-transacting
 * functions, because the callers need to commit the expense write and the
 * balance write in one `db.batch(..., 'write')`. An expense that disagrees with
 * the balance it moved is the one failure mode worth designing the API around.
 *
 * ── The invariant this file must never break ───────────────────────────────
 * `assets.amount` is the denormalized current balance. Migration 020 exists
 * because it once drifted from the valuation history, so every write here:
 *
 *   1. moves `assets.amount` **relatively** (`amount = ROUND(amount - ?, ?)`),
 *      never read-modify-write, so two expenses landing on one account in the
 *      same materializer run compose instead of losing an update; and
 *   2. appends an `assetValuations` row **selected back out of the row it just
 *      wrote**, so `assets.amount == newest valuation.amount` and
 *      `assets.lastValuedAt == newest valuation.valuedAt` hold by construction
 *      rather than by two code paths agreeing.
 *
 * ── Rate policy ───────────────────────────────────────────────────────────
 * The account leg always uses **today's** rate (`getEntryRate`), on every path
 * including the materializer's backdated catch-ups. Pinning it to the expense's
 * date would make the delta's pivot value line up exactly with the expense's —
 * prettier — but the same write re-snapshots `assets.entryRate`, and that rate
 * has to agree with `assets.lastValuedAt`, which is *now*. A past-dated rate
 * beside a present-dated `lastValuedAt` is precisely the drift 020 repaired.
 */
import type { InStatement, InValue } from '@libsql/client';

import { currencyDecimals, fundingDelta, resyncOps, wouldOverdraw } from '@core/accounts/balance';
import type { FundingState, MoneyRecord } from '@core/accounts/balance';
import { getEntryRate } from '@core/rates';

import type { ExpensePaidFrom } from '@/@types/expense';
import { isSpendableAssetCategory } from '@/constants/assets';

import { db } from './client';

export type { FundingState } from '@core/accounts/balance';

// ---------------------------------------------------------------------------
// Plan
// ---------------------------------------------------------------------------

export interface FundingPlanOk {
  ok: true;
  assetId: number;
  name: string;
  /** The account's currency at plan time — persisted alongside the delta. */
  currency: string;
  decimals: number;
  /** Today's pivot-per-unit for `currency`; also written to assets.entryRate. */
  rate: number;
  /** Positive, expressed in `currency`. */
  delta: number;
  balanceBefore: number;
  balanceAfter: number;
  overdraws: boolean;
}

export type FundingPlanErrorReason = 'not-found' | 'not-spendable' | 'no-rate';
export interface FundingPlanError {
  ok: false;
  reason: FundingPlanErrorReason;
}

export type FundingPlan = FundingPlanOk | FundingPlanError;

/**
 * How each planning failure surfaces on the interactive routes.
 *
 * Deliberately never "save it silently unfunded": the user picked an account
 * and would otherwise believe their balance moved. The materializer takes the
 * opposite trade — see its call site — because losing an occurrence is worse
 * than posting one whose balance needs a manual nudge.
 */
export const FUNDING_ERROR_STATUS: Record<FundingPlanErrorReason, number> = {
  'not-found': 404,
  'not-spendable': 400,
  'no-rate': 422,
};

export const FUNDING_ERROR_MESSAGE: Record<FundingPlanErrorReason, string> = {
  'not-found': 'Account not found',
  'not-spendable': 'Only cash and bank assets can pay for an expense',
  'no-rate': 'No exchange rate available for that account',
};

/**
 * Resolve an account and work out what paying `expense` out of it would cost.
 * Reads only — nothing is written until the caller commits the statements.
 */
export async function planFunding(args: {
  userId: number;
  assetId: number;
  expense: MoneyRecord;
}): Promise<FundingPlan> {
  const { userId, assetId, expense } = args;

  const result = await db.execute({
    sql: 'SELECT id, name, category, amount, currency FROM assets WHERE id = ? AND userId = ?',
    args: [assetId, userId],
  });
  const asset = result.rows[0];
  if (!asset) return { ok: false, reason: 'not-found' };

  // You hand over cash and you move money out of a bank; you do not pay rent
  // "from" your apartment. See SPENDABLE_ASSET_CATEGORIES.
  if (!isSpendableAssetCategory(asset.category as string)) return { ok: false, reason: 'not-spendable' };

  const currency = asset.currency as string;
  const rate = await getEntryRate(currency);
  if (rate === null) return { ok: false, reason: 'no-rate' };

  const delta = fundingDelta(expense, currency, rate);
  if (delta === null) return { ok: false, reason: 'no-rate' };

  const balanceBefore = asset.amount as number;

  return {
    ok: true,
    assetId,
    name: asset.name as string,
    currency,
    decimals: currencyDecimals(currency),
    rate,
    delta,
    balanceBefore,
    balanceAfter: balanceBefore - delta,
    overdraws: wouldOverdraw(balanceBefore, delta),
  };
}

// ---------------------------------------------------------------------------
// Statements
// ---------------------------------------------------------------------------

/** One balance movement. Positive delta = money leaves the account. */
export interface FundingStatementOp {
  assetId: number;
  delta: number;
  decimals: number;
  /** Written to `assets.entryRate` so it stays consistent with lastValuedAt. */
  entryRate: number;
}

/**
 * The statements that move balances and snapshot them.
 *
 * Callers MUST run these inside one `db.batch(..., 'write')` together with the
 * expense-row write they belong to. `valuedAt` is a single timestamp bound to
 * every op, so an account switch produces two snapshots sharing one moment.
 *
 * Both statements are scoped `WHERE id = ? AND userId = ?`. If the asset was
 * deleted between planning and committing, the UPDATE matches nothing and the
 * INSERT…SELECT selects nothing — under-applied, never phantom.
 */
export function buildFundingStatements(userId: number, ops: FundingStatementOp[], valuedAt: string): InStatement[] {
  const statements: InStatement[] = [];

  for (const op of ops) {
    statements.push({
      // SQLite evaluates every SET right-hand side against the pre-update row,
      // so `amount - ?` inside the CASE still refers to the old balance.
      //
      // unitValue is recomputed only for unlinked assets that actually carry
      // one: a linked asset's unitValue is owned by the price feed (see
      // /api/assets/revalue), and an account with a null unitValue should keep
      // it null rather than acquire a meaningless price-per-unit.
      sql: `UPDATE assets
               SET amount       = ROUND(amount - ?, ?),
                   unitValue    = CASE
                                    WHEN linkedItem IS NULL AND unitValue IS NOT NULL AND quantity > 0
                                    THEN ROUND((amount - ?) / quantity, ?)
                                    ELSE unitValue
                                  END,
                   entryRate    = ?,
                   lastValuedAt = ?,
                   updatedAt    = CURRENT_TIMESTAMP
             WHERE id = ? AND userId = ?`,
      args: [op.delta, op.decimals, op.delta, op.decimals, op.entryRate, valuedAt, op.assetId, userId],
    });

    statements.push({
      // Selected back out of the row the previous statement just wrote, in the
      // same transaction — that is what makes the snapshot unable to disagree
      // with the balance. Do not "simplify" this to VALUES with JS-computed
      // numbers; that is exactly the shape migration 020 had to repair.
      sql: `INSERT INTO assetValuations (assetId, quantity, unitValue, amount, currency, entryRate, valuedAt, source)
            SELECT id, quantity, unitValue, amount, currency, entryRate, lastValuedAt, 'expense'
              FROM assets WHERE id = ? AND userId = ?`,
      args: [op.assetId, userId],
    });
  }

  return statements;
}

/**
 * Record on the expense what was actually deducted.
 *
 * `paidFromDelta IS NULL` makes this write once-only, and the EXISTS guard
 * refuses to claim a deduction against an account that vanished mid-flight —
 * together they keep "chosen but not applied" the only reachable partial state.
 */
export function buildFundingStampStatement(userId: number, expenseId: number, plan: FundingPlanOk): InStatement {
  return {
    sql: `UPDATE expenses
             SET paidFromDelta = ?, paidFromCurrency = ?
           WHERE id = ? AND user_id = ? AND paidFromDelta IS NULL
             AND EXISTS (SELECT 1 FROM assets WHERE id = ? AND userId = ?)`,
    args: [plan.delta, plan.currency, expenseId, userId, plan.assetId, userId],
  };
}

/** The funding recorded on an expense row, or null if there is none to reverse.
 *  All three columns must be present — a row mid-way through the two-phase
 *  write has nothing to reverse, because nothing was applied. */
export function readFunding(row: Record<string, unknown>): FundingState | null {
  const assetId = row.paidFromAssetId as number | null;
  const delta = row.paidFromDelta as number | null;
  const currency = row.paidFromCurrency as string | null;
  if (assetId === null || assetId === undefined) return null;
  if (delta === null || delta === undefined) return null;
  if (currency === null || currency === undefined) return null;
  return { assetId, delta, currency };
}

interface AccountRow {
  currency: string;
  entryRate: number;
}

async function loadAccount(userId: number, assetId: number): Promise<AccountRow | null> {
  const res = await db.execute({
    sql: 'SELECT currency, entryRate FROM assets WHERE id = ? AND userId = ?',
    args: [assetId, userId],
  });
  const row = res.rows[0];
  return row ? { currency: row.currency as string, entryRate: row.entryRate as number } : null;
}

/**
 * Turn signed balance ops into statements, resolving each account's currency
 * and today's rate.
 *
 * A missing rate must never block a *credit* — refusing to give money back
 * because an API is down would be strictly worse than a slightly stale rate. So
 * the account's own stored `entryRate` is the fallback, which preserves its
 * pivot value exactly.
 */
async function opsToStatements(
  userId: number,
  ops: { assetId: number; delta: number }[],
  valuedAt: string
): Promise<InStatement[]> {
  const resolved: FundingStatementOp[] = [];

  for (const op of ops) {
    const account = await loadAccount(userId, op.assetId);
    if (!account) continue; // Deleted underneath us — nothing left to move.

    const rate = (await getEntryRate(account.currency)) ?? account.entryRate;
    resolved.push({
      assetId: op.assetId,
      delta: op.delta,
      decimals: currencyDecimals(account.currency),
      entryRate: rate,
    });
  }

  return buildFundingStatements(userId, resolved, valuedAt);
}

/**
 * Statements that give a recorded deduction back.
 *
 * Returns nothing when the account is gone, and nothing when its currency has
 * changed since the deduction was applied — crediting a dollar figure into a
 * toman balance would silently corrupt it, so refuse and say so rather than
 * guess. This is what `paidFromCurrency` is stored for.
 */
export async function buildReversalStatements(
  userId: number,
  funding: FundingState | null,
  valuedAt: string
): Promise<InStatement[]> {
  if (!funding) return [];

  const account = await loadAccount(userId, funding.assetId);
  if (!account) return [];

  if (account.currency !== funding.currency) {
    console.warn(
      `[funding] refusing to reverse ${funding.delta} ${funding.currency} into asset ${funding.assetId}, now held in ${account.currency}`
    );
    return [];
  }

  return opsToStatements(userId, [{ assetId: funding.assetId, delta: -funding.delta }], valuedAt);
}

/**
 * Statements taking an expense's funding from `before` to `after`.
 *
 * Same-account edits net into one movement, so changing 500,000 to 700,000
 * writes a single −200,000 rather than a credit-back plus a re-debit.
 */
export async function buildResyncStatements(args: {
  userId: number;
  before: FundingState | null;
  after: FundingPlanOk | null;
  valuedAt: string;
}): Promise<InStatement[]> {
  const { userId, before, after, valuedAt } = args;

  const afterState: FundingState | null = after
    ? { assetId: after.assetId, delta: after.delta, currency: after.currency }
    : null;

  // A stale delta in a currency the account no longer holds can't be credited
  // back (see buildReversalStatements). Drop the credit half but keep the new
  // debit, so the edit still does the right thing going forward.
  if (before) {
    const account = await loadAccount(userId, before.assetId);
    if (!account || account.currency !== before.currency) {
      if (account && account.currency !== before.currency) {
        console.warn(
          `[funding] skipping reversal of ${before.delta} ${before.currency} on asset ${before.assetId}, now held in ${account.currency}`
        );
      }
      return afterState
        ? opsToStatements(userId, [{ assetId: afterState.assetId, delta: afterState.delta }], valuedAt)
        : [];
    }
  }

  return opsToStatements(userId, resyncOps(before, afterState), valuedAt);
}

/**
 * Plan and commit funding for an expense row that already exists.
 *
 * Used by POST and by the recurring materializer. Deliberately a *separate*
 * batch from the expense INSERT — see the comment at the materializer call site
 * for why folding them together would double-deduct.
 */
export async function applyFundingToExpense(args: {
  userId: number;
  expenseId: number;
  assetId: number;
  expense: MoneyRecord;
}): Promise<FundingPlan> {
  const plan = await planFunding(args);
  if (!plan.ok) return plan;

  const valuedAt = new Date().toISOString();
  await db.batch(
    [
      ...buildFundingStatements(
        args.userId,
        [{ assetId: plan.assetId, delta: plan.delta, decimals: plan.decimals, entryRate: plan.rate }],
        valuedAt
      ),
      buildFundingStampStatement(args.userId, args.expenseId, plan),
    ],
    'write'
  );

  return plan;
}

// ---------------------------------------------------------------------------
// Reads
// ---------------------------------------------------------------------------

/** Map of expenseId -> the account it was paid from, for joining into lists. */
export async function fetchPaidFromForExpenses(expenseIds: InValue[]): Promise<Record<number, ExpensePaidFrom>> {
  const map: Record<number, ExpensePaidFrom> = {};
  if (expenseIds.length === 0) return map;

  const placeholders = expenseIds.map(() => '?').join(',');
  const result = await db.execute({
    sql: `SELECT e.id AS expenseId, a.id AS assetId, a.name, a.category, a.currency
            FROM expenses e
            JOIN assets a ON e.paidFromAssetId = a.id
           WHERE e.id IN (${placeholders})`,
    args: expenseIds,
  });

  for (const row of result.rows) {
    map[row.expenseId as number] = {
      id: row.assetId as number,
      name: row.name as string,
      category: row.category as string,
      currency: row.currency as string,
    };
  }
  return map;
}

/** Clear every reference to an account that is about to be deleted.
 *
 *  Not a convenience: `PRAGMA foreign_keys` defaults OFF in SQLite and nothing
 *  turns it on, so the `ON DELETE SET NULL` in migration 021 may never fire.
 *  Balances are deliberately NOT restored — that money was genuinely spent. */
export function buildAccountCleanupStatements(userId: number, assetId: number): InStatement[] {
  return [
    {
      sql: `UPDATE expenses SET paidFromAssetId = NULL, paidFromDelta = NULL, paidFromCurrency = NULL
             WHERE paidFromAssetId = ? AND user_id = ?`,
      args: [assetId, userId],
    },
    {
      sql: 'UPDATE recurringExpenses SET paidFromAssetId = NULL WHERE paidFromAssetId = ? AND userId = ?',
      args: [assetId, userId],
    },
  ];
}
