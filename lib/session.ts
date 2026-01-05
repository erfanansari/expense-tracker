import { cookies } from 'next/headers';
import { generateToken, verifyToken, type UserPayload } from './auth';

const TOKEN_COOKIE_NAME = 'auth_token';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days in seconds

export async function createSession(userId: number, email: string): Promise<string> {
  const token = await generateToken(userId, email);

  const cookieStore = await cookies();
  cookieStore.set(TOKEN_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: COOKIE_MAX_AGE,
    path: '/',
  });

  return token;
}

export async function getSession(): Promise<UserPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(TOKEN_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  return verifyToken(token);
}

export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(TOKEN_COOKIE_NAME);
}

// Helper to get current user from session
export async function getCurrentUser(): Promise<{ userId: number; email: string } | null> {
  const session = await getSession();
  if (!session) {
    return null;
  }
  return {
    userId: session.userId,
    email: session.email,
  };
}
