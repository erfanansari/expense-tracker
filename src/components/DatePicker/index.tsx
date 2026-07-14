'use client';

import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';

import { useLocale, useTranslations } from 'next-intl';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import ReactDatePicker from 'react-datepicker';
import type { DatePicker as ReactDatePickerType } from 'react-datepicker';
import { twMerge } from 'tailwind-merge';

import { useMonthLabel } from '@hooks/use-constant-labels';
import { useLocalePreferences } from '@hooks/use-locale-preferences';

import {
  addJalaliMonths,
  formatJalaliDigits,
  gregorianToJalali,
  jalaaliMonthLength,
  JALALI_MONTH_NAMES,
  jalaliToGregorian,
  resolveCalendar,
} from '@utils';
import type { JalaliDate } from '@utils';

import 'react-datepicker/dist/react-datepicker.css';

interface DatePickerProps {
  value: string;
  onChange: (date: string) => void;
  required?: boolean;
  placeholder?: string;
  isClearable?: boolean;
  wrapperClassName?: string;
}

function formatDateString(date: Date): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

// The Persian week starts Saturday; single-letter abbreviations in that order.
const JALALI_WEEKDAY_LABELS = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'];

function sameJalaliDay(a: JalaliDate | null, b: JalaliDate): boolean {
  return !!a && a.year === b.year && a.month === b.month && a.day === b.day;
}

// Custom input for Jalali mode: react-datepicker's cloneElement always
// overwrites `value`/`onChange` with its own Gregorian-formatted string, so we
// intercept those and render our own Jalali-formatted text instead. Typing is
// disabled (readOnly) — there's no unambiguous way to parse free-text Jalali
// input, so selection goes exclusively through the calendar grid below.
interface JalaliCustomInputProps extends React.ComponentProps<'input'> {
  jalaliDisplayValue: string;
}
const JalaliCustomInput = forwardRef<HTMLInputElement, JalaliCustomInputProps>(
  ({ jalaliDisplayValue, value: _value, onChange: _onChange, readOnly: _readOnly, ...rest }, ref) => {
    // `value`, `readOnly`, and `onChange` are pulled out and discarded above
    // (never reused via `...rest`) — react-datepicker's cloneElement always
    // injects its own raw Gregorian `value` and a `readOnly` prop (usually
    // `undefined`) onto this element at runtime, regardless of what our own
    // JSX/TypeScript declares; spreading `rest` after our own literals would
    // let those silently win.
    return <input ref={ref} value={jalaliDisplayValue} readOnly {...rest} />;
  }
);

const DatePicker = forwardRef<ReactDatePickerType, DatePickerProps>(
  ({ value, onChange, required, placeholder, isClearable, wrapperClassName }, ref) => {
    // Customs
    const t = useTranslations('common.datePicker');
    const monthLabel = useMonthLabel();
    const locale = useLocale() as 'en' | 'fa';
    const { prefs } = useLocalePreferences();
    const calendar = resolveCalendar(prefs.calendar, locale);
    const isJalali = calendar === 'jalali';

    // Variables
    const selected = value ? new Date(`${value}T00:00:00`) : null;
    const selectedJalali = selected ? gregorianToJalali(selected) : null;

    const handleChange = (date: Date | null) => {
      if (!date) {
        if (isClearable) onChange('');
        return;
      }
      onChange(formatDateString(date));
    };

    // References
    const onChangeRef = useRef(onChange);
    const pickerRef = useRef<ReactDatePickerType>(null);
    const closeRef = useRef(() => pickerRef.current?.setOpen(false));

    useImperativeHandle(ref, () => pickerRef.current!);

    // Effects
    useEffect(() => {
      onChangeRef.current = onChange;
    });

    // The Jalali grid tracks its own "viewed month", independent of
    // react-datepicker's internal (Gregorian) month state — navigating a
    // Jalali month doesn't line up with Gregorian month boundaries. Reset to
    // the selected date's month whenever the value changes externally (e.g. a
    // shortcut button), so re-opening the calendar lands back on it.
    const [viewedJalali, setViewedJalali] = useState<JalaliDate>(() => gregorianToJalali(selected ?? new Date()));
    useEffect(() => {
      setViewedJalali(gregorianToJalali(selected ?? new Date()));
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value]);

    const todayJalali = useMemo(() => gregorianToJalali(new Date()), []);

    const goToPrevMonth = () =>
      setViewedJalali((v) => {
        const next = addJalaliMonths(v.year, v.month, 1, -1);
        return { ...next, day: 1 };
      });
    const goToNextMonth = () =>
      setViewedJalali((v) => {
        const next = addJalaliMonths(v.year, v.month, 1, 1);
        return { ...next, day: 1 };
      });

    const jalaliGridWeeks = useMemo(() => {
      const { year, month } = viewedJalali;
      const daysInMonth = jalaaliMonthLength(year, month);
      const firstOfMonth = jalaliToGregorian(year, month, 1);
      // JS Date#getDay(): 0=Sunday..6=Saturday. Shift so Saturday=0 to match
      // the Persian week start.
      const firstWeekday = (firstOfMonth.getDay() + 1) % 7;

      const cells: Array<number | null> = [
        ...Array(firstWeekday).fill(null),
        ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
      ];
      while (cells.length % 7 !== 0) cells.push(null);

      const weeks: Array<Array<number | null>> = [];
      for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
      return weeks;
    }, [viewedJalali]);

    const jalaliDisplayValue = selectedJalali
      ? `${formatJalaliDigits(selectedJalali.day)} ${JALALI_MONTH_NAMES[selectedJalali.month - 1]} ${formatJalaliDigits(selectedJalali.year)}`
      : '';

    // Memos
    const CalendarContainer = useMemo(
      () =>
        function CalendarContainerInner({ className, children }: { className: string; children: React.ReactNode }) {
          const today = new Date();
          const yesterday = new Date(today);
          yesterday.setDate(today.getDate() - 1);
          const tomorrow = new Date(today);
          tomorrow.setDate(today.getDate() + 1);

          const weekday = (d: Date) => d.toLocaleDateString(locale === 'fa' ? 'fa-IR' : 'en-US', { weekday: 'short' });

          const shortcuts = [
            { label: t('yesterday'), date: yesterday },
            { label: t('today'), date: today },
            { label: t('tomorrow'), date: tomorrow },
          ];

          return (
            <div className={className}>
              {/* Quick shortcuts */}
              <div className="border-border-subtle flex flex-col gap-0.5 border-b p-1">
                {shortcuts.map(({ label, date }) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => {
                      onChangeRef.current(formatDateString(date));
                      closeRef.current();
                    }}
                    className="text-text-secondary hover:bg-background-elevated hover:text-text-primary flex w-full items-center rounded-md px-2.5 py-1.5 text-[13px] transition-colors duration-100"
                  >
                    <span className="font-medium">{label}</span>
                    <span className="text-text-muted ms-auto text-xs">{weekday(date)}</span>
                  </button>
                ))}
              </div>
              {/* Calendar body — Jalali grid replaces react-datepicker's own
                  (Gregorian-only) month grid when the resolved calendar is Jalali. */}
              {isJalali ? (
                <div className="p-2">
                  <div className="flex items-center justify-between px-1 pb-2">
                    <span className="text-text-primary text-sm font-semibold">
                      {JALALI_MONTH_NAMES[viewedJalali.month - 1]} {formatJalaliDigits(viewedJalali.year)}
                    </span>
                    <div className="flex items-center gap-0.5">
                      <button
                        type="button"
                        onClick={goToPrevMonth}
                        className="text-text-secondary hover:text-text-primary hover:bg-background-elevated rounded-lg p-1 transition-colors"
                        aria-label={t('previousMonth')}
                      >
                        <ChevronLeft className="h-4 w-4 rtl:-scale-x-100" />
                      </button>
                      <button
                        type="button"
                        onClick={goToNextMonth}
                        className="text-text-secondary hover:text-text-primary hover:bg-background-elevated rounded-lg p-1 transition-colors"
                        aria-label={t('nextMonth')}
                      >
                        <ChevronRight className="h-4 w-4 rtl:-scale-x-100" />
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-7 gap-0.5 px-1">
                    {JALALI_WEEKDAY_LABELS.map((label, i) => (
                      <div key={i} className="text-text-muted flex h-7 items-center justify-center text-xs font-medium">
                        {label}
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-0.5 px-1 pb-1">
                    {jalaliGridWeeks.flat().map((day, i) => {
                      if (day === null) return <div key={i} />;
                      const cellDate: JalaliDate = { year: viewedJalali.year, month: viewedJalali.month, day };
                      const isSelected = sameJalaliDay(selectedJalali, cellDate);
                      const isToday = sameJalaliDay(todayJalali, cellDate);
                      return (
                        <button
                          key={i}
                          type="button"
                          onClick={() => {
                            onChangeRef.current(
                              formatDateString(jalaliToGregorian(cellDate.year, cellDate.month, cellDate.day))
                            );
                            closeRef.current();
                          }}
                          className={twMerge(
                            'flex h-8 w-8 items-center justify-center rounded-lg text-sm transition-colors',
                            isSelected
                              ? 'bg-primary text-primary-foreground font-semibold'
                              : 'text-text-primary hover:bg-background-elevated',
                            isToday && !isSelected && 'border-blue border'
                          )}
                        >
                          {formatJalaliDigits(day)}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                children
              )}
            </div>
          );
        },
      [t, locale, isJalali, viewedJalali, jalaliGridWeeks, selectedJalali, todayJalali]
    );

    return (
      <div className={`datepicker-wrapper${wrapperClassName ? ` ${wrapperClassName}` : ''}`}>
        <ReactDatePicker
          ref={pickerRef}
          selected={selected}
          onChange={handleChange}
          dateFormat="yyyy-MM-dd"
          required={required}
          placeholderText={placeholder}
          isClearable={isClearable}
          calendarContainer={CalendarContainer}
          customInput={
            isJalali ? (
              <JalaliCustomInput jalaliDisplayValue={jalaliDisplayValue} placeholder={placeholder} />
            ) : undefined
          }
          renderCustomHeader={
            isJalali
              ? undefined
              : ({ date, decreaseMonth, increaseMonth, prevMonthButtonDisabled, nextMonthButtonDisabled }) => (
                  <div className="flex items-center justify-between px-3 pb-2">
                    <span className="text-text-primary text-sm font-semibold">
                      {monthLabel(date.getMonth() + 1)} {date.getFullYear()}
                    </span>
                    <div className="flex items-center gap-0.5">
                      <button
                        type="button"
                        onClick={decreaseMonth}
                        disabled={prevMonthButtonDisabled}
                        className="text-text-secondary hover:text-text-primary hover:bg-background-elevated rounded-lg p-1 transition-colors disabled:opacity-30"
                        aria-label={t('previousMonth')}
                      >
                        <ChevronLeft className="h-4 w-4 rtl:-scale-x-100" />
                      </button>
                      <button
                        type="button"
                        onClick={increaseMonth}
                        disabled={nextMonthButtonDisabled}
                        className="text-text-secondary hover:text-text-primary hover:bg-background-elevated rounded-lg p-1 transition-colors disabled:opacity-30"
                        aria-label={t('nextMonth')}
                      >
                        <ChevronRight className="h-4 w-4 rtl:-scale-x-100" />
                      </button>
                    </div>
                  </div>
                )
          }
          className="border-border-subtle bg-background text-text-primary focus:border-blue w-full rounded-lg border px-3 py-2 text-sm transition-all focus:outline-none"
          showPopperArrow={false}
          popperPlacement="bottom-start"
          popperProps={{ strategy: 'fixed' }}
        />
      </div>
    );
  }
);

DatePicker.displayName = 'DatePicker';

export default DatePicker;
