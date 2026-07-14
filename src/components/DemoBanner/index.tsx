'use client';

import { useTranslations } from 'next-intl';

import Alert from '@components/Alert';

import { useAuth } from '@hooks/use-auth';

const DemoBanner = () => {
  const t = useTranslations('auth');
  const { user } = useAuth();

  if (!user || !user.isDemo) return null;

  return (
    <div className="mx-auto max-w-[1600px] px-4 pt-4 sm:px-6 sm:pt-6">
      <Alert variant="info" description={t('demoBanner')} />
    </div>
  );
};

export default DemoBanner;
