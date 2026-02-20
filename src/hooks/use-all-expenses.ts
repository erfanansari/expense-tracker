import { useQuery } from '@tanstack/react-query';

import { fetchAllExpenses } from '@/lib/api/expenses';
import { queryKeys } from '@/lib/query-keys';

export function useAllExpenses() {
  return useQuery({
    queryKey: queryKeys.expenses.flat(),
    queryFn: fetchAllExpenses,
  });
}
