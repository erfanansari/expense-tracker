import { useTranslations } from 'next-intl';
import Link from 'next/link';

import { NAV_ITEMS, ROUTES } from '@constants';

import GithubIcon from '@components/Icons/GithubIcon';
import Logo from '@components/Logo';

import pkg from '../../../package.json';

const Footer = () => {
  const t = useTranslations();
  const commitSha = process.env.NEXT_PUBLIC_COMMIT_SHA || 'dev';

  return (
    <footer className="border-border-subtle bg-background border-t">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-5 px-4 py-6 sm:flex-row sm:justify-between sm:px-6 lg:px-8">
        {/* Left: Logo + Nav */}
        <div className="flex flex-col items-center gap-5 sm:flex-row sm:gap-6">
          <Link href="/" className="transition-opacity hover:opacity-80" aria-label={t('landing.header.homeAria')}>
            <Logo size="sm" />
          </Link>

          <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 sm:gap-x-6">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-text-secondary hover:text-text-primary text-sm transition-colors"
              >
                {t(`nav.${item.key}`)}
              </Link>
            ))}
          </nav>
        </div>

        {/* Right: Version + GitHub */}
        <div className="flex items-center gap-5">
          <Link
            href={ROUTES.CHANGELOG}
            className="text-text-muted hover:text-text-primary font-mono text-xs transition-colors"
            dir="ltr"
          >
            v{pkg.version} · {commitSha}
          </Link>
          <a
            href="https://github.com/erfanansari/kharji"
            target="_blank"
            rel="noopener noreferrer"
            className="text-text-secondary hover:text-text-primary transition-colors"
            aria-label={t('common.viewOnGithub')}
          >
            <GithubIcon className="h-5 w-5" aria-hidden="true" />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
