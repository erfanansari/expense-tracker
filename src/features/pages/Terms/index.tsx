import { useTranslations } from 'next-intl';
import Link from 'next/link';

import LegalPageLayout, { LegalSection } from '@components/LandingPage/LegalPageLayout';

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
    <LegalPageLayout title={t('title')} lastUpdated="2026-07-08">
      <LegalSection title={t('sections.agreement.title')}>
        <p>{t.rich('sections.agreement.body', richTags)}</p>
      </LegalSection>

      <LegalSection title={t('sections.service.title')}>
        <p>{t('sections.service.body')}</p>
      </LegalSection>

      <LegalSection title={t('sections.account.title')}>
        <ul className="list-disc space-y-2 ps-5">
          <li>{t('sections.account.item1')}</li>
          <li>{t('sections.account.item2')}</li>
          <li>{t('sections.account.item3')}</li>
          <li>{t('sections.account.item4')}</li>
        </ul>
      </LegalSection>

      <LegalSection title={t('sections.yourData.title')}>
        <p>{t.rich('sections.yourData.body', linkTag)}</p>
      </LegalSection>

      <LegalSection title={t('sections.acceptableUse.title')}>
        <p>{t('sections.acceptableUse.intro')}</p>
        <ul className="list-disc space-y-2 ps-5">
          <li>{t('sections.acceptableUse.item1')}</li>
          <li>{t('sections.acceptableUse.item2')}</li>
          <li>{t('sections.acceptableUse.item3')}</li>
          <li>{t('sections.acceptableUse.item4')}</li>
        </ul>
      </LegalSection>

      <LegalSection title={t('sections.notAdvice.title')}>
        <p>{t('sections.notAdvice.body')}</p>
      </LegalSection>

      <LegalSection title={t('sections.availability.title')}>
        <p>{t('sections.availability.body')}</p>
      </LegalSection>

      <LegalSection title={t('sections.liability.title')}>
        <p>{t('sections.liability.body')}</p>
      </LegalSection>

      <LegalSection title={t('sections.termination.title')}>
        <p>{t('sections.termination.body')}</p>
      </LegalSection>

      <LegalSection title={t('sections.changes.title')}>
        <p>{t('sections.changes.body')}</p>
      </LegalSection>

      <LegalSection title={t('sections.more.title')}>
        <p>{t.rich('sections.more.body', linkTag)}</p>
      </LegalSection>
    </LegalPageLayout>
  );
};

export default Terms;
