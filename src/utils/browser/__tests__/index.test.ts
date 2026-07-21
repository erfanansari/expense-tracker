import { buildAndroidBrowserIntentUrl, detectInAppBrowser } from '../index';

const TELEGRAM_ANDROID =
  'Mozilla/5.0 (Linux; Android 13; SM-A515F Build/TP1A.220624.014; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/120.0.6099.144 Mobile Safari/537.36';
const INSTAGRAM_IOS =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/21B74 Instagram 302.0.0.23.113';
const IOS_WKWEBVIEW =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148';

const CHROME_ANDROID =
  'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36';
const SAFARI_IOS =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Mobile/15E148 Safari/604.1';
const CHROME_IOS =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/120.0.6099.119 Mobile/15E148 Safari/604.1';
const CHROME_DESKTOP =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

describe('detectInAppBrowser', () => {
  it('detects the Android WebView used by Telegram', () => {
    expect(detectInAppBrowser(TELEGRAM_ANDROID)).toEqual({ name: '', platform: 'android' });
  });

  it('names apps that advertise themselves in the user agent', () => {
    expect(detectInAppBrowser(INSTAGRAM_IOS)).toEqual({ name: 'Instagram', platform: 'ios' });
    expect(detectInAppBrowser(`${CHROME_ANDROID} Telegram`)).toEqual({ name: 'Telegram', platform: 'android' });
  });

  it('detects a bare iOS WKWebView by its missing Safari token', () => {
    expect(detectInAppBrowser(IOS_WKWEBVIEW)).toEqual({ name: '', platform: 'ios' });
  });

  it('does not flag real browsers', () => {
    expect(detectInAppBrowser(CHROME_ANDROID)).toBeNull();
    expect(detectInAppBrowser(SAFARI_IOS)).toBeNull();
    expect(detectInAppBrowser(CHROME_IOS)).toBeNull();
    expect(detectInAppBrowser(CHROME_DESKTOP)).toBeNull();
  });

  it('returns null for an empty user agent', () => {
    expect(detectInAppBrowser('')).toBeNull();
  });
});

describe('buildAndroidBrowserIntentUrl', () => {
  it('rewrites an https URL as an intent that opens the default browser', () => {
    expect(buildAndroidBrowserIntentUrl('https://kharji.app/login?rp=%2Foverview')).toBe(
      'intent://kharji.app/login?rp=%2Foverview#Intent;scheme=https;action=android.intent.action.VIEW;end;'
    );
  });

  it('rejects non-http(s) and malformed URLs', () => {
    expect(buildAndroidBrowserIntentUrl('javascript:alert(1)')).toBeNull();
    expect(buildAndroidBrowserIntentUrl('not a url')).toBeNull();
  });
});
