import { cookies } from 'next/headers';

import type { Session, UserPayload } from '@/@types/auth';
import { authConfig } from '@/configs/auth.config';
import { generateToken, verifyToken } from '@/core/auth/token';

export async function createSession(userId: number, email: string): Promise<string> {
  const token = await generateToken(userId, email);

  const cookieStore = await cookies();
  cookieStore.set(authConfig.cookie.name, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: authConfig.cookie.maxAge,
    path: '/',
  });

  return token;
}

export async function getSession(): Promise<UserPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(authConfig.cookie.name)?.value;

  if (!token) {
    return null;
  }

  return verifyToken(token);
}

export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(authConfig.cookie.name);
}

// Helper to get current user from session
export async function getCurrentUser(): Promise<Session | null> {
  const session = await getSession();
  if (!session) {
    return null;
  }
  return {
    userId: session.userId,
    email: session.email,
  };
}
