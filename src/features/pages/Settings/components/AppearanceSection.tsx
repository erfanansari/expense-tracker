'use client';

import { useEffect, useState } from 'react';

import { useTheme } from 'next-themes';

import { Monitor, Moon, Palette, Sun } from 'lucide-react';

const THEME_OPTIONS = [
  { value: 'system', label: 'System', icon: Monitor },
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
] as const;

const AppearanceSection = () => {
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
    <div className="border-border-subtle bg-background rounded-xl border shadow-sm">
      <div className="border-border-subtle border-b p-6">
        <div className="flex items-center gap-3">
          <div className="border-border-subtle bg-background-secondary rounded-lg border p-2">
            <Palette className="text-text-secondary h-5 w-5" />
          </div>
          <div className="flex-1">
            <h2 className="text-text-primary text-lg font-semibold">Appearance</h2>
            <p className="text-text-muted text-sm">Customize the look and feel</p>
          </div>
        </div>
      </div>
      <div className="p-6">
        <label className="text-text-secondary mb-2 block text-sm font-medium">Theme</label>
        <div
          role="radiogroup"
          aria-label="Theme"
          className="border-border-subtle bg-background-secondary inline-flex w-full gap-1 rounded-lg border p-1"
        >
          {THEME_OPTIONS.map(({ value, label, icon: Icon }) => {
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
                {label}
              </button>
            );
          })}
        </div>
        <p className="text-text-muted mt-3 text-xs">
          &quot;System&quot; follows your device&apos;s appearance settings.
        </p>
      </div>
    </div>
  );
};

export default AppearanceSection;
