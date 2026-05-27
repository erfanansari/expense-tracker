import type { CreateExpenseInput, Expense } from '@/@types/expense';

import { apiFetch, apiMutate } from './client';

export interface ExpensesPage {
  expenses: Expense[];
  nextCursor: string | null;
  hasMore: boolean;
}

export interface ExpenseFilters {
  description?: string;
  categoryId?: number;
  dateFrom?: string;
  dateTo?: string;
  tagIds?: number[];
}

export async function fetchExpensesPage(cursor?: string, limit = 20, filters?: ExpenseFilters): Promise<ExpensesPage> {
  const params = new URLSearchParams({ limit: String(limit) });
  if (cursor) params.set('cursor', cursor);
  if (filters?.description) params.set('description', filters.description);
  if (filters?.categoryId) params.set('categoryId', String(filters.categoryId));
  if (filters?.dateFrom) params.set('dateFrom', filters.dateFrom);
  if (filters?.dateTo) params.set('dateTo', filters.dateTo);
  if (filters?.tagIds?.length) params.set('tagIds', filters.tagIds.join(','));
  return apiFetch<ExpensesPage>(`/api/expenses?${params}`);
}

export async function fetchAllExpenses(): Promise<Expense[]> {
  const data = await apiFetch<Expense[] | { expenses: Expense[] }>('/api/expenses');
  return Array.isArray(data) ? data : (data.expenses ?? []);
}

export const createExpense = (data: CreateExpenseInput) => apiMutate<Expense>('/api/expenses', 'POST', data);

export const updateExpense = (id: number, data: Partial<CreateExpenseInput>) =>
  apiMutate<Expense>(`/api/expenses/${id}`, 'PUT', data);

export const deleteExpense = (id: number) => apiMutate<void>(`/api/expenses/${id}`, 'DELETE');
