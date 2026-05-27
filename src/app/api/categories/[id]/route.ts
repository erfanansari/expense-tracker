import { NextResponse } from 'next/server';

import { getSearchParams, parseIdParam, verifyOwnership, withAuth } from '@core/api/utils';
import { reassignExpensesCategory } from '@core/database/categories';
import { db } from '@core/database/client';

// PUT /api/categories/[id] — update name / icon / color / sort_order.
// Empty body → 400. Duplicate name (case-insensitive) → 409.
export const PUT = withAuth(async (user, request, { params }) => {
  const id = await parseIdParam(params);
  if (id instanceof NextResponse) return id;

  const existing = await verifyOwnership('categories', id, user.userId, 'user_id');
  if (existing instanceof NextResponse) return existing;

  const body = await request.json();
  const { name, icon, color, sort_order } = body ?? {};

  if (
    (name === undefined || name === null) &&
    (icon === undefined || icon === null) &&
    (color === undefined || color === null) &&
    (sort_order === undefined || sort_order === null)
  ) {
    return NextResponse.json({ error: 'Nothing to update' }, { status: 400 });
  }

  // Validate name when provided
  let nextName: string | undefined;
  if (name !== undefined && name !== null) {
    if (typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ error: 'Category name is required' }, { status: 400 });
    }
    nextName = name.trim();

    const duplicate = await db.execute({
      sql: 'SELECT id FROM categories WHERE LOWER(name) = LOWER(?) AND user_id = ? AND id != ?',
      args: [nextName, user.userId, id],
    });

    if (duplicate.rows.length > 0) {
      return NextResponse.json({ error: `Category "${nextName}" already exists` }, { status: 409 });
    }
  }

  const fields: string[] = [];
  const args: (string | number)[] = [];
  if (nextName !== undefined) {
    fields.push('name = ?');
    args.push(nextName);
  }
  if (typeof icon === 'string' && icon.trim()) {
    fields.push('icon = ?');
    args.push(icon.trim());
  }
  if (typeof color === 'string' && color.trim()) {
    fields.push('color = ?');
    args.push(color.trim());
  }
  if (typeof sort_order === 'number' && Number.isFinite(sort_order)) {
    fields.push('sort_order = ?');
    args.push(sort_order);
  }
  args.push(id, user.userId);

  const result = await db.execute({
    sql: `
      UPDATE categories SET ${fields.join(', ')}
      WHERE id = ? AND user_id = ?
      RETURNING id, name, icon, color, sort_order, created_at
    `,
    args,
  });

  return NextResponse.json(result.rows[0]);
}, 'Categories');

// DELETE /api/categories/[id] — block when in use unless ?reassignTo=<id> is
// provided. With reassignTo, every expense pointing at this category is moved
// to the target before the category is removed.
export const DELETE = withAuth(async (user, request, { params }) => {
  const id = await parseIdParam(params);
  if (id instanceof NextResponse) return id;

  const existing = await verifyOwnership('categories', id, user.userId, 'user_id');
  if (existing instanceof NextResponse) return existing;

  const searchParams = getSearchParams(request);
  const reassignToRaw = searchParams.get('reassignTo');

  // Current usage
  const usageResult = await db.execute({
    sql: 'SELECT COUNT(*) AS count FROM expenses WHERE category_id = ? AND user_id = ?',
    args: [id, user.userId],
  });
  const usageCount = (usageResult.rows[0] as unknown as { count: number }).count;

  if (usageCount > 0 && !reassignToRaw) {
    return NextResponse.json(
      {
        error: `Category is used in ${usageCount} ${usageCount === 1 ? 'expense' : 'expenses'}`,
        usageCount,
        requiresReassign: true,
      },
      { status: 400 }
    );
  }

  if (reassignToRaw) {
    const reassignTo = Number(reassignToRaw);
    if (!Number.isFinite(reassignTo) || reassignTo <= 0 || reassignTo === id) {
      return NextResponse.json({ error: 'Invalid reassignTo target' }, { status: 400 });
    }

    const target = await verifyOwnership('categories', reassignTo, user.userId, 'user_id');
    if (target instanceof NextResponse) return target;

    await reassignExpensesCategory(id, reassignTo, user.userId);
  }

  await db.execute({
    sql: 'DELETE FROM categories WHERE id = ? AND user_id = ?',
    args: [id, user.userId],
  });

  return NextResponse.json({ success: true, usageCount, message: 'Category deleted successfully' });
}, 'Categories');
