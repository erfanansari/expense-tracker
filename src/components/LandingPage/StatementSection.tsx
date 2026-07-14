import { useTranslations } from 'next-intl';

const StatementSection = () => {
  const t = useTranslations('landing.statement');
  return (
    <section className="border-border-subtle border-t">
      <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6 sm:py-28">
        <p className="text-text-muted text-xs font-medium tracking-widest uppercase">{t('eyebrow')}</p>
        <p className="text-text-primary mt-6 text-2xl leading-snug font-medium tracking-tight sm:text-3xl">
          {t('titleMain')} <span className="text-text-muted">{t('titleEmphasis')}</span>
        </p>
        <p className="text-text-secondary mt-6 text-base leading-relaxed sm:text-lg">{t('body')}</p>
      </div>
    </section>
  );
};

export default StatementSection;
