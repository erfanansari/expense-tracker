import * as React from 'react';

import { Text } from '@react-email/components';

interface MonthBarProps {
  month: string; // 'Jan'
  incomeUsd: number;
  expensesUsd: number;
  maxUsd: number; // largest value in the entire 12-month series, for scaling
}

const BAR_HEIGHT = 56; // px, the chart cell height

function pct(value: number, max: number): number {
  if (max <= 0) return 0;
  return Math.max(0, Math.min(100, (value / max) * 100));
}

export const MonthBar = ({ month, incomeUsd, expensesUsd, maxUsd }: MonthBarProps) => {
  const incomeHeight = (pct(incomeUsd, maxUsd) / 100) * BAR_HEIGHT;
  const expenseHeight = (pct(expensesUsd, maxUsd) / 100) * BAR_HEIGHT;

  return (
    <td style={{ verticalAlign: 'bottom', textAlign: 'center', padding: '0 2px' }}>
      <div
        style={{
          display: 'inline-block',
          width: '100%',
          height: `${BAR_HEIGHT}px`,
          verticalAlign: 'bottom',
          position: 'relative',
        }}
      >
        <table role="presentation" cellPadding={0} cellSpacing={0} width="100%" style={{ height: `${BAR_HEIGHT}px` }}>
          <tr>
            <td style={{ verticalAlign: 'bottom', padding: '0 1px' }}>
              <div
                style={{
                  width: '100%',
                  height: `${Math.max(2, incomeHeight)}px`,
                  backgroundColor: '#10b981',
                  borderRadius: '2px 2px 0 0',
                }}
              />
            </td>
            <td style={{ verticalAlign: 'bottom', padding: '0 1px' }}>
              <div
                style={{
                  width: '100%',
                  height: `${Math.max(2, expenseHeight)}px`,
                  backgroundColor: '#171717',
                  borderRadius: '2px 2px 0 0',
                }}
              />
            </td>
          </tr>
        </table>
      </div>
      <Text className="m-0 mt-2 text-[10px] text-[#a3a3a3] uppercase" style={{ letterSpacing: '0.05em' }}>
        {month}
      </Text>
    </td>
  );
};

export default MonthBar;
