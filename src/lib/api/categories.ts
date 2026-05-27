import type { Category, CategoryWithUsage, CreateCategoryInput, UpdateCategoryInput } from '@/@types/expense';

import { apiFetch, apiMutate } from './client';

export const fetchCategories = () => apiFetch<Category[]>('/api/categories');

export const fetchCategoriesWithUsage = () => apiFetch<CategoryWithUsage[]>('/api/categories?includeUsage=true');

export const createCategory = (input: CreateCategoryInput) => apiMutate<Category>('/api/categories', 'POST', input);

export const updateCategory = (id: number, input: UpdateCategoryInput) =>
  apiMutate<Category>(`/api/categories/${id}`, 'PUT', input);

export const deleteCategory = (id: number, reassignTo?: number) => {
  const url = reassignTo ? `/api/categories/${id}?reassignTo=${reassignTo}` : `/api/categories/${id}`;
  return apiMutate<{ success: boolean; usageCount: number }>(url, 'DELETE');
};
