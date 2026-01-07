import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/core/database/client';
import { hashPassword } from '@/core/auth/password';
import { generateToken } from '@/core/auth/token';
import { isValidEmail, validatePassword } from '@/core/auth/validation';

const TOKEN_COOKIE_NAME = 'auth_token';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days in seconds

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, passwordConfirm } = body;

    // Validation
    if (!email || !password || !passwordConfirm) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
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

    // Check if user already exists
    const existingUser = await db.execute({
      sql: 'SELECT id FROM users WHERE email = ?',
      args: [email.toLowerCase()],
    });

    if (existingUser.rows.length > 0) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await hashPassword(password);
    const normalizedEmail = email.toLowerCase();

    // Create user
    const result = await db.execute({
      sql: 'INSERT INTO users (email, password_hash) VALUES (?, ?)',
      args: [normalizedEmail, passwordHash],
    });

    const userId = Number(result.lastInsertRowid);

    // Generate JWT token
    const token = await generateToken(userId, normalizedEmail);

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
      JSON.stringify({ message: 'User created successfully', userId }),
      {
        status: 201,
        headers: {
          'Content-Type': 'application/json',
          'Set-Cookie': cookieString,
        },
      }
    );
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
