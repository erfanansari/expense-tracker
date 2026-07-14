import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import Landing from '@features/pages/Landing';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('metaTitles');
  return {
    title: t('landing'),
    description: t('landingDescription'),
  };
}

const LandingPage = () => (
  <>
    <Landing />
  </>
);

export default LandingPage;
