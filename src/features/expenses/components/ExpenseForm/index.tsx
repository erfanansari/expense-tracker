'use client';

import { useEffect, useMemo, useState } from 'react';

import { numberToWords } from '@persian-tools/persian-tools';
import { Calendar, ChevronDown, DollarSign, FileText, Layers, Loader2, Plus, Save, X } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

import { tomanToUsd, usdToToman } from '@features/ExchangeRate/utils/currency-conversion';

import Button from '@components/Button';
import { useToast } from '@components/Toast/ToastProvider';
import Tooltip from '@components/Tooltip';

import { type CreateExpenseInput, type Tag } from '@/@types/expense';
import { EXPENSE_CATEGORIES } from '@/constants';
import { useExchangeRate } from '@/hooks/use-exchange-rate';
import { useCreateExpense, useUpdateExpense } from '@/hooks/use-expenses';

import TagInput from '../TagInput';

interface ExpenseFormProps {
  onExpenseAdded: () => void;
  editingExpense?: { id: number; tags?: Tag[] } & CreateExpenseInput;
  onCancelEdit?: () => void;
  setIsDirty?: (dirty: boolean) => void;
}

const ExpenseForm = ({ onExpenseAdded, editingExpense, onCancelEdit, setIsDirty }: ExpenseFormProps) => {
  const { showToast } = useToast();
  const { data: rateData, isLoading: isFetchingRate } = useExchangeRate();
  const createExpense = useCreateExpense();
  const updateExpense = useUpdateExpense();

  const fetchedRate = rateData?.usd ? parseInt(rateData.usd.value, 10) : 0;

  // Derive editing rate from existing expense prices
  const editingRate =
    editingExpense?.price_toman && editingExpense?.price_usd
      ? Math.round(editingExpense.price_toman / editingExpense.price_usd)
      : null;

  // User-overridden exchange rate; null means "use default"
  const [userRate, setUserRate] = useState<number | null>(null);

  // Derived exchange rate: user override > editing expense rate > fetched rate
  const exchangeRate = userRate ?? editingRate ?? fetchedRate;

  const defaultFormData: CreateExpenseInput = {
    date: new Date().toISOString().split('T')[0],
    category: '',
    description: '',
    price_toman: 0,
    price_usd: 0,
    tagIds: [],
  };

  const buildFormData = (expense: {
    date: string;
    category: string;
    description: string;
    price_toman: number;
    price_usd: number;
    tags?: Tag[];
  }): CreateExpenseInput => ({
    date: expense.date,
    category: expense.category,
    description: expense.description,
    price_toman: expense.price_toman,
    price_usd: expense.price_usd,
    tagIds: expense.tags?.map((t) => t.id) || [],
  });

  const [formData, setFormData] = useState<CreateExpenseInput>(
    editingExpense ? buildFormData(editingExpense) : defaultFormData
  );
  const [selectedTags, setSelectedTags] = useState<Tag[]>(editingExpense?.tags || []);
  const [lastChanged, setLastChanged] = useState<'toman' | 'usd'>('toman');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
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
    setUserRate(null);
  }

  // Render-time: capture initialFormData once when rate is ready (for new expenses)
  if (!editingExpense && exchangeRate > 0 && !initialDataCaptured) {
    setInitialDataCaptured(true);
    setInitialFormData(defaultFormData);
  }

  // Track form changes and update dirty state
  useEffect(() => {
    if (!initialFormData || !setIsDirty) return;

    const tagIdsChanged =
      (formData.tagIds?.length || 0) !== (initialFormData.tagIds?.length || 0) ||
      (formData.tagIds || []).some((id, idx) => id !== initialFormData.tagIds?.[idx]);

    const isDirty =
      formData.date !== initialFormData.date ||
      formData.category !== initialFormData.category ||
      formData.description !== initialFormData.description ||
      formData.price_toman !== initialFormData.price_toman ||
      formData.price_usd !== initialFormData.price_usd ||
      tagIdsChanged;

    setIsDirty(isDirty);
  }, [formData, initialFormData, setIsDirty]);

  const numberToPersianWord = useMemo(
    () => (formData.price_toman > 0 ? `${numberToWords(formData.price_toman)} تومان` : ''),
    [formData.price_toman]
  );

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
    setMessage(null);

    const dataToSubmit = {
      ...formData,
      tagIds: selectedTags.map((t) => t.id),
    };

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
      setUserRate(null);
      onExpenseAdded();
      if (editingExpense && onCancelEdit) {
        onCancelEdit();
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save expense';
      showToast(errorMessage, 'error');
      setMessage({ type: 'error', text: errorMessage });
    }
  };

  const handleCancel = () => {
    setFormData(defaultFormData);
    if (onCancelEdit) {
      onCancelEdit();
    }
  };

  return (
    <div className="border-border-subtle bg-background relative rounded-xl border p-6 shadow-sm">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="border-border-subtle bg-background-secondary rounded-lg border p-2.5">
            {editingExpense ? (
              <Save className="text-text-secondary h-5 w-5" />
            ) : (
              <Plus className="text-text-secondary h-5 w-5" />
            )}
          </div>
          <div>
            <h2 className="text-text-primary text-lg font-semibold">
              {editingExpense ? 'Edit Expense' : 'Add New Expense'}
            </h2>
            <p className="text-text-muted text-sm" dir="rtl">
              {editingExpense ? 'ویرایش هزینه' : 'افزودن هزینه جدید'}
            </p>
          </div>
        </div>
        {editingExpense && (
          <button
            onClick={handleCancel}
            className="text-text-muted hover:bg-background-elevated hover:text-text-primary rounded-lg p-2 transition-all"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Message */}
      {message && (
        <div
          className={twMerge(
            'mb-6 rounded-lg border p-4',
            message.type === 'success'
              ? 'border-success bg-success-light text-success'
              : 'border-danger bg-danger-light text-danger'
          )}
        >
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Row 1: Category and Date */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-8">
          {/* Category */}
          <div className="space-y-2">
            <label className="text-text-secondary flex items-center gap-2 text-sm font-medium">
              <Layers className="text-text-muted h-4 w-4" />
              Category / دسته‌بندی
            </label>
            <div className="relative">
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                required
                className="border-border-subtle bg-background text-text-primary focus:border-blue w-full cursor-pointer appearance-none rounded-lg border px-4 py-3 pr-10 transition-all focus:outline-none"
              >
                <option value="" className="bg-background">
                  Select category...
                </option>
                {EXPENSE_CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value} className="bg-background">
                    {cat.label} / {cat.labelFa}
                  </option>
                ))}
              </select>
              <ChevronDown className="text-text-muted pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2" />
            </div>
          </div>

          {/* Date */}
          <div className="space-y-2">
            <label className="text-text-secondary flex items-center gap-2 text-sm font-medium">
              <Calendar className="text-text-muted h-4 w-4" />
              Date / تاریخ
            </label>
            <input
              type="date"
              required
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="border-border-subtle bg-background text-text-primary focus:border-blue w-full rounded-lg border px-4 py-3 transition-all focus:outline-none"
            />
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label className="text-text-secondary flex items-center gap-2 text-sm font-medium">
            <FileText className="text-text-muted h-4 w-4" />
            Description / توضیحات
          </label>
          <textarea
            placeholder="Enter expense details..."
            required
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="border-border-subtle bg-background text-text-primary placeholder:text-text-muted focus:border-blue w-full resize-none rounded-lg border px-4 py-3 transition-all focus:outline-none"
          />
        </div>

        {/* Tags */}
        <div className="space-y-2">
          <label className="text-text-secondary flex items-center gap-2 text-sm font-medium">
            <span className="text-text-muted">#</span>
            Tags / برچسب‌ها
          </label>
          <TagInput selectedTags={selectedTags} onTagsChange={setSelectedTags} />
        </div>

        {/* Prices - 2 columns */}
        <div className="grid grid-cols-1 gap-5">
          {/* Toman */}
          <div className="space-y-2">
            <label className="text-text-secondary flex items-center gap-2 text-sm font-medium">
              <span className="text-success font-bold">T</span>
              Price (Toman) / مبلغ (تومان)
            </label>
            <Tooltip content={numberToPersianWord} position="top">
              <input
                type="number"
                placeholder="60000"
                required
                min="0"
                step="1"
                value={formData.price_toman || ''}
                onChange={(e) => handleTomanChange(parseFloat(e.target.value) || 0)}
                className="border-border-subtle bg-background text-text-primary placeholder:text-text-muted focus:border-success w-full rounded-lg border px-4 py-3 transition-all focus:outline-none"
              />
            </Tooltip>
          </div>

          {/* USD */}
          <div className="space-y-2">
            <label className="text-text-secondary flex items-center gap-2 text-sm font-medium">
              <DollarSign className="text-blue h-4 w-4" />
              Price (USD) / مبلغ (دلار)
            </label>
            <input
              type="number"
              placeholder="0.00"
              required
              min="0"
              step="0.01"
              value={formData.price_usd || ''}
              onChange={(e) => handleUsdChange(parseFloat(e.target.value) || 0)}
              className="border-border-subtle bg-background text-text-primary placeholder:text-text-muted focus:border-blue w-full rounded-lg border px-4 py-3 transition-all focus:outline-none"
            />
          </div>
        </div>

        {/* Exchange Rate - separate row */}
        <div className="space-y-2">
          <label className="text-text-secondary flex items-center gap-2 text-sm font-medium">
            <span className="text-text-muted">↔</span>
            Rate (Toman/USD) / نرخ
            {isFetchingRate && <Loader2 className="text-text-muted h-3 w-3 animate-spin" />}
          </label>
          <input
            type="number"
            placeholder="130100"
            required
            min="1"
            step="1"
            value={exchangeRate || ''}
            onChange={(e) => handleRateChange(parseFloat(e.target.value) || exchangeRate)}
            disabled={isFetchingRate}
            className="border-border-subtle bg-background text-text-primary placeholder:text-text-muted focus:border-blue w-full rounded-lg border px-4 py-3 transition-all focus:outline-none disabled:cursor-wait disabled:opacity-50"
          />
        </div>

        {/* Buttons */}
        <div className="flex gap-3 pt-2">
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
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading rate...
                  </>
                );
              }
              if (isSubmitting) {
                return (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                );
              }
              return (
                <>
                  {editingExpense ? <Save className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                  {editingExpense ? 'Update / بروزرسانی' : 'Add / افزودن'}
                </>
              );
            })()}
          </Button>
          {editingExpense && (
            <Button type="button" onClick={handleCancel} variant="outline">
              Cancel / لغو
            </Button>
          )}
        </div>
      </form>
    </div>
  );
};

export default ExpenseForm;
