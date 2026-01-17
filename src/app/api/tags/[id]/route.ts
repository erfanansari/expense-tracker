import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { db } from '@/core/database/client';
import { getCurrentUser } from '@/core/session/session';

// PUT /api/tags/[id] - Update tag name
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const tagId = parseInt(id, 10);
    if (isNaN(tagId)) {
      return NextResponse.json({ error: 'Invalid tag ID' }, { status: 400 });
    }

    const { name } = await request.json();

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ error: 'Tag name is required' }, { status: 400 });
    }

    const trimmedName = name.trim();

    // Verify tag exists and belongs to user
    const existingTag = await db.execute({
      sql: 'SELECT id FROM tags WHERE id = ? AND user_id = ?',
      args: [tagId, user.userId],
    });

    if (existingTag.rows.length === 0) {
      return NextResponse.json({ error: 'Tag not found' }, { status: 404 });
    }

    // Check for duplicate name (excluding current tag)
    const duplicate = await db.execute({
      sql: 'SELECT id FROM tags WHERE LOWER(name) = LOWER(?) AND user_id = ? AND id != ?',
      args: [trimmedName, user.userId, tagId],
    });

    if (duplicate.rows.length > 0) {
      return NextResponse.json({ error: `Tag "${trimmedName}" already exists` }, { status: 409 });
    }

    // Update tag name
    const result = await db.execute({
      sql: 'UPDATE tags SET name = ? WHERE id = ? AND user_id = ? RETURNING *',
      args: [trimmedName, tagId, user.userId],
    });

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Failed to update tag:', error);
    return NextResponse.json({ error: 'Failed to update tag' }, { status: 500 });
  }
}

// DELETE /api/tags/[id] - Delete tag
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const tagId = parseInt(id, 10);
    if (isNaN(tagId)) {
      return NextResponse.json({ error: 'Invalid tag ID' }, { status: 400 });
    }

    // Verify tag exists and belongs to user
    const existingTag = await db.execute({
      sql: 'SELECT id, name FROM tags WHERE id = ? AND user_id = ?',
      args: [tagId, user.userId],
    });

    if (existingTag.rows.length === 0) {
      return NextResponse.json({ error: 'Tag not found' }, { status: 404 });
    }

    // Get usage count before deletion
    const usageResult = await db.execute({
      sql: 'SELECT COUNT(*) as count FROM expense_tags WHERE tag_id = ?',
      args: [tagId],
    });

    const usageCount = (usageResult.rows[0] as unknown as { count: number }).count;

    // Delete tag (CASCADE will automatically remove from expense_tags)
    await db.execute({
      sql: 'DELETE FROM tags WHERE id = ? AND user_id = ?',
      args: [tagId, user.userId],
    });

    return NextResponse.json({
      success: true,
      usageCount,
      message: `Tag deleted successfully`,
    });
  } catch (error) {
    console.error('Failed to delete tag:', error);
    return NextResponse.json({ error: 'Failed to delete tag' }, { status: 500 });
  }
}
