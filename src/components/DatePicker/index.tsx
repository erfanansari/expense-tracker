'use client';

import { useEffect, useMemo, useRef } from 'react';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import ReactDatePicker from 'react-datepicker';

import 'react-datepicker/dist/react-datepicker.css';

interface DatePickerProps {
  value: string;
  onChange: (date: string) => void;
  required?: boolean;
  placeholder?: string;
  isClearable?: boolean;
  wrapperClassName?: string;
}

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

function formatDateString(date: Date): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

const DatePicker = ({ value, onChange, required, placeholder, isClearable, wrapperClassName }: DatePickerProps) => {
  const selected = value ? new Date(`${value}T00:00:00`) : null;

  const handleChange = (date: Date | null) => {
    if (!date) {
      if (isClearable) onChange('');
      return;
    }
    onChange(formatDateString(date));
  };

  // Stable ref so the CalendarContainer closure always sees the latest onChange
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  });

  // Stable component — defined once, reads onChange via ref
  const CalendarContainer = useMemo(
    () =>
      function CalendarContainerInner({ className, children }: { className: string; children: React.ReactNode }) {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);

        const weekday = (d: Date) => d.toLocaleDateString('en-US', { weekday: 'short' });

        return (
          <div className={className}>
            {/* Quick shortcuts */}
            <div className="border-border-subtle border-b px-2 py-1.5">
              <button
                type="button"
                onClick={() => onChangeRef.current(formatDateString(today))}
                className="hover:bg-background-elevated flex w-full items-center rounded-lg px-3 py-2 transition-colors"
              >
                <span className="text-text-primary text-sm font-medium">Today</span>
                <span className="text-text-muted ml-auto text-xs">{weekday(today)}</span>
              </button>
              <button
                type="button"
                onClick={() => onChangeRef.current(formatDateString(tomorrow))}
                className="hover:bg-background-elevated flex w-full items-center rounded-lg px-3 py-2 transition-colors"
              >
                <span className="text-text-primary text-sm font-medium">Tomorrow</span>
                <span className="text-text-muted ml-auto text-xs">{weekday(tomorrow)}</span>
              </button>
            </div>
            {/* Calendar body */}
            {children}
          </div>
        );
      },
    [] // stable — onChange accessed via ref
  );

  return (
    <div className={`datepicker-wrapper${wrapperClassName ? ` ${wrapperClassName}` : ''}`}>
      <ReactDatePicker
        selected={selected}
        onChange={handleChange}
        dateFormat="yyyy-MM-dd"
        required={required}
        placeholderText={placeholder}
        isClearable={isClearable}
        calendarContainer={CalendarContainer}
        renderCustomHeader={({
          date,
          decreaseMonth,
          increaseMonth,
          prevMonthButtonDisabled,
          nextMonthButtonDisabled,
        }) => (
          <div className="flex items-center justify-between px-3 pb-2">
            <span className="text-text-primary text-sm font-semibold">
              {MONTH_NAMES[date.getMonth()]} {date.getFullYear()}
            </span>
            <div className="flex items-center gap-0.5">
              <button
                type="button"
                onClick={decreaseMonth}
                disabled={prevMonthButtonDisabled}
                className="text-text-secondary hover:text-text-primary hover:bg-background-elevated rounded-lg p-1 transition-colors disabled:opacity-30"
                aria-label="Previous month"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={increaseMonth}
                disabled={nextMonthButtonDisabled}
                className="text-text-secondary hover:text-text-primary hover:bg-background-elevated rounded-lg p-1 transition-colors disabled:opacity-30"
                aria-label="Next month"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
        className="border-border-subtle bg-background text-text-primary focus:border-blue w-full rounded-lg border px-3 py-2 text-sm transition-all focus:outline-none"
        showPopperArrow={false}
        popperPlacement="bottom-start"
        popperProps={{ strategy: 'fixed' }}
      />
    </div>
  );
};

export default DatePicker;
