'use client';

import { useEffect, useMemo, useState } from 'react';

import { numberToWords } from '@persian-tools/persian-tools';
import { Calendar, DollarSign, FileText, Layers, Loader2, Plus } from 'lucide-react';

import { createExpenseSchema } from '@schemas';

import { tomanToUsd, usdToToman } from '@features/ExchangeRate/utils/currency-conversion';

import AmountInput from '@components/AmountInput';
import Button from '@components/Button';
import DatePicker from '@components/DatePicker';
import { useToast } from '@components/Toast/ToastProvider';
import Tooltip from '@components/Tooltip';

import { useExchangeRateForm } from '@hooks/use-exchange-rate-form';
import { useCreateExpense, useUpdateExpense } from '@hooks/use-expenses';

import { ensureError } from '@utils';

import { type Category, type CreateExpenseInput, type Tag } from '@/@types/expense';

import CategorySelect from '../CategorySelect';
import TagInput from '../TagInput';

interface ExpenseFormProps {
  onExpenseAdded: () => void;
  /**
   * The editing expense. Note: `category` is the full Category object (from
   * GET /api/expenses), while the form's local `formData` carries just the id.
   */
  editingExpense?: {
    id: number;
    date: string;
    category: Category;
    description: string;
    price_toman: number;
    price_usd: number;
    tags?: Tag[];
  };
  onCancelEdit?: () => void;
  setIsDirty?: (dirty: boolean) => void;
}

const ExpenseForm = ({ onExpenseAdded, editingExpense, onCancelEdit, setIsDirty }: ExpenseFormProps) => {
  // Customs
  const { showToast } = useToast();

  // Mutations
  const createExpense = useCreateExpense();
  const updateExpense = useUpdateExpense();

  // Variables
  const editingRate =
    editingExpense?.price_toman && editingExpense?.price_usd
      ? Math.round(editingExpense.price_toman / editingExpense.price_usd)
      : null;

  const { exchangeRate, isFetchingRate, setUserRate, resetUserRate } = useExchangeRateForm({
    editingRate,
  });

  const defaultFormData: CreateExpenseInput = {
    date: new Date().toISOString().split('T')[0],
    categoryId: 0,
    description: '',
    price_toman: 0,
    price_usd: 0,
    tagIds: [],
  };

  const buildFormData = (expense: {
    date: string;
    category: Category;
    description: string;
    price_toman: number;
    price_usd: number;
    tags?: Tag[];
  }): CreateExpenseInput => ({
    date: expense.date,
    categoryId: expense.category.id,
    description: expense.description,
    price_toman: expense.price_toman,
    price_usd: expense.price_usd,
    tagIds: expense.tags?.map((t) => t.id) || [],
  });

  // States
  const [formData, setFormData] = useState<CreateExpenseInput>(
    editingExpense ? buildFormData(editingExpense) : defaultFormData
  );
  const [selectedTags, setSelectedTags] = useState<Tag[]>(editingExpense?.tags || []);
  const [lastChanged, setLastChanged] = useState<'toman' | 'usd'>('toman');
  const [initialFormData, setInitialFormData] = useState<CreateExpenseInput | null>(
    editingExpense ? buildFormData(editingExpense) : null
  );
  const [initialDataCaptured, setInitialDataCaptured] = useState(!!editingExpense);

  const isSubmitting = createExpense.isPending || updateExpense.isPending;

  // Render-time: sync form data when editingExpense prop changes
  const [prevEditingExpense, setPrevEditingExpense] = useState(editingExpense);
  if (prevEditingExpense !== editingExpense) {
    setPrevEditingExpense(editingExpense);
    if (editingExpense) {
      const initialData = buildFormData(editingExpense);
      setFormData(initialData);
      setInitialFormData(initialData);
      setSelectedTags(editingExpense.tags || []);
    }
    resetUserRate();
  }

  // Render-time: capture initialFormData once when rate is ready (for new expenses)
  if (!editingExpense && exchangeRate > 0 && !initialDataCaptured) {
    setInitialDataCaptured(true);
    setInitialFormData(defaultFormData);
  }

  // Effects
  useEffect(() => {
    if (!initialFormData || !setIsDirty) return;

    const tagIdsChanged =
      (formData.tagIds?.length || 0) !== (initialFormData.tagIds?.length || 0) ||
      (formData.tagIds || []).some((id, idx) => id !== initialFormData.tagIds?.[idx]);

    const isDirty =
      formData.date !== initialFormData.date ||
      formData.categoryId !== initialFormData.categoryId ||
      formData.description !== initialFormData.description ||
      formData.price_toman !== initialFormData.price_toman ||
      formData.price_usd !== initialFormData.price_usd ||
      tagIdsChanged;

    setIsDirty(isDirty);
  }, [formData, initialFormData, setIsDirty]);

  // Memos
  const numberToPersianWord = useMemo(() => {
    if (formData.price_toman <= 0) return '';
    // Toman has no fractional sub-unit; numberToWords also requires a safe integer.
    const rounded = Math.round(formData.price_toman);
    return Number.isSafeInteger(rounded) ? `${numberToWords(rounded)} تومان` : '';
  }, [formData.price_toman]);

  const handleTomanChange = (value: number) => {
    setFormData({
      ...formData,
      price_toman: value,
      price_usd: tomanToUsd(value, exchangeRate),
    });
    setLastChanged('toman');
  };

  const handleUsdChange = (value: number) => {
    setFormData({
      ...formData,
      price_usd: value,
      price_toman: usdToToman(value, exchangeRate),
    });
    setLastChanged('usd');
  };

  const handleRateChange = (value: number) => {
    setUserRate(value);
    if (lastChanged === 'toman') {
      setFormData({
        ...formData,
        price_usd: tomanToUsd(formData.price_toman, value),
      });
    } else {
      setFormData({
        ...formData,
        price_toman: usdToToman(formData.price_usd, value),
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const dataToSubmit = {
      ...formData,
      tagIds: selectedTags.map((t) => t.id),
    };

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
      resetUserRate();
      onExpenseAdded();
      if (editingExpense && onCancelEdit) {
        onCancelEdit();
      }
    } catch (err) {
      showToast(ensureError(err).message, 'error');
    }
  };

  const handleCancel = () => {
    setFormData(defaultFormData);
    if (onCancelEdit) {
      onCancelEdit();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {/* Row 1: Category and Date */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4">
        {/* Category */}
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

        {/* Date */}
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

      {/* Prices */}
      <div className="grid grid-cols-1 gap-3">
        {/* Toman */}
        <div className="space-y-1">
          <label className="text-text-secondary flex items-center gap-2 text-sm font-medium">
            <span className="text-success font-bold">T</span>
            Price (Toman)
          </label>
          <Tooltip content={numberToPersianWord} position="top">
            <AmountInput
              placeholder="e.g. 60k, 1.5m"
              required
              value={formData.price_toman}
              onChange={handleTomanChange}
              className="border-border-subtle bg-background text-text-primary placeholder:text-text-muted focus:border-success w-full rounded-lg border px-3 py-2 text-sm transition-all focus:outline-none"
            />
          </Tooltip>
        </div>

        {/* USD */}
        <div className="space-y-1">
          <label className="text-text-secondary flex items-center gap-2 text-sm font-medium">
            <DollarSign className="text-blue h-4 w-4" />
            Price (USD)
          </label>
          <AmountInput
            placeholder="e.g. 3.2k, 1m"
            required
            value={formData.price_usd}
            onChange={handleUsdChange}
            className="border-border-subtle bg-background text-text-primary placeholder:text-text-muted focus:border-blue w-full rounded-lg border px-3 py-2 text-sm transition-all focus:outline-none"
          />
        </div>
      </div>

      {/* Exchange Rate */}
      <div className="space-y-1">
        <label className="text-text-secondary flex items-center gap-2 text-sm font-medium">
          <span className="text-text-muted">↔</span>
          Rate (Toman/USD)
          {isFetchingRate && <Loader2 className="text-text-muted h-3 w-3 animate-spin" />}
        </label>
        <AmountInput
          placeholder="e.g. 130k"
          required
          value={exchangeRate}
          onChange={(v) => handleRateChange(v || exchangeRate)}
          disabled={isFetchingRate}
          className="border-border-subtle bg-background text-text-primary placeholder:text-text-muted focus:border-blue w-full rounded-lg border px-3 py-2 text-sm transition-all focus:outline-none disabled:cursor-wait disabled:opacity-50"
        />
      </div>

      {/* Buttons */}
      <div className="flex gap-3 pt-1">
        <Button
          type="submit"
          disabled={isSubmitting || isFetchingRate || !exchangeRate}
          variant="primary"
          className="flex-1"
        >
          {(() => {
            if (isFetchingRate) {
              return (
                <>
                  <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
                  <span>Loading rate...</span>
                </>
              );
            }
            if (isSubmitting) {
              return (
                <>
                  <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
                  <span>Saving...</span>
                </>
              );
            }
            return (
              <>
                {!editingExpense && <Plus className="h-4 w-4 shrink-0" />}
                <span>{editingExpense ? 'Update' : 'Add'}</span>
              </>
            );
          })()}
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
