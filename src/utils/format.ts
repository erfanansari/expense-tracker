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

// Get Jalali month name for a Gregorian month/year
export function getJalaliMonthName(gregorianMonth: number, gregorianYear: number): string {
  // Create a date in the middle of the Gregorian month to get the correct Jalali month
  const date = new Date(gregorianYear, gregorianMonth - 1, 15);
  const formatter = new Intl.DateTimeFormat('fa-IR', {
    month: 'long',
  });
  return formatter.format(date);
}
