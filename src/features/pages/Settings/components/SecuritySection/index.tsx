'use client';

import { useTranslations } from 'next-intl';

import { Lock } from 'lucide-react';

import SectionCard from '@components/SectionCard';

import { useAuth } from '@hooks/use-auth';

import ConnectedAccounts from './ConnectedAccounts';
import PasswordBlock from './PasswordBlock';
import SessionsList from './SessionsList';

const SecuritySection = () => {
  const t = useTranslations('settings.security');
  const { user } = useAuth();
  const isDemo = user?.isDemo ?? false;

  return (
    <SectionCard icon={Lock} title={t('title')} subtitle={t('subtitle')}>
      {isDemo ? (
        <div className="p-6">
          <p className="text-text-muted max-w-2xl text-sm">{t('demoDisabled')}</p>
        </div>
      ) : (
        <div className="divide-border-subtle divide-y">
          <div className="p-6">
            <PasswordBlock />
          </div>
          <div className="p-6">
            <ConnectedAccounts />
          </div>
          <div className="p-6">
            <SessionsList />
          </div>
        </div>
      )}
    </SectionCard>
  );
};

export default SecuritySection;
