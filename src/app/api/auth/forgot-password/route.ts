import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { forgotPasswordSchema } from '@schemas';

import { checkRateLimit } from '@core/auth/rate-limit';
import { generateResetToken } from '@core/auth/token';
import { db } from '@core/database/client';

export async function POST(request: NextRequest) {
  const limited = checkRateLimit(request, { name: 'forgot-password', limit: 5, windowMs: 15 * 60_000 });
  if (limited) return limited;

  try {
    const raw = await request.json();
    const parsed = forgotPasswordSchema.safeParse(raw);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const { email } = parsed.data;

    // Find user
    const userResult = await db.execute({
      sql: 'SELECT id FROM users WHERE email = ?',
      args: [email.toLowerCase()],
    });

    if (userResult.rows.length === 0) {
      // Don't reveal if email exists for security reasons
      return NextResponse.json({ message: 'If that email exists, we sent a password reset link' }, { status: 200 });
    }

    const userId = userResult.rows[0].id as number;

    // Generate reset token
    const resetToken = generateResetToken();
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60).toISOString(); // 1 hour

    // Store reset token
    await db.execute({
      sql: 'INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES (?, ?, ?)',
      args: [userId, resetToken, expiresAt],
    });

    // In a real app, send email with reset link
    // For now, return the token (in production, send via email)
    // eslint-disable-next-line no-console
    console.log(`Password reset token for ${email}: ${resetToken}`);

    return NextResponse.json({ message: 'If that email exists, we sent a password reset link' }, { status: 200 });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
