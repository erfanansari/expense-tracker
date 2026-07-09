import { NextResponse } from 'next/server';

import type { ZodSchema } from 'zod';

import { auth } from '@core/auth/auth';
import { db } from '@core/database/client';

import type { Session } from '@/@types/auth';

// ---------------------------------------------------------------------------
// getSearchParams — safe URL search params extraction
// ---------------------------------------------------------------------------

export function getSearchParams(request: Request): URLSearchParams {
  try {
    return new URL(request.url).searchParams;
  } catch {
    return new URL(request.url || '', 'http://localhost').searchParams;
  }
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AuthHandler<P = any> = (user: Session, request: Request, context: { params: Promise<P> }) => Promise<NextResponse>;

// ---------------------------------------------------------------------------
// withAuth — wraps a handler with auth check + try-catch + error logging
// ---------------------------------------------------------------------------

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function withAuth<P = any>(handler: AuthHandler<P>, label?: string) {
  return async (request: Request, context: { params: Promise<P> }) => {
    try {
      const session = await auth.api.getSession({ headers: request.headers });
      if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      // Better Auth types ids as string; with generateId 'serial' the runtime
      // value is the integer users.id — coerce for the numeric FK queries.
      const user: Session = { userId: Number(session.user.id), email: session.user.email };
      return await handler(user, request, context);
    } catch (error) {
      const tag = label ? `[${label}] ` : '';
      console.error(`${tag}Route error:`, error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  };
}

// ---------------------------------------------------------------------------
// parseIdParam — validates and returns numeric ID from async params
// ---------------------------------------------------------------------------

export async function parseIdParam(params: Promise<{ id: string }>): Promise<number | NextResponse> {
  const { id } = await params;
  const numId = Number(id);
  if (!id || isNaN(numId)) {
    return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
  }
  return numId;
}

// ---------------------------------------------------------------------------
// verifyOwnership — checks record exists in table and belongs to user
// ---------------------------------------------------------------------------

export async function verifyOwnership(
  table: string,
  id: number,
  userId: number,
  userIdColumn = 'userId'
): Promise<Record<string, unknown> | NextResponse> {
  const result = await db.execute({
    sql: `SELECT * FROM ${table} WHERE id = ? AND ${userIdColumn} = ?`,
    args: [id, userId],
  });

  if (result.rows.length === 0) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return result.rows[0] as Record<string, unknown>;
}

// ---------------------------------------------------------------------------
// validateBody — Zod parse + error response
// ---------------------------------------------------------------------------

export function validateBody<T>(schema: ZodSchema<T>, body: unknown): { data: T } | NextResponse {
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }
  return { data: parsed.data };
}
