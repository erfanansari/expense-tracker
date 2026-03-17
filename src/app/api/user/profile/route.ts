import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { db } from '@core/database/client';
import { getCurrentUser } from '@core/session/session';

export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
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
      args: [trimmedName, user.userId],
    });

    // Fetch updated user data
    const result = await db.execute({
      sql: 'SELECT id, email, name FROM users WHERE id = ?',
      args: [user.userId],
    });

    if (!result.rows.length) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const updatedUser = result.rows[0];

    return NextResponse.json(
      {
        user: {
          id: updatedUser.id as number,
          email: updatedUser.email as string,
          name: updatedUser.name as string | null,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating user profile:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
