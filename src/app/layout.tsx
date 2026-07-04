import type { Metadata, Viewport } from 'next';
import { Geist, Vazirmatn } from 'next/font/google';

import { SerwistProvider } from '@serwist/next/react';
import { Analytics } from '@vercel/analytics/next';
import { twMerge } from 'tailwind-merge';

import Providers from '@features/Providers';

import '@/styles/globals.css';

import AppleSplashScreens from './AppleSplashScreens';

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

const APP_URL = 'https://kharji.app';

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    template: '%s | Kharji',
    default: 'Kharji',
  },
  description: 'Track expenses, income, and assets — all in one place.',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Kharji',
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    title: 'Kharji – Personal Finance Tracker',
    description: 'Track expenses, income, and assets — all in one place.',
    siteName: 'Kharji',
    url: APP_URL,
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/opengraph-image',
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
    images: ['/opengraph-image'],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
  // Android/Chrome: shrink the layout viewport when the keyboard opens so
  // dvh-sized drawers resize natively. iOS ignores this hint (handled by
  // useKeyboardInset instead).
  interactiveWidget: 'resizes-content',
  themeColor: '#ffffff',
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
        <AppleSplashScreens />
      </head>
      <body className={twMerge(geistSans.variable, persianFont.variable, 'bg-background antialiased')}>
        <SerwistProvider swUrl="/sw.js" disable={process.env.NODE_ENV === 'development'}>
          <Providers>
            {children}
            <Analytics />
          </Providers>
        </SerwistProvider>
      </body>
    </html>
  );
}
