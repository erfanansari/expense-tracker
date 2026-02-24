import type { Metadata } from 'next';
import { Geist, Vazirmatn } from 'next/font/google';

import { Analytics } from '@vercel/analytics/next';
import { twMerge } from 'tailwind-merge';

import { CommandPaletteProvider } from '@/components/CommandPalette/CommandPaletteProvider';
import QueryProvider from '@/components/QueryProvider';
import { ToastProvider } from '@/components/Toast/ToastProvider';
import '@/styles/globals.css';

const geistSans = Geist({
  display: 'swap',
  variable: '--font-geist-sans',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
});

const persianFont = Vazirmatn({
  display: 'swap',
  variable: '--font-persian',
  subsets: ['arabic'],
  weight: ['300', '400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: {
    template: '%s | Kharji',
    default: 'Kharji',
  },
  description: 'Track expenses, income, and assets — all in one place.',
  openGraph: {
    title: 'Kharji – Personal Finance Tracker',
    description: 'Track expenses, income, and assets — all in one place.',
    siteName: 'Kharji',
    url: 'https://kharji.erfanansari.com',
    type: 'website',
    images: [
      {
        url: 'https://kharji.erfanansari.com/opengraph-image',
        width: 1200,
        height: 630,
        alt: 'Kharji – Personal Finance Tracker',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Kharji – Personal Finance Tracker',
    description: 'Track expenses, income, and assets — all in one place.',
    images: ['https://kharji.erfanansari.com/opengraph-image'],
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="bg-background">
      <head>
        <meta name="color-scheme" content="light" />
      </head>
      <body className={twMerge(geistSans.variable, persianFont.variable, 'bg-background antialiased')}>
        <QueryProvider>
          <CommandPaletteProvider>
            <ToastProvider>
              {children}
              <Analytics />
            </ToastProvider>
          </CommandPaletteProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
