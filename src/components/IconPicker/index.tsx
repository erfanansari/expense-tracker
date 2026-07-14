'use client';

import { useTranslations } from 'next-intl';

import { CATEGORY_ICONS, getCategoryColor } from '@constants/categories';
import { twMerge } from 'tailwind-merge';

interface IconPickerProps {
  value: string;
  onChange: (icon: string) => void;
  /**
   * Color token used to highlight the selected icon. Defaults to `gray`.
   */
  highlightColor?: string;
}

const IconPicker = ({ value, onChange, highlightColor = 'gray' }: IconPickerProps) => {
  const t = useTranslations('settings.categories');
  const color = getCategoryColor(highlightColor);

  return (
    <div
      role="radiogroup"
      aria-label={t('chooseIcon')}
      className="border-border-subtle bg-background-secondary grid max-h-44 grid-cols-7 gap-1.5 overflow-y-auto rounded-lg border p-2 sm:grid-cols-9"
    >
      {CATEGORY_ICONS.map(({ value: iconValue, Icon }) => {
        const isSelected = iconValue === value;
        return (
          <button
            key={iconValue}
            type="button"
            role="radio"
            aria-checked={isSelected}
            aria-label={iconValue}
            onClick={() => onChange(iconValue)}
            className={twMerge(
              'flex h-8 w-8 items-center justify-center rounded-md border border-transparent transition-all duration-150',
              'hover:bg-background-elevated focus-visible:ring-blue/30 focus-visible:ring-2 focus-visible:outline-none',
              isSelected ? twMerge(color.pill, 'border-2') : 'text-text-secondary'
            )}
          >
            <Icon className="h-4 w-4" />
          </button>
        );
      })}
    </div>
  );
};

export default IconPicker;
