import * as React from 'react';

import { Heading, Hr, Section, Text } from '@react-email/components';

import CategoryRow from './components/CategoryRow';
import Layout from './components/Layout';
import StatCard from './components/StatCard';

export interface MonthlyReportProps {
  userName: string | null;
  periodLabel: string; // 'May 2026'
  totals: {
    incomeUsd: number;
    incomeToman: number;
    expensesUsd: number;
    expensesToman: number;
    netUsd: number;
    netToman: number;
  };
  previousLabel: string; // 'Apr 2026'
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
  unsubscribeUrl: string;
  webViewUrl: string;
  logoUrl: string;
}

function fmt(n: number): string {
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(n);
}

const MonthlyReport = ({
  userName,
  periodLabel,
  totals,
  previousLabel,
  deltaPct,
  topCategories,
  netWorth,
  unsubscribeUrl,
  webViewUrl,
  logoUrl,
}: MonthlyReportProps) => {
  const preview = `Your ${periodLabel} report — $${fmt(totals.expensesUsd)} spent, $${fmt(totals.netUsd)} net.`;
  const greeting = userName ? `Hi ${userName.split(' ')[0]},` : 'Hi there,';
  let netTone: 'positive' | 'negative' | 'neutral' = 'neutral';
  if (totals.netUsd > 0) netTone = 'positive';
  else if (totals.netUsd < 0) netTone = 'negative';

  return (
    <Layout preview={preview} unsubscribeUrl={unsubscribeUrl} webViewUrl={webViewUrl} logoUrl={logoUrl}>
      <Text className="m-0 text-[14px] text-[#525252]">{greeting}</Text>
      <Heading
        as="h1"
        className="m-0 mt-2 text-[#171717]"
        style={{ fontSize: '28px', fontWeight: 700, letterSpacing: '-0.02em', lineHeight: '32px' }}
      >
        Your {periodLabel} report
      </Heading>
      <Text className="m-0 mt-2 text-[14px] leading-5 text-[#6b7280]">
        Here&apos;s a quick look at how the month went.
      </Text>

      {/* Stats */}
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
            <StatCard label="Net (income − expenses)" usd={totals.netUsd} toman={totals.netToman} tone={netTone} />
          </td>
        </tr>
      </table>

      {/* Top categories */}
      {topCategories.length > 0 && (
        <>
          <Hr className="my-8 border-t border-[#e5e5e5]" />
          <Heading as="h2" className="m-0 text-[#171717]" style={{ fontSize: '16px', fontWeight: 600 }}>
            Top categories
          </Heading>
          <Text className="m-0 mt-1 text-[13px] text-[#a3a3a3]">Where your money went in {periodLabel}.</Text>
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

MonthlyReport.PreviewProps = {
  userName: 'Erfan',
  periodLabel: 'May 2026',
  previousLabel: 'Apr 2026',
  totals: {
    incomeUsd: 4200,
    incomeToman: 252_000_000,
    expensesUsd: 2840,
    expensesToman: 170_400_000,
    netUsd: 1360,
    netToman: 81_600_000,
  },
  deltaPct: { income: 3.2, expenses: -8.4 },
  topCategories: [
    { id: 1, name: 'Rent', color: 'blue', valueUsd: 900, valueToman: 54_000_000, pct: 31.7 },
    { id: 2, name: 'Groceries', color: 'green', valueUsd: 620, valueToman: 37_200_000, pct: 21.8 },
    { id: 3, name: 'Transport', color: 'sky', valueUsd: 410, valueToman: 24_600_000, pct: 14.4 },
    { id: 4, name: 'Coffee', color: 'orange', valueUsd: 240, valueToman: 14_400_000, pct: 8.5 },
    { id: 5, name: 'Entertainment', color: 'pink', valueUsd: 195, valueToman: 11_700_000, pct: 6.9 },
  ],
  netWorth: { totalUsd: 48_300, totalToman: 2_898_000_000 },
  unsubscribeUrl: 'https://kharji.app/api/unsubscribe/preview-token',
  webViewUrl: 'https://kharji.app/overview',
  logoUrl:
    'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgdmlld0JveD0iMCAwIDMyIDMyIj48cmVjdCB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHJ4PSI4IiBmaWxsPSIjMTcxNzE3Ii8+PHBhdGggdHJhbnNmb3JtPSJ0cmFuc2xhdGUoNCw0KSIgZD0iTTQgMTRhMSAxIDAgMCAxLS43OC0xLjYzbDkuOS0xMC4yYS41LjUgMCAwIDEgLjg2LjQ2bC0xLjkyIDYuMDJBMSAxIDAgMCAwIDEzIDEwaDdhMSAxIDAgMCAxIC43OCAxLjYzbC05LjkgMTAuMmEuNS41IDAgMCAxLS44Ni0uNDZsMS45Mi02LjAyQTEgMSAwIDAgMCAxMSAxNHoiIGZpbGw9IiNmZmZmZmYiLz48L3N2Zz4=',
} satisfies MonthlyReportProps;

export default MonthlyReport;
