import { useTranslations } from 'next-intl';
import Link from 'next/link';

import StaticPageLayout, { StaticSection } from '@components/LandingPage/StaticPageLayout';

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
    <StaticPageLayout title={t('title')} lastUpdated="2026-07-08">
      <StaticSection title={t('sections.overview.title')}>
        <p>{t.rich('sections.overview.body', richTags)}</p>
      </StaticSection>

      <StaticSection title={t('sections.infoCollect.title')}>
        <p>{t.rich('sections.infoCollect.account', richTags)}</p>
        <p>{t.rich('sections.infoCollect.financial', richTags)}</p>
        <p>{t.rich('sections.infoCollect.analytics', richTags)}</p>
      </StaticSection>

      <StaticSection title={t('sections.cookies.title')}>
        <p>{t('sections.cookies.body')}</p>
      </StaticSection>

      <StaticSection title={t('sections.howWeUse.title')}>
        <ul className="list-disc space-y-2 ps-5">
          <li>{t('sections.howWeUse.item1')}</li>
          <li>{t('sections.howWeUse.item2')}</li>
          <li>{t('sections.howWeUse.item3')}</li>
          <li>{t('sections.howWeUse.item4')}</li>
        </ul>
      </StaticSection>

      <StaticSection title={t('sections.whereDataLives.title')}>
        <p>{t('sections.whereDataLives.body')}</p>
      </StaticSection>

      <StaticSection title={t('sections.dataSharing.title')}>
        <p>{t('sections.dataSharing.body')}</p>
      </StaticSection>

      <StaticSection title={t('sections.yourRights.title')}>
        <ul className="list-disc space-y-2 ps-5">
          <li>{t.rich('sections.yourRights.export', richTags)}</li>
          <li>{t.rich('sections.yourRights.delete', richTags)}</li>
          <li>{t.rich('sections.yourRights.correct', richTags)}</li>
        </ul>
      </StaticSection>

      <StaticSection title={t('sections.retention.title')}>
        <p>{t('sections.retention.body')}</p>
      </StaticSection>

      <StaticSection title={t('sections.security.title')}>
        <p>{t('sections.security.body')}</p>
      </StaticSection>

      <StaticSection title={t('sections.children.title')}>
        <p>{t('sections.children.body')}</p>
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

export default Privacy;
