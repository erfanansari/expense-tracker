import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { authConfig } from '@configs/auth.config';

const AUTH_PAGES = new Set<string>(authConfig.routes.auth);
const PUBLIC_PAGES = new Set<string>(authConfig.routes.public);

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const hasToken = Boolean(request.cookies.get(authConfig.cookie.name)?.value);

  if (AUTH_PAGES.has(pathname) && hasToken) {
    return NextResponse.redirect(new URL('/overview', request.url));
  }

  if (!PUBLIC_PAGES.has(pathname) && !hasToken) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('rp', `${pathname}${search}`);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.[\\w]+$).*)'],
};
