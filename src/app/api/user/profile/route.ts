import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { db } from '@/core/database/client';
import { getSession } from '@/core/session/session';

export async function PUT(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name } = body;

    // Validate name
    if (typeof name !== 'string') {
      return NextResponse.json({ error: 'Name must be a string' }, { status: 400 });
    }

    const trimmedName = name.trim();

    if (trimmedName.length === 0) {
      return NextResponse.json({ error: 'Name cannot be empty' }, { status: 400 });
    }

    if (trimmedName.length > 100) {
      return NextResponse.json({ error: 'Name is too long (max 100 characters)' }, { status: 400 });
    }

    // Update user's name in database
    await db.execute({
      sql: 'UPDATE users SET name = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      args: [trimmedName, session.userId],
    });

    // Fetch updated user data
    const result = await db.execute({
      sql: 'SELECT id, email, name FROM users WHERE id = ?',
      args: [session.userId],
    });

    if (!result.rows.length) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const user = result.rows[0];

    return NextResponse.json(
      {
        user: {
          id: user.id as number,
          email: user.email as string,
          name: user.name as string | null,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating user profile:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
