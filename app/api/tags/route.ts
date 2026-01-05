import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/client';
import { getCurrentUser } from '@/lib/session';

// GET /api/tags - Get all tags for current user
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = await db.execute({
      sql: 'SELECT * FROM tags WHERE user_id = ? ORDER BY name ASC',
      args: [user.userId]
    });

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Failed to fetch tags:', error);
    return NextResponse.json({ error: 'Failed to fetch tags' }, { status: 500 });
  }
}

// POST /api/tags - Create a new tag for current user
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name } = await request.json();

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ error: 'Tag name is required' }, { status: 400 });
    }

    const trimmedName = name.trim();

    // Check if tag already exists for this user
    const existing = await db.execute({
      sql: 'SELECT id, name, created_at FROM tags WHERE LOWER(name) = LOWER(?) AND user_id = ?',
      args: [trimmedName, user.userId]
    });

    if (existing.rows.length > 0) {
      // Return existing tag
      return NextResponse.json(existing.rows[0]);
    }

    // Create new tag for this user
    const result = await db.execute({
      sql: 'INSERT INTO tags (user_id, name) VALUES (?, ?) RETURNING *',
      args: [user.userId, trimmedName]
    });

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error('Failed to create tag:', error);
    return NextResponse.json({ error: 'Failed to create tag' }, { status: 500 });
  }
}
