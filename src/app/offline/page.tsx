import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import { WifiOff, Zap } from 'lucide-react';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('metaTitles');
  return { title: t('offline') };
}

export default async function OfflinePage() {
  const t = await getTranslations('offlinePage');
  const tCommon = await getTranslations('common');

  return (
    <main className="bg-background flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <div className="flex items-center gap-2">
        <div className="bg-primary rounded-md p-2">
          <Zap className="text-primary-foreground h-5 w-5" aria-hidden="true" />
        </div>
        <span className="text-text-primary text-xl font-bold">{tCommon('appName')}</span>
      </div>

      <div className="border-border-subtle bg-background-secondary mt-10 flex h-14 w-14 items-center justify-center rounded-full border">
        <WifiOff className="text-text-muted h-6 w-6" aria-hidden="true" />
      </div>

      <h1 className="text-text-primary mt-6 text-lg font-semibold">{t('title')}</h1>
      <p className="text-text-tertiary mt-2 max-w-sm text-sm">{t('description')}</p>
    </main>
  );
}
