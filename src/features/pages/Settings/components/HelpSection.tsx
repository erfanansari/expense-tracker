'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';

import { HelpCircle, Sparkles } from 'lucide-react';

import { ROUTES } from '@constants';

import SectionCard from '@components/SectionCard';

const LINK_CLASSES =
  'border-button-outline-border bg-background hover:bg-button-outline-bg-hover text-button-outline-text hover:text-button-outline-text-hover inline-flex items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-semibold transition-all';

const HelpSection = () => {
  const t = useTranslations('settings.help');
  return (
    <SectionCard icon={HelpCircle} title={t('title')} subtitle={t('subtitle')}>
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
    </SectionCard>
  );
};

export default HelpSection;
