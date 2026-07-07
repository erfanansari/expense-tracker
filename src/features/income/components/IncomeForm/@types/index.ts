import type { Income } from '@types';

export interface IncomeFormProps {
  onIncomeAdded: () => void;
  editingIncome?: Income;
  onCancelEdit?: () => void;
  setIsDirty?: (dirty: boolean) => void;
}
