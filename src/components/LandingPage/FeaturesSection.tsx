import { useTranslations } from 'next-intl';

import { Banknote, Building2, DatabaseBackup, History, PieChart, Tags } from 'lucide-react';

const FEATURE_KEYS = [
  { icon: Banknote, key: 'multiCurrency' },
  { icon: History, key: 'rates' },
  { icon: Building2, key: 'assets' },
  { icon: PieChart, key: 'reports' },
  { icon: Tags, key: 'tags' },
  { icon: DatabaseBackup, key: 'dataOwnership' },
] as const;

const FeaturesSection = () => {
  const t = useTranslations('landing.features');
  return (
    <section id="features" className="border-border-subtle border-t">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-text-primary text-2xl font-bold tracking-tight sm:text-3xl">{t('title')}</h2>
          <p className="text-text-secondary mt-4 text-base leading-relaxed">{t('subtitle')}</p>
        </div>

        <div className="mt-14 grid gap-4 sm:mt-16 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
          {FEATURE_KEYS.map(({ icon: Icon, key }) => (
            <div
              key={key}
              className="border-border-subtle bg-background hover:bg-background-secondary rounded-xl border p-6 transition-colors sm:p-8"
            >
              <div className="border-border-subtle bg-background-secondary flex h-10 w-10 items-center justify-center rounded-lg border">
                <Icon className="text-text-primary h-5 w-5" aria-hidden="true" />
              </div>
              <h3 className="text-text-primary mt-5 text-base font-semibold">{t(`${key}.title`)}</h3>
              <p className="text-text-secondary mt-2 text-sm leading-relaxed">{t(`${key}.description`)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
