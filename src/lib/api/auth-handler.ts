type UnauthorizedHandler = () => void;

let handler: UnauthorizedHandler | null = null;

export function setUnauthorizedHandler(fn: UnauthorizedHandler) {
  handler = fn;
}

export function triggerUnauthorized() {
  handler?.();
}

/**
 * Global one-shot latch for signout transitions. Several paths can detect a
 * dead session at the same time (manual logout, a 401 from any API call, the
 * `me` query resolving to null) — whichever calls beginSignout() first owns
 * the toast and the redirect, and everyone else stands down. The latch never
 * needs resetting: every signout path ends in a hard navigation, which
 * reloads the JS and clears module state.
 */
let signoutInProgress = false;

export function beginSignout(): boolean {
  if (signoutInProgress) return false;
  signoutInProgress = true;
  return true;
}
