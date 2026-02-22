'use client';

import { AlertTriangle } from 'lucide-react';

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ reset }: GlobalErrorProps) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: 'sans-serif', background: '#ffffff' }}>
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
              background: '#ea001d',
              borderRadius: 12,
            }}
          >
            <AlertTriangle style={{ width: 28, height: 28, color: '#ffffff' }} aria-hidden="true" />
          </div>

          {/* Text */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <p style={{ margin: 0, fontSize: 24, fontWeight: 700, color: '#171717' }}>Something went wrong</p>
            <p style={{ margin: 0, fontSize: 13, color: '#a3a3a3' }}>An unexpected error occurred.</p>
          </div>

          {/* CTA */}
          <button
            onClick={reset}
            style={{
              padding: '10px 24px',
              background: '#171717',
              color: '#ffffff',
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
