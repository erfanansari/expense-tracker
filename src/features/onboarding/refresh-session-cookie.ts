/**
 * Better Auth's cookie cache holds a signed session snapshot for 5 minutes,
 * so flags changed outside Better Auth (onboarded_at, checklist_dismissed_at)
 * go stale on hard reloads until the TTL expires — bouncing freshly-onboarded
 * users back to /welcome. Hitting get-session with disableCookieCache makes
 * the server reissue the cookie from the database immediately.
 */
export async function refreshSessionCookie(): Promise<void> {
  try {
    await fetch('/api/auth/get-session?disableCookieCache=true');
  } catch {
    // Best-effort — worst case is the pre-existing 5-minute staleness window.
  }
}
