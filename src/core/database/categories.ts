import type { Client, InValue } from '@libsql/client';

import type { Category } from '@/@types/expense';
import type { AppLocale } from '@/i18n/config';

import { db } from './client';

/**
 * Anything that supports `.execute()` — covers both the shared `db` client
 * and standalone clients created by the seed scripts.
 */
type Executor = Pick<Client, 'execute'>;

type CategorySeed = ReadonlyArray<{ name: string; icon: string; color: string }>;

// icon/color stay locale-neutral; only the display name is translated. Kept
// as plain rows (not i18n message keys) because these become real, editable
// `categories` rows in the user's own DB — not app-wide static strings.
const DEFAULT_CATEGORY_SEED_EN: CategorySeed = [
  { name: 'Rent', icon: 'Home', color: 'blue' },
  { name: 'Utilities', icon: 'Zap', color: 'amber' },
  { name: 'Groceries', icon: 'ShoppingCart', color: 'green' },
  { name: 'Coffee', icon: 'Coffee', color: 'orange' },
  { name: 'Transport', icon: 'Car', color: 'sky' },
  { name: 'Healthcare', icon: 'Heart', color: 'rose' },
  { name: 'Clothing', icon: 'Shirt', color: 'violet' },
  { name: 'Entertainment', icon: 'Film', color: 'pink' },
  { name: 'Travel', icon: 'Plane', color: 'cyan' },
  { name: 'Investment', icon: 'TrendingUp', color: 'emerald' },
  { name: 'Work', icon: 'Briefcase', color: 'slate' },
  { name: 'Other', icon: 'Folder', color: 'gray' },
];

const DEFAULT_CATEGORY_SEED_FA: CategorySeed = [
  { name: 'اجاره', icon: 'Home', color: 'blue' },
  { name: 'قبوض', icon: 'Zap', color: 'amber' },
  { name: 'خواربار', icon: 'ShoppingCart', color: 'green' },
  { name: 'قهوه', icon: 'Coffee', color: 'orange' },
  { name: 'حمل و نقل', icon: 'Car', color: 'sky' },
  { name: 'سلامت و درمان', icon: 'Heart', color: 'rose' },
  { name: 'پوشاک', icon: 'Shirt', color: 'violet' },
  { name: 'سرگرمی', icon: 'Film', color: 'pink' },
  { name: 'سفر', icon: 'Plane', color: 'cyan' },
  { name: 'سرمایه‌گذاری', icon: 'TrendingUp', color: 'emerald' },
  { name: 'کار', icon: 'Briefcase', color: 'slate' },
  { name: 'سایر', icon: 'Folder', color: 'gray' },
];

function categorySeedFor(locale: AppLocale): CategorySeed {
  return locale === 'fa' ? DEFAULT_CATEGORY_SEED_FA : DEFAULT_CATEGORY_SEED_EN;
}

/**
 * Seed the default categories for a freshly created user, named in their
 * chosen locale. Called from the signup route and seed scripts. Safe to call
 * multiple times — uses INSERT OR IGNORE against the (user_id, name) unique
 * constraint (so calling with a different locale later just adds the other
 * language's set rather than renaming existing rows).
 *
 * @param userId   The user receiving the defaults.
 * @param locale   Locale to seed names in. Defaults to 'en'.
 * @param executor Optional client to use. Defaults to the shared `db`. The seed
 *                 scripts pass their own libSQL client (built after dotenv
 *                 loads .env.local).
 */
export async function seedDefaultCategoriesForUser(
  userId: number,
  locale: AppLocale = 'en',
  executor: Executor = db
): Promise<void> {
  const seed = categorySeedFor(locale);
  for (let i = 0; i < seed.length; i++) {
    const { name, icon, color } = seed[i];
    await executor.execute({
      sql: 'INSERT OR IGNORE INTO categories (user_id, name, icon, color, sort_order) VALUES (?, ?, ?, ?, ?)',
      args: [userId, name, icon, color, i],
    });
  }
}

/**
 * Fetch a map of expenseId -> Category for joining into expense lists.
 */
export async function fetchCategoriesForExpenses(expenseIds: InValue[]): Promise<Record<number, Category>> {
  const map: Record<number, Category> = {};
  if (expenseIds.length === 0) return map;

  const placeholders = expenseIds.map(() => '?').join(',');
  const result = await db.execute({
    sql: `
      SELECT e.id AS expense_id, c.id, c.name, c.icon, c.color, c.sort_order, c.created_at
      FROM expenses e
      JOIN categories c ON e.category_id = c.id
      WHERE e.id IN (${placeholders})
    `,
    args: expenseIds,
  });

  for (const row of result.rows) {
    const expenseId = row.expense_id as number;
    map[expenseId] = {
      id: row.id as number,
      name: row.name as string,
      icon: row.icon as string,
      color: row.color as string,
      sort_order: row.sort_order as number,
      created_at: row.created_at as string,
    };
  }
  return map;
}

/**
 * Move every expense currently pointing at `fromId` to `toId`, scoped to the
 * given user. Used by the DELETE /api/categories/[id]?reassignTo=... flow.
 * Returns the number of expenses that were reassigned.
 */
export async function reassignExpensesCategory(fromId: number, toId: number, userId: number): Promise<number> {
  const result = await db.execute({
    sql: 'UPDATE expenses SET category_id = ? WHERE category_id = ? AND user_id = ?',
    args: [toId, fromId, userId],
  });
  return result.rowsAffected;
}
