import { Resend } from 'resend';

if (!process.env.RESEND_API_KEY) {
  // Don't throw at module load — local dev shouldn't crash without a key.
  // Sends will fail loudly at call time instead.
  console.warn('[email] RESEND_API_KEY is not set; emails will not be sent.');
}

export const resend = new Resend(process.env.RESEND_API_KEY);

export const FROM_ADDRESS = 'Kharji Reports <reports@kharji.app>';
export const REPLY_TO = 'hello@kharji.app';

export const APP_URL = process.env.APP_URL ?? 'http://localhost:3000';

// Kharji logo — black 32x32 rounded square + filled white Zap path (the same
// stylized lucide Zap used in the website / favicon, not the old polygon).
// Inlined as a data URI so emails don't fetch from an external URL.
export const LOGO_DATA_URI =
  'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgdmlld0JveD0iMCAwIDMyIDMyIj48cmVjdCB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHJ4PSI4IiBmaWxsPSIjMTcxNzE3Ii8+PHBhdGggdHJhbnNmb3JtPSJ0cmFuc2xhdGUoNCw0KSIgZD0iTTQgMTRhMSAxIDAgMCAxLS43OC0xLjYzbDkuOS0xMC4yYS41LjUgMCAwIDEgLjg2LjQ2bC0xLjkyIDYuMDJBMSAxIDAgMCAwIDEzIDEwaDdhMSAxIDAgMCAxIC43OCAxLjYzbC05LjkgMTAuMmEuNS41IDAgMCAxLS44Ni0uNDZsMS45Mi02LjAyQTEgMSAwIDAgMCAxMSAxNHoiIGZpbGw9IiNmZmZmZmYiLz48L3N2Zz4=';

export function unsubscribeUrl(token: string): string {
  return `${APP_URL}/api/unsubscribe/${token}`;
}
