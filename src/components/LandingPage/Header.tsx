'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';

import Button from '@components/Button';
import Logo from '@components/Logo';

const Header = () => {
  const t = useTranslations('landing.header');
  const tCommon = useTranslations('common');
  return (
    <header className="border-border-subtle bg-background/80 sticky top-0 z-50 border-b backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" aria-label={t('homeAria')}>
          <Logo size="sm" wordmark={tCommon('appName')} wordmarkClassName="text-base font-bold sm:text-lg" />
        </Link>

        <div className="flex items-center gap-3 sm:gap-4">
          <Link href="/login" className="text-text-secondary hover:text-text-primary text-sm transition-colors">
            {t('signIn')}
          </Link>
          <Link href="/signup">
            <Button variant="primary">{t('getStarted')}</Button>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
