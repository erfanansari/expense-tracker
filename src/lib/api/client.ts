/**
 * Shared client-side API fetch utilities.
 * All client API functions should use these instead of raw fetch().
 */
import { ApiError } from '@core/errors';

import { triggerUnauthorized } from './auth-handler';

export { ApiError };

/**
 * 401s from auth endpoints (e.g. wrong login password) are surfaced to the form
 * and must not trigger the global signed-out toast/redirect.
 */
function isAuthEndpoint(url: string): boolean {
  return url.startsWith('/api/auth/');
}

/**
 * Fetch wrapper for GET requests that returns typed JSON.
 * Throws ApiError on non-ok responses.
 */
export async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, options);
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    if (response.status === 401 && !isAuthEndpoint(url)) triggerUnauthorized();
    throw new ApiError(body.error || `Request failed`, response.status);
  }
  return response.json();
}

/**
 * Fetch wrapper for mutating requests (POST, PUT, DELETE).
 * Automatically sets Content-Type and JSON-stringifies the body.
 */
export async function apiMutate<T>(url: string, method: string, body?: unknown): Promise<T> {
  const options: RequestInit = { method };
  if (body !== undefined) {
    options.headers = { 'Content-Type': 'application/json' };
    options.body = JSON.stringify(body);
  }
  const response = await fetch(url, options);
  const json = await response.json().catch(() => ({}));
  if (!response.ok) {
    if (response.status === 401 && !isAuthEndpoint(url)) triggerUnauthorized();
    throw new ApiError(json.error || `Request failed`, response.status);
  }
  return json as T;
}
