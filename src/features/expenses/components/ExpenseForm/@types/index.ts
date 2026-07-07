import type { Category, Tag } from '@types';

export interface ExpenseFormProps {
  onExpenseAdded: () => void;
  editingExpense?: {
    id: number;
    date: string;
    category: Category;
    description: string;
    amount: number;
    currency: string;
    tags?: Tag[];
  };
  onCancelEdit?: () => void;
  setIsDirty?: (dirty: boolean) => void;
}
