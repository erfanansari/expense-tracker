import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/core/database/client';
import { verifyPassword } from '@/core/auth/password';
import { generateToken } from '@/core/auth/token';

const TOKEN_COOKIE_NAME = 'auth_token';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days in seconds

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find user
    const result = await db.execute({
      sql: 'SELECT id, email, password_hash FROM users WHERE email = ?',
      args: [email.toLowerCase()],
    });

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const userId = result.rows[0].id as number;
    const userEmail = result.rows[0].email as string;
    const passwordHash = result.rows[0].password_hash as string;

    // Verify password
    const isValidPassword = await verifyPassword(password, passwordHash);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Generate JWT token
    const token = await generateToken(userId, userEmail);

    // Build cookie string manually
    const isProduction = process.env.NODE_ENV === 'production';
    const cookieParts = [
      `${TOKEN_COOKIE_NAME}=${token}`,
      `Path=/`,
      `Max-Age=${COOKIE_MAX_AGE}`,
      `HttpOnly`,
      `SameSite=Lax`,
    ];
    if (isProduction) {
      cookieParts.push('Secure');
    }
    const cookieString = cookieParts.join('; ');

    // Create response with Set-Cookie header
    return new NextResponse(
      JSON.stringify({ message: 'Logged in successfully', userId }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Set-Cookie': cookieString,
        },
      }
    );
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
