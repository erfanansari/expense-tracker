import { useTranslations } from 'next-intl';
import Link from 'next/link';

import StaticPageLayout, { StaticSection } from '@components/LandingPage/StaticPageLayout';

const richTags = {
  a: (chunks: React.ReactNode) => (
    <a href="https://kharji.app" className="text-blue hover:underline">
      {chunks}
    </a>
  ),
};

const linkTag = {
  link: (chunks: React.ReactNode) => (
    <Link href="/privacy" className="text-blue hover:underline">
      {chunks}
    </Link>
  ),
};

const Terms = () => {
  const t = useTranslations('legal.terms');

  return (
    <StaticPageLayout title={t('title')} lastUpdated="2026-07-08">
      <StaticSection title={t('sections.agreement.title')}>
        <p>{t.rich('sections.agreement.body', richTags)}</p>
      </StaticSection>

      <StaticSection title={t('sections.service.title')}>
        <p>{t('sections.service.body')}</p>
      </StaticSection>

      <StaticSection title={t('sections.account.title')}>
        <ul className="list-disc space-y-2 ps-5">
          <li>{t('sections.account.item1')}</li>
          <li>{t('sections.account.item2')}</li>
          <li>{t('sections.account.item3')}</li>
          <li>{t('sections.account.item4')}</li>
        </ul>
      </StaticSection>

      <StaticSection title={t('sections.yourData.title')}>
        <p>{t.rich('sections.yourData.body', linkTag)}</p>
      </StaticSection>

      <StaticSection title={t('sections.acceptableUse.title')}>
        <p>{t('sections.acceptableUse.intro')}</p>
        <ul className="list-disc space-y-2 ps-5">
          <li>{t('sections.acceptableUse.item1')}</li>
          <li>{t('sections.acceptableUse.item2')}</li>
          <li>{t('sections.acceptableUse.item3')}</li>
          <li>{t('sections.acceptableUse.item4')}</li>
        </ul>
      </StaticSection>

      <StaticSection title={t('sections.notAdvice.title')}>
        <p>{t('sections.notAdvice.body')}</p>
      </StaticSection>

      <StaticSection title={t('sections.availability.title')}>
        <p>{t('sections.availability.body')}</p>
      </StaticSection>

      <StaticSection title={t('sections.liability.title')}>
        <p>{t('sections.liability.body')}</p>
      </StaticSection>

      <StaticSection title={t('sections.termination.title')}>
        <p>{t('sections.termination.body')}</p>
      </StaticSection>

      <StaticSection title={t('sections.changes.title')}>
        <p>{t('sections.changes.body')}</p>
      </StaticSection>

      <StaticSection title={t('sections.more.title')}>
        <p>{t.rich('sections.more.body', linkTag)}</p>
      </StaticSection>
    </StaticPageLayout>
  );
};

export default Terms;
