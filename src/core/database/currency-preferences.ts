import type { Client } from '@libsql/client';

import { PIVOT_CURRENCY } from '@/constants/currencies';

import { db } from './client';

type Executor = Pick<Client, 'execute'>;

export interface CurrencyPreferences {
  primaryCurrency: string;
  /** null = secondary display disabled. */
  secondaryCurrency: string | null;
}

const DEFAULTS: CurrencyPreferences = {
  primaryCurrency: PIVOT_CURRENCY, // IRT
  secondaryCurrency: 'USD',
};

/** Insert default currency preferences for a new user (idempotent). */
export async function createDefaultCurrencyPreferences(userId: number, executor: Executor = db): Promise<void> {
  await executor.execute({
    sql: `INSERT OR IGNORE INTO userCurrencyPreferences (userId, primaryCurrency, secondaryCurrency)
          VALUES (?, ?, ?)`,
    args: [userId, DEFAULTS.primaryCurrency, DEFAULTS.secondaryCurrency],
  });
}

/** Fetch a user's currency preferences, lazy-creating the row if missing. */
export async function getCurrencyPreferences(userId: number): Promise<CurrencyPreferences> {
  const existing = await db.execute({
    sql: `SELECT primaryCurrency, secondaryCurrency FROM userCurrencyPreferences WHERE userId = ?`,
    args: [userId],
  });

  if (existing.rows.length === 0) {
    await createDefaultCurrencyPreferences(userId);
    return { ...DEFAULTS };
  }

  const row = existing.rows[0];
  return {
    primaryCurrency: row.primaryCurrency as string,
    secondaryCurrency: (row.secondaryCurrency as string | null) ?? null,
  };
}

export async function updateCurrencyPreferences(
  userId: number,
  patch: Partial<CurrencyPreferences>
): Promise<CurrencyPreferences> {
  const fields: string[] = [];
  const args: (number | string | null)[] = [];

  if (typeof patch.primaryCurrency === 'string') {
    fields.push('primaryCurrency = ?');
    args.push(patch.primaryCurrency);
  }
  if (patch.secondaryCurrency !== undefined) {
    fields.push('secondaryCurrency = ?');
    args.push(patch.secondaryCurrency);
  }

  if (fields.length > 0) {
    // Ensure the row exists before updating (predates backfill / new user).
    await createDefaultCurrencyPreferences(userId);
    fields.push('updatedAt = CURRENT_TIMESTAMP');
    args.push(userId);
    await db.execute({
      sql: `UPDATE userCurrencyPreferences SET ${fields.join(', ')} WHERE userId = ?`,
      args,
    });
  }

  return getCurrencyPreferences(userId);
}
