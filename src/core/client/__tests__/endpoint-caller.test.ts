import { z } from 'zod';

import { ApiError, ValidationError } from '@core/errors';

import { setUnauthorizedHandler } from '../auth-handler';
import EndpointCaller from '../endpoint-caller';

function mockFetchResponse(body: unknown, ok = true, status = 200) {
  return jest.fn().mockResolvedValue({
    ok,
    status,
    json: () => Promise.resolve(body),
  });
}

describe('EndpointCaller', () => {
  afterEach(() => {
    setUnauthorizedHandler(() => {});
  });

  it('serializes GET data to search params, skipping null/undefined and joining arrays', async () => {
    global.fetch = mockFetchResponse({ ok: true });
    const caller = new EndpointCaller<Record<string, unknown>, { ok: boolean }>({
      url: '/api/things',
      method: 'GET',
    });

    await caller.callQuery({
      queryKey: ['things', 'list', { from: '2026-01-01', to: undefined, tagIds: [1, 2, 3], empty: null }],
      signal: undefined as unknown as AbortSignal,
    } as never);

    const calledUrl = (global.fetch as jest.Mock).mock.calls[0][0] as string;
    expect(calledUrl).toBe('/api/things?from=2026-01-01&tagIds=1%2C2%2C3');
  });

  it('merges pageParam into GET params under pageParamName', async () => {
    global.fetch = mockFetchResponse({ ok: true });
    const caller = new EndpointCaller<{ limit: number }, { ok: boolean }>({
      url: '/api/things',
      method: 'GET',
      pageParamName: 'cursor',
    });

    await caller.callQuery({
      queryKey: ['things', 'list', { limit: 20 }],
      pageParam: 'abc',
      signal: undefined as unknown as AbortSignal,
    } as never);

    const calledUrl = (global.fetch as jest.Mock).mock.calls[0][0] as string;
    expect(calledUrl).toBe('/api/things?limit=20&cursor=abc');
  });

  it('sends JSON body for mutations and strips omitFromBody keys', async () => {
    global.fetch = mockFetchResponse({ ok: true });
    const caller = new EndpointCaller<{ id: number; name: string }, { ok: boolean }>({
      url: (data) => `/api/things/${data.id}`,
      method: 'PUT',
      omitFromBody: ['id'],
    });

    await caller.callMutation({ id: 7, name: 'new name' });

    const [url, init] = (global.fetch as jest.Mock).mock.calls[0] as [string, RequestInit];
    expect(url).toBe('/api/things/7');
    expect(init.body).toBe(JSON.stringify({ name: 'new name' }));
  });

  it('sends no body when omitFromBody leaves an empty payload', async () => {
    global.fetch = mockFetchResponse({ ok: true });
    const caller = new EndpointCaller<{ id: number }, { ok: boolean }>({
      url: (data) => `/api/things/${data.id}`,
      method: 'DELETE',
      omitFromBody: ['id'],
    });

    await caller.callMutation({ id: 7 });

    const [, init] = (global.fetch as jest.Mock).mock.calls[0] as [string, RequestInit];
    expect(init.body).toBeUndefined();
    expect(init.headers).toBeUndefined();
  });

  it('throws ApiError with server message on non-ok responses', async () => {
    global.fetch = mockFetchResponse({ error: 'Nope' }, false, 400);
    const caller = new EndpointCaller<void, { ok: boolean }>({ url: '/api/things', method: 'GET' });

    await expect(caller.callQuery({ queryKey: ['things', 'list'] } as never)).rejects.toThrow(
      new ApiError('Nope', 400)
    );
  });

  it('triggers the unauthorized handler on 401 unless skipUnauthorizedHandling', async () => {
    const handler = jest.fn();
    setUnauthorizedHandler(handler);

    global.fetch = mockFetchResponse({ error: 'Unauthorized' }, false, 401);
    const caller = new EndpointCaller<void, { ok: boolean }>({ url: '/api/things', method: 'GET' });
    await expect(caller.callQuery({ queryKey: ['things', 'list'] } as never)).rejects.toThrow(ApiError);
    expect(handler).toHaveBeenCalledTimes(1);

    const skippingCaller = new EndpointCaller<void, { ok: boolean }>({
      url: '/api/auth/login',
      skipUnauthorizedHandling: true,
    });
    await expect(skippingCaller.callMutation()).rejects.toThrow(ApiError);
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('throws ValidationError when the response does not match responseSchema', async () => {
    global.fetch = mockFetchResponse({ id: 'not-a-number' });
    const caller = new EndpointCaller<void, { id: number }>({
      url: '/api/things',
      method: 'GET',
      responseSchema: z.object({ id: z.number() }),
    });

    await expect(caller.callQuery({ queryKey: ['things', 'list'] } as never)).rejects.toThrow(ValidationError);
  });

  it('applies responseNormalizer before responseSchema', async () => {
    global.fetch = mockFetchResponse([{ id: 1 }]);
    const schema = z.object({ items: z.array(z.object({ id: z.number() })) });
    const caller = new EndpointCaller<void, z.infer<typeof schema>>({
      url: '/api/things',
      method: 'GET',
      responseNormalizer: (response) =>
        Array.isArray(response) ? { items: response } : (response as z.infer<typeof schema>),
      responseSchema: schema,
    });

    const result = await caller.callQuery({ queryKey: ['things', 'list'] } as never);
    expect(result).toEqual({ items: [{ id: 1 }] });
  });

  it('validates request data with requestDataSchema', async () => {
    global.fetch = mockFetchResponse({ ok: true });
    const caller = new EndpointCaller<{ name: string }, { ok: boolean }>({
      url: '/api/things',
      requestDataSchema: z.object({ name: z.string().min(1) }),
    });

    await expect(caller.callMutation({ name: '' })).rejects.toThrow(ValidationError);
    expect(global.fetch).not.toHaveBeenCalled();
  });
});
