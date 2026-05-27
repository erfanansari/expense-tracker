import { useQuery } from '@tanstack/react-query';

import type { CreateCategoryInput, UpdateCategoryInput } from '@/@types/expense';
import {
  createCategory,
  deleteCategory,
  fetchCategories,
  fetchCategoriesWithUsage,
  updateCategory,
} from '@/lib/api/categories';
import { queryKeys } from '@/lib/query-keys';

import { useMutationWithInvalidation } from './use-mutation-with-invalidation';

const CATEGORY_INVALIDATION_KEYS = [queryKeys.categories.all(), queryKeys.categories.withUsage()] as const;

export function useCategories() {
  return useQuery({
    queryKey: queryKeys.categories.all(),
    queryFn: fetchCategories,
  });
}

export function useCategoriesWithUsage() {
  return useQuery({
    queryKey: queryKeys.categories.withUsage(),
    queryFn: fetchCategoriesWithUsage,
  });
}

export const useCreateCategory = () =>
  useMutationWithInvalidation((input: CreateCategoryInput) => createCategory(input), CATEGORY_INVALIDATION_KEYS);

export const useUpdateCategory = () =>
  useMutationWithInvalidation(
    ({ id, input }: { id: number; input: UpdateCategoryInput }) => updateCategory(id, input),
    CATEGORY_INVALIDATION_KEYS
  );

export const useDeleteCategory = () =>
  useMutationWithInvalidation(
    ({ id, reassignTo }: { id: number; reassignTo?: number }) => deleteCategory(id, reassignTo),
    [
      ...CATEGORY_INVALIDATION_KEYS,
      queryKeys.expenses.all(), // reassign / delete affects expense rows
      queryKeys.summary.all(), // category totals change
    ]
  );
