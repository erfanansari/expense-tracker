export const queryKeys = {
  auth: {
    me: () => ['auth', 'me'] as const,
  },
  expenses: {
    all: () => ['expenses'] as const,
    paginated: () => ['expenses', 'paginated'] as const,
    flat: () => ['expenses', 'flat'] as const,
  },
  incomes: {
    all: () => ['incomes'] as const,
  },
  assets: {
    all: () => ['assets'] as const,
  },
  tags: {
    all: () => ['tags'] as const,
    withUsage: () => ['tags', 'withUsage'] as const,
  },
  summary: {
    all: () => ['summary'] as const,
  },
  exchangeRate: {
    current: () => ['exchangeRate', 'current'] as const,
  },
  user: {
    profile: () => ['user', 'profile'] as const,
  },
} as const;
