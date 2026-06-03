import React from 'react';

import { render } from '@react-email/render';

import { APP_URL, FROM_ADDRESS, LOGO_DATA_URI, REPLY_TO, resend, unsubscribeUrl } from '@core/email/client';

import { getMonthLabel } from '@/constants/income';
import MonthlyReport from '@/emails/MonthlyReport';
import type { MonthlyReportProps } from '@/emails/MonthlyReport';
import YearlyReport from '@/emails/YearlyReport';
import type { YearlyReportProps } from '@/emails/YearlyReport';

import type { ReportData } from './aggregate';

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

function buildMonthlyProps(input: DispatchInput): MonthlyReportProps {
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
      incomeUsd: data.totals.income.usd,
      incomeToman: data.totals.income.toman,
      expensesUsd: data.totals.expenses.usd,
      expensesToman: data.totals.expenses.toman,
      netUsd: data.totals.net.usd,
      netToman: data.totals.net.toman,
    },
    deltaPct: data.deltaPct,
    topCategories: data.topCategories.map((c) => ({
      id: c.id,
      name: c.name,
      color: c.color,
      valueUsd: c.value.usd,
      valueToman: c.value.toman,
      pct: c.pct,
    })),
    netWorth: { totalUsd: data.netWorth.usd, totalToman: data.netWorth.toman },
    unsubscribeUrl: unsubscribeUrl(unsubscribeToken),
    webViewUrl: `${APP_URL}/overview`,
    logoUrl: LOGO_DATA_URI,
  };
}

function buildYearlyProps(input: DispatchInput): YearlyReportProps {
  const { data, userName, unsubscribeToken } = input;
  const previousLabel = String(Number(data.periodKey) - 1);

  return {
    userName,
    periodLabel: data.periodLabel,
    previousLabel,
    totals: {
      incomeUsd: data.totals.income.usd,
      incomeToman: data.totals.income.toman,
      expensesUsd: data.totals.expenses.usd,
      expensesToman: data.totals.expenses.toman,
      netUsd: data.totals.net.usd,
      netToman: data.totals.net.toman,
    },
    deltaPct: data.deltaPct,
    topCategories: data.topCategories.map((c) => ({
      id: c.id,
      name: c.name,
      color: c.color,
      valueUsd: c.value.usd,
      valueToman: c.value.toman,
      pct: c.pct,
    })),
    netWorth: { totalUsd: data.netWorth.usd, totalToman: data.netWorth.toman },
    months: (data.months ?? []).map((m) => ({
      month: m.month,
      incomeUsd: m.income.usd,
      expensesUsd: m.expenses.usd,
    })),
    bestMonth: data.bestMonth && {
      monthLabel: `${getMonthLabel(data.bestMonth.month).en} ${data.bestMonth.year}`,
      netUsd: data.bestMonth.net.usd,
      netToman: data.bestMonth.net.toman,
    },
    worstMonth: data.worstMonth && {
      monthLabel: `${getMonthLabel(data.worstMonth.month).en} ${data.worstMonth.year}`,
      netUsd: data.worstMonth.net.usd,
      netToman: data.worstMonth.net.toman,
    },
    totalSaved: data.totalSaved ?? { usd: 0, toman: 0 },
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

  const element =
    data.type === 'monthly'
      ? React.createElement(MonthlyReport, buildMonthlyProps(input))
      : React.createElement(YearlyReport, buildYearlyProps(input));

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
