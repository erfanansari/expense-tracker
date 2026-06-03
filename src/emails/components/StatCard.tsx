import * as React from 'react';

import { Section, Text } from '@react-email/components';

interface StatCardProps {
  label: string;
  usd: number;
  toman: number;
  tone?: 'neutral' | 'positive' | 'negative';
  delta?: { pct: number; label: string }; // e.g. { pct: -12.4, label: 'vs Apr 2026' }
  // Whether a positive delta is good or bad. Income up = good, expenses up = bad.
  deltaDirection?: 'up-is-good' | 'up-is-bad';
}

const TONE_COLOR: Record<NonNullable<StatCardProps['tone']>, string> = {
  neutral: '#171717',
  positive: '#10b981',
  negative: '#ea001d',
};

function fmt(n: number): string {
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(n);
}

function fmtUsd(n: number): string {
  const sign = n < 0 ? '-' : '';
  return `${sign}$${fmt(Math.abs(n))}`;
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
  usd,
  toman,
  tone = 'neutral',
  delta,
  deltaDirection = 'up-is-bad',
}: StatCardProps) => {
  const valueColor = TONE_COLOR[tone];
  const deltaDisplay = delta ? fmtDelta(delta.pct, deltaDirection) : null;
  return (
    <Section
      style={{
        border: '1px solid #e5e5e5',
        borderRadius: '12px',
        padding: '20px',
        backgroundColor: '#ffffff',
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
        {fmtUsd(usd)}
      </Text>
      <Text className="m-0 mt-1 text-[13px] text-[#6b7280]">{fmt(toman)} T</Text>
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
