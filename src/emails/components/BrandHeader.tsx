import * as React from 'react';

import { Img } from '@react-email/components';

import { BRAND_NAME, EMAIL_LOGO_URL } from '../brand';
import { emailDir, type EmailLocale, FONT_STACKS } from '../i18n';

interface BrandHeaderProps {
  locale?: EmailLocale;
  logoUrl?: string;
}

/**
 * The logo + wordmark lockup shared by every template.
 *
 * Rendered as a table because Outlook ignores flex/inline-block alignment, and
 * the img carries a black background plus white text colour so that a blocked
 * or slow image degrades into a black tile with the brand name — not the grey
 * broken-image glyph.
 */
export const BrandHeader = ({ locale = 'en', logoUrl = EMAIL_LOGO_URL }: BrandHeaderProps) => {
  const dir = emailDir(locale);
  const isRtl = dir === 'rtl';
  const font = FONT_STACKS[locale];
  const brand = BRAND_NAME[locale];

  return (
    <table role="presentation" cellPadding={0} cellSpacing={0} dir={dir}>
      <tbody>
        <tr>
          <td style={{ verticalAlign: 'middle' }}>
            <Img
              src={logoUrl}
              width="32"
              height="32"
              alt={brand}
              style={{
                display: 'block',
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: '#171717',
                color: '#ffffff',
                fontSize: '12px',
                fontFamily: font,
              }}
            />
          </td>
          <td style={{ [isRtl ? 'paddingRight' : 'paddingLeft']: '10px', verticalAlign: 'middle' }}>
            <span
              style={{
                color: '#171717',
                fontSize: '18px',
                fontWeight: 700,
                letterSpacing: '-0.01em',
                fontFamily: font,
              }}
            >
              {brand}
            </span>
          </td>
        </tr>
      </tbody>
    </table>
  );
};

export default BrandHeader;
