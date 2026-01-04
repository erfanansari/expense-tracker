import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const publicRoutes = ['/login', '/signup', '/forgot-password', '/reset-password', '/'];
const apiPublicRoutes = ['/api/auth/login', '/api/auth/signup', '/api/auth/forgot-password', '/api/auth/reset-password', '/api/auth/me'];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if it's an API route
  if (pathname.startsWith('/api')) {
    // Public API routes can be accessed without auth
    if (apiPublicRoutes.includes(pathname)) {
      return NextResponse.next();
    }

    // Other API routes require authentication
    const sessionId = request.cookies.get('session')?.value;
    if (!sessionId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // For now, skip session validation in API routes to avoid DB calls during routing
    // Sessions will be validated in the individual API route handlers
    return NextResponse.next();
  }

  // Public pages can be accessed without auth
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  // All other pages require authentication
  const sessionId = request.cookies.get('session')?.value;
  if (!sessionId) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // For client-side pages, trust the session cookie
  // The actual validation will happen in the page components via the useAuth hook
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
