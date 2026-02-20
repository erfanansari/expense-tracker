import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { CreateIncomeInput, UpdateIncomeInput } from '@/@types/income';
import { createIncome, deleteIncome, fetchIncomes, updateIncome } from '@/lib/api/incomes';
import { queryKeys } from '@/lib/query-keys';

export function useIncomes() {
  return useQuery({
    queryKey: queryKeys.incomes.all(),
    queryFn: fetchIncomes,
  });
}

export function useCreateIncome() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createIncome,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.incomes.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.summary.all() });
    },
  });
}

export function useUpdateIncome() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateIncomeInput }) => updateIncome(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.incomes.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.summary.all() });
    },
  });
}

export function useDeleteIncome() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteIncome,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.incomes.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.summary.all() });
    },
  });
}

// Re-export type so pages don't need to import from lib/api
export type { CreateIncomeInput };
