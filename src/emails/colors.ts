/**
 * The email palette.
 *
 * Mail clients support neither CSS custom properties nor `prefers-color-scheme`
 * reliably, so email has to carry literal hex values and always renders in the
 * light theme. These mirror the `:root` block of src/styles/globals.css — when
 * that palette moves, move these with it. Keeping every template on this one
 * map is what stops the two from silently drifting apart.
 */
export const EMAIL_COLORS = {
  /** Page background behind the card. */
  paper: '#f3f6fa',
  /** Card / content surface. */
  surface: '#ffffff',
  surfaceMuted: '#e9eff7',
  border: '#e2e8f1',

  textPrimary: '#0f1b2d',
  textSecondary: '#46586e',
  textMuted: '#6f8199',

  /** Cobalt trust-blue — buttons, links, accents. */
  brand: '#1a56db',
  brandHover: '#1546b8',
  onBrand: '#ffffff',

  success: '#0e7a3e',
  danger: '#c81e1e',
  warning: '#8a5a06',
  info: '#7028cc',
} as const;

/**
 * Category accents, mirroring the `--color-cat-*` light values. The keys are
 * persisted per user in the database, so they must match the app's 16 exactly.
 */
export const EMAIL_CATEGORY_COLORS: Record<string, string> = {
  blue: '#1a56db',
  green: '#0e7a3e',
  amber: '#8a5a06',
  violet: '#7028cc',
  red: '#c81e1e',
  sky: '#0a6880',
  orange: '#a8490a',
  rose: '#b0143f',
  pink: '#a81b5f',
  cyan: '#0e6f77',
  emerald: '#0a6b4a',
  teal: '#0a7065',
  indigo: '#4338ca',
  lime: '#4d6c10',
  slate: '#455468',
  gray: '#535c66',
};

export const EMAIL_CATEGORY_COLOR_FALLBACK = EMAIL_CATEGORY_COLORS.gray;
