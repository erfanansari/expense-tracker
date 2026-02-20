import { useQuery } from '@tanstack/react-query';

import { fetchSummary } from '@/lib/api/summary';
import { queryKeys } from '@/lib/query-keys';

export function useSummary() {
  return useQuery({
    queryKey: queryKeys.summary.all(),
    queryFn: fetchSummary,
  });
}
