interface ZapBoltProps {
  className?: string;
}

/**
 * The Kharji brand glyph: an outlined lightning bolt (برق) — stroked rather
 * than filled, so the tile colour shows through the middle. That hollow
 * interior is the mark's signature; don't fill it.
 *
 * Geometry is lucide's Zap path at its native stroke weight, which is tuned
 * for exactly this 16–24px range. `scripts/generate-brand-assets.mjs` mirrors
 * the path to raster the favicon, PWA icons and iOS splash screens, and
 * thickens the stroke slightly for the 16px favicon where a hairline would
 * smear — see the note there.
 */
const ZapBolt = ({ className }: ZapBoltProps) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinejoin="round"
    strokeLinecap="round"
    className={className}
    aria-hidden="true"
    focusable="false"
  >
    <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z" />
  </svg>
);

export default ZapBolt;
