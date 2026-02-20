import type { CreateExpenseInput, Expense } from '@/@types/expense';

export interface ExpensesPage {
  expenses: Expense[];
  nextCursor: string | null;
  hasMore: boolean;
}

export async function fetchExpensesPage(cursor?: string, limit = 20): Promise<ExpensesPage> {
  const params = new URLSearchParams({ limit: String(limit) });
  if (cursor) params.set('cursor', cursor);
  const response = await fetch(`/api/expenses?${params}`);
  if (!response.ok) throw new Error('Failed to load expenses');
  return response.json();
}

export async function fetchAllExpenses(): Promise<Expense[]> {
  const response = await fetch('/api/expenses');
  if (!response.ok) throw new Error('Failed to load expenses');
  const data = await response.json();
  return Array.isArray(data) ? data : (data.expenses ?? []);
}

export async function createExpense(data: CreateExpenseInput): Promise<Expense> {
  const response = await fetch('/api/expenses', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const json = await response.json();
  if (!response.ok) throw new Error(json.error || 'Failed to create expense');
  return json;
}

export async function updateExpense(id: number, data: Partial<CreateExpenseInput>): Promise<Expense> {
  const response = await fetch(`/api/expenses/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const json = await response.json();
  if (!response.ok) throw new Error(json.error || 'Failed to update expense');
  return json;
}

export async function deleteExpense(id: number): Promise<void> {
  const response = await fetch(`/api/expenses/${id}`, { method: 'DELETE' });
  if (!response.ok) throw new Error('Failed to delete expense');
}
