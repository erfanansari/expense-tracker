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
});
