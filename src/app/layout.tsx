import type { Metadata } from 'next';
import { Geist, Vazirmatn } from 'next/font/google';

import { Analytics } from '@vercel/analytics/next';
import { twMerge } from 'tailwind-merge';

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
  title: 'Kharji',
  description: 'Track your personal expenses',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
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
        {children}
        <Analytics />
      </body>
    </html>
  );
}
