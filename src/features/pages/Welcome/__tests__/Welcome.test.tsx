import Welcome from '..';
import { getCurrencyPreferencesKeyGenerator } from '@api/getCurrencyPreferencesQuery';
import { getMeKeyGenerator } from '@api/getMeQuery';
import { updateOnboardingKeyGenerator } from '@api/updateOnboardingMutation';
import userEvent from '@testing-library/user-event';

import type { AuthUser } from '@types';

import { makeTestQueryClient, render, screen, waitFor } from '@/__tests__/test-utils';

const replaceMock = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ replace: replaceMock }),
}));

const freshUser: AuthUser = {
  id: 1,
  email: 'me@example.com',
  name: 'Erfan Ansari',
  isDemo: false,
  onboardedAt: null,
  checklistDismissedAt: null,
};

function renderWelcome(user: AuthUser = freshUser) {
  const queryClient = makeTestQueryClient();
  queryClient.setQueryData(getMeKeyGenerator(), user);
  queryClient.setQueryData(getCurrencyPreferencesKeyGenerator(), {
    primaryCurrency: 'IRT',
    secondaryCurrency: 'USD',
    numberFormat: 'auto',
  });
  const onboardFn = jest.fn().mockResolvedValue({ onboardedAt: '2026-07-12T00:00:00Z', checklistDismissedAt: null });
  queryClient.setMutationDefaults([...updateOnboardingKeyGenerator()], { mutationFn: onboardFn });
  render(<Welcome />, { queryClient });
  return { onboardFn };
}

describe('Welcome page', () => {
  beforeEach(() => replaceMock.mockClear());

  it('greets the user by first name', () => {
    renderWelcome();
    expect(screen.getByText('Welcome, Erfan')).toBeInTheDocument();
  });

  it('redirects already-onboarded users to /overview', () => {
    renderWelcome({ ...freshUser, onboardedAt: '2026-01-01T00:00:00Z' });
    expect(replaceMock).toHaveBeenCalledWith('/overview');
    expect(screen.queryByText(/Welcome,/)).not.toBeInTheDocument();
  });

  it('redirects the demo account to /overview', () => {
    renderWelcome({ ...freshUser, isDemo: true });
    expect(replaceMock).toHaveBeenCalledWith('/overview');
  });

  it('completes onboarding and navigates on the CTA', async () => {
    const { onboardFn } = renderWelcome();
    await userEvent.click(screen.getByRole('button', { name: 'Start tracking' }));
    await waitFor(() => expect(onboardFn).toHaveBeenCalledWith({ completeOnboarding: true }, expect.anything()));
    await waitFor(() => expect(replaceMock).toHaveBeenCalledWith('/overview'));
  });
});
