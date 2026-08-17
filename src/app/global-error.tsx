'use client';

import { useEffect } from 'react';

import * as Sentry from '@sentry/nextjs';
import { AlertTriangle } from 'lucide-react';

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Renders when the root layout itself fails, so it gets no providers, no
 * Tailwind and no next-themes class. The palette is inlined as literals that
 * mirror src/styles/globals.css, with a media query standing in for the theme
 * toggle — otherwise dark-mode users get a white flash on the error screen.
 */
const THEME_CSS = `
  :root {
    --ge-bg: #ffffff;
    --ge-text: #0f1b2d;
    --ge-muted: #6f8199;
    --ge-danger: #c81e1e;
    --ge-brand: #1a56db;
    --ge-on-brand: #ffffff;
  }
  @media (prefers-color-scheme: dark) {
    :root {
      --ge-bg: #121214;
      --ge-text: #ececee;
      --ge-muted: #78787c;
      --ge-danger: #ff7070;
      --ge-brand: #5b9bf8;
      --ge-on-brand: #0a1220;
    }
  }
`;

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: 'sans-serif', background: 'var(--ge-bg)' }}>
        <style dangerouslySetInnerHTML={{ __html: THEME_CSS }} />
        <main
          style={{
            display: 'flex',
            minHeight: '100dvh',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            textAlign: 'center',
            gap: '2rem',
          }}
        >
          {/* Icon */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 56,
              height: 56,
              background: 'var(--ge-danger)',
              borderRadius: 16,
            }}
          >
            <AlertTriangle style={{ width: 28, height: 28, color: 'var(--ge-bg)' }} aria-hidden="true" />
          </div>

          {/* Text */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <p style={{ margin: 0, fontSize: 24, fontWeight: 700, color: 'var(--ge-text)' }}>Something went wrong</p>
            <p style={{ margin: 0, fontSize: 13, color: 'var(--ge-muted)' }}>An unexpected error occurred.</p>
          </div>

          {/* CTA */}
          <button
            onClick={reset}
            style={{
              padding: '10px 24px',
              background: 'var(--ge-brand)',
              color: 'var(--ge-on-brand)',
              border: 'none',
              borderRadius: 9999,
              fontSize: 14,
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
