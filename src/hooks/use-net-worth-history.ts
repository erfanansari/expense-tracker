import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { fetchNetWorthHistory } from '@/lib/api/net-worth';
import { queryKeys } from '@/lib/query-keys';

export type NetWorthRange = '1M' | '3M' | '6M' | '1Y' | 'ALL';

function getRangeDates(range: NetWorthRange): { from: string; to: string } {
  const now = new Date();
  const to = now.toISOString().slice(0, 10);

  if (range === 'ALL') {
    return { from: '2000-01-01', to };
  }

  const monthsBack = range === '1M' ? 1 : range === '3M' ? 3 : range === '6M' ? 6 : 12;
  const fromDate = new Date(now.getFullYear(), now.getMonth() - monthsBack, now.getDate());
  const from = fromDate.toISOString().slice(0, 10);

  return { from, to };
}

export function useNetWorthHistory(range: NetWorthRange) {
  const { from, to } = getRangeDates(range);
  return useQuery({
    queryKey: queryKeys.netWorth.history(from, to),
    queryFn: () => fetchNetWorthHistory(from, to),
    select: (res) => res.data,
    // Keep the previous range's data visible while the new range loads —
    // otherwise every range switch flashes the full card skeleton.
    placeholderData: keepPreviousData,
  });
}
