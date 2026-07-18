// Pre-Better-Auth JWT cookie; proxy.ts deletes it when seen so stale sessions
// land cleanly on /login.
export const LEGACY_COOKIE = 'auth_token';

export const authConfig = {
  routes: {
    public: [
      '/',
      '/login',
      '/signup',
      '/forgot-password',
      '/reset-password',
      '/opengraph-image',
      '/offline',
      '/privacy',
      '/terms',
      '/contact',
      '/verify-email',
    ],
    auth: ['/login', '/signup', '/forgot-password', '/reset-password'],
  },
} as const;
