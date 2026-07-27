// Email assets must resolve from the recipient's mail client, which has no
// access to a dev server — so they are pinned to the production origin rather
// than derived from APP_URL. Otherwise a send from local dev (APP_URL =
// localhost) ships a logo nobody but the sender can load.
export const EMAIL_ASSET_ORIGIN = process.env.EMAIL_ASSET_ORIGIN ?? 'https://kharji.app';

// The hosted PWA icon: black rounded square + white Zap.
export const EMAIL_LOGO_URL = `${EMAIL_ASSET_ORIGIN}/icons/icon-192.png`;

export const BRAND_NAME = { en: 'Kharji', fa: 'خرجی' } as const;
