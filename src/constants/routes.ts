export const ROUTES = {
  HOME: '/',
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
  { label: 'Overview', href: ROUTES.OVERVIEW },
  { label: 'Expenses', href: ROUTES.EXPENSES },
  { label: 'Income', href: ROUTES.INCOME },
  { label: 'Reports', href: ROUTES.REPORTS },
  { label: 'Assets', href: ROUTES.ASSETS },
  { label: 'Settings', href: ROUTES.SETTINGS },
] as const;
