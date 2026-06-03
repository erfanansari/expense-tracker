import type { Client } from '@libsql/client';
import { randomBytes } from 'crypto';

import { db } from './client';

type Executor = Pick<Client, 'execute'>;

export interface NotificationPreferences {
  emailEnabled: boolean;
  monthlyReportEnabled: boolean;
  yearlyReportEnabled: boolean;
  unsubscribeToken: string;
}

function generateUnsubscribeToken(): string {
  return randomBytes(16).toString('hex');
}

/**
 * Insert default notification preferences for a freshly created user. Safe to
 * call multiple times — INSERT OR IGNORE protects against the PRIMARY KEY.
 */
export async function createDefaultNotificationPreferences(userId: number, executor: Executor = db): Promise<void> {
  await executor.execute({
    sql: `INSERT OR IGNORE INTO userNotificationPreferences
            (userId, emailEnabled, monthlyReportEnabled, yearlyReportEnabled, unsubscribeToken)
          VALUES (?, 1, 1, 1, ?)`,
    args: [userId, generateUnsubscribeToken()],
  });
}

/**
 * Fetch a user's notification preferences. Lazy-creates the row if missing so
 * callers never have to handle the null case (defensive against any user who
 * predates the 008 backfill).
 */
export async function getNotificationPreferences(userId: number): Promise<NotificationPreferences> {
  const existing = await db.execute({
    sql: `SELECT emailEnabled, monthlyReportEnabled, yearlyReportEnabled, unsubscribeToken
          FROM userNotificationPreferences WHERE userId = ?`,
    args: [userId],
  });

  if (existing.rows.length === 0) {
    await createDefaultNotificationPreferences(userId);
    return getNotificationPreferences(userId);
  }

  const row = existing.rows[0];
  return {
    emailEnabled: Boolean(row.emailEnabled),
    monthlyReportEnabled: Boolean(row.monthlyReportEnabled),
    yearlyReportEnabled: Boolean(row.yearlyReportEnabled),
    unsubscribeToken: row.unsubscribeToken as string,
  };
}

export async function updateNotificationPreferences(
  userId: number,
  patch: Partial<Pick<NotificationPreferences, 'emailEnabled' | 'monthlyReportEnabled' | 'yearlyReportEnabled'>>
): Promise<NotificationPreferences> {
  const fields: string[] = [];
  const args: (number | string)[] = [];

  if (typeof patch.emailEnabled === 'boolean') {
    fields.push('emailEnabled = ?');
    args.push(patch.emailEnabled ? 1 : 0);
  }
  if (typeof patch.monthlyReportEnabled === 'boolean') {
    fields.push('monthlyReportEnabled = ?');
    args.push(patch.monthlyReportEnabled ? 1 : 0);
  }
  if (typeof patch.yearlyReportEnabled === 'boolean') {
    fields.push('yearlyReportEnabled = ?');
    args.push(patch.yearlyReportEnabled ? 1 : 0);
  }

  if (fields.length > 0) {
    fields.push('updatedAt = CURRENT_TIMESTAMP');
    args.push(userId);
    await db.execute({
      sql: `UPDATE userNotificationPreferences SET ${fields.join(', ')} WHERE userId = ?`,
      args,
    });
  }

  return getNotificationPreferences(userId);
}

export async function unsubscribeByToken(token: string): Promise<boolean> {
  const result = await db.execute({
    sql: `UPDATE userNotificationPreferences
          SET emailEnabled = 0, updatedAt = CURRENT_TIMESTAMP
          WHERE unsubscribeToken = ?`,
    args: [token],
  });
  return result.rowsAffected > 0;
}
