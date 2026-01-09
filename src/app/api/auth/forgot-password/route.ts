import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { generateResetToken } from '@/core/auth/token';
import { isValidEmail } from '@/core/auth/validation';
import { db } from '@/core/database/client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    // Validation
    if (!email || !isValidEmail(email)) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
    }

    // Find user
    const userResult = await db.execute({
      sql: 'SELECT id FROM users WHERE email = ?',
      args: [email.toLowerCase()],
    });

    if (userResult.rows.length === 0) {
      // Don't reveal if email exists for security reasons
      return NextResponse.json({ message: 'If that email exists, we sent a password reset link' }, { status: 200 });
    }

    const userId = userResult.rows[0][0] as number;

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
    console.log(`Password reset token for ${email}: ${resetToken}`);

    return NextResponse.json(
      { message: 'If that email exists, we sent a password reset link', token: resetToken },
      { status: 200 }
    );
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
