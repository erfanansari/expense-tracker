'use client';

import type { FC } from 'react';

import { useCurrency } from '@features/ExchangeRate/CurrencyProvider';

interface MoneyProps {
  /** Amount in `currency` (the currency the record was entered in). */
  amount: number;
  /** The record's entry currency code. */
  currency: string;
  /** The record's date (YYYY-MM-DD) — used to pick the historical rate. */
  date?: string;
  /** Wrapper className (controls alignment/spacing in context). */
  className?: string;
  /** Override the dominant primary text styles. */
  primaryClassName?: string;
  /** Override the muted secondary caption styles. */
  secondaryClassName?: string;
  /** Stack secondary beneath (default) or render inline after the primary. */
  inline?: boolean;
}

/**
 * The single primitive for rendering money everywhere in the app. Shows the
 * value in the user's primary currency (dominant) with the secondary currency as
 * a muted caption beneath — identical pattern app-wide. Secondary is hidden when
 * disabled, equal to primary, or its rate is unavailable.
 */
const Money: FC<MoneyProps> = ({
  amount,
  currency,
  date,
  className = '',
  primaryClassName = 'text-text-primary font-semibold',
  secondaryClassName = 'text-text-muted text-xs',
  inline = false,
}) => {
  const { display, convert, formatFull, primaryCurrency, secondaryCurrency } = useCurrency();
  const { primary, secondary } = display(amount, currency, date);

  // Always expose the exact full value on hover, even when shown compact.
  const pNum = convert(amount, currency, primaryCurrency, date);
  const parts = pNum === null ? [] : [formatFull(pNum, primaryCurrency)];
  if (secondary && secondaryCurrency && secondaryCurrency !== primaryCurrency) {
    const sNum = convert(amount, currency, secondaryCurrency, date);
    if (sNum !== null) parts.push(formatFull(sNum, secondaryCurrency));
  }
  const title = parts.join(' · ') || undefined;

  if (inline) {
    return (
      <span className={className} title={title}>
        <span className={primaryClassName}>{primary}</span>
        {secondary && <span className={`ml-1.5 ${secondaryClassName}`}>{secondary}</span>}
      </span>
    );
  }

  return (
    <span className={`flex flex-col ${className}`} title={title}>
      <span className={primaryClassName}>{primary}</span>
      {secondary && <span className={secondaryClassName}>{secondary}</span>}
    </span>
  );
};

export default Money;
