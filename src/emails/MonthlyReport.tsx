import * as React from 'react';

import { Heading, Hr, Section, Text } from '@react-email/components';

import { formatMoney } from '@features/ExchangeRate/utils/currency';

import CategoryRow from './components/CategoryRow';
import Layout from './components/Layout';
import StatCard from './components/StatCard';
import { emailDir, type EmailLocale, REPORT_STRINGS } from './i18n';
import type { EmailCurrencyContext, EmailMoney } from './types';

export interface MonthlyReportProps extends EmailCurrencyContext {
  userName: string | null;
  periodLabel: string; // 'May 2026'
  totals: {
    income: EmailMoney;
    expenses: EmailMoney;
    net: EmailMoney;
  };
  previousLabel: string; // 'Apr 2026'
  deltaPct: { income: number; expenses: number };
  topCategories: Array<{
    id: number;
    name: string;
    color: string;
    value: EmailMoney;
    pct: number;
  }>;
  unsubscribeUrl: string;
  webViewUrl: string;
  logoUrl: string;
  locale?: EmailLocale;
}

const MonthlyReport = ({
  userName,
  periodLabel,
  totals,
  previousLabel,
  deltaPct,
  topCategories,
  primaryCurrency,
  secondaryCurrency,
  numberFormat,
  unsubscribeUrl,
  webViewUrl,
  logoUrl,
  locale = 'fa',
}: MonthlyReportProps) => {
  const dir = emailDir(locale);
  const currency: EmailCurrencyContext = { primaryCurrency, secondaryCurrency, numberFormat };
  const t = REPORT_STRINGS[locale];
  // Preview is a sentence — keep amounts full so they read naturally.
  const preview = t.monthly.preview(
    periodLabel,
    formatMoney(totals.expenses.primary, primaryCurrency, { locale }),
    formatMoney(totals.net.primary, primaryCurrency, { locale })
  );
  const greeting = t.greeting(userName ? userName.split(' ')[0] : null);
  let netTone: 'positive' | 'negative' | 'neutral' = 'neutral';
  if (totals.net.primary > 0) netTone = 'positive';
  else if (totals.net.primary < 0) netTone = 'negative';

  return (
    <Layout preview={preview} unsubscribeUrl={unsubscribeUrl} webViewUrl={webViewUrl} logoUrl={logoUrl} locale={locale}>
      <Text className="m-0 text-[14px] text-[#525252]">{greeting}</Text>
      <Heading
        as="h1"
        className="m-0 mt-2 text-[#171717]"
        style={{ fontSize: '28px', fontWeight: 700, letterSpacing: '-0.02em', lineHeight: '32px' }}
      >
        {t.monthly.title(periodLabel)}
      </Heading>
      <Text className="m-0 mt-2 text-[14px] leading-5 text-[#6b7280]">{t.monthly.subtitle}</Text>

      {/* Stats */}
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
            <StatCard label={t.net} value={totals.net} currency={currency} tone={netTone} locale={locale} />
          </td>
        </tr>
      </table>

      {/* Top categories */}
      {topCategories.length > 0 && (
        <>
          <Hr className="my-8 border-t border-[#e5e5e5]" />
          <Heading as="h2" className="m-0 text-[#171717]" style={{ fontSize: '16px', fontWeight: 600 }}>
            {t.topCategories}
          </Heading>
          <Text className="m-0 mt-1 text-[13px] text-[#a3a3a3]">{t.monthly.topCategoriesSubtitle(periodLabel)}</Text>
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

MonthlyReport.PreviewProps = {
  userName: 'Erfan',
  periodLabel: 'May 2026',
  previousLabel: 'Apr 2026',
  primaryCurrency: 'IRT',
  secondaryCurrency: 'USD',
  numberFormat: 'auto',
  totals: {
    income: { primary: 252_000_000, secondary: 4200 },
    expenses: { primary: 170_400_000, secondary: 2840 },
    net: { primary: 81_600_000, secondary: 1360 },
  },
  deltaPct: { income: 3.2, expenses: -8.4 },
  topCategories: [
    { id: 1, name: 'Rent', color: 'blue', value: { primary: 54_000_000, secondary: 900 }, pct: 31.7 },
    { id: 2, name: 'Groceries', color: 'green', value: { primary: 37_200_000, secondary: 620 }, pct: 21.8 },
    { id: 3, name: 'Transport', color: 'sky', value: { primary: 24_600_000, secondary: 410 }, pct: 14.4 },
    { id: 4, name: 'Coffee', color: 'orange', value: { primary: 14_400_000, secondary: 240 }, pct: 8.5 },
    { id: 5, name: 'Entertainment', color: 'pink', value: { primary: 11_700_000, secondary: 195 }, pct: 6.9 },
  ],
  unsubscribeUrl: 'https://kharji.app/api/unsubscribe/preview-token',
  webViewUrl: 'https://kharji.app/overview',
  logoUrl: 'https://kharji.app/icons/icon-192.png',
} satisfies MonthlyReportProps;

export default MonthlyReport;
