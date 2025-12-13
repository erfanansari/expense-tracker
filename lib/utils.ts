// Format number with commas
export function formatNumber(num: number): string {
  return new Intl.NumberFormat().format(Math.round(num));
}

// Convert Gregorian to Jalali/Persian (Farsi) date
export function formatToFarsiDate(dateStr: string): string {
  const date = new Date(dateStr);
  const formatter = new Intl.DateTimeFormat("fa-IR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  return formatter.format(date);
}

// Category mapping with Farsi translations
export const categories = [
  { value: "Food", label: "Food", labelFa: "غذا" },
  { value: "Transport", label: "Transport", labelFa: "حمل و نقل" },
  { value: "Work", label: "Work", labelFa: "کار" },
  { value: "Other", label: "Other", labelFa: "سایر" },
  { value: "Shopping", label: "Shopping", labelFa: "خرید" },
  { value: "Healthcare", label: "Healthcare", labelFa: "بهداشت و درمان" },
  { value: "Entertainment", label: "Entertainment", labelFa: "سرگرمی" },
  { value: "Utilities", label: "Utilities", labelFa: "قبوض" },
];

export function getCategoryLabel(category: string): { en: string; fa: string } {
  const cat = categories.find(c => c.value === category);
  return cat ? { en: cat.label, fa: cat.labelFa } : { en: category, fa: category };
}
