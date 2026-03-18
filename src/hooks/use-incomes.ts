import { useQuery } from '@tanstack/react-query';

import type { CreateIncomeInput, UpdateIncomeInput } from '@/@types/income';
import { createIncome, deleteIncome, fetchIncomes, updateIncome } from '@/lib/api/incomes';
import { queryKeys } from '@/lib/query-keys';

import { useMutationWithInvalidation } from './use-mutation-with-invalidation';

const INCOME_INVALIDATION_KEYS = [queryKeys.incomes.all(), queryKeys.summary.all()] as const;

export function useIncomes() {
  return useQuery({
    queryKey: queryKeys.incomes.all(),
    queryFn: fetchIncomes,
  });
}

export const useCreateIncome = () => useMutationWithInvalidation(createIncome, INCOME_INVALIDATION_KEYS);

export const useUpdateIncome = () =>
  useMutationWithInvalidation(
    ({ id, data }: { id: number; data: UpdateIncomeInput }) => updateIncome(id, data),
    INCOME_INVALIDATION_KEYS
  );

export const useDeleteIncome = () => useMutationWithInvalidation(deleteIncome, INCOME_INVALIDATION_KEYS);

// Re-export type so pages don't need to import from lib/api
export type { CreateIncomeInput };
