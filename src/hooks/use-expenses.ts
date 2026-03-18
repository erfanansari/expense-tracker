import { keepPreviousData, useInfiniteQuery } from '@tanstack/react-query';

import type { CreateExpenseInput } from '@/@types/expense';
import {
  createExpense,
  deleteExpense,
  type ExpenseFilters,
  fetchExpensesPage,
  updateExpense,
} from '@/lib/api/expenses';
import { queryKeys } from '@/lib/query-keys';

import { useMutationWithInvalidation } from './use-mutation-with-invalidation';

const ITEMS_PER_PAGE = 20;
const EXPENSE_INVALIDATION_KEYS = [queryKeys.expenses.all(), queryKeys.summary.all()] as const;

export function useInfiniteExpenses(filters?: ExpenseFilters) {
  return useInfiniteQuery({
    queryKey: [...queryKeys.expenses.paginated(), filters ?? {}],
    queryFn: ({ pageParam }) => fetchExpensesPage(pageParam as string | undefined, ITEMS_PER_PAGE, filters),
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.nextCursor : undefined),
    initialPageParam: undefined as string | undefined,
    placeholderData: keepPreviousData,
  });
}

export const useCreateExpense = () => useMutationWithInvalidation(createExpense, EXPENSE_INVALIDATION_KEYS);

export const useUpdateExpense = () =>
  useMutationWithInvalidation(
    ({ id, data }: { id: number; data: Partial<CreateExpenseInput> }) => updateExpense(id, data),
    EXPENSE_INVALIDATION_KEYS
  );

export const useDeleteExpense = () => useMutationWithInvalidation(deleteExpense, EXPENSE_INVALIDATION_KEYS);
