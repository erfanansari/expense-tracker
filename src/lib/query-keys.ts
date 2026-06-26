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
  categories: {
    all: () => ['categories'] as const,
    withUsage: () => ['categories', 'withUsage'] as const,
  },
  summary: {
    all: () => ['summary'] as const,
  },
  netWorth: {
    history: (from: string, to: string) => ['netWorth', 'history', from, to] as const,
  },
  rates: {
    all: () => ['rates'] as const,
    withHistory: () => ['rates', 'history'] as const,
  },
  currencyPreferences: {
    all: () => ['currencyPreferences'] as const,
  },
  user: {
    profile: () => ['user', 'profile'] as const,
  },
  notifications: {
    preferences: () => ['notifications', 'preferences'] as const,
  },
} as const;
