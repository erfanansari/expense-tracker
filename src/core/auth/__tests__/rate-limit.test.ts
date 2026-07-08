/**
 * @jest-environment node
 */
import { checkRateLimit, resetRateLimitStore } from '../rate-limit';

function mockRequest(ip: string | null): Request {
  return {
    headers: {
      get: (name: string) => (name.toLowerCase() === 'x-forwarded-for' ? ip : null),
    },
  } as unknown as Request;
}

describe('checkRateLimit', () => {
  beforeEach(() => {
    resetRateLimitStore();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('allows requests under the limit', () => {
    const request = mockRequest('1.2.3.4');
    for (let i = 0; i < 5; i++) {
      expect(checkRateLimit(request, { name: 'login', limit: 5, windowMs: 60_000 })).toBeNull();
    }
  });

  it('blocks requests over the limit with a 429 response', () => {
    const request = mockRequest('1.2.3.4');
    for (let i = 0; i < 5; i++) {
      checkRateLimit(request, { name: 'login', limit: 5, windowMs: 60_000 });
    }
    const response = checkRateLimit(request, { name: 'login', limit: 5, windowMs: 60_000 });
    expect(response?.status).toBe(429);
  });

  it('tracks different IPs independently', () => {
    const first = mockRequest('1.2.3.4');
    const second = mockRequest('5.6.7.8');
    for (let i = 0; i < 5; i++) {
      checkRateLimit(first, { name: 'login', limit: 5, windowMs: 60_000 });
    }
    expect(checkRateLimit(second, { name: 'login', limit: 5, windowMs: 60_000 })).toBeNull();
  });

  it('tracks different route names independently', () => {
    const request = mockRequest('1.2.3.4');
    for (let i = 0; i < 5; i++) {
      checkRateLimit(request, { name: 'login', limit: 5, windowMs: 60_000 });
    }
    expect(checkRateLimit(request, { name: 'signup', limit: 5, windowMs: 60_000 })).toBeNull();
  });

  it('resets the count after the window expires', () => {
    const request = mockRequest('1.2.3.4');
    for (let i = 0; i < 5; i++) {
      checkRateLimit(request, { name: 'login', limit: 5, windowMs: 60_000 });
    }
    expect(checkRateLimit(request, { name: 'login', limit: 5, windowMs: 60_000 })).not.toBeNull();

    jest.advanceTimersByTime(61_000);

    expect(checkRateLimit(request, { name: 'login', limit: 5, windowMs: 60_000 })).toBeNull();
  });

  it('uses the first IP from a multi-hop x-forwarded-for header', () => {
    const direct = mockRequest('1.2.3.4');
    const proxied = mockRequest('1.2.3.4, 10.0.0.1');
    for (let i = 0; i < 5; i++) {
      checkRateLimit(direct, { name: 'login', limit: 5, windowMs: 60_000 });
    }
    expect(checkRateLimit(proxied, { name: 'login', limit: 5, windowMs: 60_000 })).not.toBeNull();
  });

  it('still limits requests with no forwarded IP', () => {
    const request = mockRequest(null);
    for (let i = 0; i < 5; i++) {
      expect(checkRateLimit(request, { name: 'login', limit: 5, windowMs: 60_000 })).toBeNull();
    }
    expect(checkRateLimit(request, { name: 'login', limit: 5, windowMs: 60_000 })).not.toBeNull();
  });
});
