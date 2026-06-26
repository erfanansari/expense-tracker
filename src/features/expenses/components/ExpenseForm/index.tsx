'use client';

import { useEffect, useMemo, useState } from 'react';

import { numberToWords } from '@persian-tools/persian-tools';
import { Calendar, Coins, FileText, Layers, Loader2, Plus } from 'lucide-react';

import { createExpenseSchema } from '@schemas';

import { useCurrency } from '@features/ExchangeRate/CurrencyProvider';

import Button from '@components/Button';
import DatePicker from '@components/DatePicker';
import MoneyInput from '@components/MoneyInput';
import { useToast } from '@components/Toast/ToastProvider';
import Tooltip from '@components/Tooltip';

import { useCreateExpense, useUpdateExpense } from '@hooks/use-expenses';

import { ensureError } from '@utils';

import { type Category, type CreateExpenseInput, type Tag } from '@/@types/expense';
import { PIVOT_CURRENCY } from '@/constants/currencies';

import CategorySelect from '../CategorySelect';
import TagInput from '../TagInput';

interface ExpenseFormProps {
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

const ExpenseForm = ({ onExpenseAdded, editingExpense, onCancelEdit, setIsDirty }: ExpenseFormProps) => {
  const { showToast } = useToast();
  const { primaryCurrency } = useCurrency();

  const createExpense = useCreateExpense();
  const updateExpense = useUpdateExpense();

  const defaultFormData: CreateExpenseInput = useMemo(
    () => ({
      date: new Date().toISOString().split('T')[0],
      categoryId: 0,
      description: '',
      amount: 0,
      currency: primaryCurrency || PIVOT_CURRENCY,
      tagIds: [],
    }),
    [primaryCurrency]
  );

  const buildFormData = (expense: {
    date: string;
    category: Category;
    description: string;
    amount: number;
    currency: string;
    tags?: Tag[];
  }): CreateExpenseInput => ({
    date: expense.date,
    categoryId: expense.category.id,
    description: expense.description,
    amount: expense.amount,
    currency: expense.currency,
    tagIds: expense.tags?.map((t) => t.id) || [],
  });

  const [formData, setFormData] = useState<CreateExpenseInput>(
    editingExpense ? buildFormData(editingExpense) : defaultFormData
  );
  const [selectedTags, setSelectedTags] = useState<Tag[]>(editingExpense?.tags || []);
  const [initialFormData, setInitialFormData] = useState<CreateExpenseInput | null>(
    editingExpense ? buildFormData(editingExpense) : null
  );

  const isSubmitting = createExpense.isPending || updateExpense.isPending;

  // Sync form data when editingExpense prop changes
  const [prevEditingExpense, setPrevEditingExpense] = useState(editingExpense);
  if (prevEditingExpense !== editingExpense) {
    setPrevEditingExpense(editingExpense);
    if (editingExpense) {
      const initialData = buildFormData(editingExpense);
      setFormData(initialData);
      setInitialFormData(initialData);
      setSelectedTags(editingExpense.tags || []);
    }
  }

  useEffect(() => {
    if (!initialFormData || !setIsDirty) return;

    const tagIdsChanged =
      (formData.tagIds?.length || 0) !== (initialFormData.tagIds?.length || 0) ||
      (formData.tagIds || []).some((id, idx) => id !== initialFormData.tagIds?.[idx]);

    const isDirty =
      formData.date !== initialFormData.date ||
      formData.categoryId !== initialFormData.categoryId ||
      formData.description !== initialFormData.description ||
      formData.amount !== initialFormData.amount ||
      formData.currency !== initialFormData.currency ||
      tagIdsChanged;

    setIsDirty(isDirty);
  }, [formData, initialFormData, setIsDirty]);

  // Persian words helper only applies when the entry currency is Toman.
  const numberToPersianWord = useMemo(() => {
    if (formData.currency !== PIVOT_CURRENCY || formData.amount <= 0) return '';
    const rounded = Math.round(formData.amount);
    return Number.isSafeInteger(rounded) ? `${numberToWords(rounded)} تومان` : '';
  }, [formData.amount, formData.currency]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const dataToSubmit = { ...formData, tagIds: selectedTags.map((t) => t.id) };

    const validated = createExpenseSchema.safeParse(dataToSubmit);
    if (!validated.success) {
      showToast(validated.error.issues[0].message, 'error');
      return;
    }

    try {
      if (editingExpense) {
        await updateExpense.mutateAsync({ id: editingExpense.id, data: dataToSubmit });
        showToast('Expense updated successfully!', 'success');
      } else {
        await createExpense.mutateAsync(dataToSubmit);
        showToast('Expense added successfully!', 'success');
      }

      setFormData(defaultFormData);
      setSelectedTags([]);
      onExpenseAdded();
      if (editingExpense && onCancelEdit) onCancelEdit();
    } catch (err) {
      showToast(ensureError(err).message, 'error');
    }
  };

  const handleCancel = () => {
    setFormData(defaultFormData);
    if (onCancelEdit) onCancelEdit();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {/* Row 1: Category and Date */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4">
        <div className="space-y-1">
          <label className="text-text-secondary flex items-center gap-2 text-sm font-medium">
            <Layers className="text-text-muted h-4 w-4" />
            Category
          </label>
          <CategorySelect
            value={formData.categoryId || null}
            onChange={(id) => setFormData({ ...formData, categoryId: id ?? 0 })}
          />
        </div>

        <div className="space-y-1">
          <label className="text-text-secondary flex items-center gap-2 text-sm font-medium">
            <Calendar className="text-text-muted h-4 w-4" />
            Date
          </label>
          <DatePicker value={formData.date} onChange={(date) => setFormData({ ...formData, date })} required />
        </div>
      </div>

      {/* Description */}
      <div className="space-y-1">
        <label className="text-text-secondary flex items-center gap-2 text-sm font-medium">
          <FileText className="text-text-muted h-4 w-4" />
          Description
        </label>
        <textarea
          placeholder="Enter expense details..."
          required
          rows={2}
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="border-border-subtle bg-background text-text-primary placeholder:text-text-muted focus:border-blue w-full resize-none rounded-lg border px-3 py-2 text-sm transition-all focus:outline-none"
        />
      </div>

      {/* Tags */}
      <TagInput selectedTags={selectedTags} onTagsChange={setSelectedTags} />

      {/* Amount + Currency */}
      <div className="space-y-1">
        <label className="text-text-secondary flex items-center gap-2 text-sm font-medium">
          <Coins className="text-text-muted h-4 w-4" />
          Amount
        </label>
        <Tooltip content={numberToPersianWord} position="top">
          <MoneyInput
            amount={formData.amount}
            currency={formData.currency}
            onAmountChange={(value) => setFormData({ ...formData, amount: value })}
            onCurrencyChange={(currency) => setFormData({ ...formData, currency })}
            placeholder="e.g. 60k, 1.5m"
            required
          />
        </Tooltip>
      </div>

      {/* Buttons */}
      <div className="flex gap-3 pt-1">
        <Button type="submit" disabled={isSubmitting} variant="primary" className="flex-1">
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
              <span>Saving...</span>
            </>
          ) : (
            <>
              {!editingExpense && <Plus className="h-4 w-4 shrink-0" />}
              <span>{editingExpense ? 'Update' : 'Add'}</span>
            </>
          )}
        </Button>
        {editingExpense && (
          <Button type="button" onClick={handleCancel} variant="outline">
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
};

export default ExpenseForm;
