import { getTranslations } from 'next-intl/server';
import { NextResponse } from 'next/server';

import { createCategorySchema } from '@schemas';

import { getSearchParams, validateBody, withAuth } from '@core/api/utils';
import { db } from '@core/database/client';

// GET /api/categories — list current user's categories, ordered for display.
// ?includeUsage=true adds a `usage_count` column for the Settings page.
export const GET = withAuth(async (user, request) => {
  const searchParams = getSearchParams(request);
  const includeUsage = searchParams.get('includeUsage') === 'true';

  if (includeUsage) {
    const result = await db.execute({
      sql: `
        SELECT
          c.id,
          c.name,
          c.icon,
          c.color,
          c.sort_order,
          c.created_at,
          COUNT(e.id) AS usage_count
        FROM categories c
        LEFT JOIN expenses e ON e.category_id = c.id
        WHERE c.user_id = ?
        GROUP BY c.id, c.name, c.icon, c.color, c.sort_order, c.created_at
        ORDER BY c.sort_order ASC, c.name ASC
      `,
      args: [user.userId],
    });
    return NextResponse.json(result.rows);
  }

  const result = await db.execute({
    sql: `
      SELECT id, name, icon, color, sort_order, created_at
      FROM categories
      WHERE user_id = ?
      ORDER BY sort_order ASC, name ASC
    `,
    args: [user.userId],
  });
  return NextResponse.json(result.rows);
}, 'Categories');

// POST /api/categories — create a category. Returns the existing row if the
// name already exists for this user (case-insensitive), mirroring tags.
export const POST = withAuth(async (user, request) => {
  const raw = await request.json();
  const t = await getTranslations();
  const parsed = validateBody(createCategorySchema(t), raw);
  if (parsed instanceof NextResponse) return parsed;

  const trimmedName = parsed.data.name;
  const finalIcon = parsed.data.icon || 'Folder';
  const finalColor = parsed.data.color || 'gray';

  const existing = await db.execute({
    sql: `
      SELECT id, name, icon, color, sort_order, created_at
      FROM categories
      WHERE LOWER(name) = LOWER(?) AND user_id = ?
    `,
    args: [trimmedName, user.userId],
  });

  if (existing.rows.length > 0) {
    return NextResponse.json(existing.rows[0]);
  }

  // Append at end by giving it max(sort_order)+1
  const maxSort = await db.execute({
    sql: 'SELECT COALESCE(MAX(sort_order), -1) AS max FROM categories WHERE user_id = ?',
    args: [user.userId],
  });
  const nextSort = ((maxSort.rows[0] as unknown as { max: number }).max ?? -1) + 1;

  const result = await db.execute({
    sql: `
      INSERT INTO categories (user_id, name, icon, color, sort_order)
      VALUES (?, ?, ?, ?, ?)
      RETURNING id, name, icon, color, sort_order, created_at
    `,
    args: [user.userId, trimmedName, finalIcon, finalColor, nextSort],
  });

  return NextResponse.json(result.rows[0], { status: 201 });
}, 'Categories');
