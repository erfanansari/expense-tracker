'use client';

import { useTranslations } from 'next-intl';

import { twMerge } from 'tailwind-merge';

interface ToggleProps {
  checked: boolean;
  onChange: (next: boolean) => void;
  disabled?: boolean;
  label?: string;
}

const Toggle = ({ checked, onChange, disabled, label }: ToggleProps) => {
  const t = useTranslations('common');
  const base =
    'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200 focus:ring-2 focus:ring-blue focus:ring-offset-2 focus:outline-none';
  const tone = checked ? 'bg-blue' : 'bg-background-elevated';
  const interactive = disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer';
  const knob = `inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${
    checked ? 'translate-x-6 rtl:-translate-x-6' : 'translate-x-1 rtl:-translate-x-1'
  }`;

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label ?? t('toggle')}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={twMerge(base, tone, interactive)}
    >
      <span className={knob} />
    </button>
  );
};

export default Toggle;
