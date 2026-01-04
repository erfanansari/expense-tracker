import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/client';
import { hashPassword, validatePassword } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, password, passwordConfirm } = body;

    // Validation
    if (!token || !password || !passwordConfirm) {
      return NextResponse.json(
        { error: 'Token and password are required' },
        { status: 400 }
      );
    }

    if (password !== passwordConfirm) {
      return NextResponse.json(
        { error: 'Passwords do not match' },
        { status: 400 }
      );
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return NextResponse.json(
        { error: passwordValidation.errors.join(', ') },
        { status: 400 }
      );
    }

    // Find and validate reset token
    const tokenResult = await db.execute({
      sql: `SELECT user_id FROM password_reset_tokens
            WHERE token = ? AND expires_at > datetime('now')`,
      args: [token],
    });

    if (tokenResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Invalid or expired reset token' },
        { status: 400 }
      );
    }

    const userId = tokenResult.rows[0][0] as number;

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

    return NextResponse.json(
      { message: 'Password reset successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
