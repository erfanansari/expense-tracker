import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { jwtVerify } from 'jose';

import { authConfig } from '@/configs/auth.config';

const JWT_SECRET = new TextEncoder().encode(authConfig.jwt.secret);

async function verifyAuth(token: string): Promise<boolean> {
  try {
    await jwtVerify(token, JWT_SECRET, {
      issuer: authConfig.jwt.issuer,
      audience: authConfig.jwt.audience,
    });
    return true;
  } catch {
    return false;
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get auth token from cookie
  const token = request.cookies.get(authConfig.cookie.name)?.value;
  const isAuthenticated = token ? await verifyAuth(token) : false;

  // Handle API routes
  if (pathname.startsWith('/api')) {
    // Public API routes can be accessed without auth
    if (authConfig.routes.apiPublic.some((route) => pathname === route || pathname.startsWith(`${route}/`))) {
      return NextResponse.next();
    }

    // Other API routes require authentication
    if (!isAuthenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.next();
  }

  // Handle root path
  if (pathname === '/') {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL('/overview', request.url));
    } else {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Redirect authenticated users away from auth pages
  if ((authConfig.routes.auth as readonly string[]).includes(pathname) && isAuthenticated) {
    return NextResponse.redirect(new URL('/overview', request.url));
  }

  // Public pages can be accessed without auth
  if ((authConfig.routes.public as readonly string[]).includes(pathname)) {
    return NextResponse.next();
  }

  // All other pages require authentication
  if (!isAuthenticated) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}
