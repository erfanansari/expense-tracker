import { getTranslations } from 'next-intl/server';
import { NextResponse } from 'next/server';

import { updateProfileSchema } from '@schemas';

import { validateBody, withAuth } from '@core/api/utils';
import { db } from '@core/database/client';

export const PUT = withAuth(async (user, request) => {
  const raw = await request.json();
  const t = await getTranslations();
  const parsed = validateBody(updateProfileSchema(t), raw);
  if (parsed instanceof NextResponse) return parsed;

  const trimmedName = parsed.data.name;

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
}, 'UserProfile');
