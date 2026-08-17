'use client';

import { useTranslations } from 'next-intl';

import { Bell } from 'lucide-react';

import SectionCard from '@components/SectionCard';
import Toggle from '@components/Toggle';

import { useToast } from '@stores/toast';

import { useNotificationPreferences } from '@/hooks/use-notification-preferences';

interface RowProps {
  title: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (next: boolean) => void;
}

const Row = ({ title, description, checked, disabled, onChange }: RowProps) => (
  <div className="flex items-center justify-between">
    <div className={disabled ? 'opacity-50' : undefined}>
      <p className="text-text-primary text-sm font-medium">{title}</p>
      <p className="text-text-muted mt-0.5 text-xs">{description}</p>
    </div>
    <Toggle checked={checked} onChange={onChange} disabled={disabled} label={title} />
  </div>
);

const SkeletonRow = () => (
  <div className="flex items-center justify-between">
    <div className="space-y-1.5">
      <div className="bg-background-elevated h-3.5 w-40 animate-pulse rounded" />
      <div className="bg-background-elevated h-3 w-56 animate-pulse rounded" />
    </div>
    <div className="bg-background-elevated h-6 w-11 animate-pulse rounded-full" />
  </div>
);

type ToggleKey = 'emailEnabled' | 'monthlyReportEnabled' | 'yearlyReportEnabled';

const TOGGLE_MESSAGES: Record<
  ToggleKey,
  { on: 'email.on' | 'monthly.on' | 'yearly.on'; off: 'email.off' | 'monthly.off' | 'yearly.off' }
> = {
  emailEnabled: { on: 'email.on', off: 'email.off' },
  monthlyReportEnabled: { on: 'monthly.on', off: 'monthly.off' },
  yearlyReportEnabled: { on: 'yearly.on', off: 'yearly.off' },
};

const NotificationsSection = () => {
  const t = useTranslations('settings.notifications');
  const { prefs, isLoading, mutate } = useNotificationPreferences();
  const { showToast } = useToast();

  const handleToggle = (key: ToggleKey, next: boolean) => {
    mutate(
      { [key]: next },
      {
        onSuccess: () =>
          showToast(t(next ? TOGGLE_MESSAGES[key].on : TOGGLE_MESSAGES[key].off), next ? 'success' : 'info'),
        onError: (err) => showToast(err instanceof Error ? err.message : t('saveFailed'), 'error'),
      }
    );
  };

  const emailOn = !!prefs?.emailEnabled;

  return (
    <SectionCard icon={Bell} title={t('title')} subtitle={t('subtitle')}>
      <div className="p-6">
        <div className="max-w-2xl space-y-5">
          {isLoading || !prefs ? (
            <>
              <SkeletonRow />
              <SkeletonRow />
              <SkeletonRow />
            </>
          ) : (
            <>
              <Row
                title={t('email.title')}
                description={t('email.description')}
                checked={prefs.emailEnabled}
                onChange={(next) => handleToggle('emailEnabled', next)}
              />
              <Row
                title={t('monthly.title')}
                description={t('monthly.description')}
                checked={prefs.monthlyReportEnabled}
                disabled={!emailOn}
                onChange={(next) => handleToggle('monthlyReportEnabled', next)}
              />
              <Row
                title={t('yearly.title')}
                description={t('yearly.description')}
                checked={prefs.yearlyReportEnabled}
                disabled={!emailOn}
                onChange={(next) => handleToggle('yearlyReportEnabled', next)}
              />
            </>
          )}
        </div>
      </div>
    </SectionCard>
  );
};

export default NotificationsSection;
