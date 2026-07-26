import { useTranslations } from 'next-intl';
import Link from 'next/link';

import { ChevronLeft, ChevronRight } from 'lucide-react';

import { ROUTES } from '@constants';

/** Page 1 is the bare route, so `/changelog` and `/changelog?page=1` don't compete as duplicates. */
const hrefForPage = (page: number) => (page === 1 ? ROUTES.CHANGELOG : `${ROUTES.CHANGELOG}?page=${page}`);

interface ChangelogPaginationProps {
  currentPage: number;
  totalPages: number;
}

const ChangelogPagination = ({ currentPage, totalPages }: ChangelogPaginationProps) => {
  const t = useTranslations('pages.changelog.pagination');

  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);
  const hasPrevious = currentPage > 1;
  const hasNext = currentPage < totalPages;

  const arrowClassName =
    'text-text-secondary hover:text-text-primary hover:bg-background-elevated flex items-center gap-1 rounded-lg px-3 py-2 text-sm transition-colors';
  const disabledArrowClassName = 'text-text-muted flex items-center gap-1 rounded-lg px-3 py-2 text-sm opacity-50';

  return (
    <nav
      className="border-border-subtle flex items-center justify-between border-t pt-6"
      aria-label={t('navigationLabel')}
    >
      {hasPrevious ? (
        <Link href={hrefForPage(currentPage - 1)} className={arrowClassName} rel="prev">
          {/* Chevrons point the wrong way in RTL unless mirrored. */}
          <ChevronLeft className="h-4 w-4 rtl:-scale-x-100" aria-hidden="true" />
          {t('previous')}
        </Link>
      ) : (
        <span className={disabledArrowClassName} aria-hidden="true">
          <ChevronLeft className="h-4 w-4 rtl:-scale-x-100" />
          {t('previous')}
        </span>
      )}

      <ol className="flex items-center gap-1">
        {pages.map((page) => {
          const isCurrent = page === currentPage;

          return (
            <li key={page}>
              {isCurrent ? (
                <span
                  className="bg-primary text-primary-foreground flex h-9 min-w-9 items-center justify-center rounded-lg px-2 text-sm font-medium"
                  aria-current="page"
                  aria-label={t('pageLabel', { page })}
                >
                  {page}
                </span>
              ) : (
                <Link
                  href={hrefForPage(page)}
                  className="text-text-secondary hover:text-text-primary hover:bg-background-elevated flex h-9 min-w-9 items-center justify-center rounded-lg px-2 text-sm transition-colors"
                  aria-label={t('pageLabel', { page })}
                >
                  {page}
                </Link>
              )}
            </li>
          );
        })}
      </ol>

      {hasNext ? (
        <Link href={hrefForPage(currentPage + 1)} className={arrowClassName} rel="next">
          {t('next')}
          <ChevronRight className="h-4 w-4 rtl:-scale-x-100" aria-hidden="true" />
        </Link>
      ) : (
        <span className={disabledArrowClassName} aria-hidden="true">
          {t('next')}
          <ChevronRight className="h-4 w-4 rtl:-scale-x-100" />
        </span>
      )}
    </nav>
  );
};

export default ChangelogPagination;
