import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { authConfig, LEGACY_COOKIE } from '@configs/auth.config';
import { getSessionCookie } from 'better-auth/cookies';

const AUTH_PAGES = new Set<string>(authConfig.routes.auth);
const PUBLIC_PAGES = new Set<string>(authConfig.routes.public);

// Optimistic cookie-presence check only — real session validation happens
// server-side in withAuth / auth.api.getSession.
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const hasToken = Boolean(getSessionCookie(request));

  let response: NextResponse;

  if ((pathname === '/' || AUTH_PAGES.has(pathname)) && hasToken) {
    // Authenticated users skip the landing and auth pages entirely
    response = NextResponse.redirect(new URL('/overview', request.url));
  } else if (!PUBLIC_PAGES.has(pathname) && !hasToken) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('rp', `${pathname}${search}`);
    response = NextResponse.redirect(loginUrl);
  } else {
    response = NextResponse.next();
  }

  // Clean up pre-Better-Auth JWT cookies so stale sessions land on /login once
  if (request.cookies.get(LEGACY_COOKIE)) {
    response.cookies.delete(LEGACY_COOKIE);
  }

  return response;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.[\\w]+$).*)'],
};
