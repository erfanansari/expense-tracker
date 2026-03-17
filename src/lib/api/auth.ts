import { apiMutate } from './client';

export interface AuthUser {
  id: number;
  email: string;
  name: string | null;
  isDemo: boolean;
}

export async function fetchMe(): Promise<AuthUser | null> {
  const response = await fetch('/api/auth/me');
  if (!response.ok) return null;
  const data = await response.json();
  return data.user ?? null;
}

export async function login(email: string, password: string): Promise<AuthUser> {
  const data = await apiMutate<{ user: AuthUser }>('/api/auth/login', 'POST', { email, password });
  return data.user;
}

export async function logout(): Promise<void> {
  await fetch('/api/auth/logout', { method: 'POST' });
}

export async function signup(
  name: string,
  email: string,
  password: string,
  passwordConfirm: string
): Promise<AuthUser> {
  const data = await apiMutate<{ user: AuthUser }>('/api/auth/signup', 'POST', {
    name,
    email,
    password,
    passwordConfirm,
  });
  return data.user;
}

export const forgotPassword = (email: string) =>
  apiMutate<{ message: string }>('/api/auth/forgot-password', 'POST', { email });

export const resetPassword = (token: string, password: string) =>
  apiMutate<void>('/api/auth/reset-password', 'POST', { token, password });
