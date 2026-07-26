'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';

import { HelpCircle, Sparkles } from 'lucide-react';

import { ROUTES } from '@constants';

const LINK_CLASSES =
  'border-button-outline-border bg-background hover:bg-button-outline-bg-hover text-button-outline-text hover:text-button-outline-text-hover inline-flex items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-semibold transition-all';

const HelpSection = () => {
  const t = useTranslations('settings.help');
  return (
    <div className="border-border-subtle bg-background rounded-xl border shadow-sm">
      <div className="border-border-subtle border-b p-6">
        <div className="flex items-center gap-3">
          <div className="border-border-subtle bg-background-secondary rounded-lg border p-2">
            <HelpCircle className="text-text-secondary h-5 w-5" />
          </div>
          <div>
            <h2 className="text-text-primary text-lg font-semibold">{t('title')}</h2>
            <p className="text-text-muted text-sm">{t('subtitle')}</p>
          </div>
        </div>
      </div>
      <div className="p-6">
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link href={ROUTES.CHANGELOG} className={LINK_CLASSES}>
            <Sparkles className="h-4 w-4" aria-hidden="true" />
            {t('whatsNew')}
          </Link>
          <a
            href="https://github.com/erfanansari/kharji#readme"
            target="_blank"
            rel="noopener noreferrer"
            className={LINK_CLASSES}
          >
            {t('documentation')}
          </a>
          <Link href="/contact" className={LINK_CLASSES}>
            {t('contactSupport')}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HelpSection;
