'use client';

import { useEffect, useState } from 'react';

import { useTranslations } from 'next-intl';
import { useTheme } from 'next-themes';

import { Monitor, Moon, Palette, Sun } from 'lucide-react';

import SectionCard from '@components/SectionCard';

const THEME_OPTIONS = [
  { value: 'system', key: 'system', icon: Monitor },
  { value: 'light', key: 'light', icon: Sun },
  { value: 'dark', key: 'dark', icon: Moon },
] as const;

const AppearanceSection = () => {
  const t = useTranslations('settings.appearance');
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // next-themes only knows the resolved theme after mount; gate the active
  // state until then to avoid a hydration mismatch. One-time flag on mount —
  // no cascading renders.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const active = mounted ? (theme ?? 'system') : undefined;

  return (
    <SectionCard icon={Palette} title={t('title')} subtitle={t('subtitle')}>
      <div className="p-6">
        <label className="text-text-secondary mb-2 block text-sm font-medium">{t('theme')}</label>
        <div
          role="radiogroup"
          aria-label={t('theme')}
          className="border-border-subtle bg-background-secondary inline-flex w-full gap-1 rounded-lg border p-1"
        >
          {THEME_OPTIONS.map(({ value, key, icon: Icon }) => {
            const isActive = active === value;
            return (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={isActive}
                onClick={() => setTheme(value)}
                className={`flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-background text-text-primary border-border-subtle border shadow-sm'
                    : 'text-text-muted hover:text-text-secondary border border-transparent'
                }`}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                {t(key)}
              </button>
            );
          })}
        </div>
        <p className="text-text-muted mt-3 text-xs">{t('systemHint')}</p>
      </div>
    </SectionCard>
  );
};

export default AppearanceSection;
