/**
 * Safely coerce an unknown caught value into an Error instance.
 * Use in catch blocks: `const err = ensureError(e);`
 */
export function ensureError(value: unknown): Error {
  if (value instanceof Error) return value;
  return new Error(String(value));
}
