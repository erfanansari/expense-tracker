import type { Expense } from '@types';

import type { ExpenseFilters } from '@/lib/api/expenses';

export interface ExpensesTableProps {
  expenses: Expense[];
  isLoading: boolean;
  error: Error | null;
  filters: ExpenseFilters;
  descInput: string;
  onDescInputChange: (value: string) => void;
  onFiltersChange: (updater: (prev: ExpenseFilters) => ExpenseFilters) => void;
  onRowClick: (expense: Expense) => void;
  onEdit: (expense: Expense) => void;
  onDelete: (expense: Expense) => void;
  deletingId: number | null;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  onLoadMore: () => void;
  onRetry: () => void;
}
