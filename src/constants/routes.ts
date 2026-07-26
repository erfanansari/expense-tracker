export const ROUTES = {
  HOME: '/',
  CHANGELOG: '/changelog',
  LOGIN: '/login',
  SIGNUP: '/signup',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  OVERVIEW: '/overview',
  EXPENSES: '/expenses',
  INCOME: '/income',
  REPORTS: '/reports',
  ASSETS: '/assets',
  SETTINGS: '/settings',
} as const;

export const NAV_ITEMS = [
  { key: 'overview', href: ROUTES.OVERVIEW },
  { key: 'expenses', href: ROUTES.EXPENSES },
  { key: 'income', href: ROUTES.INCOME },
  { key: 'reports', href: ROUTES.REPORTS },
  { key: 'assets', href: ROUTES.ASSETS },
  { key: 'settings', href: ROUTES.SETTINGS },
] as const;
