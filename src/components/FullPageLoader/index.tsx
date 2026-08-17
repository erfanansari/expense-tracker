'use client';

import type { FC } from 'react';

import { useTranslations } from 'next-intl';

import Logo from '@components/Logo';

const FullPageLoader: FC = () => {
  const t = useTranslations('common');
  return (
    <div className="bg-background fixed inset-0 z-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-9">
        <Logo size="xl" />
        <div
          role="status"
          aria-label={t('loading')}
          className="border-border-default border-t-text-primary h-6 w-6 animate-spin rounded-full border-2"
        />
      </div>
    </div>
  );
};

export default FullPageLoader;
