import * as React from 'react';

import { Text } from '@react-email/components';

import { formatMoney } from '@features/ExchangeRate/utils/currency';

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

// Map our category color names to email-safe hex (subset of tailwind palette).
const COLOR_HEX: Record<string, string> = {
  blue: '#3b82f6',
  amber: '#f59e0b',
  green: '#10b981',
  orange: '#f97316',
  sky: '#0ea5e9',
  rose: '#f43f5e',
  violet: '#8b5cf6',
  pink: '#ec4899',
  cyan: '#06b6d4',
  emerald: '#10b981',
  slate: '#64748b',
  gray: '#6b7280',
  red: '#ef4444',
  yellow: '#eab308',
  lime: '#84cc16',
  teal: '#14b8a6',
  indigo: '#6366f1',
  purple: '#a855f7',
  fuchsia: '#d946ef',
};

export const CategoryRow = ({ rank, name, color, value, currency, pct, locale = 'en' }: CategoryRowProps) => {
  const dir = emailDir(locale);
  const isRtl = dir === 'rtl';
  const swatch = COLOR_HEX[color] ?? '#6b7280';
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
          <span style={{ color: '#a3a3a3', fontSize: '13px', fontWeight: 500 }}>{rank}</span>
        </td>
        <td style={{ verticalAlign: 'middle' }}>
          <table role="presentation" cellPadding={0} cellSpacing={0} width="100%" dir={dir}>
            <tr>
              <td>
                <Text className="m-0 text-[14px] font-medium text-[#171717]">{name}</Text>
              </td>
              <td style={{ textAlign: farAlign, whiteSpace: 'nowrap', ...farPad }}>
                <Text className="m-0 text-[14px] font-semibold text-[#171717]">
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
                    backgroundColor: '#f0f0f0',
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
                  <Text className="m-0 text-[12px] text-[#a3a3a3]">
                    {formatMoney(value.secondary, currency.secondaryCurrency, { compact, locale })}
                  </Text>
                )}
              </td>
              <td style={{ textAlign: farAlign, paddingTop: '4px' }}>
                <Text className="m-0 text-[12px] text-[#a3a3a3]">{pct.toFixed(1)}%</Text>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  );
};

export default CategoryRow;
