'use client';

import { useTranslations } from 'next-intl';

import { Lock } from 'lucide-react';

import { useAuth } from '@hooks/use-auth';

import ConnectedAccounts from './ConnectedAccounts';
import PasswordBlock from './PasswordBlock';
import SessionsList from './SessionsList';

const SecuritySection = () => {
  const t = useTranslations('settings.security');
  const { user } = useAuth();
  const isDemo = user?.isDemo ?? false;

  return (
    <div className="border-border-subtle bg-background rounded-xl border shadow-sm">
      <div className="border-border-subtle border-b p-6">
        <div className="flex items-center gap-3">
          <div className="border-border-subtle bg-background-secondary rounded-lg border p-2">
            <Lock className="text-text-secondary h-5 w-5" aria-hidden="true" />
          </div>
          <div className="flex-1">
            <h2 className="text-text-primary text-lg font-semibold">{t('title')}</h2>
            <p className="text-text-muted text-sm">{t('subtitle')}</p>
          </div>
        </div>
      </div>

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
    </div>
  );
};

export default SecuritySection;
