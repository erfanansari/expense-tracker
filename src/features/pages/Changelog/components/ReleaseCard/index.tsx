import { useFormatter, useLocale, useTranslations } from 'next-intl';

import type { Release } from '@types';

import { HIGHLIGHT_TYPES } from '@constants';

import type { AppLocale } from '@/i18n/config';

/**
 * Builds a Date in the local timezone. `new Date('2026-07-26')` is parsed as UTC
 * midnight, which formats as the previous day for anyone behind UTC.
 */
const parseIsoDate = (iso: string) => {
  const [year, month, day] = iso.split('-').map(Number);
  return new Date(year, month - 1, day);
};

interface ReleaseCardProps {
  release: Release;
  isLatest?: boolean;
}

const ReleaseCard = ({ release, isLatest = false }: ReleaseCardProps) => {
  const t = useTranslations('pages.changelog');
  const format = useFormatter();
  const locale = useLocale() as AppLocale;

  const { version, date, title, summary, highlights } = release;

  return (
    <article className="border-card-border bg-card-bg flex flex-col gap-4 rounded-xl border p-5 sm:p-6">
      <header className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <span
            className="bg-tag-bg text-tag-text border-tag-border rounded-md border px-2 py-0.5 font-mono text-xs"
            dir="ltr"
          >
            v{version}
          </span>

          {isLatest && (
            <span className="bg-success/10 text-success rounded-md px-2 py-0.5 text-xs font-medium">
              {t('latestBadge')}
            </span>
          )}

          <time className="text-text-muted ms-auto text-xs" dateTime={date}>
            {format.dateTime(parseIsoDate(date), { year: 'numeric', month: 'long', day: 'numeric' })}
          </time>
        </div>

        {title && <h2 className="text-text-primary text-lg font-semibold sm:text-xl">{title[locale]}</h2>}
        {summary && <p className="text-text-secondary text-sm leading-relaxed">{summary[locale]}</p>}
      </header>

      <ul className="border-border-subtle flex flex-col gap-3 border-t pt-4">
        {highlights.map((highlight) => {
          const { icon: Icon, iconClassName, containerClassName } = HIGHLIGHT_TYPES[highlight.type];

          return (
            <li key={highlight.en} className="flex items-start gap-3">
              <span
                className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md ${containerClassName}`}
                title={t(`highlightTypes.${highlight.type}`)}
              >
                <Icon className={`h-3.5 w-3.5 ${iconClassName}`} aria-hidden="true" />
                <span className="sr-only">{t(`highlightTypes.${highlight.type}`)}</span>
              </span>
              <span className="text-text-secondary text-sm leading-relaxed">{highlight[locale]}</span>
            </li>
          );
        })}
      </ul>
    </article>
  );
};

export default ReleaseCard;
