import { Resend } from 'resend';

if (!process.env.RESEND_API_KEY) {
  // Don't throw at module load — local dev shouldn't crash without a key.
  // Sends will fail loudly at call time instead.
  console.warn('[email] RESEND_API_KEY is not set; emails will not be sent.');
}

export const resend = new Resend(process.env.RESEND_API_KEY);

// Single sender for all email — reports, auth, and notifications alike.
// support@ so replies naturally become support requests (REPLY_TO routes them).
export const FROM_ADDRESS = 'Kharji <support@kharji.app>';
export const REPLY_TO = 'dev.erfanansari@gmail.com';

export const APP_URL = process.env.APP_URL ?? 'http://localhost:3000';

// Kharji logo — the hosted PWA icon (black rounded square + white Zap). Must be
// a real URL: Gmail and most clients block data: URIs, which renders as a
// broken image. APP_URL is the production domain wherever real sends happen.
export const LOGO_URL = `${APP_URL}/icons/icon-192.png`;

export function unsubscribeUrl(token: string): string {
  return `${APP_URL}/api/unsubscribe/${token}`;
}
