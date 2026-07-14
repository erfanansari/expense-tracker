'use client';

import { useTranslations } from 'next-intl';

import { CATEGORY_COLORS } from '@constants/categories';
import { Check } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
}

const ColorPicker = ({ value, onChange }: ColorPickerProps) => {
  const t = useTranslations('settings.categories');
  return (
    <div role="radiogroup" aria-label={t('chooseColor')} className="flex flex-wrap gap-2">
      {CATEGORY_COLORS.map((color) => {
        const isSelected = color.value === value;
        return (
          <button
            key={color.value}
            type="button"
            role="radio"
            aria-checked={isSelected}
            aria-label={color.value}
            onClick={() => onChange(color.value)}
            className={twMerge(
              'relative flex h-7 w-7 items-center justify-center rounded-full transition-all duration-150',
              color.swatch,
              isSelected
                ? 'ring-text-primary ring-2 ring-offset-2'
                : 'hover:scale-110 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none'
            )}
          >
            {isSelected && <Check className="h-4 w-4 text-white drop-shadow" aria-hidden="true" />}
          </button>
        );
      })}
    </div>
  );
};

export default ColorPicker;
