import { NextResponse } from 'next/server';

interface RateLimitOptions {
  /** Unique name for the endpoint being limited (e.g. 'login') */
  name: string;
  /** Max requests allowed per window */
  limit: number;
  /** Window length in milliseconds */
  windowMs: number;
}

interface WindowEntry {
  count: number;
  resetAt: number;
}

// In-memory fixed-window store. State is per serverless instance, so limits
// are approximate under horizontal scaling — enough to blunt brute force from
// a single source, not a hard guarantee. Swap for a shared store (e.g. Upstash)
// if stronger limits are ever needed.
let store = new Map<string, WindowEntry>();

const MAX_STORE_SIZE = 10_000;

function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }
  return 'unknown';
}

/**
 * Returns a 429 response if the caller has exceeded the limit, or null if the
 * request is allowed. Usage: `const limited = checkRateLimit(request, {...}); if (limited) return limited;`
 */
export function checkRateLimit(request: Request, { name, limit, windowMs }: RateLimitOptions): NextResponse | null {
  const now = Date.now();
  const key = `${name}:${getClientIp(request)}`;

  const entry = store.get(key);

  if (!entry || now >= entry.resetAt) {
    if (store.size >= MAX_STORE_SIZE) {
      for (const [existingKey, existingEntry] of store) {
        if (now >= existingEntry.resetAt) store.delete(existingKey);
      }
    }
    store.set(key, { count: 1, resetAt: now + windowMs });
    return null;
  }

  entry.count += 1;

  if (entry.count > limit) {
    const retryAfterSeconds = Math.max(1, Math.ceil((entry.resetAt - now) / 1000));
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429, headers: { 'Retry-After': String(retryAfterSeconds) } }
    );
  }

  return null;
}

/** Test-only helper to clear limiter state between tests. */
export function resetRateLimitStore(): void {
  store = new Map();
}
