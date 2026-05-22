type UnauthorizedHandler = () => void;

let handler: UnauthorizedHandler | null = null;

export function setUnauthorizedHandler(fn: UnauthorizedHandler) {
  handler = fn;
}

export function triggerUnauthorized() {
  handler?.();
}
