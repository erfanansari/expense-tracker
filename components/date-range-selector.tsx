'use client';

import { Calendar, ChevronDown } from 'lucide-react';

export type DateRange = '7D' | '30D' | 'THIS_MONTH' | 'LAST_MONTH' | 'YTD' | 'ALL_TIME';

interface DateRangeSelectorProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
}

export function DateRangeSelector({ value, onChange }: DateRangeSelectorProps) {
  const options: { value: DateRange; label: string; labelFa: string }[] = [
    { value: '7D', label: '7 Days', labelFa: '۷ روز' },
    { value: '30D', label: '30 Days', labelFa: '۳۰ روز' },
    { value: 'THIS_MONTH', label: 'This Month', labelFa: 'این ماه' },
    { value: 'LAST_MONTH', label: 'Last Month', labelFa: 'ماه گذشته' },
    { value: 'YTD', label: 'Year to Date', labelFa: 'از ابتدای سال' },
    { value: 'ALL_TIME', label: 'All Time', labelFa: 'همه' },
  ];

  return (
    <div className="relative group">
      <div className="flex items-center gap-2 px-4 py-2.5 bg-[#0f0f18] border border-[#1f1f30] hover:border-violet-500/30 rounded-xl transition-all duration-200 cursor-pointer shadow-lg shadow-black/10">
        <Calendar className="h-4 w-4 text-violet-400" />
        <select
          value={value}
          onChange={(e) => onChange(e.target.value as DateRange)}
          className="appearance-none bg-transparent border-none text-sm font-semibold text-white cursor-pointer focus:outline-none pr-6"
          style={{ background: 'transparent' }}
        >
          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              className="bg-[#0f0f18] text-white"
            >
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown className="h-4 w-4 text-zinc-400 group-hover:text-violet-400 transition-colors absolute right-3 pointer-events-none" />
      </div>
    </div>
  );
}

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

export function filterExpensesByDateRange<T extends { date: string }>(
  expenses: T[],
  range: DateRange
): T[] {
  const filter = getDateRangeFilter(range);

  if (!filter) {
    return expenses;
  }

  const { start, end } = filter;

  return expenses.filter(exp => {
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
