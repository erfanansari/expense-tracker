import { EMAIL_ASSET_ORIGIN } from './brand';

/**
 * Vazirmatn — the same family the app loads through next/font — served from our
 * own origin so email clients don't depend on Google.
 *
 * Emails must inline this as a <style> block: a <link rel="stylesheet"> is
 * stripped by Gmail and most webmail, so the font never arrives. Inline
 * @font-face is honoured by Apple Mail, iOS Mail and Outlook for Mac; Gmail
 * ignores webfonts entirely and falls back to FONT_STACKS.fa (Tahoma).
 *
 * Subsets and unicode-ranges mirror what Google Fonts serves. The file is a
 * variable font, so every weight points at the same woff2 per subset.
 */
const SUBSETS = [
  {
    name: 'arabic',
    file: 'vazirmatn-arabic.woff2',
    // Google's copy, kept as a second src so the font still resolves if our own
    // origin is unreachable (or hasn't shipped the file yet).
    mirror: 'https://fonts.gstatic.com/s/vazirmatn/v16/Dxxo8j6PP2D_kU2muijlGMWWIGroe7ll.woff2',
    range:
      'U+0600-06FF, U+0750-077F, U+0870-088E, U+0890-0891, U+0897-08E1, U+08E3-08FF, U+200C-200E, U+2010-2011, U+204F, U+2E41, U+FB50-FDFF, U+FE70-FE74, U+FE76-FEFC',
  },
  {
    name: 'latin-ext',
    file: 'vazirmatn-latin-ext.woff2',
    mirror: 'https://fonts.gstatic.com/s/vazirmatn/v16/Dxxo8j6PP2D_kU2muijlE8WWIGroe7ll.woff2',
    range:
      'U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF',
  },
  {
    name: 'latin',
    file: 'vazirmatn-latin.woff2',
    mirror: 'https://fonts.gstatic.com/s/vazirmatn/v16/Dxxo8j6PP2D_kU2muijlHcWWIGroew.woff2',
    range:
      'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
  },
] as const;

const WEIGHTS = [400, 600, 700] as const;

export const VAZIRMATN_FONT_CSS = SUBSETS.flatMap((subset) =>
  WEIGHTS.map(
    (weight) => `@font-face {
  font-family: 'Vazirmatn';
  font-style: normal;
  font-weight: ${weight};
  font-display: swap;
  src: url(${EMAIL_ASSET_ORIGIN}/fonts/vazirmatn/${subset.file}) format('woff2'), url(${subset.mirror}) format('woff2');
  unicode-range: ${subset.range};
}`
  )
).join('\n');
