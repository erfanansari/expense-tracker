import OnboardingGuard from '..';
import { getMeKeyGenerator } from '@api/getMeQuery';

import type { AuthUser } from '@types';

import { makeTestQueryClient, render, screen } from '@/__tests__/test-utils';

const replaceMock = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ replace: replaceMock }),
}));

const baseUser: AuthUser = {
  id: 1,
  email: 'me@example.com',
  name: 'Me',
  isDemo: false,
  onboardedAt: '2026-01-01T00:00:00Z',
  checklistDismissedAt: null,
};

function renderGuard(user: AuthUser) {
  const queryClient = makeTestQueryClient();
  queryClient.setQueryData(getMeKeyGenerator(), user);
  render(
    <OnboardingGuard>
      <div>dashboard content</div>
    </OnboardingGuard>,
    { queryClient }
  );
}

describe('OnboardingGuard', () => {
  beforeEach(() => replaceMock.mockClear());

  it('renders children for onboarded users', () => {
    renderGuard(baseUser);
    expect(screen.getByText('dashboard content')).toBeInTheDocument();
    expect(replaceMock).not.toHaveBeenCalled();
  });

  it('redirects un-onboarded users to /welcome and hides children', () => {
    renderGuard({ ...baseUser, onboardedAt: null });
    expect(screen.queryByText('dashboard content')).not.toBeInTheDocument();
    expect(replaceMock).toHaveBeenCalledWith('/welcome');
  });

  it('never redirects the demo account', () => {
    renderGuard({ ...baseUser, onboardedAt: null, isDemo: true });
    expect(screen.getByText('dashboard content')).toBeInTheDocument();
    expect(replaceMock).not.toHaveBeenCalled();
  });
});
