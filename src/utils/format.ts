// Format number with commas
export function formatNumber(num: number): string {
  return new Intl.NumberFormat().format(Math.round(num));
}

// Convert Gregorian to Jalali/Persian (Farsi) date
export function formatToFarsiDate(dateStr: string): string {
  const date = new Date(dateStr);
  const formatter = new Intl.DateTimeFormat('fa-IR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  return formatter.format(date);
}
