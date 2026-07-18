import { useTranslations } from 'next-intl';
import Link from 'next/link';

import LocaleToggle from '@components/LocaleToggle';

import pkg from '../../../package.json';

const LandingFooter = () => {
  const t = useTranslations('landing.footer');
  const year = new Date().getFullYear();
  const commitSha = process.env.NEXT_PUBLIC_COMMIT_SHA || 'dev';

  return (
    <footer className="border-border-subtle border-t">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-6 text-sm sm:flex-row sm:px-6 lg:px-8">
        <span className="text-text-muted">{t('copyright', { year })}</span>

        <div className="flex items-center gap-4">
          <Link href="/privacy" className="text-text-muted hover:text-text-primary text-xs transition-colors">
            {t('privacy')}
          </Link>
          <Link href="/terms" className="text-text-muted hover:text-text-primary text-xs transition-colors">
            {t('terms')}
          </Link>
          <Link href="/contact" className="text-text-muted hover:text-text-primary text-xs transition-colors">
            {t('contact')}
          </Link>
          <LocaleToggle />
        </div>

        <span className="text-text-muted font-mono text-xs">
          v{pkg.version} · {commitSha}
        </span>
      </div>
    </footer>
  );
};

export default LandingFooter;
