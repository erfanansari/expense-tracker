// @ts-check
import { serwist } from '@serwist/next/config';

/**
 * Serwist configurator mode (Turbopack-compatible).
 * The service worker is built by `serwist build` after `next build`
 * (see the "build" script in package.json).
 */
export default await serwist({
  swSrc: 'src/app/sw.ts',
  swDest: 'public/sw.js',
  // iOS launch screens are only used by Safari at startup (before the SW) — no need
  // to bloat the offline precache with ~1.4 MB of them.
  globIgnores: ['public/splash/**'],
});
