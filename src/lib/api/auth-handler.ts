type UnauthorizedHandler = () => void;

let handler: UnauthorizedHandler | null = null;

export function setUnauthorizedHandler(fn: UnauthorizedHandler) {
  handler = fn;
}

export function triggerUnauthorized() {
  handler?.();
}

/**
 * One-shot suppression flag for the AuthGuard / UnauthorizedListener toast.
 * Set by intentional flows (manual logout) so the guard doesn't also yell
 * "you've been signed out" on top of the action's own success toast.
 */
let suppressNext = false;

export function suppressNextSignoutToast() {
  suppressNext = true;
}

export function consumeSignoutToastSuppression(): boolean {
  if (suppressNext) {
    suppressNext = false;
    return true;
  }
  return false;
}
