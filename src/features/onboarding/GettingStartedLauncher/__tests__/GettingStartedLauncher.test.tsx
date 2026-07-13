import GettingStartedLauncher from '..';
import { getAllExpensesKeyGenerator } from '@api/getAllExpensesQuery';
import { getAssetListKeyGenerator } from '@api/getAssetListQuery';
import { getIncomeListKeyGenerator } from '@api/getIncomeListQuery';
import { getMeKeyGenerator } from '@api/getMeQuery';
import { updateOnboardingKeyGenerator } from '@api/updateOnboardingMutation';
import { act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import type { AuthUser } from '@types';

import drawerStore from '@stores/drawer';

import { makeTestQueryClient, render, screen, waitFor } from '@/__tests__/test-utils';

const user: AuthUser = {
  id: 1,
  email: 'me@example.com',
  name: 'Me',
  isDemo: false,
  onboardedAt: '2026-01-01T00:00:00Z',
  checklistDismissedAt: null,
};

function renderLauncher(opts: { user?: AuthUser; expenses?: unknown[]; incomes?: unknown[]; assets?: unknown[] } = {}) {
  const queryClient = makeTestQueryClient();
  queryClient.setQueryData(getMeKeyGenerator(), opts.user ?? user);
  queryClient.setQueryData(getAllExpensesKeyGenerator(), opts.expenses ?? []);
  queryClient.setQueryData(getIncomeListKeyGenerator(), opts.incomes ?? []);
  queryClient.setQueryData(getAssetListKeyGenerator(), opts.assets ?? []);
  const dismissFn = jest.fn().mockResolvedValue({ onboardedAt: user.onboardedAt, checklistDismissedAt: 'now' });
  queryClient.setMutationDefaults([...updateOnboardingKeyGenerator()], { mutationFn: dismissFn });
  render(<GettingStartedLauncher />, { queryClient });
  return { queryClient, dismissFn };
}

const panelOpen = () => screen.queryByText('Set up Kharji') !== null;

describe('GettingStartedLauncher (chained flow)', () => {
  beforeEach(() => {
    localStorage.clear();
    drawerStore.getState().closeExpenseDrawer();
    drawerStore.getState().closeIncomeDrawer();
    drawerStore.getState().closeAssetDrawer();
  });

  it('renders the ring dock and opens the checklist panel for a fresh user', async () => {
    renderLauncher();
    expect(screen.getByRole('button', { name: /Get started/ })).toBeInTheDocument();
    await waitFor(() => expect(panelOpen()).toBe(true));
    expect(screen.getByText('Add your first expense')).toBeInTheDocument();
    expect(screen.getByText('0 of 3')).toBeInTheDocument();
  });

  it.each([
    ['demo account', { ...user, isDemo: true }],
    ['dismissed', { ...user, checklistDismissedAt: '2026-01-02T00:00:00Z' }],
    ['pre-welcome', { ...user, onboardedAt: null }],
  ])('is hidden for %s', (_label, testUser) => {
    renderLauncher({ user: testUser as AuthUser });
    expect(screen.queryByRole('button', { name: /Get started/ })).not.toBeInTheDocument();
  });

  it('is hidden when all steps were already complete on arrival (no celebration)', () => {
    renderLauncher({ expenses: [{ id: 1 }], incomes: [{ id: 1 }], assets: [{ id: 1 }] });
    expect(screen.queryByRole('button', { name: /Get started/ })).not.toBeInTheDocument();
    expect(screen.queryByText("You're all set")).not.toBeInTheDocument();
  });

  it('step CTA opens the matching drawer', async () => {
    renderLauncher();
    await waitFor(() => expect(panelOpen()).toBe(true));
    await userEvent.click(screen.getByRole('button', { name: 'Add expense' }));
    expect(drawerStore.getState().expense.open).toBe(true);
  });

  it('CHAIN: completing a step live shows the celebration + next-step suggestion', async () => {
    const { queryClient } = renderLauncher();
    await waitFor(() => expect(panelOpen()).toBe(true));

    act(() => {
      queryClient.setQueryData(getAllExpensesKeyGenerator(), [{ id: 1 }]);
    });

    await waitFor(() => expect(screen.getByText('Expense saved!')).toBeInTheDocument());
    expect(screen.getByText('Keep going — record your income?')).toBeInTheDocument();

    // Accepting opens the suggested drawer
    await userEvent.click(screen.getByRole('button', { name: 'Add income' }));
    expect(drawerStore.getState().income.open).toBe(true);
  });

  it('CHAIN: "Later" collapses back to the dock', async () => {
    const { queryClient } = renderLauncher();
    await waitFor(() => expect(panelOpen()).toBe(true));
    act(() => {
      queryClient.setQueryData(getAllExpensesKeyGenerator(), [{ id: 1 }]);
    });
    await waitFor(() => expect(screen.getByText('Expense saved!')).toBeInTheDocument());

    await userEvent.click(screen.getByRole('button', { name: 'Later' }));
    expect(screen.queryByText('Expense saved!')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Get started/ })).toBeInTheDocument();
  });

  it('CHAIN: finishing the last step live shows the completion celebration', async () => {
    const { queryClient } = renderLauncher({ expenses: [{ id: 1 }], incomes: [{ id: 1 }] });
    await waitFor(() => expect(panelOpen()).toBe(true));
    act(() => {
      queryClient.setQueryData(getAssetListKeyGenerator(), [{ id: 1 }]);
    });
    await waitFor(() => expect(screen.getByText("You're all set")).toBeInTheDocument());
  });

  it('dismiss fires the mutation and hides the launcher', async () => {
    const { dismissFn } = renderLauncher();
    await waitFor(() => expect(panelOpen()).toBe(true));
    await userEvent.click(screen.getByRole('button', { name: 'Dismiss checklist' }));
    await waitFor(() => expect(dismissFn).toHaveBeenCalledWith({ dismissChecklist: true }, expect.anything()));
    expect(screen.queryByRole('button', { name: /Get started/ })).not.toBeInTheDocument();
  });

  it('dock toggle collapses the panel and persists', async () => {
    renderLauncher();
    await waitFor(() => expect(panelOpen()).toBe(true));
    await userEvent.click(screen.getByRole('button', { name: /Get started/ }));
    expect(panelOpen()).toBe(false);
    expect(localStorage.getItem('kharji-getting-started-collapsed')).toBe('1');
  });
});
