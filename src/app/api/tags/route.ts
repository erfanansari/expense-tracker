import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { db } from '@/core/database/client';
import { getCurrentUser } from '@/core/session/session';

// GET /api/tags - Get all tags for current user with usage counts
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if usage counts are requested
    const { searchParams } = new URL(request.url);
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
  } catch (error) {
    console.error('Failed to create tag:', error);
    return NextResponse.json({ error: 'Failed to create tag' }, { status: 500 });
  }
}
