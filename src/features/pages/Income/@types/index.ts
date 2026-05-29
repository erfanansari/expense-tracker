import type { Income } from '@types';

export interface IncomeSummaryProps {
  incomes: Income[];
}

export interface IncomeTableProps {
  incomesByYear: Record<number, Income[]>;
  sortedYears: number[];
  isLoading: boolean;
  error: Error | null;
  onEdit: (income: Income) => void;
  onDelete: (income: Income) => void;
  deletingId: number | null;
  onRetry: () => void;
}
