import type { ReactNode } from 'react';

import { useTranslations } from 'next-intl';

import Footer from '@components/LandingPage/Footer';
import Header from '@components/LandingPage/Header';

interface LegalPageLayoutProps {
  title: string;
  lastUpdated?: string;
  children: ReactNode;
}

const LegalPageLayout = ({ title, lastUpdated, children }: LegalPageLayoutProps) => {
  const t = useTranslations('landing.legal');
  return (
    <div className="bg-background flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <h1 className="text-text-primary text-3xl font-bold sm:text-4xl">{title}</h1>
          {lastUpdated && (
            <p className="text-text-muted mt-2 text-sm">
              {t('lastUpdated')} <time dateTime={lastUpdated}>{lastUpdated}</time>
            </p>
          )}
          <div className="mt-8 flex flex-col gap-8">{children}</div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export const LegalSection = ({ title, children }: { title: string; children: ReactNode }) => (
  <section className="flex flex-col gap-3">
    <h2 className="text-text-primary text-xl font-semibold">{title}</h2>
    <div className="text-text-secondary flex flex-col gap-3 text-sm leading-relaxed sm:text-base">{children}</div>
  </section>
);

export default LegalPageLayout;
