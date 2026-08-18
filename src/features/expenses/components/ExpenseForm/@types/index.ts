import type { Category, ExpenseRepeat, Tag } from '@types';

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
    /** The repeat behind this expense, so editing it can change or stop it. */
    repeat?: ExpenseRepeat | null;
  };
  onCancelEdit?: () => void;
  setIsDirty?: (dirty: boolean) => void;
}
