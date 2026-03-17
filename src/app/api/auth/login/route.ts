import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { loginSchema } from '@schemas';

import { verifyPassword } from '@core/auth/password';
import { db } from '@core/database/client';
import { createSession } from '@core/session/session';

export async function POST(request: NextRequest) {
  try {
    const raw = await request.json();
    const parsed = loginSchema.safeParse(raw);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const { email, password } = parsed.data;

    // Find user
    const result = await db.execute({
      sql: 'SELECT id, email, password_hash FROM users WHERE email = ?',
      args: [email.toLowerCase()],
    });

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const userId = result.rows[0].id as number;
    const userEmail = result.rows[0].email as string;
    const passwordHash = result.rows[0].password_hash as string;

    // Verify password
    const isValidPassword = await verifyPassword(password, passwordHash);
    if (!isValidPassword) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    // Create session (sets cookie automatically)
    await createSession(userId, userEmail);

    return NextResponse.json({ message: 'Logged in successfully', userId });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
