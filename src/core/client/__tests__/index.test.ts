import client from '..';

import getQueryClient from '../get-query-client';

describe('Client.registerEndpoint', () => {
  it('registers queryFn defaults under the string entries of the key', () => {
    const keyGenerator = (data: { q?: string }) => ['register-test', 'list', data] as const;
    client.registerEndpoint<{ q?: string }, { ok: boolean }>(
      (data) => [...keyGenerator(data)] as ['register-test', 'list', { q?: string }],
      { url: '/api/register-test', method: 'GET' }
    );

    const defaults = getQueryClient().getQueryDefaults(['register-test', 'list']);
    expect(defaults.queryFn).toBeInstanceOf(Function);
  });

  it('registers mutationFn defaults for mutation endpoints', () => {
    client.registerEndpoint<{ name: string }, { ok: boolean }>(() => ['register-test', 'create'], {
      url: '/api/register-test',
      type: 'mutation',
    });

    const defaults = getQueryClient().getMutationDefaults(['register-test', 'create']);
    expect(defaults.mutationFn).toBeInstanceOf(Function);
  });

  it('spreads per-endpoint query options into the defaults', () => {
    client.registerEndpoint<void, { ok: boolean }>(() => ['register-test', 'me'], {
      url: '/api/register-test/me',
      method: 'GET',
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: true,
    });

    const defaults = getQueryClient().getQueryDefaults(['register-test', 'me']);
    expect(defaults.staleTime).toBe(5 * 60 * 1000);
    expect(defaults.refetchOnWindowFocus).toBe(true);
  });
});
