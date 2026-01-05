import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const TOKEN_COOKIE_NAME = 'auth_token';

// Routes that don't require authentication
const publicRoutes = ['/', '/login', '/signup', '/forgot-password', '/reset-password'];

// API routes that don't require authentication
const apiPublicRoutes = ['/api/auth/login', '/api/auth/signup', '/api/auth/forgot-password', '/api/auth/reset-password', '/api/auth/me'];

// Routes that should redirect to dashboard if already authenticated
const authRoutes = ['/login', '/signup', '/forgot-password', '/reset-password'];

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-in-production'
);

async function verifyAuth(token: string): Promise<boolean> {
  try {
    await jwtVerify(token, JWT_SECRET, {
      issuer: 'kharji',
      audience: 'kharji-users',
    });
    return true;
  } catch {
    return false;
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get auth token from cookie
  const token = request.cookies.get(TOKEN_COOKIE_NAME)?.value;
  const isAuthenticated = token ? await verifyAuth(token) : false;

  // Handle API routes
  if (pathname.startsWith('/api')) {
    // Public API routes can be accessed without auth
    if (apiPublicRoutes.some(route => pathname === route || pathname.startsWith(route + '/'))) {
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
      return NextResponse.redirect(new URL('/dashboard', request.url));
    } else {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Redirect authenticated users away from auth pages
  if (authRoutes.includes(pathname) && isAuthenticated) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Public pages can be accessed without auth
  if (publicRoutes.includes(pathname)) {
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

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
