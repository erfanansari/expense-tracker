import * as React from 'react';

import { Section, Text } from '@react-email/components';

import { formatMoney } from '@features/ExchangeRate/utils/currency';

import { emailDir, type EmailLocale } from '../i18n';
import type { EmailCurrencyContext, EmailMoney } from '../types';
import { isCompact } from '../types';

interface StatCardProps {
  label: string;
  value: EmailMoney;
  currency: EmailCurrencyContext;
  tone?: 'neutral' | 'positive' | 'negative';
  delta?: { pct: number; label: string }; // e.g. { pct: -12.4, label: 'vs Apr 2026' }
  // Whether a positive delta is good or bad. Income up = good, expenses up = bad.
  deltaDirection?: 'up-is-good' | 'up-is-bad';
  locale?: EmailLocale;
}

const TONE_COLOR: Record<NonNullable<StatCardProps['tone']>, string> = {
  neutral: '#171717',
  positive: '#10b981',
  negative: '#ea001d',
};

/** Format with an explicit leading minus so the sign never lands mid-string (e.g. -1,234 IRT). */
export function formatSigned(n: number, currencyCode: string, compact: boolean, locale: EmailLocale = 'en'): string {
  const sign = n < 0 ? '-' : '';
  return `${sign}${formatMoney(Math.abs(n), currencyCode, { compact, locale })}`;
}

function fmtDelta(pct: number, direction: 'up-is-good' | 'up-is-bad'): { value: string; color: string } {
  if (pct === 0) return { value: '0%', color: '#a3a3a3' };
  const arrow = pct > 0 ? '↑' : '↓';
  const isGood = direction === 'up-is-good' ? pct > 0 : pct < 0;
  const color = isGood ? '#10b981' : '#ea001d';
  return { value: `${arrow} ${Math.abs(pct).toFixed(1)}%`, color };
}

export const StatCard = ({
  label,
  value,
  currency,
  tone = 'neutral',
  delta,
  deltaDirection = 'up-is-bad',
  locale = 'en',
}: StatCardProps) => {
  const dir = emailDir(locale);
  const valueColor = TONE_COLOR[tone];
  const deltaDisplay = delta ? fmtDelta(delta.pct, deltaDirection) : null;
  const compact = isCompact(currency.numberFormat, true);
  return (
    <Section
      dir={dir}
      style={{
        border: '1px solid #e5e5e5',
        borderRadius: '12px',
        padding: '20px',
        backgroundColor: '#ffffff',
        textAlign: dir === 'rtl' ? 'right' : 'left',
      }}
    >
      <Text className="m-0 text-[12px] font-medium tracking-wide text-[#a3a3a3] uppercase">{label}</Text>
      <Text
        style={{
          margin: '8px 0 0 0',
          fontSize: '28px',
          fontWeight: 700,
          lineHeight: '32px',
          letterSpacing: '-0.02em',
          color: valueColor,
        }}
      >
        {formatSigned(value.primary, currency.primaryCurrency, compact, locale)}
      </Text>
      {value.secondary !== null && currency.secondaryCurrency && (
        <Text className="m-0 mt-1 text-[13px] text-[#6b7280]">
          {formatSigned(value.secondary, currency.secondaryCurrency, compact, locale)}
        </Text>
      )}
      {delta && deltaDisplay && (
        <Text className="m-0 mt-3 text-[12px]" style={{ color: deltaDisplay.color }}>
          <span style={{ fontWeight: 600 }}>{deltaDisplay.value}</span>
          <span style={{ color: '#a3a3a3', fontWeight: 400 }}> {delta.label}</span>
        </Text>
      )}
    </Section>
  );
};

export default StatCard;
