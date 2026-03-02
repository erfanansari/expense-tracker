import { keepPreviousData, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import type { CreateExpenseInput } from '@/@types/expense';
import {
  createExpense,
  deleteExpense,
  type ExpenseFilters,
  fetchExpensesPage,
  updateExpense,
} from '@/lib/api/expenses';
import { queryKeys } from '@/lib/query-keys';

const ITEMS_PER_PAGE = 20;

export function useInfiniteExpenses(filters?: ExpenseFilters) {
  return useInfiniteQuery({
    queryKey: [...queryKeys.expenses.paginated(), filters ?? {}],
    queryFn: ({ pageParam }) => fetchExpensesPage(pageParam as string | undefined, ITEMS_PER_PAGE, filters),
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.nextCursor : undefined),
    initialPageParam: undefined as string | undefined,
    placeholderData: keepPreviousData,
  });
}

export function useCreateExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createExpense,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.expenses.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.summary.all() });
    },
  });
}

export function useUpdateExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<CreateExpenseInput> }) => updateExpense(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.expenses.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.summary.all() });
    },
  });
}

export function useDeleteExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteExpense,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.expenses.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.summary.all() });
    },
  });
}
