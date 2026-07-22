import { NextResponse } from 'next/server';

import { withAuth } from '@core/api/utils';
import { db } from '@core/database/client';
import { getCurrencyPreferences } from '@core/database/currency-preferences';

import { PIVOT_CURRENCY, SUPPORTED_CURRENCY_CODES } from '@/constants/currencies';

// Totals are converted PER RECORD at each record's own date (historically
// accurate and stable over time), into the user's primary & secondary currency.
interface SummaryPair {
  primary: number;
  secondary: number | null;
}

interface SummaryResponse {
  primaryCurrency: string;
  secondaryCurrency: string | null;
  total_income: SummaryPair;
  total_expenses: SummaryPair;
  net_worth: SummaryPair;
}

const num = (v: unknown): number => (typeof v === 'number' ? v : 0);

/**
 * SQL expression summing each row's value converted to `currency` at the row's
 * own date. A row already denominated in `currency` contributes its amount
 * as-is — conversion into a record's own currency must be a no-op, never a
 * pivot round-trip, or rate-table gaps/drift corrupt the total (this mirrors
 * convertItem in use-currency.ts). Other rows convert their pivot value
 * (amount*entryRate) by the currency's rate on that date (carry-forward, with
 * a fallback to the earliest known rate). `currency` is validated against the
 * supported set before inlining.
 */
function sumInCurrency(currency: string, dateExpr: string): string {
  const pivot = 'amount * entryRate';
  if (currency === PIVOT_CURRENCY) return `COALESCE(SUM(${pivot}), 0)`;
  if (!SUPPORTED_CURRENCY_CODES.includes(currency)) return '0';
  return `COALESCE(SUM(CASE WHEN currency = '${currency}' THEN amount ELSE (${pivot}) / NULLIF(COALESCE(
    (SELECT cr.rate FROM currencyRates cr WHERE cr.currency='${currency}' AND cr.rateDate <= ${dateExpr} ORDER BY cr.rateDate DESC LIMIT 1),
    (SELECT cr.rate FROM currencyRates cr WHERE cr.currency='${currency}' ORDER BY cr.rateDate ASC LIMIT 1)
  ), 0) END), 0)`;
}

export const GET = withAuth(async (user) => {
  const prefs = await getCurrencyPreferences(user.userId);
  const primary = prefs.primaryCurrency;
  const secondary = prefs.secondaryCurrency && prefs.secondaryCurrency !== primary ? prefs.secondaryCurrency : null;

  // Run one query per table selecting both primary and secondary totals.
  const pair = async (table: string, userCol: string, dateExpr: string): Promise<SummaryPair> => {
    const secSelect = secondary ? `, ${sumInCurrency(secondary, dateExpr)} AS s` : '';
    const res = await db.execute({
      sql: `SELECT ${sumInCurrency(primary, dateExpr)} AS p ${secSelect} FROM ${table} WHERE ${userCol} = ?`,
      args: [user.userId],
    });
    return { primary: num(res.rows[0]?.p), secondary: secondary ? num(res.rows[0]?.s) : null };
  };

  const [total_income, total_expenses, net_worth] = await Promise.all([
    pair('incomes', 'userId', `printf('%04d-%02d-01', year, month)`),
    pair('expenses', 'user_id', `substr(date, 1, 10)`),
    pair('assets', 'userId', `substr(lastValuedAt, 1, 10)`),
  ]);

  const response: SummaryResponse = {
    primaryCurrency: primary,
    secondaryCurrency: secondary,
    total_income,
    total_expenses,
    net_worth,
  };
  return NextResponse.json(response);
}, 'Summary');
