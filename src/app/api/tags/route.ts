import { getTranslations } from 'next-intl/server';
import { NextResponse } from 'next/server';

import { createTagSchema } from '@schemas';

import { getSearchParams, validateBody, withAuth } from '@core/api/utils';
import { db } from '@core/database/client';

// GET /api/tags - Get all tags for current user with usage counts
export const GET = withAuth(async (user, request) => {
  const searchParams = getSearchParams(request);
  const includeUsage = searchParams.get('includeUsage') === 'true';

  if (includeUsage) {
    // Fetch tags with usage counts in a single query
    const result = await db.execute({
      sql: `
        SELECT
          t.id,
          t.name,
          t.created_at,
          COUNT(et.expense_id) as usage_count
        FROM tags t
        LEFT JOIN expense_tags et ON t.id = et.tag_id
        WHERE t.user_id = ?
        GROUP BY t.id, t.name, t.created_at
        ORDER BY t.name ASC
      `,
      args: [user.userId],
    });

    return NextResponse.json(result.rows);
  } else {
    // Fetch tags without usage counts (faster for simple cases)
    const result = await db.execute({
      sql: 'SELECT id, name, created_at FROM tags WHERE user_id = ? ORDER BY name ASC',
      args: [user.userId],
    });

    return NextResponse.json(result.rows);
  }
}, 'Tags');

// POST /api/tags - Create a new tag for current user
export const POST = withAuth(async (user, request) => {
  const raw = await request.json();
  const t = await getTranslations();
  const parsed = validateBody(createTagSchema(t), raw);
  if (parsed instanceof NextResponse) return parsed;

  const trimmedName = parsed.data.name;

  // Check if tag already exists for this user
  const existing = await db.execute({
    sql: 'SELECT id, name, created_at FROM tags WHERE LOWER(name) = LOWER(?) AND user_id = ?',
    args: [trimmedName, user.userId],
  });

  if (existing.rows.length > 0) {
    // Return existing tag
    return NextResponse.json(existing.rows[0]);
  }

  // Create new tag for this user
  const result = await db.execute({
    sql: 'INSERT INTO tags (user_id, name) VALUES (?, ?) RETURNING *',
    args: [user.userId, trimmedName],
  });

  return NextResponse.json(result.rows[0], { status: 201 });
}, 'Tags');
