import type { CreateIncomeInput, Income, UpdateIncomeInput } from '@/@types/income';

export async function fetchIncomes(): Promise<Income[]> {
  const response = await fetch('/api/incomes');
  if (!response.ok) throw new Error('Failed to load incomes');
  return response.json();
}

export async function createIncome(data: CreateIncomeInput): Promise<Income> {
  const response = await fetch('/api/incomes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const json = await response.json();
  if (!response.ok) throw new Error(json.error || 'Failed to create income');
  return json;
}

export async function updateIncome(id: number, data: UpdateIncomeInput): Promise<Income> {
  const response = await fetch(`/api/incomes/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const json = await response.json();
  if (!response.ok) throw new Error(json.error || 'Failed to update income');
  return json;
}

export async function deleteIncome(id: number): Promise<void> {
  const response = await fetch(`/api/incomes/${id}`, { method: 'DELETE' });
  if (!response.ok) throw new Error('Failed to delete income');
}
