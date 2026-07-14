import { useTranslations } from 'next-intl';
import Link from 'next/link';

import LegalPageLayout, { LegalSection } from '@components/LandingPage/LegalPageLayout';

const richTags = {
  a: (chunks: React.ReactNode) => (
    <a href="https://kharji.app" className="text-blue hover:underline">
      {chunks}
    </a>
  ),
  b: (chunks: React.ReactNode) => <strong className="text-text-primary">{chunks}</strong>,
};

const linkTag = {
  link: (chunks: React.ReactNode) => (
    <Link href="/terms" className="text-blue hover:underline">
      {chunks}
    </Link>
  ),
};

const Privacy = () => {
  const t = useTranslations('legal.privacy');

  return (
    <LegalPageLayout title={t('title')} lastUpdated="2026-07-08">
      <LegalSection title={t('sections.overview.title')}>
        <p>{t.rich('sections.overview.body', richTags)}</p>
      </LegalSection>

      <LegalSection title={t('sections.infoCollect.title')}>
        <p>{t.rich('sections.infoCollect.account', richTags)}</p>
        <p>{t.rich('sections.infoCollect.financial', richTags)}</p>
        <p>{t.rich('sections.infoCollect.analytics', richTags)}</p>
      </LegalSection>

      <LegalSection title={t('sections.cookies.title')}>
        <p>{t('sections.cookies.body')}</p>
      </LegalSection>

      <LegalSection title={t('sections.howWeUse.title')}>
        <ul className="list-disc space-y-2 ps-5">
          <li>{t('sections.howWeUse.item1')}</li>
          <li>{t('sections.howWeUse.item2')}</li>
          <li>{t('sections.howWeUse.item3')}</li>
          <li>{t('sections.howWeUse.item4')}</li>
        </ul>
      </LegalSection>

      <LegalSection title={t('sections.whereDataLives.title')}>
        <p>{t('sections.whereDataLives.body')}</p>
      </LegalSection>

      <LegalSection title={t('sections.dataSharing.title')}>
        <p>{t('sections.dataSharing.body')}</p>
      </LegalSection>

      <LegalSection title={t('sections.yourRights.title')}>
        <ul className="list-disc space-y-2 ps-5">
          <li>{t.rich('sections.yourRights.export', richTags)}</li>
          <li>{t.rich('sections.yourRights.delete', richTags)}</li>
          <li>{t.rich('sections.yourRights.correct', richTags)}</li>
        </ul>
      </LegalSection>

      <LegalSection title={t('sections.retention.title')}>
        <p>{t('sections.retention.body')}</p>
      </LegalSection>

      <LegalSection title={t('sections.security.title')}>
        <p>{t('sections.security.body')}</p>
      </LegalSection>

      <LegalSection title={t('sections.children.title')}>
        <p>{t('sections.children.body')}</p>
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

export default Privacy;
