import type { InValue } from '@libsql/client';

import type { Tag } from '@/@types/expense';

import { db } from './client';

/**
 * Fetch tags for a list of expense IDs and return a map of expenseId -> Tag[].
 */
export async function fetchTagsForExpenses(expenseIds: InValue[]): Promise<Record<number, Tag[]>> {
  const tagsMap: Record<number, Tag[]> = {};

  if (expenseIds.length === 0) return tagsMap;

  const placeholders = expenseIds.map(() => '?').join(',');
  const tagsResult = await db.execute({
    sql: `
      SELECT et.expense_id, t.id, t.name, t.created_at
      FROM expense_tags et
      JOIN tags t ON et.tag_id = t.id
      WHERE et.expense_id IN (${placeholders})
    `,
    args: expenseIds,
  });

  tagsResult.rows.forEach((row) => {
    const expenseId = row.expense_id as number;
    if (!tagsMap[expenseId]) {
      tagsMap[expenseId] = [];
    }
    tagsMap[expenseId].push({
      id: row.id as number,
      name: row.name as string,
      created_at: row.created_at as string,
    });
  });

  return tagsMap;
}

/**
 * Replace all tag associations for an expense.
 * Deletes existing tags then inserts new ones.
 */
export async function assignTagsToExpense(expenseId: number, tagIds: number[] | undefined): Promise<void> {
  await db.execute({
    sql: 'DELETE FROM expense_tags WHERE expense_id = ?',
    args: [expenseId],
  });

  if (tagIds && tagIds.length > 0) {
    for (const tagId of tagIds) {
      await db.execute({
        sql: 'INSERT INTO expense_tags (expense_id, tag_id) VALUES (?, ?)',
        args: [expenseId, tagId],
      });
    }
  }
}
