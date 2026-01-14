export const INCOME_TYPES = [
  { value: 'salary', label: 'Salary', labelFa: 'حقوق' },
  { value: 'freelance', label: 'Freelance', labelFa: 'فریلنس' },
  { value: 'investment', label: 'Investment Returns', labelFa: 'سود سرمایه‌گذاری' },
  { value: 'gift', label: 'Gift', labelFa: 'هدیه' },
  { value: 'other', label: 'Other', labelFa: 'سایر' },
] as const;

export const MONTHS = [
  { value: 1, label: 'January', labelFa: 'ژانویه' },
  { value: 2, label: 'February', labelFa: 'فوریه' },
  { value: 3, label: 'March', labelFa: 'مارس' },
  { value: 4, label: 'April', labelFa: 'آوریل' },
  { value: 5, label: 'May', labelFa: 'مه' },
  { value: 6, label: 'June', labelFa: 'ژوئن' },
  { value: 7, label: 'July', labelFa: 'ژوئیه' },
  { value: 8, label: 'August', labelFa: 'اوت' },
  { value: 9, label: 'September', labelFa: 'سپتامبر' },
  { value: 10, label: 'October', labelFa: 'اکتبر' },
  { value: 11, label: 'November', labelFa: 'نوامبر' },
  { value: 12, label: 'December', labelFa: 'دسامبر' },
] as const;

export function getIncomeTypeLabel(type: string): { en: string; fa: string } {
  const found = INCOME_TYPES.find((t) => t.value === type);
  return found ? { en: found.label, fa: found.labelFa } : { en: type, fa: type };
}

export function getMonthLabel(month: number): { en: string; fa: string } {
  const found = MONTHS.find((m) => m.value === month);
  return found ? { en: found.label, fa: found.labelFa } : { en: String(month), fa: String(month) };
}
