export const authConfig = {
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
    issuer: 'kharji',
    audience: 'kharji-users',
    expiration: '30d',
  },
  cookie: {
    name: 'auth_token',
    maxAge: 60 * 60 * 24 * 30, // 30 days in seconds
  },
  routes: {
    public: ['/', '/login', '/signup', '/forgot-password', '/reset-password'],
    apiPublic: [
      '/api/auth/login',
      '/api/auth/signup',
      '/api/auth/forgot-password',
      '/api/auth/reset-password',
      '/api/auth/me',
    ],
    auth: ['/login', '/signup', '/forgot-password', '/reset-password'],
  },
} as const;
