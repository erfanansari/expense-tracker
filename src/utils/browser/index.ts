/**
 * Detects embedded ("in-app") browsers — the WebViews that Telegram, Instagram,
 * Facebook & co. use to open links without leaving the app.
 *
 * Why we care: Google refuses OAuth inside embedded WebViews ("Use secure
 * browsers" policy) and answers with `403 disallowed_useragent`, so the
 * "Continue with Google" flow can never succeed there. Detecting it lets us
 * explain the problem up front instead of dumping the user on Google's
 * "Access blocked" page.
 *
 * Spoofing the user agent is not an option (it violates that same policy) —
 * the only real fix is getting the page into a full browser.
 */

export interface InAppBrowser {
  /** Human-readable host app, e.g. "Telegram". Empty when only the WebView is detectable. */
  name: string;
  platform: 'android' | 'ios' | 'unknown';
}

const NAMED_IN_APP_BROWSERS: [RegExp, string][] = [
  [/Telegram/i, 'Telegram'],
  [/FBAN|FBAV|FB_IAB|FBIOS/, 'Facebook'],
  [/Instagram/i, 'Instagram'],
  [/\bLine\//, 'LINE'],
  [/MicroMessenger/i, 'WeChat'],
  [/\bTwitter(Android)?\b/, 'X'],
  [/LinkedInApp/i, 'LinkedIn'],
  [/Snapchat/i, 'Snapchat'],
  [/Pinterest/i, 'Pinterest'],
  [/\bKAKAOTALK\b/i, 'KakaoTalk'],
];

const getPlatform = (userAgent: string): InAppBrowser['platform'] => {
  if (/Android/.test(userAgent)) return 'android';
  if (/iPhone|iPad|iPod/.test(userAgent)) return 'ios';
  return 'unknown';
};

/**
 * Returns the detected in-app browser, or `null` for real browsers.
 *
 * Detection is user-agent based, which is inherently fuzzy, so it is used only
 * to show extra guidance — never to block a flow the user might still complete.
 */
export const detectInAppBrowser = (userAgent: string): InAppBrowser | null => {
  if (!userAgent) return null;

  const platform = getPlatform(userAgent);

  for (const [pattern, name] of NAMED_IN_APP_BROWSERS) {
    if (pattern.test(userAgent)) return { name, platform };
  }

  // Android WebView always carries the `; wv)` token; Chrome/Firefox/Samsung do not.
  if (platform === 'android' && /;\s*wv[;)]/.test(userAgent)) return { name: '', platform };

  // On iOS every browser is WebKit, but real browsers (and SFSafariViewController)
  // keep a `Safari/` token. A bare WKWebView drops it.
  if (platform === 'ios' && /AppleWebKit/.test(userAgent) && !/Safari\//.test(userAgent)) {
    return { name: '', platform };
  }

  return null;
};

/**
 * An `intent://` URL that hands the page to Android's default browser, escaping
 * the WebView. Android-only — iOS has no equivalent escape hatch.
 */
export const buildAndroidBrowserIntentUrl = (url: string): string | null => {
  const parsed = URL.canParse(url) ? new URL(url) : null;
  if (!parsed || (parsed.protocol !== 'https:' && parsed.protocol !== 'http:')) return null;

  const scheme = parsed.protocol.slice(0, -1);
  const withoutScheme = url.slice(`${scheme}://`.length);

  return `intent://${withoutScheme}#Intent;scheme=${scheme};action=android.intent.action.VIEW;end;`;
};
