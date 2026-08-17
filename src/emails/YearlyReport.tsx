import * as React from 'react';

import { Heading, Hr, Section, Text } from '@react-email/components';

import { formatMoney } from '@features/ExchangeRate/utils/currency';

import { EMAIL_COLORS } from './colors';
import CategoryRow from './components/CategoryRow';
import Layout from './components/Layout';
import MonthBar from './components/MonthBar';
import StatCard, { formatSigned } from './components/StatCard';
import { emailDir, type EmailLocale, REPORT_STRINGS } from './i18n';
import type { EmailCurrencyContext, EmailMoney } from './types';
import { isCompact } from './types';

export interface YearlyReportProps extends EmailCurrencyContext {
  userName: string | null;
  periodLabel: string; // '2025'
  previousLabel: string; // '2024'
  totals: {
    income: EmailMoney;
    expenses: EmailMoney;
    net: EmailMoney;
  };
  deltaPct: { income: number; expenses: number };
  topCategories: Array<{
    id: number;
    name: string;
    color: string;
    value: EmailMoney;
    pct: number;
  }>;
  months: Array<{
    month: number; // 1..12
    monthLabel: string; // 'Jan' or 'فروردین' — locale/calendar-resolved by the caller
    // Amounts in the user's primary currency — only used relatively, for bar heights.
    income: number;
    expenses: number;
  }>;
  bestMonth?: { monthLabel: string; net: EmailMoney };
  worstMonth?: { monthLabel: string; net: EmailMoney };
  totalSaved: EmailMoney;
  savingsRatePct: number;
  unsubscribeUrl: string;
  webViewUrl: string;
  logoUrl: string;
  locale?: EmailLocale;
}

const MONTH_LABELS_EN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const YearlyReport = ({
  userName,
  periodLabel,
  previousLabel,
  totals,
  deltaPct,
  topCategories,
  months,
  bestMonth,
  worstMonth,
  totalSaved,
  savingsRatePct,
  primaryCurrency,
  secondaryCurrency,
  numberFormat,
  unsubscribeUrl,
  webViewUrl,
  logoUrl,
  locale = 'fa',
}: YearlyReportProps) => {
  const dir = emailDir(locale);
  const currency: EmailCurrencyContext = { primaryCurrency, secondaryCurrency, numberFormat };
  const t = REPORT_STRINGS[locale];
  // Preview is a sentence — keep amounts full so they read naturally.
  const preview = t.yearly.preview(
    periodLabel,
    formatMoney(totals.expenses.primary, primaryCurrency, { locale }),
    formatMoney(totalSaved.primary, primaryCurrency, { locale })
  );
  const greeting = t.greeting(userName ? userName.split(' ')[0] : null);
  let netTone: 'positive' | 'negative' | 'neutral' = 'neutral';
  if (totals.net.primary > 0) netTone = 'positive';
  else if (totals.net.primary < 0) netTone = 'negative';

  const maxBar = Math.max(1, ...months.flatMap((m) => [m.income, m.expenses]));
  const cardCompact = isCompact(numberFormat, true);

  return (
    <Layout preview={preview} unsubscribeUrl={unsubscribeUrl} webViewUrl={webViewUrl} logoUrl={logoUrl} locale={locale}>
      <Text className="m-0 text-[14px] text-[#46586e]">{greeting}</Text>
      <Heading
        as="h1"
        className="m-0 mt-2 text-[#0f1b2d]"
        style={{ fontSize: '28px', fontWeight: 700, letterSpacing: '-0.02em', lineHeight: '32px' }}
      >
        {t.yearly.title(periodLabel)}
      </Heading>
      <Text className="m-0 mt-2 text-[14px] leading-5 text-[#616579]">{t.yearly.subtitle}</Text>

      {/* Headline stats */}
      <table role="presentation" cellPadding={0} cellSpacing={0} width="100%" dir={dir} style={{ marginTop: '24px' }}>
        <tr>
          <td style={{ paddingBottom: '12px' }}>
            <StatCard
              label={t.totalSpent}
              value={totals.expenses}
              currency={currency}
              tone="negative"
              delta={{ pct: deltaPct.expenses, label: t.vsLabel(previousLabel) }}
              locale={locale}
            />
          </td>
        </tr>
        <tr>
          <td style={{ paddingBottom: '12px' }}>
            <StatCard
              label={t.totalIncome}
              value={totals.income}
              currency={currency}
              tone="positive"
              delta={{ pct: deltaPct.income, label: t.vsLabel(previousLabel) }}
              deltaDirection="up-is-good"
              locale={locale}
            />
          </td>
        </tr>
        <tr>
          <td>
            <StatCard
              label={t.yearly.totalSaved(savingsRatePct.toFixed(1))}
              value={totalSaved}
              currency={currency}
              tone={netTone}
              locale={locale}
            />
          </td>
        </tr>
      </table>

      {/* Monthly breakdown */}
      <Hr className="my-8 border-t border-[#e2e8f1]" />
      <Heading as="h2" className="m-0 text-[#0f1b2d]" style={{ fontSize: '16px', fontWeight: 600 }}>
        {t.yearly.monthByMonth}
      </Heading>
      <Text className="m-0 mt-1 text-[13px] text-[#6f8199]">
        <span
          style={{
            display: 'inline-block',
            width: 8,
            height: 8,
            backgroundColor: EMAIL_COLORS.success,
            borderRadius: 2,
            marginRight: 4,
          }}
        />
        {t.income} &nbsp;
        <span
          style={{
            display: 'inline-block',
            width: 8,
            height: 8,
            backgroundColor: EMAIL_COLORS.textPrimary,
            borderRadius: 2,
            marginRight: 4,
          }}
        />
        {t.expenses}
      </Text>
      <Section style={{ marginTop: '20px' }}>
        <table role="presentation" cellPadding={0} cellSpacing={0} width="100%" dir={dir}>
          <tr>
            {months.map((m) => (
              <MonthBar
                key={m.month}
                month={m.monthLabel || MONTH_LABELS_EN[m.month - 1]}
                income={m.income}
                expenses={m.expenses}
                max={maxBar}
              />
            ))}
          </tr>
        </table>
      </Section>

      {/* Best / worst */}
      {(bestMonth || worstMonth) && (
        <table role="presentation" cellPadding={0} cellSpacing={0} width="100%" dir={dir} style={{ marginTop: '24px' }}>
          <tr>
            {bestMonth && (
              <td style={{ width: '50%', paddingRight: '8px', verticalAlign: 'top' }}>
                <Section
                  style={{
                    border: '1px solid #e2e8f1',
                    borderRadius: '12px',
                    padding: '16px',
                  }}
                >
                  <Text className="m-0 text-[11px] tracking-wide text-[#6f8199] uppercase">{t.yearly.bestMonth}</Text>
                  <Text className="m-0 mt-1 text-[#0f1b2d]" style={{ fontSize: '16px', fontWeight: 600 }}>
                    {bestMonth.monthLabel}
                  </Text>
                  <Text className="m-0 mt-1 text-[13px] font-semibold text-[#0e7a3e]">
                    +{formatMoney(bestMonth.net.primary, primaryCurrency, { compact: cardCompact, locale })}
                  </Text>
                </Section>
              </td>
            )}
            {worstMonth && (
              <td style={{ width: '50%', paddingLeft: '8px', verticalAlign: 'top' }}>
                <Section
                  style={{
                    border: '1px solid #e2e8f1',
                    borderRadius: '12px',
                    padding: '16px',
                  }}
                >
                  <Text className="m-0 text-[11px] tracking-wide text-[#6f8199] uppercase">{t.yearly.worstMonth}</Text>
                  <Text className="m-0 mt-1 text-[#0f1b2d]" style={{ fontSize: '16px', fontWeight: 600 }}>
                    {worstMonth.monthLabel}
                  </Text>
                  <Text className="m-0 mt-1 text-[13px] font-semibold text-[#c81e1e]">
                    {worstMonth.net.primary >= 0 ? '+' : ''}
                    {formatSigned(worstMonth.net.primary, primaryCurrency, cardCompact, locale)}
                  </Text>
                </Section>
              </td>
            )}
          </tr>
        </table>
      )}

      {/* Top categories */}
      {topCategories.length > 0 && (
        <>
          <Hr className="my-8 border-t border-[#e2e8f1]" />
          <Heading as="h2" className="m-0 text-[#0f1b2d]" style={{ fontSize: '16px', fontWeight: 600 }}>
            {t.yearly.topCategoriesOf(periodLabel)}
          </Heading>
          <Text className="m-0 mt-1 text-[13px] text-[#6f8199]">{t.yearly.topCategoriesSubtitle}</Text>
          <Section style={{ marginTop: '20px' }}>
            {topCategories.map((c, i) => (
              <CategoryRow
                key={c.id}
                rank={i + 1}
                name={c.name}
                color={c.color}
                value={c.value}
                currency={currency}
                pct={c.pct}
                locale={locale}
              />
            ))}
          </Section>
        </>
      )}
    </Layout>
  );
};

YearlyReport.PreviewProps = {
  userName: 'Erfan',
  periodLabel: '2025',
  previousLabel: '2024',
  primaryCurrency: 'IRT',
  secondaryCurrency: 'USD',
  numberFormat: 'auto',
  totals: {
    income: { primary: 3_024_000_000, secondary: 50_400 },
    expenses: { primary: 2_044_800_000, secondary: 34_080 },
    net: { primary: 979_200_000, secondary: 16_320 },
  },
  deltaPct: { income: 12.5, expenses: 4.8 },
  topCategories: [
    { id: 1, name: 'Rent', color: 'blue', value: { primary: 648_000_000, secondary: 10_800 }, pct: 31.7 },
    { id: 2, name: 'Groceries', color: 'green', value: { primary: 436_800_000, secondary: 7_280 }, pct: 21.4 },
    { id: 3, name: 'Travel', color: 'cyan', value: { primary: 307_200_000, secondary: 5_120 }, pct: 15.0 },
    { id: 4, name: 'Transport', color: 'sky', value: { primary: 218_400_000, secondary: 3_640 }, pct: 10.7 },
    { id: 5, name: 'Entertainment', color: 'pink', value: { primary: 130_800_000, secondary: 2_180 }, pct: 6.4 },
  ],
  months: [
    { month: 1, monthLabel: 'Jan', income: 246_000_000, expenses: 160_800_000 },
    { month: 2, monthLabel: 'Feb', income: 249_000_000, expenses: 162_600_000 },
    { month: 3, monthLabel: 'Mar', income: 252_000_000, expenses: 173_400_000 },
    { month: 4, monthLabel: 'Apr', income: 252_000_000, expenses: 186_000_000 },
    { month: 5, monthLabel: 'May', income: 252_000_000, expenses: 170_400_000 },
    { month: 6, monthLabel: 'Jun', income: 258_000_000, expenses: 177_000_000 },
    { month: 7, monthLabel: 'Jul', income: 258_000_000, expenses: 192_000_000 },
    { month: 8, monthLabel: 'Aug', income: 258_000_000, expenses: 172_800_000 },
    { month: 9, monthLabel: 'Sep', income: 255_000_000, expenses: 163_800_000 },
    { month: 10, monthLabel: 'Oct', income: 255_000_000, expenses: 168_600_000 },
    { month: 11, monthLabel: 'Nov', income: 249_000_000, expenses: 158_400_000 },
    { month: 12, monthLabel: 'Dec', income: 240_000_000, expenses: 159_000_000 },
  ],
  bestMonth: { monthLabel: 'November 2025', net: { primary: 90_600_000, secondary: 1510 } },
  worstMonth: { monthLabel: 'July 2025', net: { primary: 66_000_000, secondary: 1100 } },
  totalSaved: { primary: 979_200_000, secondary: 16_320 },
  savingsRatePct: 32.4,
  unsubscribeUrl: 'https://kharji.app/api/unsubscribe/preview-token',
  webViewUrl: 'https://kharji.app/overview',
  logoUrl: 'https://kharji.app/icons/icon-192.png',
} satisfies YearlyReportProps;

export default YearlyReport;
