'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';

import { CheckCircle2, Circle, X } from 'lucide-react';

import Button from '@components/Button';
import Pulse from '@components/Skeleton';

import type { StepKey } from './use-getting-started-flow';

export interface StepView {
  key: StepKey;
  label: string;
  cta: string;
  done: boolean;
  loading: boolean;
  onOpen: () => void;
}

interface ChecklistPanelProps {
  steps: StepView[];
  doneCount: number;
  onDismiss: () => void;
}

function StepStatusIcon({ loading, done }: { loading: boolean; done: boolean }) {
  if (loading) return <Pulse className="h-5 w-5 rounded-full" />;
  if (done) {
    return (
      <CheckCircle2
        className="text-success h-5 w-5 shrink-0 animate-[gs-pop_0.4s_ease-out_both] motion-reduce:animate-none"
        aria-hidden="true"
      />
    );
  }
  return <Circle className="text-border-strong h-5 w-5 shrink-0" aria-hidden="true" />;
}

/** Open launcher state: title, animated progress bar, the three step rows. */
const ChecklistPanel = ({ steps, doneCount, onDismiss }: ChecklistPanelProps) => {
  const t = useTranslations('onboarding.checklist');
  return (
    <div className="animate-[gs-slide-up_0.25s_ease-out] motion-reduce:animate-none">
      <div className="flex items-start gap-2 px-4 pt-3.5">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h2 className="text-text-primary text-sm font-semibold">{t('panelTitle')}</h2>
            <span className="bg-background-elevated text-text-muted rounded px-1.5 py-0.5 text-[11px] font-medium tabular-nums">
              {t('progress', { done: doneCount, total: steps.length })}
            </span>
          </div>
          <div className="bg-background-elevated mt-2.5 h-1 overflow-hidden rounded-full">
            <div
              className="bg-success h-full rounded-full transition-[width] duration-700 ease-out motion-reduce:transition-none"
              style={{ width: `${(doneCount / steps.length) * 100}%` }}
            />
          </div>
        </div>
        <button
          onClick={onDismiss}
          className="text-action-default hover:bg-action-cancel-bg-hover hover:text-action-cancel-text-hover -mt-1 rounded-lg p-1.5 transition-all duration-200"
          title={t('dismiss')}
          aria-label={t('dismiss')}
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <ul className="mt-2">
        {steps.map((step) => (
          <li key={step.key} className="flex items-center gap-2.5 px-4 py-2.5">
            <StepStatusIcon loading={step.loading} done={step.done} />
            <span
              className={`flex-1 text-[13px] ${step.done ? 'text-text-muted line-through decoration-1' : 'text-text-primary font-medium'}`}
            >
              {step.label}
            </span>
            {!step.loading && !step.done && (
              <Button variant="outline" onClick={step.onOpen} className="px-2.5 py-1 text-xs">
                {step.cta}
              </Button>
            )}
          </li>
        ))}
      </ul>

      <div className="border-border-subtle border-t px-4 py-2.5">
        <p className="text-text-muted text-xs">
          {t('importHint')}{' '}
          <Link href="/settings" className="text-text-secondary font-medium hover:underline">
            {t('importLink')}
          </Link>
          .
        </p>
      </div>
    </div>
  );
};

export default ChecklistPanel;
