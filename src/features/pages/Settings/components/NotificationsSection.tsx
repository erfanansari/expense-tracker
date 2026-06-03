'use client';

import { Bell } from 'lucide-react';

import { useToast } from '@components/Toast/ToastProvider';
import Toggle from '@components/Toggle';

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

const TOGGLE_COPY: Record<
  'emailEnabled' | 'monthlyReportEnabled' | 'yearlyReportEnabled',
  { on: string; off: string }
> = {
  emailEnabled: {
    on: 'Email notifications on.',
    off: "You won't receive any more emails from Kharji.",
  },
  monthlyReportEnabled: {
    on: 'Monthly reports on.',
    off: 'Monthly reports turned off.',
  },
  yearlyReportEnabled: {
    on: 'Yearly reports on.',
    off: 'Yearly reports turned off.',
  },
};

const NotificationsSection = () => {
  const { prefs, isLoading, mutate } = useNotificationPreferences();
  const { showToast } = useToast();

  const handleToggle = (key: 'emailEnabled' | 'monthlyReportEnabled' | 'yearlyReportEnabled', next: boolean) => {
    mutate(
      { [key]: next },
      {
        onSuccess: () => showToast(next ? TOGGLE_COPY[key].on : TOGGLE_COPY[key].off, next ? 'success' : 'info'),
        onError: (err) => showToast(err instanceof Error ? err.message : 'Could not save', 'error'),
      }
    );
  };

  const emailOn = !!prefs?.emailEnabled;

  return (
    <div className="border-border-subtle bg-background rounded-xl border shadow-sm">
      <div className="border-border-subtle border-b p-6">
        <div className="flex items-center gap-3">
          <div className="border-border-subtle bg-background-secondary rounded-lg border p-2">
            <Bell className="text-text-secondary h-5 w-5" />
          </div>
          <div className="flex-1">
            <h2 className="text-text-primary text-lg font-semibold">Notifications</h2>
            <p className="text-text-muted text-sm">Manage your notification preferences</p>
          </div>
        </div>
      </div>

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
                title="Email Notifications"
                description="Receive reports and updates from Kharji by email."
                checked={prefs.emailEnabled}
                onChange={(next) => handleToggle('emailEnabled', next)}
              />
              <Row
                title="Monthly Report"
                description="A summary of last month's finances, delivered on the 1st."
                checked={prefs.monthlyReportEnabled}
                disabled={!emailOn}
                onChange={(next) => handleToggle('monthlyReportEnabled', next)}
              />
              <Row
                title="Yearly Report"
                description="Your year in review, delivered every January 1st."
                checked={prefs.yearlyReportEnabled}
                disabled={!emailOn}
                onChange={(next) => handleToggle('yearlyReportEnabled', next)}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationsSection;
