import { Bell, Coins, Database, Globe, HelpCircle, Layers, Lock, Palette, Tag, User } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

/**
 * Spelled out as unions rather than `string` so `t(`${titleKey}.title`)`
 * resolves to real message keys — next-intl type-checks them, and a widened
 * `string` would fail.
 */
export type SettingsTitleKey =
  | 'profile'
  | 'security'
  | 'notifications'
  | 'currency'
  | 'language'
  | 'appearance'
  | 'categories'
  | 'tags'
  | 'dataManagement'
  | 'help';

export type SettingsGroupKey = 'account' | 'preferences' | 'organize' | 'advanced';

export interface SettingsSection {
  /** URL slug — the section lives at `/settings/<slug>`. */
  slug: string;
  /**
   * Key under `settings` in the message catalogue. The section's own card
   * already renders `<key>.title` and `<key>.subtitle`, so the nav and the
   * index reuse those rather than duplicating copy.
   */
  titleKey: SettingsTitleKey;
  /** Mirrors the icon on the section's own card header. */
  icon: LucideIcon;
}

export interface SettingsGroup {
  /** Key under `settings.groups`. */
  labelKey: SettingsGroupKey;
  sections: SettingsSection[];
}

/**
 * The settings navigation, grouped.
 *
 * Grouping follows what comparable products converged on: identity and security
 * cluster together, notifications sits beside them rather than inside
 * "preferences", taxonomy management is its own group, and destructive data
 * operations are quarantined at the bottom with help.
 *
 * Order here is the order in the rail and on the index page.
 */
export const SETTINGS_GROUPS: SettingsGroup[] = [
  {
    labelKey: 'account',
    sections: [
      { slug: 'profile', titleKey: 'profile', icon: User },
      { slug: 'security', titleKey: 'security', icon: Lock },
      { slug: 'notifications', titleKey: 'notifications', icon: Bell },
    ],
  },
  {
    labelKey: 'preferences',
    sections: [
      { slug: 'currency', titleKey: 'currency', icon: Coins },
      { slug: 'language', titleKey: 'language', icon: Globe },
      { slug: 'appearance', titleKey: 'appearance', icon: Palette },
    ],
  },
  {
    labelKey: 'organize',
    sections: [
      { slug: 'categories', titleKey: 'categories', icon: Layers },
      { slug: 'tags', titleKey: 'tags', icon: Tag },
    ],
  },
  {
    labelKey: 'advanced',
    sections: [
      { slug: 'data', titleKey: 'dataManagement', icon: Database },
      { slug: 'help', titleKey: 'help', icon: HelpCircle },
    ],
  },
];

export const SETTINGS_SECTIONS: SettingsSection[] = SETTINGS_GROUPS.flatMap((group) => group.sections);

export const SETTINGS_SLUGS = SETTINGS_SECTIONS.map((section) => section.slug);

/** Where `/settings` sends desktop visitors, and the first row on the index. */
export const DEFAULT_SETTINGS_SLUG = 'profile';

export const getSettingsSection = (slug: string): SettingsSection | undefined =>
  SETTINGS_SECTIONS.find((section) => section.slug === slug);
