import { getTranslations } from 'next-intl/server';
import Link from 'next/link';

import { ChevronRight } from 'lucide-react';

import { SETTINGS_GROUPS } from '../../constants';

/**
 * The `/settings` landing.
 *
 * On phones this is the whole navigation — a list of rows you tap into, which
 * is the pattern mobile users already know from iOS/Android settings. On
 * desktop the rail carries navigation, so this doubles as an overview that
 * explains what lives where.
 */
const SettingsIndex = async () => {
  const t = await getTranslations('settings');

  return (
    <div className="flex flex-col gap-8">
      {SETTINGS_GROUPS.map((group) => (
        <section key={group.labelKey} aria-labelledby={`settings-index-${group.labelKey}`}>
          <h2
            id={`settings-index-${group.labelKey}`}
            className="text-text-muted mb-3 text-xs font-medium tracking-wider uppercase"
          >
            {t(`groups.${group.labelKey}`)}
          </h2>

          <ul className="grid gap-3 sm:grid-cols-2">
            {group.sections.map(({ slug, titleKey, icon: Icon }) => (
              <li key={slug}>
                <Link
                  href={`/settings/${slug}`}
                  className="border-border-subtle bg-background hover:border-border-default focus-visible:ring-accent flex h-full items-center gap-3 rounded-xl border p-5 shadow-sm transition-colors focus-visible:ring-2 focus-visible:outline-none"
                >
                  <span className="border-icon-box-border bg-icon-box-bg flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border">
                    <Icon className="text-text-secondary h-4 w-4" aria-hidden="true" />
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="text-text-primary block text-sm font-semibold">{t(`${titleKey}.title`)}</span>
                    <span className="text-text-muted mt-0.5 block text-xs">{t(`${titleKey}.subtitle`)}</span>
                  </span>

                  <ChevronRight className="text-text-muted h-4 w-4 shrink-0 rtl:-scale-x-100" aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
};

export default SettingsIndex;
