import React from 'react';

import { render } from '@react-email/render';

import { APP_URL, FROM_ADDRESS, LOGO_DATA_URI, REPLY_TO, resend, unsubscribeUrl } from '@core/email/client';
import { getLatestRates } from '@core/rates';

import { getMonthLabel } from '@/constants/income';
import MonthlyReport from '@/emails/MonthlyReport';
import type { MonthlyReportProps } from '@/emails/MonthlyReport';
import YearlyReport from '@/emails/YearlyReport';
import type { YearlyReportProps } from '@/emails/YearlyReport';

import type { ReportData } from './aggregate';

/**
 * Report aggregates are in the pivot currency (Toman). Emails still show a
 * Toman + USD pair, so we convert pivot→USD with the latest USD rate at send
 * time. `usd(v)` returns 0 when no USD rate is available.
 */
function makeUsdConverter(usdRate: number) {
  return (pivotValue: number): number => (usdRate > 0 ? Math.round((pivotValue / usdRate) * 100) / 100 : 0);
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

function buildMonthlyProps(input: DispatchInput, usd: (v: number) => number): MonthlyReportProps {
  const { data, userName, unsubscribeToken } = input;
  const [yearStr, monthStr] = data.periodKey.split('-');
  const month = Number(monthStr);
  const prevMonth = month === 1 ? 12 : month - 1;
  const prevYear = month === 1 ? Number(yearStr) - 1 : Number(yearStr);
  const previousLabel = `${getMonthLabel(prevMonth).en.slice(0, 3)} ${prevYear}`;

  return {
    userName,
    periodLabel: data.periodLabel,
    previousLabel,
    totals: {
      incomeUsd: usd(data.totals.income.value),
      incomeToman: data.totals.income.value,
      expensesUsd: usd(data.totals.expenses.value),
      expensesToman: data.totals.expenses.value,
      netUsd: usd(data.totals.net.value),
      netToman: data.totals.net.value,
    },
    deltaPct: data.deltaPct,
    topCategories: data.topCategories.map((c) => ({
      id: c.id,
      name: c.name,
      color: c.color,
      valueUsd: usd(c.value.value),
      valueToman: c.value.value,
      pct: c.pct,
    })),
    netWorth: { totalUsd: usd(data.netWorth.value), totalToman: data.netWorth.value },
    unsubscribeUrl: unsubscribeUrl(unsubscribeToken),
    webViewUrl: `${APP_URL}/overview`,
    logoUrl: LOGO_DATA_URI,
  };
}

function buildYearlyProps(input: DispatchInput, usd: (v: number) => number): YearlyReportProps {
  const { data, userName, unsubscribeToken } = input;
  const previousLabel = String(Number(data.periodKey) - 1);

  return {
    userName,
    periodLabel: data.periodLabel,
    previousLabel,
    totals: {
      incomeUsd: usd(data.totals.income.value),
      incomeToman: data.totals.income.value,
      expensesUsd: usd(data.totals.expenses.value),
      expensesToman: data.totals.expenses.value,
      netUsd: usd(data.totals.net.value),
      netToman: data.totals.net.value,
    },
    deltaPct: data.deltaPct,
    topCategories: data.topCategories.map((c) => ({
      id: c.id,
      name: c.name,
      color: c.color,
      valueUsd: usd(c.value.value),
      valueToman: c.value.value,
      pct: c.pct,
    })),
    netWorth: { totalUsd: usd(data.netWorth.value), totalToman: data.netWorth.value },
    months: (data.months ?? []).map((m) => ({
      month: m.month,
      incomeUsd: usd(m.income.value),
      expensesUsd: usd(m.expenses.value),
    })),
    bestMonth: data.bestMonth && {
      monthLabel: `${getMonthLabel(data.bestMonth.month).en} ${data.bestMonth.year}`,
      netUsd: usd(data.bestMonth.net.value),
      netToman: data.bestMonth.net.value,
    },
    worstMonth: data.worstMonth && {
      monthLabel: `${getMonthLabel(data.worstMonth.month).en} ${data.worstMonth.year}`,
      netUsd: usd(data.worstMonth.net.value),
      netToman: data.worstMonth.net.value,
    },
    totalSaved: data.totalSaved
      ? { usd: usd(data.totalSaved.value), toman: data.totalSaved.value }
      : { usd: 0, toman: 0 },
    savingsRatePct: data.savingsRatePct ?? 0,
    unsubscribeUrl: unsubscribeUrl(unsubscribeToken),
    webViewUrl: `${APP_URL}/overview`,
    logoUrl: LOGO_DATA_URI,
  };
}

/**
 * Render the report template to HTML and send via Resend. Throws on Resend
 * error so the caller (cron route or test-send route) can record the failure.
 */
export async function dispatchReport(input: DispatchInput): Promise<DispatchResult> {
  const { data, userEmail, unsubscribeToken } = input;

  const latest = await getLatestRates();
  const usd = makeUsdConverter(latest['USD'] ?? 0);

  const element =
    data.type === 'monthly'
      ? React.createElement(MonthlyReport, buildMonthlyProps(input, usd))
      : React.createElement(YearlyReport, buildYearlyProps(input, usd));

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
