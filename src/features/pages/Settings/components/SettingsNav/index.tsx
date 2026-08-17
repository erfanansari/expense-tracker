'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { twMerge } from 'tailwind-merge';

import { SETTINGS_GROUPS } from '../../constants';

/**
 * The settings rail.
 *
 * These are links to real routes, not an ARIA tablist — `role="tab"` is for
 * switching panels within one page, and using it for navigation gives screen
 * readers the wrong model. So: a plain `<nav>` of `<a>`s with `aria-current`,
 * and Tab (not arrow keys) moves through them.
 *
 * Every inline offset is a logical property (`border-s`, `ps`, `pe`) so the
 * rail and its active indicator mirror themselves in Persian instead of
 * needing an `rtl:` patch.
 */
const SettingsNav = () => {
  const t = useTranslations('settings');
  const pathname = usePathname();

  return (
    <nav aria-label={t('navLabel')}>
      <ul className="flex flex-col gap-6">
        {SETTINGS_GROUPS.map((group) => {
          const headingId = `settings-group-${group.labelKey}`;

          return (
            <li key={group.labelKey}>
              <h2 id={headingId} className="text-text-muted mb-2 px-3 text-xs font-medium tracking-wider uppercase">
                {t(`groups.${group.labelKey}`)}
              </h2>

              <ul aria-labelledby={headingId} className="flex flex-col gap-0.5">
                {group.sections.map(({ slug, titleKey, icon: Icon }) => {
                  const href = `/settings/${slug}`;
                  const isActive = pathname === href;

                  return (
                    <li key={slug}>
                      <Link
                        href={href}
                        aria-current={isActive ? 'page' : undefined}
                        className={twMerge(
                          'focus-visible:ring-accent flex items-center gap-2.5 rounded-lg border-s-2 border-s-transparent py-2 ps-3 pe-3 text-sm transition-colors focus-visible:ring-2 focus-visible:outline-none',
                          isActive
                            ? 'border-s-accent bg-accent-light text-accent font-semibold'
                            : 'text-text-secondary hover:bg-background-elevated hover:text-text-primary'
                        )}
                      >
                        <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                        <span className="truncate">{t(`${titleKey}.title`)}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default SettingsNav;
