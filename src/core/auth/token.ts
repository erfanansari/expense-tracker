import crypto from 'crypto';
import { jwtVerify, SignJWT } from 'jose';

import type { UserPayload } from '@/@types/auth';
import { authConfig } from '@/configs/auth.config';

const JWT_SECRET = new TextEncoder().encode(authConfig.jwt.secret);

// Generate JWT token
export async function generateToken(userId: number, email: string): Promise<string> {
  const token = await new SignJWT({ userId, email })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setIssuer(authConfig.jwt.issuer)
    .setAudience(authConfig.jwt.audience)
    .setExpirationTime(authConfig.jwt.expiration)
    .sign(JWT_SECRET);

  return token;
}

// Verify and decode JWT token
export async function verifyToken(token: string): Promise<UserPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET, {
      issuer: authConfig.jwt.issuer,
      audience: authConfig.jwt.audience,
    });

    return payload as UserPayload;
  } catch {
    return null;
  }
}

// Generate password reset token (random, not JWT - stored in DB with expiry)
export function generateResetToken(): string {
  return crypto.randomBytes(32).toString('hex');
}
