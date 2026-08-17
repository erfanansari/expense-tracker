import * as React from 'react';

import { Text } from '@react-email/components';

import { formatMoney } from '@features/ExchangeRate/utils/currency';

import { EMAIL_CATEGORY_COLOR_FALLBACK, EMAIL_CATEGORY_COLORS, EMAIL_COLORS } from '../colors';
import { emailDir, type EmailLocale } from '../i18n';
import type { EmailCurrencyContext, EmailMoney } from '../types';
import { isCompact } from '../types';

interface CategoryRowProps {
  rank: number;
  name: string;
  color: string; // 'blue' | 'amber' | etc. (tailwind palette name)
  value: EmailMoney;
  currency: EmailCurrencyContext;
  pct: number; // 0..100
  locale?: EmailLocale;
}

export const CategoryRow = ({ rank, name, color, value, currency, pct, locale = 'fa' }: CategoryRowProps) => {
  const dir = emailDir(locale);
  const isRtl = dir === 'rtl';
  const swatch = EMAIL_CATEGORY_COLORS[color] ?? EMAIL_CATEGORY_COLOR_FALLBACK;
  const widthPct = Math.max(2, Math.round(pct));
  // Rows are dense lists: 'auto' keeps them full-precision (compact is cards-only).
  const compact = isCompact(currency.numberFormat, false);
  const farAlign: React.CSSProperties['textAlign'] = isRtl ? 'left' : 'right';
  const farPad = isRtl ? { paddingRight: '12px' } : { paddingLeft: '12px' };
  const nearPad = isRtl ? { paddingLeft: '12px' } : { paddingRight: '12px' };

  return (
    <table role="presentation" cellPadding={0} cellSpacing={0} width="100%" dir={dir} style={{ marginBottom: '14px' }}>
      <tr>
        <td style={{ ...nearPad, verticalAlign: 'middle', width: '20px' }}>
          <span style={{ color: EMAIL_COLORS.textMuted, fontSize: '13px', fontWeight: 500 }}>{rank}</span>
        </td>
        <td style={{ verticalAlign: 'middle' }}>
          <table role="presentation" cellPadding={0} cellSpacing={0} width="100%" dir={dir}>
            <tr>
              <td>
                <Text className="m-0 text-[14px] font-medium" style={{ color: EMAIL_COLORS.textPrimary }}>
                  {name}
                </Text>
              </td>
              <td style={{ textAlign: farAlign, whiteSpace: 'nowrap', ...farPad }}>
                <Text className="m-0 text-[14px] font-semibold" style={{ color: EMAIL_COLORS.textPrimary }}>
                  {formatMoney(value.primary, currency.primaryCurrency, { compact, locale })}
                </Text>
              </td>
            </tr>
            <tr>
              <td colSpan={2} style={{ paddingTop: '6px' }}>
                {/* Bar */}
                <div
                  style={{
                    width: '100%',
                    height: '6px',
                    backgroundColor: EMAIL_COLORS.surfaceMuted,
                    borderRadius: '3px',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      width: `${widthPct}%`,
                      height: '100%',
                      backgroundColor: swatch,
                      ...(isRtl ? { marginLeft: 'auto' } : {}),
                    }}
                  />
                </div>
              </td>
            </tr>
            <tr>
              <td style={{ paddingTop: '4px' }}>
                {value.secondary !== null && currency.secondaryCurrency && (
                  <Text className="m-0 text-[12px]" style={{ color: EMAIL_COLORS.textMuted }}>
                    {formatMoney(value.secondary, currency.secondaryCurrency, { compact, locale })}
                  </Text>
                )}
              </td>
              <td style={{ textAlign: farAlign, paddingTop: '4px' }}>
                <Text className="m-0 text-[12px]" style={{ color: EMAIL_COLORS.textMuted }}>
                  {pct.toFixed(1)}%
                </Text>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  );
};

export default CategoryRow;
