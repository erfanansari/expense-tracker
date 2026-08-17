import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Kharji — Personal Finance Tracker',
    short_name: 'Kharji',
    description: 'Track expenses, income, and assets — all in one place.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    // Matches the light --color-background; the splash screens in
    // public/splash are generated on the same paper tone.
    background_color: '#ffffff',
    theme_color: '#ffffff',
    categories: ['finance', 'productivity'],
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
