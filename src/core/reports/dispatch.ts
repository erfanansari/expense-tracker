import React from 'react';

import { render } from '@react-email/render';

import { getCurrencyPreferences } from '@core/database/currency-preferences';
import type { CurrencyPreferences } from '@core/database/currency-preferences';
import { getLocalePreferences } from '@core/database/locale-preferences';
import { APP_URL, FROM_ADDRESS, LOGO_URL, REPLY_TO, resend, unsubscribeUrl } from '@core/email/client';
import { getLatestRates } from '@core/rates';

import { convert, seriesFromLatest } from '@features/ExchangeRate/utils/currency';
import type { RatesSeries } from '@features/ExchangeRate/utils/currency';

import { PIVOT_CURRENCY } from '@/constants/currencies';
import { type EmailLocale, REPORT_STRINGS } from '@/emails/i18n';
import MonthlyReport from '@/emails/MonthlyReport';
import type { MonthlyReportProps } from '@/emails/MonthlyReport';
import type { EmailCurrencyContext, EmailMoney } from '@/emails/types';
import YearlyReport from '@/emails/YearlyReport';
import type { YearlyReportProps } from '@/emails/YearlyReport';
import { formatJalaliDigits, getJalaliMonthName, getJalaliYear, resolveCalendar } from '@/utils/date';
import type { ResolvedCalendar } from '@/utils/date';

import type { ReportData } from './aggregate';

const MONTH_LABELS_EN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTH_LABELS_EN_LONG = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

function localizeYear(year: number, locale: EmailLocale, calendar: ResolvedCalendar): string {
  // June 15 anchors the Gregorian calendar year to the single Jalali year it
  // mostly overlaps with — same day=15 convention used elsewhere in the app.
  const displayYear = calendar === 'jalali' ? getJalaliYear(6, year) : year;
  return locale === 'fa' ? formatJalaliDigits(displayYear) : String(displayYear);
}

/** Long "Month Year" label for a Gregorian (month, year) pair, resolved per locale/calendar. */
function monthYearLabel(month: number, year: number, locale: EmailLocale, calendar: ResolvedCalendar): string {
  if (calendar === 'jalali') {
    const jYear = getJalaliYear(month, year);
    const jMonthName = getJalaliMonthName(month, year);
    return `${jMonthName} ${locale === 'fa' ? formatJalaliDigits(jYear) : jYear}`;
  }
  return `${MONTH_LABELS_EN_LONG[month - 1]} ${year}`;
}

/** Short month label for the yearly report's 12-bar chart. Jalali month names are
 * inherently Persian regardless of UI locale, matching the DatePicker convention. */
function shortMonthLabel(month: number, year: number, calendar: ResolvedCalendar): string {
  if (calendar === 'jalali') return getJalaliMonthName(month, year);
  return MONTH_LABELS_EN[month - 1];
}

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

function buildMonthlyProps(
  input: DispatchInput,
  currency: EmailCurrencySetup,
  locale: EmailLocale,
  calendar: ResolvedCalendar
): MonthlyReportProps {
  const { data, userName, unsubscribeToken } = input;
  const { ctx, money } = currency;
  const [yearStr, monthStr] = data.periodKey.split('-');
  const year = Number(yearStr);
  const month = Number(monthStr);
  const prevMonth = month === 1 ? 12 : month - 1;
  const prevYear = month === 1 ? year - 1 : year;

  return {
    ...ctx,
    userName,
    periodLabel: monthYearLabel(month, year, locale, calendar),
    previousLabel: monthYearLabel(prevMonth, prevYear, locale, calendar),
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
    locale,
  };
}

function buildYearlyProps(
  input: DispatchInput,
  currency: EmailCurrencySetup,
  locale: EmailLocale,
  calendar: ResolvedCalendar
): YearlyReportProps {
  const { data, userName, unsubscribeToken } = input;
  const { ctx, money, toPrimary } = currency;
  const year = Number(data.periodKey);

  return {
    ...ctx,
    userName,
    periodLabel: localizeYear(year, locale, calendar),
    previousLabel: localizeYear(year - 1, locale, calendar),
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
      monthLabel: shortMonthLabel(m.month, year, calendar),
      income: toPrimary(m.income.value),
      expenses: toPrimary(m.expenses.value),
    })),
    bestMonth: data.bestMonth && {
      monthLabel: monthYearLabel(data.bestMonth.month, data.bestMonth.year, locale, calendar),
      net: money(data.bestMonth.net.value),
    },
    worstMonth: data.worstMonth && {
      monthLabel: monthYearLabel(data.worstMonth.month, data.worstMonth.year, locale, calendar),
      net: money(data.worstMonth.net.value),
    },
    totalSaved: data.totalSaved ? money(data.totalSaved.value) : { primary: 0, secondary: null },
    savingsRatePct: data.savingsRatePct ?? 0,
    unsubscribeUrl: unsubscribeUrl(unsubscribeToken),
    webViewUrl: `${APP_URL}/overview`,
    logoUrl: LOGO_URL,
    locale,
  };
}

/**
 * Render the report template to HTML and send via Resend. Throws on Resend
 * error so the caller (cron route or test-send route) can record the failure.
 * Locale/calendar are read from the recipient's saved preferences — cron runs
 * with no request context, so there's no cookie to fall back to here.
 */
export async function dispatchReport(input: DispatchInput): Promise<DispatchResult> {
  const { data, userEmail, unsubscribeToken } = input;

  const [prefs, latest, localePrefs] = await Promise.all([
    getCurrencyPreferences(input.userId),
    getLatestRates(),
    getLocalePreferences(input.userId),
  ]);
  const currency = makeEmailCurrencySetup(prefs, seriesFromLatest(latest));
  const locale = localePrefs.locale;
  const calendar = resolveCalendar(localePrefs.calendar, locale);

  const element =
    data.type === 'monthly'
      ? React.createElement(MonthlyReport, buildMonthlyProps(input, currency, locale, calendar))
      : React.createElement(YearlyReport, buildYearlyProps(input, currency, locale, calendar));

  const html = await render(element);

  const periodLabel = data.type === 'monthly' ? Number(data.periodKey.split('-')[1]) : Number(data.periodKey);
  const t = REPORT_STRINGS[locale];
  const localizedPeriodLabel =
    data.type === 'monthly'
      ? monthYearLabel(periodLabel, Number(data.periodKey.split('-')[0]), locale, calendar)
      : localizeYear(periodLabel, locale, calendar);
  const subject =
    data.type === 'monthly' ? t.monthly.subject(localizedPeriodLabel) : t.yearly.subject(localizedPeriodLabel);

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
