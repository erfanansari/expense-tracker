import type { CreateIncomeInput, Income, UpdateIncomeInput } from '@/@types/income';

import { apiFetch, apiMutate } from './client';

export const fetchIncomes = () => apiFetch<Income[]>('/api/incomes');

export const createIncome = (data: CreateIncomeInput) => apiMutate<Income>('/api/incomes', 'POST', data);

export const updateIncome = (id: number, data: UpdateIncomeInput) =>
  apiMutate<Income>(`/api/incomes/${id}`, 'PUT', data);

export const deleteIncome = (id: number) => apiMutate<void>(`/api/incomes/${id}`, 'DELETE');
