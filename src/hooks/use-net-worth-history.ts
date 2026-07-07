import { getNetWorthHistoryKeyGenerator } from '@api/getNetWorthHistoryQuery';
import type { NetWorthHistoryResponse } from '@api/getNetWorthHistoryQuery';
import { keepPreviousData, useQuery } from '@tanstack/react-query';

export type NetWorthRange = '1M' | '3M' | '6M' | '1Y' | 'ALL';

const RANGE_MONTHS: Record<Exclude<NetWorthRange, 'ALL'>, number> = { '1M': 1, '3M': 3, '6M': 6, '1Y': 12 };

function getRangeDates(range: NetWorthRange): { from: string; to: string } {
  const now = new Date();
  const to = now.toISOString().slice(0, 10);

  if (range === 'ALL') {
    return { from: '2000-01-01', to };
  }

  const monthsBack = RANGE_MONTHS[range];
  const fromDate = new Date(now.getFullYear(), now.getMonth() - monthsBack, now.getDate());
  const from = fromDate.toISOString().slice(0, 10);

  return { from, to };
}

export function useNetWorthHistory(range: NetWorthRange) {
  const { from, to } = getRangeDates(range);
  return useQuery({
    queryKey: getNetWorthHistoryKeyGenerator({ from, to }),
    select: (res: NetWorthHistoryResponse) => res.data,
    // Keep the previous range's data visible while the new range loads —
    // otherwise every range switch flashes the full card skeleton.
    placeholderData: keepPreviousData,
  });
}
