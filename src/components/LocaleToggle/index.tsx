'use client';

import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';

import { Languages } from 'lucide-react';

import { LOCALE_COOKIE, LOCALE_COOKIE_MAX_AGE } from '@/i18n/config';
import type { AppLocale } from '@/i18n/config';

const LABELS: Record<AppLocale, string> = { en: 'فارسی', fa: 'English' };

/**
 * Language switcher for logged-out surfaces (landing, auth pages) where there's
 * no session to persist a preference against — it just sets the locale cookie
 * directly (same cookie the signed-in Settings toggle writes) and refreshes.
 */
const LocaleToggle = ({ className }: { className?: string }) => {
  const locale = useLocale() as AppLocale;
  const router = useRouter();
  const next: AppLocale = locale === 'fa' ? 'en' : 'fa';

  const handleClick = () => {
    const secure = window.location.protocol === 'https:' ? '; Secure' : '';
    document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=${LOCALE_COOKIE_MAX_AGE}; SameSite=Lax${secure}`;
    router.refresh();
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`text-text-muted hover:text-text-primary inline-flex items-center gap-1.5 text-xs transition-colors ${className ?? ''}`}
    >
      <Languages className="h-3.5 w-3.5" aria-hidden="true" />
      {LABELS[locale]}
    </button>
  );
};

export default LocaleToggle;
