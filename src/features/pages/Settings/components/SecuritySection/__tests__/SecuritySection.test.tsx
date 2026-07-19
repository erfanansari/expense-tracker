import SecuritySection from '..';
import { getMeKeyGenerator } from '@api/getMeQuery';
import { listAccountsKeyGenerator } from '@api/listAccountsQuery';
import { listSessionsKeyGenerator } from '@api/listSessionsQuery';

import { makeTestQueryClient, render, screen } from '@/__tests__/test-utils';

import { formatIpForDisplay, parseUserAgent } from '../SessionsList';

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

describe('SessionsList IP display', () => {
  it('hides the localhost /64-masked IP and compresses real IPv6', () => {
    const queryClient = makeTestQueryClient();
    queryClient.setQueryData(getMeKeyGenerator(), { id: 1, email: 'me@example.com', name: 'Me', isDemo: false });
    queryClient.setQueryData(listAccountsKeyGenerator(), [{ id: '1', providerId: 'credential' }]);
    queryClient.setQueryData(listSessionsKeyGenerator(), [
      {
        token: 'a',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Chrome/126.0',
        ipAddress: '0000:0000:0000:0000:0000:0000:0000:0000',
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 86400000).toISOString(),
      },
      {
        token: 'b',
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) Safari/604.1',
        ipAddress: '2a01:0e0a:0159:1234:0000:0000:0000:0000',
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 86400000).toISOString(),
      },
    ]);
    render(<SecuritySection />, { queryClient });
    expect(screen.queryByText(/0000:0000/)).not.toBeInTheDocument();
    expect(screen.getByText(/2a01:e0a:159:1234::/)).toBeInTheDocument();
  });
});

describe('formatIpForDisplay', () => {
  it.each([
    // Better Auth stores "::1" (localhost) /64-masked and expanded — meaningless, hide it
    ['0000:0000:0000:0000:0000:0000:0000:0000', null],
    ['::1', null],
    ['127.0.0.1', null],
    [null, null],
    ['95.135.200.32', '95.135.200.32'],
    // Expanded /64-masked IPv6 compresses to standard "::" notation
    ['2a01:0e0a:0159:1234:0000:0000:0000:0000', '2a01:e0a:159:1234::'],
    ['2001:0db8:0000:0000:0000:0000:0000:0001', '2001:db8::1'],
  ])('formats %s as %s', (ip, expected) => {
    expect(formatIpForDisplay(ip)).toBe(expected);
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
