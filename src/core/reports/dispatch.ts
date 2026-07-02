import React from 'react';

import { render } from '@react-email/render';

import { getCurrencyPreferences } from '@core/database/currency-preferences';
import type { CurrencyPreferences } from '@core/database/currency-preferences';
import { APP_URL, FROM_ADDRESS, LOGO_URL, REPLY_TO, resend, unsubscribeUrl } from '@core/email/client';
import { getLatestRates } from '@core/rates';

import { convert, seriesFromLatest } from '@features/ExchangeRate/utils/currency';
import type { RatesSeries } from '@features/ExchangeRate/utils/currency';

import { PIVOT_CURRENCY } from '@/constants/currencies';
import { getMonthLabel } from '@/constants/income';
import MonthlyReport from '@/emails/MonthlyReport';
import type { MonthlyReportProps } from '@/emails/MonthlyReport';
import type { EmailCurrencyContext, EmailMoney } from '@/emails/types';
import YearlyReport from '@/emails/YearlyReport';
import type { YearlyReportProps } from '@/emails/YearlyReport';

import type { ReportData } from './aggregate';

interface EmailCurrencySetup {
  ctx: EmailCurrencyContext;
  /** Convert a pivot (Toman) aggregate into the user's display currencies. */
  money: (pivotValue: number) => EmailMoney;
  /** Pivot → primary currency number (for chart-scaling values). */
  toPrimary: (pivotValue: number) => number;
}

/**
 * Report aggregates are in the pivot currency (Toman). Emails show them in the
 * user's primary currency with their secondary as a muted caption, converted
 * with the latest rates at send time. If the primary rate is somehow missing,
 * fall back to displaying pivot amounts (never silently wrong numbers).
 */
function makeEmailCurrencySetup(prefs: CurrencyPreferences, series: RatesSeries): EmailCurrencySetup {
  const primaryAvailable = convert(1, PIVOT_CURRENCY, prefs.primaryCurrency, series) !== null;
  const primaryCurrency = primaryAvailable ? prefs.primaryCurrency : PIVOT_CURRENCY;
  const secondaryCurrency =
    prefs.secondaryCurrency && prefs.secondaryCurrency !== primaryCurrency ? prefs.secondaryCurrency : null;

  const toPrimary = (v: number): number => convert(v, PIVOT_CURRENCY, primaryCurrency, series) ?? v;
  const money = (v: number): EmailMoney => ({
    primary: toPrimary(v),
    secondary: secondaryCurrency ? convert(v, PIVOT_CURRENCY, secondaryCurrency, series) : null,
  });

  return {
    ctx: { primaryCurrency, secondaryCurrency, numberFormat: prefs.numberFormat },
    money,
    toPrimary,
  };
}

interface DispatchInput {
  userId: number;
  userEmail: string;
  userName: string | null;
  unsubscribeToken: string;
  data: ReportData;
  // Override the Resend idempotency key. Cron uses the default (one send per
  // user/type/period); test sends pass a unique token so repeated clicks don't
  // collide with prior test sends or the real production send for that period.
  idempotencyKey?: string;
}

interface DispatchResult {
  resendId: string;
}

function buildMonthlyProps(input: DispatchInput, currency: EmailCurrencySetup): MonthlyReportProps {
  const { data, userName, unsubscribeToken } = input;
  const { ctx, money } = currency;
  const [yearStr, monthStr] = data.periodKey.split('-');
  const month = Number(monthStr);
  const prevMonth = month === 1 ? 12 : month - 1;
  const prevYear = month === 1 ? Number(yearStr) - 1 : Number(yearStr);
  const previousLabel = `${getMonthLabel(prevMonth).en.slice(0, 3)} ${prevYear}`;

  return {
    ...ctx,
    userName,
    periodLabel: data.periodLabel,
    previousLabel,
    totals: {
      income: money(data.totals.income.value),
      expenses: money(data.totals.expenses.value),
      net: money(data.totals.net.value),
    },
    deltaPct: data.deltaPct,
    topCategories: data.topCategories.map((c) => ({
      id: c.id,
      name: c.name,
      color: c.color,
      value: money(c.value.value),
      pct: c.pct,
    })),
    unsubscribeUrl: unsubscribeUrl(unsubscribeToken),
    webViewUrl: `${APP_URL}/overview`,
    logoUrl: LOGO_URL,
  };
}

function buildYearlyProps(input: DispatchInput, currency: EmailCurrencySetup): YearlyReportProps {
  const { data, userName, unsubscribeToken } = input;
  const { ctx, money, toPrimary } = currency;
  const previousLabel = String(Number(data.periodKey) - 1);

  return {
    ...ctx,
    userName,
    periodLabel: data.periodLabel,
    previousLabel,
    totals: {
      income: money(data.totals.income.value),
      expenses: money(data.totals.expenses.value),
      net: money(data.totals.net.value),
    },
    deltaPct: data.deltaPct,
    topCategories: data.topCategories.map((c) => ({
      id: c.id,
      name: c.name,
      color: c.color,
      value: money(c.value.value),
      pct: c.pct,
    })),
    months: (data.months ?? []).map((m) => ({
      month: m.month,
      income: toPrimary(m.income.value),
      expenses: toPrimary(m.expenses.value),
    })),
    bestMonth: data.bestMonth && {
      monthLabel: `${getMonthLabel(data.bestMonth.month).en} ${data.bestMonth.year}`,
      net: money(data.bestMonth.net.value),
    },
    worstMonth: data.worstMonth && {
      monthLabel: `${getMonthLabel(data.worstMonth.month).en} ${data.worstMonth.year}`,
      net: money(data.worstMonth.net.value),
    },
    totalSaved: data.totalSaved ? money(data.totalSaved.value) : { primary: 0, secondary: null },
    savingsRatePct: data.savingsRatePct ?? 0,
    unsubscribeUrl: unsubscribeUrl(unsubscribeToken),
    webViewUrl: `${APP_URL}/overview`,
    logoUrl: LOGO_URL,
  };
}

/**
 * Render the report template to HTML and send via Resend. Throws on Resend
 * error so the caller (cron route or test-send route) can record the failure.
 */
export async function dispatchReport(input: DispatchInput): Promise<DispatchResult> {
  const { data, userEmail, unsubscribeToken } = input;

  const [prefs, latest] = await Promise.all([getCurrencyPreferences(input.userId), getLatestRates()]);
  const currency = makeEmailCurrencySetup(prefs, seriesFromLatest(latest));

  const element =
    data.type === 'monthly'
      ? React.createElement(MonthlyReport, buildMonthlyProps(input, currency))
      : React.createElement(YearlyReport, buildYearlyProps(input, currency));

  const html = await render(element);

  const subject =
    data.type === 'monthly' ? `Your ${data.periodLabel} report from Kharji` : `Your ${data.periodLabel} year in review`;

  const idempotencyKey = input.idempotencyKey ?? `${input.userId}-${data.type}-${data.periodKey}`;
  const unsubLink = unsubscribeUrl(unsubscribeToken);

  const result = await resend.emails.send(
    {
      from: FROM_ADDRESS,
      to: userEmail,
      replyTo: REPLY_TO,
      subject,
      html,
      headers: {
        'List-Unsubscribe': `<${unsubLink}>`,
        'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
      },
    },
    { idempotencyKey }
  );

  if (result.error) {
    throw new Error(result.error.message || 'Resend send failed');
  }
  if (!result.data?.id) {
    throw new Error('Resend returned no message id');
  }

  return { resendId: result.data.id };
}
