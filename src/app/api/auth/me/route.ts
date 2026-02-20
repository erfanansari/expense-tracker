import { NextResponse } from 'next/server';

import { db } from '@/core/database/client';
import { deleteSession, getSession } from '@/core/session/session';

export async function GET() {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    // Fetch user data from database including name
    const result = await db.execute({
      sql: 'SELECT id, email, name FROM users WHERE id = ?',
      args: [session.userId],
    });

    if (!result.rows.length) {
      await deleteSession();
      return NextResponse.json({ user: null }, { status: 200 });
    }

    const user = result.rows[0];

    const email = user.email as string;

    return NextResponse.json(
      {
        user: {
          id: user.id as number,
          email,
          name: user.name as string | null,
          isDemo: email === 'demo@kharji.com',
        },
      },
      { status: 200 }
    );
  } catch {
    // Token invalid or expired - clear cookie
    await deleteSession();
    return NextResponse.json({ user: null }, { status: 200 });
  }
}
