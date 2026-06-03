import * as React from 'react';

import { Heading, Hr, Section, Text } from '@react-email/components';

import CategoryRow from './components/CategoryRow';
import Layout from './components/Layout';
import MonthBar from './components/MonthBar';
import StatCard from './components/StatCard';

export interface YearlyReportProps {
  userName: string | null;
  periodLabel: string; // '2025'
  previousLabel: string; // '2024'
  totals: {
    incomeUsd: number;
    incomeToman: number;
    expensesUsd: number;
    expensesToman: number;
    netUsd: number;
    netToman: number;
  };
  deltaPct: { income: number; expenses: number };
  topCategories: Array<{
    id: number;
    name: string;
    color: string;
    valueUsd: number;
    valueToman: number;
    pct: number;
  }>;
  netWorth: { totalUsd: number; totalToman: number };
  months: Array<{
    month: number; // 1..12
    incomeUsd: number;
    expensesUsd: number;
  }>;
  bestMonth?: { monthLabel: string; netUsd: number; netToman: number };
  worstMonth?: { monthLabel: string; netUsd: number; netToman: number };
  totalSaved: { usd: number; toman: number };
  savingsRatePct: number;
  unsubscribeUrl: string;
  webViewUrl: string;
  logoUrl: string;
}

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function fmt(n: number): string {
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(n);
}

const YearlyReport = ({
  userName,
  periodLabel,
  previousLabel,
  totals,
  deltaPct,
  topCategories,
  netWorth,
  months,
  bestMonth,
  worstMonth,
  totalSaved,
  savingsRatePct,
  unsubscribeUrl,
  webViewUrl,
  logoUrl,
}: YearlyReportProps) => {
  const preview = `Your ${periodLabel} year in review — $${fmt(totals.expensesUsd)} spent, $${fmt(totalSaved.usd)} saved.`;
  const greeting = userName ? `Hi ${userName.split(' ')[0]},` : 'Hi there,';
  let netTone: 'positive' | 'negative' | 'neutral' = 'neutral';
  if (totals.netUsd > 0) netTone = 'positive';
  else if (totals.netUsd < 0) netTone = 'negative';

  const maxBar = Math.max(1, ...months.flatMap((m) => [m.incomeUsd, m.expensesUsd]));

  return (
    <Layout preview={preview} unsubscribeUrl={unsubscribeUrl} webViewUrl={webViewUrl} logoUrl={logoUrl}>
      <Text className="m-0 text-[14px] text-[#525252]">{greeting}</Text>
      <Heading
        as="h1"
        className="m-0 mt-2 text-[#171717]"
        style={{ fontSize: '28px', fontWeight: 700, letterSpacing: '-0.02em', lineHeight: '32px' }}
      >
        Your {periodLabel} in review
      </Heading>
      <Text className="m-0 mt-2 text-[14px] leading-5 text-[#6b7280]">
        Twelve months of expenses, income, and savings in one place.
      </Text>

      {/* Headline stats */}
      <table role="presentation" cellPadding={0} cellSpacing={0} width="100%" style={{ marginTop: '24px' }}>
        <tr>
          <td style={{ paddingBottom: '12px' }}>
            <StatCard
              label="Total spent"
              usd={totals.expensesUsd}
              toman={totals.expensesToman}
              tone="negative"
              delta={{ pct: deltaPct.expenses, label: `vs ${previousLabel}` }}
            />
          </td>
        </tr>
        <tr>
          <td style={{ paddingBottom: '12px' }}>
            <StatCard
              label="Total income"
              usd={totals.incomeUsd}
              toman={totals.incomeToman}
              tone="positive"
              delta={{ pct: deltaPct.income, label: `vs ${previousLabel}` }}
              deltaDirection="up-is-good"
            />
          </td>
        </tr>
        <tr>
          <td>
            <StatCard
              label={`Total saved · ${savingsRatePct.toFixed(1)}% savings rate`}
              usd={totalSaved.usd}
              toman={totalSaved.toman}
              tone={netTone}
            />
          </td>
        </tr>
      </table>

      {/* Monthly breakdown */}
      <Hr className="my-8 border-t border-[#e5e5e5]" />
      <Heading as="h2" className="m-0 text-[#171717]" style={{ fontSize: '16px', fontWeight: 600 }}>
        Month by month
      </Heading>
      <Text className="m-0 mt-1 text-[13px] text-[#a3a3a3]">
        <span
          style={{
            display: 'inline-block',
            width: 8,
            height: 8,
            backgroundColor: '#10b981',
            borderRadius: 2,
            marginRight: 4,
          }}
        />
        Income &nbsp;
        <span
          style={{
            display: 'inline-block',
            width: 8,
            height: 8,
            backgroundColor: '#171717',
            borderRadius: 2,
            marginRight: 4,
          }}
        />
        Expenses
      </Text>
      <Section style={{ marginTop: '20px' }}>
        <table role="presentation" cellPadding={0} cellSpacing={0} width="100%">
          <tr>
            {months.map((m) => (
              <MonthBar
                key={m.month}
                month={MONTH_LABELS[m.month - 1]}
                incomeUsd={m.incomeUsd}
                expensesUsd={m.expensesUsd}
                maxUsd={maxBar}
              />
            ))}
          </tr>
        </table>
      </Section>

      {/* Best / worst */}
      {(bestMonth || worstMonth) && (
        <table role="presentation" cellPadding={0} cellSpacing={0} width="100%" style={{ marginTop: '24px' }}>
          <tr>
            {bestMonth && (
              <td style={{ width: '50%', paddingRight: '8px', verticalAlign: 'top' }}>
                <Section
                  style={{
                    border: '1px solid #e5e5e5',
                    borderRadius: '12px',
                    padding: '16px',
                  }}
                >
                  <Text className="m-0 text-[11px] tracking-wide text-[#a3a3a3] uppercase">Best month</Text>
                  <Text className="m-0 mt-1 text-[#171717]" style={{ fontSize: '16px', fontWeight: 600 }}>
                    {bestMonth.monthLabel}
                  </Text>
                  <Text className="m-0 mt-1 text-[13px] font-semibold text-[#10b981]">+${fmt(bestMonth.netUsd)}</Text>
                </Section>
              </td>
            )}
            {worstMonth && (
              <td style={{ width: '50%', paddingLeft: '8px', verticalAlign: 'top' }}>
                <Section
                  style={{
                    border: '1px solid #e5e5e5',
                    borderRadius: '12px',
                    padding: '16px',
                  }}
                >
                  <Text className="m-0 text-[11px] tracking-wide text-[#a3a3a3] uppercase">Worst month</Text>
                  <Text className="m-0 mt-1 text-[#171717]" style={{ fontSize: '16px', fontWeight: 600 }}>
                    {worstMonth.monthLabel}
                  </Text>
                  <Text className="m-0 mt-1 text-[13px] font-semibold text-[#ea001d]">
                    {worstMonth.netUsd >= 0 ? '+' : '-'}${fmt(Math.abs(worstMonth.netUsd))}
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
          <Hr className="my-8 border-t border-[#e5e5e5]" />
          <Heading as="h2" className="m-0 text-[#171717]" style={{ fontSize: '16px', fontWeight: 600 }}>
            Top categories of {periodLabel}
          </Heading>
          <Text className="m-0 mt-1 text-[13px] text-[#a3a3a3]">Where most of the year&apos;s money went.</Text>
          <Section style={{ marginTop: '20px' }}>
            {topCategories.map((c, i) => (
              <CategoryRow
                key={c.id}
                rank={i + 1}
                name={c.name}
                color={c.color}
                valueUsd={c.valueUsd}
                valueToman={c.valueToman}
                pct={c.pct}
              />
            ))}
          </Section>
        </>
      )}

      {/* Net worth */}
      <Hr className="my-8 border-t border-[#e5e5e5]" />
      <Heading as="h2" className="m-0 text-[#171717]" style={{ fontSize: '16px', fontWeight: 600 }}>
        Net worth
      </Heading>
      <Text className="m-0 mt-1 text-[13px] text-[#a3a3a3]">Sum of all tracked assets, as of today.</Text>
      <Section style={{ marginTop: '16px' }}>
        <Text className="m-0 text-[#171717]" style={{ fontSize: '24px', fontWeight: 700, letterSpacing: '-0.02em' }}>
          ${fmt(netWorth.totalUsd)}
        </Text>
        <Text className="m-0 mt-1 text-[14px] text-[#6b7280]">{fmt(netWorth.totalToman)} T</Text>
      </Section>
    </Layout>
  );
};

YearlyReport.PreviewProps = {
  userName: 'Erfan',
  periodLabel: '2025',
  previousLabel: '2024',
  totals: {
    incomeUsd: 50_400,
    incomeToman: 3_024_000_000,
    expensesUsd: 34_080,
    expensesToman: 2_044_800_000,
    netUsd: 16_320,
    netToman: 979_200_000,
  },
  deltaPct: { income: 12.5, expenses: 4.8 },
  topCategories: [
    { id: 1, name: 'Rent', color: 'blue', valueUsd: 10_800, valueToman: 648_000_000, pct: 31.7 },
    { id: 2, name: 'Groceries', color: 'green', valueUsd: 7_280, valueToman: 436_800_000, pct: 21.4 },
    { id: 3, name: 'Travel', color: 'cyan', valueUsd: 5_120, valueToman: 307_200_000, pct: 15.0 },
    { id: 4, name: 'Transport', color: 'sky', valueUsd: 3_640, valueToman: 218_400_000, pct: 10.7 },
    { id: 5, name: 'Entertainment', color: 'pink', valueUsd: 2_180, valueToman: 130_800_000, pct: 6.4 },
  ],
  netWorth: { totalUsd: 48_300, totalToman: 2_898_000_000 },
  months: [
    { month: 1, incomeUsd: 4100, expensesUsd: 2680 },
    { month: 2, incomeUsd: 4150, expensesUsd: 2710 },
    { month: 3, incomeUsd: 4200, expensesUsd: 2890 },
    { month: 4, incomeUsd: 4200, expensesUsd: 3100 },
    { month: 5, incomeUsd: 4200, expensesUsd: 2840 },
    { month: 6, incomeUsd: 4300, expensesUsd: 2950 },
    { month: 7, incomeUsd: 4300, expensesUsd: 3200 },
    { month: 8, incomeUsd: 4300, expensesUsd: 2880 },
    { month: 9, incomeUsd: 4250, expensesUsd: 2730 },
    { month: 10, incomeUsd: 4250, expensesUsd: 2810 },
    { month: 11, incomeUsd: 4150, expensesUsd: 2640 },
    { month: 12, incomeUsd: 4000, expensesUsd: 2650 },
  ],
  bestMonth: { monthLabel: 'November 2025', netUsd: 1510, netToman: 90_600_000 },
  worstMonth: { monthLabel: 'July 2025', netUsd: 1100, netToman: 66_000_000 },
  totalSaved: { usd: 16_320, toman: 979_200_000 },
  savingsRatePct: 32.4,
  unsubscribeUrl: 'https://kharji.app/api/unsubscribe/preview-token',
  webViewUrl: 'https://kharji.app/overview',
  logoUrl:
    'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgdmlld0JveD0iMCAwIDMyIDMyIj48cmVjdCB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHJ4PSI4IiBmaWxsPSIjMTcxNzE3Ii8+PHBhdGggdHJhbnNmb3JtPSJ0cmFuc2xhdGUoNCw0KSIgZD0iTTQgMTRhMSAxIDAgMCAxLS43OC0xLjYzbDkuOS0xMC4yYS41LjUgMCAwIDEgLjg2LjQ2bC0xLjkyIDYuMDJBMSAxIDAgMCAwIDEzIDEwaDdhMSAxIDAgMCAxIC43OCAxLjYzbC05LjkgMTAuMmEuNS41IDAgMCAxLS44Ni0uNDZsMS45Mi02LjAyQTEgMSAwIDAgMCAxMSAxNHoiIGZpbGw9IiNmZmZmZmYiLz48L3N2Zz4=',
} satisfies YearlyReportProps;

export default YearlyReport;
