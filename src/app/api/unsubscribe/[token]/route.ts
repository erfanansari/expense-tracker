import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { unsubscribeByToken } from '@core/database/notification-preferences';

const SUCCESS_HTML = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Unsubscribed · Kharji</title>
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif; background:#fafafa; margin:0; padding:48px 24px; color:#171717; }
      .card { max-width: 480px; margin: 0 auto; background:#fff; border:1px solid #e5e5e5; border-radius: 16px; padding: 32px; box-shadow: 0 1px 2px rgba(0,0,0,0.04); }
      h1 { margin: 0 0 8px 0; font-size: 22px; letter-spacing: -0.01em; }
      p { margin: 0; color:#525252; line-height: 1.5; font-size: 14px; }
      .logo { display:inline-flex; align-items:center; gap:10px; margin-bottom: 24px; }
      .logo .box { background:#171717; color:#fff; width:32px; height:32px; border-radius:8px; display:inline-flex; align-items:center; justify-content:center; }
      .logo .brand { font-weight: 700; font-size: 18px; }
      a { color:#171717; }
    </style>
  </head>
  <body>
    <div class="card">
      <div class="logo">
        <span class="box">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="#ffffff" aria-hidden="true"><path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/></svg>
        </span>
        <span class="brand">Kharji</span>
      </div>
      <h1>You're unsubscribed.</h1>
      <p>We won't send you any more report emails. You can re-enable them anytime in your <a href="/settings">Kharji settings</a>.</p>
    </div>
  </body>
</html>`;

const FAILURE_HTML = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Link expired · Kharji</title>
    <style>body { font-family: -apple-system, BlinkMacSystemFont, system-ui, sans-serif; padding: 48px 24px; color:#171717; }</style>
  </head>
  <body>
    <h1>This unsubscribe link is no longer valid.</h1>
    <p>You can manage your notification preferences in your <a href="/settings">Kharji settings</a>.</p>
  </body>
</html>`;

export async function GET(_request: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  if (!token) {
    return new NextResponse(FAILURE_HTML, { status: 404, headers: { 'Content-Type': 'text/html' } });
  }

  const ok = await unsubscribeByToken(token);
  if (!ok) {
    return new NextResponse(FAILURE_HTML, { status: 404, headers: { 'Content-Type': 'text/html' } });
  }

  return new NextResponse(SUCCESS_HTML, { status: 200, headers: { 'Content-Type': 'text/html' } });
}

// Some email clients (Gmail, Apple Mail) hit the URL via POST when the user
// clicks the one-click unsubscribe button — match the GET behavior.
export const POST = GET;
