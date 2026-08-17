/**
 * Renders every raster brand asset from the canonical Kharji bolt mark so the
 * icon set can never drift from the in-app <Logo/> component.
 *
 *   node scripts/generate-brand-assets.mjs
 *
 * Outputs: src/app/favicon.ico, src/app/icon.svg, public/apple-touch-icon.png,
 * public/icons/*.png and the 19 public/splash/*.png iOS launch screens.
 * The splash device list must stay in sync with src/app/AppleSplashScreens.tsx.
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const sharp = require('sharp');

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

// Brand values — keep in sync with :root in src/styles/globals.css.
const TILE_TOP = '#3b7bee';
const TILE_BOTTOM = '#1a4fc4';
const BOLT = '#ffffff';
const PAPER = '#ffffff';

// Mirrors src/components/Logo/ZapBolt.tsx: lucide's Zap path in a 24-unit box,
// stroked (not filled) so the tile shows through the bolt. The path's ink spans
// roughly x 3.2–20.8, y 1.9–22.1, so scaling by span/20.2 keeps the bolt's
// visual weight consistent per size.
const ZAP_PATH =
  'M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z';
const BOLT_SPAN = 20.2;
/** Component weight. Correct everywhere the mark is rendered above ~24px. */
const STROKE = 2;
/**
 * Favicon weight. At 16px a 2-unit stroke lands on well under one device pixel
 * and the hollow interior greys out, so the small .ico entries get a heavier
 * stroke and a slightly larger bolt — standard optical compensation, and the
 * only place the two definitions intentionally differ.
 */
const STROKE_SMALL = 2.6;

const bolt = (cx, cy, span, { color = BOLT, strokeWidth = STROKE } = {}) => {
  const s = span / BOLT_SPAN;
  return `<g transform="translate(${cx - 12 * s} ${cy - 12 * s}) scale(${s})"
    fill="none" stroke="${color}" stroke-width="${strokeWidth}"
    stroke-linejoin="round" stroke-linecap="round">
    <path d="${ZAP_PATH}"/>
  </g>`;
};

const gradient = `<linearGradient id="tile" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="${TILE_TOP}"/>
    <stop offset="1" stop-color="${TILE_BOTTOM}"/>
  </linearGradient>`;

/** Rounded cobalt tile + bolt. `radiusRatio: 0` gives a full-bleed square. */
const markSvg = (size, { radiusRatio = 0.2237, boltRatio = 0.52, strokeWidth = STROKE } = {}) => `
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>${gradient}</defs>
  <rect width="${size}" height="${size}" rx="${(size * radiusRatio).toFixed(2)}" fill="url(#tile)"/>
  ${bolt(size / 2, size / 2, size * boltRatio, { strokeWidth })}
</svg>`;

/** Centred mark on the app's paper background, for iOS launch screens. */
const splashSvg = (w, h) => {
  const tile = Math.round(Math.min(w, h) * 0.22);
  return `
<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>${gradient}</defs>
  <rect width="${w}" height="${h}" fill="${PAPER}"/>
  <rect x="${(w - tile) / 2}" y="${(h - tile) / 2}" width="${tile}" height="${tile}"
        rx="${(tile * 0.2237).toFixed(2)}" fill="url(#tile)"/>
  ${bolt(w / 2, h / 2, tile * 0.5)}
</svg>`;
};

const png = (svg, size) => sharp(Buffer.from(svg)).resize(size, size).png({ compressionLevel: 9 }).toBuffer();

/** Modern .ico files may embed PNG payloads directly; every current browser reads them. */
const buildIco = (images) => {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);

  let offset = 6 + images.length * 16;
  const entries = images.map(({ size, data }) => {
    const e = Buffer.alloc(16);
    e.writeUInt8(size >= 256 ? 0 : size, 0);
    e.writeUInt8(size >= 256 ? 0 : size, 1);
    e.writeUInt8(0, 2);
    e.writeUInt8(0, 3);
    e.writeUInt16LE(1, 4);
    e.writeUInt16LE(32, 6);
    e.writeUInt32LE(data.length, 8);
    e.writeUInt32LE(offset, 12);
    offset += data.length;
    return e;
  });

  return Buffer.concat([header, ...entries, ...images.map((i) => i.data)]);
};

const SPLASH_SCREENS = [
  [440, 956, 3],
  [402, 874, 3],
  [430, 932, 3],
  [393, 852, 3],
  [428, 926, 3],
  [390, 844, 3],
  [375, 812, 3],
  [414, 896, 3],
  [414, 896, 2],
  [414, 736, 3],
  [375, 667, 2],
  [320, 568, 2],
  [1024, 1366, 2],
  [834, 1194, 2],
  [834, 1112, 2],
  [820, 1180, 2],
  [810, 1080, 2],
  [768, 1024, 2],
  [744, 1133, 2],
];

const write = async (relPath, data) => {
  const abs = join(ROOT, relPath);
  await mkdir(dirname(abs), { recursive: true });
  await writeFile(abs, data);
  process.stdout.write(`  ${relPath}\n`);
};

process.stdout.write('Generating Kharji brand assets…\n');

// Crisp vector favicon for modern browsers; Next.js serves it alongside the .ico.
await write('src/app/icon.svg', `${markSvg(512).trim()}\n`);

// Legacy multi-size favicon — heavier stroke so the hollow bolt survives 16px.
const faviconSvg = markSvg(512, { boltRatio: 0.54, strokeWidth: STROKE_SMALL });
await write(
  'src/app/favicon.ico',
  buildIco(await Promise.all([16, 32, 48].map(async (size) => ({ size, data: await png(faviconSvg, size) }))))
);

// iOS home screen — full-bleed, iOS applies its own mask.
await write('public/apple-touch-icon.png', await png(markSvg(512, { radiusRatio: 0, boltRatio: 0.56 }), 180));

// PWA icons.
await write('public/icons/icon-192.png', await png(markSvg(512), 192));
await write('public/icons/icon-512.png', await png(markSvg(512), 512));
// Maskable: full bleed, bolt kept well inside the 80% safe zone.
await write('public/icons/icon-maskable-512.png', await png(markSvg(512, { radiusRatio: 0, boltRatio: 0.46 }), 512));

for (const [w, h, ratio] of SPLASH_SCREENS) {
  const [pw, ph] = [w * ratio, h * ratio];
  const buf = await sharp(Buffer.from(splashSvg(pw, ph)))
    .png({ compressionLevel: 9 })
    .toBuffer();
  await write(`public/splash/apple-splash-${pw}-${ph}.png`, buf);
}

process.stdout.write('Done.\n');
