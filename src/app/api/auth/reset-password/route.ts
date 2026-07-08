import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { resetPasswordSchema } from '@schemas';

import { hashPassword } from '@core/auth/password';
import { checkRateLimit } from '@core/auth/rate-limit';
import { validatePassword } from '@core/auth/validation';
import { db } from '@core/database/client';

export async function POST(request: NextRequest) {
  const limited = checkRateLimit(request, { name: 'reset-password', limit: 10, windowMs: 15 * 60_000 });
  if (limited) return limited;

  try {
    const raw = await request.json();
    const parsed = resetPasswordSchema.safeParse(raw);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const { token, password } = parsed.data;

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return NextResponse.json({ error: passwordValidation.errors.join(', ') }, { status: 400 });
    }

    // Find and validate reset token
    const tokenResult = await db.execute({
      sql: `SELECT user_id FROM password_reset_tokens
            WHERE token = ? AND expires_at > datetime('now')`,
      args: [token],
    });

    if (tokenResult.rows.length === 0) {
      return NextResponse.json({ error: 'Invalid or expired reset token' }, { status: 400 });
    }

    const userId = tokenResult.rows[0].user_id as number;

    // Hash new password
    const passwordHash = await hashPassword(password);

    // Update user password
    await db.execute({
      sql: 'UPDATE users SET password_hash = ?, updated_at = datetime("now") WHERE id = ?',
      args: [passwordHash, userId],
    });

    // Delete used reset token
    await db.execute({
      sql: 'DELETE FROM password_reset_tokens WHERE token = ?',
      args: [token],
    });

    return NextResponse.json({ message: 'Password reset successfully' }, { status: 200 });
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
