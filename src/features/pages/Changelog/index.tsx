import { useTranslations } from 'next-intl';
import { notFound } from 'next/navigation';

import { RELEASES_PER_PAGE } from '@constants';

import StaticPageLayout from '@components/LandingPage/StaticPageLayout';

import { RELEASES } from '@/content/releases';

import ChangelogPagination from './components/ChangelogPagination';
import ReleaseCard from './components/ReleaseCard';

/**
 * Resolves the `?page=` query param to a valid page number, or 404s.
 * Anything unparseable or out of range is a bad URL rather than an empty page.
 */
const resolvePage = (raw: string | undefined, totalPages: number) => {
  if (raw === undefined) return 1;
  if (!/^\d+$/.test(raw)) notFound();

  const page = Number(raw);
  if (page < 1 || page > totalPages) notFound();

  return page;
};

const Changelog = ({ page: rawPage }: { page?: string }) => {
  const t = useTranslations('pages.changelog');

  const totalPages = Math.max(1, Math.ceil(RELEASES.length / RELEASES_PER_PAGE));
  const currentPage = resolvePage(rawPage, totalPages);

  const start = (currentPage - 1) * RELEASES_PER_PAGE;
  const releases = RELEASES.slice(start, start + RELEASES_PER_PAGE);

  return (
    <StaticPageLayout title={t('title')} subtitle={t('subtitle')}>
      {releases.length === 0 ? (
        <p className="text-text-muted text-sm">{t('empty')}</p>
      ) : (
        <div className="flex flex-col gap-5">
          {releases.map((release) => (
            <ReleaseCard key={release.version} release={release} isLatest={release.version === RELEASES[0].version} />
          ))}
        </div>
      )}

      <ChangelogPagination currentPage={currentPage} totalPages={totalPages} />
    </StaticPageLayout>
  );
};

export default Changelog;
