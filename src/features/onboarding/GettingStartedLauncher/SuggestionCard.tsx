'use client';

import { useTranslations } from 'next-intl';

import { CheckCircle2 } from 'lucide-react';

import type { StepKey } from './use-getting-started-flow';

interface SuggestionCardProps {
  completed: StepKey;
  next: StepKey;
  doneCount: number;
  total: number;
  onAccept: () => void;
  onLater: () => void;
}

/**
 * The chain: shown right after a step completes live — celebrates it and
 * hands the user the next step while the momentum is there.
 */
const SuggestionCard = ({ completed, next, doneCount, total, onAccept, onLater }: SuggestionCardProps) => {
  const t = useTranslations('onboarding.checklist');

  return (
    <div className="px-4 py-3.5">
      <div className="flex items-center gap-2">
        <CheckCircle2
          className="text-success h-5 w-5 shrink-0 animate-[gs-pop_0.4s_0.15s_ease-out_both] motion-reduce:animate-none"
          aria-hidden="true"
        />
        <span className="text-text-primary text-sm font-semibold">{t(`stepSaved.${completed}`)}</span>
        <span className="bg-background-elevated text-text-muted ml-auto rounded px-1.5 py-0.5 text-[11px] font-medium tabular-nums">
          {t('progress', { done: doneCount, total })}
        </span>
      </div>

      <div className="bg-background-secondary mt-3 animate-[gs-slide-up_0.4s_0.45s_ease-out_both] rounded-xl p-3 motion-reduce:animate-none">
        <div className="text-text-primary text-sm font-semibold">{t(`suggestions.${next}.title`)}</div>
        <p className="text-text-muted mt-0.5 text-xs">{t(`suggestions.${next}.body`)}</p>
        <div className="mt-2.5 flex items-center gap-2">
          <button
            onClick={onAccept}
            className="bg-primary hover:bg-button-primary-bg-hover text-primary-foreground rounded-lg px-3 py-1.5 text-xs font-medium transition-colors"
          >
            {t(`suggestions.${next}.cta`)}
          </button>
          <button
            onClick={onLater}
            className="text-text-muted hover:text-text-secondary px-1 py-1.5 text-xs transition-colors"
          >
            {t('suggestions.later')}
          </button>
        </div>
      </div>

      <div className="bg-background-elevated mt-3.5 h-1 overflow-hidden rounded-full">
        <div
          className="bg-success h-full rounded-full transition-[width] duration-700 ease-out motion-reduce:transition-none"
          style={{ width: `${(doneCount / total) * 100}%` }}
        />
      </div>
    </div>
  );
};

export default SuggestionCard;
