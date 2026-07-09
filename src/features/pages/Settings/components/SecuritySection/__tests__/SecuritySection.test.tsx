import SecuritySection from '..';
import { getMeKeyGenerator } from '@api/getMeQuery';
import { listAccountsKeyGenerator } from '@api/listAccountsQuery';
import { listSessionsKeyGenerator } from '@api/listSessionsQuery';

import { makeTestQueryClient, render, screen } from '@/__tests__/test-utils';

import { parseUserAgent } from '../SessionsList';

function renderSection(user: { isDemo: boolean }, accounts: { id: string; providerId: string }[]) {
  const queryClient = makeTestQueryClient();
  queryClient.setQueryData(getMeKeyGenerator(), { id: 1, email: 'me@example.com', name: 'Me', isDemo: user.isDemo });
  queryClient.setQueryData(listAccountsKeyGenerator(), accounts);
  queryClient.setQueryData(listSessionsKeyGenerator(), []);
  render(<SecuritySection />, { queryClient });
}

describe('SecuritySection', () => {
  it('shows a disabled note for the demo account', () => {
    renderSection({ isDemo: true }, []);
    expect(screen.getByText(/disabled for the shared demo account/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /change password/i })).not.toBeInTheDocument();
  });

  it('shows Change Password for users with a credential account', () => {
    renderSection({ isDemo: false }, [{ id: '1', providerId: 'credential' }]);
    expect(screen.getByRole('button', { name: /change password/i })).toBeInTheDocument();
  });

  it('shows Set Password and Connect Google for Google-only users', () => {
    renderSection({ isDemo: false }, [{ id: '1', providerId: 'google' }]);
    expect(screen.getByRole('button', { name: /set password/i })).toBeInTheDocument();
    // Google is the only account — disconnect must be disabled to avoid lockout
    expect(screen.getByRole('button', { name: /disconnect/i })).toBeDisabled();
  });
});

describe('parseUserAgent', () => {
  it.each([
    ['Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/126.0 Safari/537.36', 'Chrome · macOS'],
    ['Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Safari/604.1', 'Safari · iOS'],
    [null, 'Unknown device'],
  ])('parses %s', (userAgent, expected) => {
    expect(parseUserAgent(userAgent)).toBe(expected);
  });
});
