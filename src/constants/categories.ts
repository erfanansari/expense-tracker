export const EXPENSE_CATEGORIES = [
  // Housing
  { value: 'Rent', label: 'Rent', labelFa: 'اجاره' },
  { value: 'Utilities', label: 'Utilities', labelFa: 'قبوض' },

  // Food (split)
  { value: 'Groceries', label: 'Groceries', labelFa: 'خواربار' },
  { value: 'Coffee', label: 'Coffee', labelFa: 'رستوران و کافه' }, // Includes coffee

  // Daily
  { value: 'Transport', label: 'Transport', labelFa: 'حمل‌ و نقل' }, // Local only
  { value: 'Healthcare', label: 'Healthcare', labelFa: 'بهداشت و درمان' },
  { value: 'Clothing', label: 'Clothing', labelFa: 'پوشاک' },

  // Lifestyle
  { value: 'Entertainment', label: 'Entertainment', labelFa: 'سرگرمی' },
  { value: 'Travel', label: 'Travel', labelFa: 'سفر' }, // ALL travel expenses

  // Financial
  { value: 'Investment', label: 'Investment', labelFa: 'سرمایه‌گذاری' },

  // Work
  { value: 'Work', label: 'Work', labelFa: 'کار' },

  // Misc
  { value: 'Other', label: 'Other', labelFa: 'سایر' },
] as const;
