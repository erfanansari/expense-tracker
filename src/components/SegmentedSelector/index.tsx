'use client';

import { twMerge } from 'tailwind-merge';

interface SegmentedOption<T extends string> {
  value: T;
  label: string;
}

interface SegmentedSelectorProps<T extends string> {
  value: T;
  onChange: (value: T) => void;
  options: SegmentedOption<T>[];
  className?: string;
  ariaLabel?: string;
}

const SegmentedSelector = <T extends string>({
  value,
  onChange,
  options,
  className,
  ariaLabel,
}: SegmentedSelectorProps<T>) => (
  <div
    role="radiogroup"
    aria-label={ariaLabel}
    className={twMerge(
      'bg-background-secondary scrollbar-hide flex max-w-full min-w-0 gap-0.5 self-start overflow-x-auto rounded-lg p-0.5 sm:self-auto',
      className
    )}
  >
    {options.map((opt) => {
      const isActive = opt.value === value;
      return (
        <button
          key={opt.value}
          type="button"
          role="radio"
          aria-checked={isActive}
          onClick={() => onChange(opt.value)}
          className={twMerge(
            'shrink-0 rounded-md px-2.5 py-1.5 text-[13px] font-medium whitespace-nowrap transition-colors sm:px-3',
            isActive ? 'bg-text-primary text-background shadow-sm' : 'text-text-muted hover:text-text-secondary'
          )}
        >
          {opt.label}
        </button>
      );
    })}
  </div>
);

export default SegmentedSelector;
