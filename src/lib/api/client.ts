/**
 * Shared client-side API fetch utilities.
 * All client API functions should use these instead of raw fetch().
 */

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Fetch wrapper for GET requests that returns typed JSON.
 * Throws ApiError on non-ok responses.
 */
export async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, options);
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
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
    throw new ApiError(json.error || `Request failed`, response.status);
  }
  return json as T;
}
