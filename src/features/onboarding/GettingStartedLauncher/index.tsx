'use client';

import { useTranslations } from 'next-intl';

import { getAllExpensesKeyGenerator } from '@api/getAllExpensesQuery';
import type { GetAllExpensesResponse } from '@api/getAllExpensesQuery';
import { getAssetListKeyGenerator } from '@api/getAssetListQuery';
import type { GetAssetListResponse } from '@api/getAssetListQuery';
import { getIncomeListKeyGenerator } from '@api/getIncomeListQuery';
import type { GetIncomeListResponse } from '@api/getIncomeListQuery';
import { updateOnboardingKeyGenerator } from '@api/updateOnboardingMutation';
import type { UpdateOnboardingRequestData, UpdateOnboardingResponse } from '@api/updateOnboardingMutation';
import { useMutation, useQuery } from '@tanstack/react-query';

import { refreshSessionCookie } from '@features/onboarding/refresh-session-cookie';

import { useAuth } from '@hooks/use-auth';

import { useDrawerStore } from '@stores/drawer';

import ChecklistPanel from './ChecklistPanel';
import type { StepView } from './ChecklistPanel';
import CompletionCelebration from './CompletionCelebration';
import RingDock from './RingDock';
import SuggestionCard from './SuggestionCard';
import { STEP_ORDER, useGettingStartedFlow } from './use-getting-started-flow';
import type { StepKey } from './use-getting-started-flow';

/**
 * The Chained Getting-Started Flow (spec: docs/superpowers/specs/
 * 2026-07-13-chained-getting-started-design.md): a ring dock bottom-left that
 * expands into the checklist, reacts live when a step completes (celebrates +
 * suggests the next step), and retires with one celebration when all three
 * are done.
 */
const GettingStartedLauncher = () => {
  // Customs
  const t = useTranslations('onboarding.checklist');
  const { user, updateUser } = useAuth();
  const openExpenseDrawer = useDrawerStore((state) => state.openExpenseDrawer);
  const openIncomeDrawer = useDrawerStore((state) => state.openIncomeDrawer);
  const openAssetDrawer = useDrawerStore((state) => state.openAssetDrawer);

  // Only relevant for onboarded, non-demo users who haven't dismissed it
  const relevant = Boolean(user && user.onboardedAt && !user.checklistDismissedAt && !user.isDemo);

  // Queries (cheap, cached, only fetched while the launcher can render)
  const { data: expenses, isLoading: expensesLoading } = useQuery<GetAllExpensesResponse>({
    queryKey: getAllExpensesKeyGenerator(),
    enabled: relevant,
  });
  const { data: incomes, isLoading: incomesLoading } = useQuery<GetIncomeListResponse>({
    queryKey: getIncomeListKeyGenerator(),
    enabled: relevant,
  });
  const { data: assets, isLoading: assetsLoading } = useQuery<GetAssetListResponse>({
    queryKey: getAssetListKeyGenerator(),
    enabled: relevant,
  });

  const { state, toggle, later } = useGettingStartedFlow({
    expense: expenses?.length,
    income: incomes?.length,
    asset: assets?.length,
  });

  // Mutations
  const dismissMutation = useMutation<UpdateOnboardingResponse, Error, UpdateOnboardingRequestData>({
    mutationKey: updateOnboardingKeyGenerator(),
    onMutate: () => {
      // Optimistic: hide immediately; the flag is idempotent server-side.
      updateUser({ checklistDismissedAt: new Date().toISOString() });
    },
    onSuccess: () => {
      // Reissue the session cookie so reloads don't resurrect the launcher
      void refreshSessionCookie();
    },
  });

  if (!relevant || state.kind === 'finished') return null;

  // Variables
  const openers: Record<StepKey, () => void> = {
    expense: () => openExpenseDrawer(),
    income: () => openIncomeDrawer(),
    asset: () => openAssetDrawer(),
  };
  const counts: Record<StepKey, number | undefined> = {
    expense: expenses?.length,
    income: incomes?.length,
    asset: assets?.length,
  };
  const loadings: Record<StepKey, boolean> = {
    expense: expensesLoading,
    income: incomesLoading,
    asset: assetsLoading,
  };

  const steps: StepView[] = STEP_ORDER.map((key) => ({
    key,
    label: t(`steps.${key}.label`),
    cta: t(`steps.${key}.cta`),
    done: (counts[key] ?? 0) > 0,
    loading: loadings[key],
    onOpen: openers[key],
  }));

  const doneCount = steps.filter((step) => step.done).length;
  const anyLoading = steps.some((step) => step.loading);

  // Already fully set up on arrival (no live completion happened) — nothing to do
  if (!anyLoading && doneCount === steps.length && state.kind !== 'completing') return null;

  const panelContent = (() => {
    switch (state.kind) {
      case 'open':
        return (
          <ChecklistPanel
            steps={steps}
            doneCount={doneCount}
            onDismiss={() => dismissMutation.mutate({ dismissChecklist: true })}
          />
        );
      case 'suggesting':
        return (
          <SuggestionCard
            completed={state.completed}
            next={state.next}
            doneCount={doneCount}
            total={steps.length}
            onAccept={() => openers[state.next]()}
            onLater={later}
          />
        );
      case 'completing':
        return <CompletionCelebration />;
      default:
        return null;
    }
  })();

  return (
    <div className="fixed start-5 bottom-5 z-40 flex flex-col items-start gap-3">
      {panelContent && (
        <div
          className={`border-border-subtle bg-background w-[344px] max-w-[calc(100vw-2.5rem)] rounded-xl border shadow-[0_20px_50px_-12px_rgba(0,0,0,0.25),0_4px_12px_-4px_rgba(0,0,0,0.1)] ${
            state.kind === 'completing' ? 'animate-[gs-fade-out_0.5s_ease-in_5.4s_both] motion-reduce:animate-none' : ''
          }`}
        >
          {panelContent}
        </div>
      )}
      {state.kind !== 'completing' && (
        <RingDock
          done={doneCount}
          total={steps.length}
          expanded={state.kind === 'open' || state.kind === 'suggesting'}
          onToggle={toggle}
        />
      )}
    </div>
  );
};

export default GettingStartedLauncher;
