import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { signupSchema } from '@schemas';

import { DEMO_EMAIL } from '@constants';

import { hashPassword } from '@core/auth/password';
import { validatePassword } from '@core/auth/validation';
import { seedDefaultCategoriesForUser } from '@core/database/categories';
import { db } from '@core/database/client';
import { createDefaultNotificationPreferences } from '@core/database/notification-preferences';
import { sendWelcomeEmail } from '@core/email/welcome';
import { createSession } from '@core/session/session';

export async function POST(request: NextRequest) {
  try {
    const raw = await request.json();
    const parsed = signupSchema.safeParse(raw);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const { name, email, password } = parsed.data;

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return NextResponse.json({ error: passwordValidation.errors.join(', ') }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await db.execute({
      sql: 'SELECT id FROM users WHERE email = ?',
      args: [email.toLowerCase()],
    });

    if (existingUser.rows.length > 0) {
      return NextResponse.json({ error: 'User already exists' }, { status: 409 });
    }

    // Hash password
    const passwordHash = await hashPassword(password);
    const normalizedEmail = email.toLowerCase();

    // Create user
    const result = await db.execute({
      sql: 'INSERT INTO users (email, password_hash, name) VALUES (?, ?, ?)',
      args: [normalizedEmail, passwordHash, name || null],
    });

    const userId = Number(result.lastInsertRowid);

    // Seed the 12 default categories so new accounts can start adding expenses
    // immediately without first visiting Settings.
    await seedDefaultCategoriesForUser(userId);

    // Seed notification preferences (master + monthly + yearly all on) and the
    // unique unsubscribe token used in email footers.
    await createDefaultNotificationPreferences(userId);

    // Fire-and-forget welcome email — must never block or fail the signup response.
    sendWelcomeEmail({ userId, email: normalizedEmail, name: name || null }).catch((err) =>
      console.error('[signup] welcome email failed:', err)
    );

    // Create session (sets cookie automatically)
    await createSession(userId, normalizedEmail);

    return NextResponse.json(
      {
        user: {
          id: userId,
          email: normalizedEmail,
          name: name || null,
          isDemo: normalizedEmail === DEMO_EMAIL,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
