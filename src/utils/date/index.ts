import { format, parseISO } from 'date-fns';

// Format a chart bucket key (yyyy-MM-dd or yyyy-MM) into a tooltip-friendly label
// based on the chart's aggregation granularity.
export function formatChartTooltipDate(label: string, granularity: 'daily' | 'weekly' | 'monthly'): string {
  if (granularity === 'monthly') return format(parseISO(`${label}-01`), 'MMMM yyyy');
  if (granularity === 'weekly') return `Week of ${format(parseISO(label), 'MMM d, yyyy')}`;
  return format(parseISO(label), 'EEE, MMM d, yyyy');
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
