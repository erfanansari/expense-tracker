import { getTranslations } from 'next-intl/server';
import { NextResponse } from 'next/server';

import { createTagSchema } from '@schemas';

import { parseIdParam, validateBody, verifyOwnership, withAuth } from '@core/api/utils';
import { db } from '@core/database/client';

// PUT /api/tags/[id] - Update tag name
export const PUT = withAuth(async (user, request, { params }) => {
  const id = await parseIdParam(params);
  if (id instanceof NextResponse) return id;

  const existing = await verifyOwnership('tags', id, user.userId, 'user_id');
  if (existing instanceof NextResponse) return existing;

  const raw = await request.json();
  const t = await getTranslations();
  const parsed = validateBody(createTagSchema(t), raw);
  if (parsed instanceof NextResponse) return parsed;

  const trimmedName = parsed.data.name;

  // Check for duplicate name (excluding current tag)
  const duplicate = await db.execute({
    sql: 'SELECT id FROM tags WHERE LOWER(name) = LOWER(?) AND user_id = ? AND id != ?',
    args: [trimmedName, user.userId, id],
  });

  if (duplicate.rows.length > 0) {
    return NextResponse.json({ error: `Tag "${trimmedName}" already exists` }, { status: 409 });
  }

  // Update tag name
  const result = await db.execute({
    sql: 'UPDATE tags SET name = ? WHERE id = ? AND user_id = ? RETURNING *',
    args: [trimmedName, id, user.userId],
  });

  return NextResponse.json(result.rows[0]);
}, 'Tags');

// DELETE /api/tags/[id] - Delete tag
export const DELETE = withAuth(async (user, _request, { params }) => {
  const id = await parseIdParam(params);
  if (id instanceof NextResponse) return id;

  const existing = await verifyOwnership('tags', id, user.userId, 'user_id');
  if (existing instanceof NextResponse) return existing;

  // Get usage count before deletion
  const usageResult = await db.execute({
    sql: 'SELECT COUNT(*) as count FROM expense_tags WHERE tag_id = ?',
    args: [id],
  });

  const usageCount = (usageResult.rows[0] as unknown as { count: number }).count;

  // Delete tag (CASCADE will automatically remove from expense_tags)
  await db.execute({
    sql: 'DELETE FROM tags WHERE id = ? AND user_id = ?',
    args: [id, user.userId],
  });

  return NextResponse.json({
    success: true,
    usageCount,
    message: `Tag deleted successfully`,
  });
}, 'Tags');
