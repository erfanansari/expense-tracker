'use client';

import { useTranslations } from 'next-intl';

import Select from '@components/Select';

export type DateRange = '7D' | '30D' | 'THIS_MONTH' | 'LAST_MONTH' | 'YTD' | 'ALL_TIME';

interface DateRangeSelectorProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
}

const DATE_RANGE_KEYS: { value: DateRange; key: '7d' | '30d' | 'thisMonth' | 'lastMonth' | 'ytd' | 'allTime' }[] = [
  { value: '7D', key: '7d' },
  { value: '30D', key: '30d' },
  { value: 'THIS_MONTH', key: 'thisMonth' },
  { value: 'LAST_MONTH', key: 'lastMonth' },
  { value: 'YTD', key: 'ytd' },
  { value: 'ALL_TIME', key: 'allTime' },
];

const DateRangeSelector = ({ value, onChange }: DateRangeSelectorProps) => {
  const t = useTranslations('dateRange');
  const options = DATE_RANGE_KEYS.map((r) => ({ value: r.value, label: t(r.key) }));
  return <Select value={value} onChange={(val) => onChange(val as DateRange)} options={options} />;
};

export function getDateRangeFilter(range: DateRange): { start: Date; end: Date } | null {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const end = new Date(today);
  let start = new Date(today);

  switch (range) {
    case '7D':
      start.setDate(today.getDate() - 6);
      break;
    case '30D':
      start.setDate(today.getDate() - 29);
      break;
    case 'THIS_MONTH':
      start = new Date(today.getFullYear(), today.getMonth(), 1);
      break;
    case 'LAST_MONTH':
      start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      end.setDate(0);
      break;
    case 'YTD':
      start = new Date(today.getFullYear(), 0, 1);
      break;
    case 'ALL_TIME':
      return null;
    default:
      return null;
  }

  return { start, end };
}

export function filterExpensesByDateRange<T extends { date: string }>(expenses: T[], range: DateRange): T[] {
  const filter = getDateRangeFilter(range);

  if (!filter) {
    return expenses;
  }

  const { start, end } = filter;

  return expenses.filter((exp) => {
    const expDate = new Date(exp.date);
    expDate.setHours(0, 0, 0, 0);
    return expDate >= start && expDate <= end;
  });
}

export function getChartGranularity(range: DateRange): 'daily' | 'weekly' | 'monthly' {
  const filter = getDateRangeFilter(range);

  if (!filter) {
    return 'monthly';
  }

  const { start, end } = filter;
  const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

  if (daysDiff <= 31) {
    return 'daily';
  } else if (daysDiff <= 180) {
    return 'weekly';
  } else {
    return 'monthly';
  }
}

export default DateRangeSelector;
