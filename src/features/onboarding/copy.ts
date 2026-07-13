/**
 * All first-run-experience copy in one place — the next project is Farsi
 * i18n, so new user-facing strings must be trivially extractable.
 */
export const onboardingCopy = {
  welcome: {
    title: (name: string | null) => (name ? `Welcome, ${name.split(' ')[0]} 👋` : 'Welcome to Kharji 👋'),
    subtitle: 'One quick thing before you start: pick the currencies you think in.',
    primaryLabel: 'Primary currency',
    primaryHint: 'The dominant value shown everywhere.',
    secondaryLabel: 'Secondary currency',
    secondaryHint: 'Shown as a muted caption beneath the primary. Optional.',
    cta: 'Start tracking',
    ctaBusy: 'Setting up...',
    footnote: 'You can change these anytime in Settings.',
  },
  checklist: {
    title: 'Get started',
    subtitle: 'Three quick steps to bring your dashboard to life.',
    progress: (done: number, total: number) => `${done} of ${total}`,
    dismiss: 'Dismiss checklist',
    steps: {
      expense: { label: 'Add your first expense', cta: 'Add expense' },
      income: { label: 'Record your income', cta: 'Add income' },
      asset: { label: 'Add an asset you own', cta: 'Add asset' },
    },
    importHint: 'Have data elsewhere? Import a CSV in',
    importLink: 'Settings',
    panelTitle: 'Set up Kharji',
    stepSaved: {
      expense: 'Expense saved!',
      income: 'Income saved!',
      asset: 'Asset saved!',
    },
    suggestions: {
      expense: {
        title: 'Start with your first expense?',
        body: 'The quickest way to see Kharji working.',
        cta: 'Add expense',
      },
      income: {
        title: 'Keep going — record your income?',
        body: '30 seconds. Your dashboard makes sense with both sides.',
        cta: 'Add income',
      },
      asset: {
        title: 'One more — add an asset you own?',
        body: 'Cash, gold, crypto, a car — your net worth appears instantly.',
        cta: 'Add asset',
      },
      later: 'Later',
    },
    completion: {
      title: "You're all set",
      body: 'Expenses, income, and assets — your dashboard is alive. This helper retires now.',
    },
  },
  zeroCaptions: {
    netWorth: 'Add an asset to see your net worth',
    income: 'No income recorded yet',
    expenses: 'No expenses yet',
    incomeTotal: 'No income recorded yet',
    incomeYtd: 'Nothing recorded this year',
    incomeLastMonth: 'Nothing recorded last month',
    incomeAverage: 'Add income to see your monthly average',
    assetsNetWorth: 'Add an asset to see your net worth',
    assetCategoryPlaceholder: 'Nothing tracked yet',
    expensesTotal: 'No expenses to show',
    expensesCount: 'No expenses to show',
    expensesDailyAverage: 'Add expenses to see your daily average',
  },
  emptyStates: {
    addExpense: 'Add expense',
    addIncome: 'Add income',
    addAsset: 'Add asset',
    recentExpenses: {
      title: 'No expenses yet',
      description: 'Record your first expense and it will show up here.',
    },
    reports: {
      title: 'No expenses yet',
      description: 'Add your first expense to unlock spending analytics.',
    },
    noMatch: {
      title: 'No matching expenses',
      description: 'Try adjusting your date range or filters.',
      clearFilters: 'Clear filters',
    },
    spendingTrend: {
      title: 'No spending to show',
      description: 'Add your first expense to start tracking your spending trend.',
    },
    expensesTable: {
      title: 'No expenses yet',
      description: 'Your expenses will appear here once you add them.',
    },
    incomeTable: {
      title: 'No income recorded yet',
      description: 'Track salary, freelance work, gifts, and more.',
    },
    assetsTable: {
      title: 'No assets recorded yet',
      description: 'Track cash, gold, crypto, vehicles — anything you own.',
    },
  },
} as const;
