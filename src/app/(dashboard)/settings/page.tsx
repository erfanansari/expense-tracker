import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import Settings from '@features/pages/Settings';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('metaTitles');
  return { title: t('settings') };
}

const SettingsPage = () => (
  <>
    <Settings />
  </>
);

export default SettingsPage;
