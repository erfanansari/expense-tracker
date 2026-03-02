'use client';

import { useEffect, useState } from 'react';

import { numberToWords } from '@persian-tools/persian-tools';
import { Briefcase, Calendar, DollarSign, FileText, Loader2, Plus, Save } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

import { tomanToUsd, usdToToman } from '@features/ExchangeRate/utils/currency-conversion';

import Button from '@components/Button';
import Select from '@components/Select';
import { useToast } from '@components/Toast/ToastProvider';
import Tooltip from '@components/Tooltip';

import type { CreateIncomeInput, Income } from '@/@types/income';
import { INCOME_TYPES, MONTHS } from '@/constants/income';
import { useExchangeRate } from '@/hooks/use-exchange-rate';
import { useCreateIncome, useUpdateIncome } from '@/hooks/use-incomes';
import { getJalaliMonthName } from '@/utils';

interface IncomeFormProps {
  onIncomeAdded: () => void;
  editingIncome?: Income;
  onCancelEdit?: () => void;
  setIsDirty?: (dirty: boolean) => void;
}

const IncomeForm = ({ onIncomeAdded, editingIncome, onCancelEdit, setIsDirty }: IncomeFormProps) => {
  const { showToast } = useToast();
  const { data: rateData, isLoading: isFetchingRate } = useExchangeRate();
  const createIncome = useCreateIncome();
  const updateIncome = useUpdateIncome();

  const fetchedRate = rateData?.usd ? parseInt(rateData.usd.value, 10) : 0;

  // User-overridden exchange rate; null means "use default"
  const [userRate, setUserRate] = useState<number | null>(null);

  // Derived exchange rate: user override > editing income rate > fetched rate
  const exchangeRate = userRate ?? editingIncome?.exchangeRateUsed ?? fetchedRate;

  const currentDate = new Date();

  const defaultFormData: CreateIncomeInput = {
    amountUsd: 0,
    amountToman: 0,
    exchangeRateUsed: 0,
    month: currentDate.getMonth() + 1,
    year: currentDate.getFullYear(),
    incomeType: 'salary',
    source: '',
    notes: '',
  };

  const buildFormData = (income: Income): CreateIncomeInput => ({
    amountUsd: income.amountUsd,
    amountToman: income.amountToman,
    exchangeRateUsed: income.exchangeRateUsed,
    month: income.month,
    year: income.year,
    incomeType: income.incomeType,
    source: income.source || '',
    notes: income.notes || '',
  });

  const [formData, setFormData] = useState<CreateIncomeInput>(
    editingIncome ? buildFormData(editingIncome) : defaultFormData
  );
  const [lastChanged, setLastChanged] = useState<'toman' | 'usd'>('usd');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [initialFormData, setInitialFormData] = useState<CreateIncomeInput | null>(
    editingIncome ? buildFormData(editingIncome) : null
  );
  const [initialDataCaptured, setInitialDataCaptured] = useState(!!editingIncome);

  const isSubmitting = createIncome.isPending || updateIncome.isPending;

  // Render-time: sync form data when editingIncome prop changes
  const [prevEditingIncome, setPrevEditingIncome] = useState(editingIncome);
  if (prevEditingIncome !== editingIncome) {
    setPrevEditingIncome(editingIncome);
    if (editingIncome) {
      const initialData = buildFormData(editingIncome);
      setFormData(initialData);
      setInitialFormData(initialData);
    }
    setUserRate(null);
  }

  // Render-time: capture initialFormData once when rate is ready (for new incomes)
  if (!editingIncome && exchangeRate > 0 && !initialDataCaptured) {
    setInitialDataCaptured(true);
    setInitialFormData({ ...defaultFormData, exchangeRateUsed: exchangeRate });
  }

  // Track form changes and update dirty state
  useEffect(() => {
    if (!initialFormData || !setIsDirty) return;

    const isDirty =
      formData.amountUsd !== initialFormData.amountUsd ||
      formData.amountToman !== initialFormData.amountToman ||
      formData.month !== initialFormData.month ||
      formData.year !== initialFormData.year ||
      formData.incomeType !== initialFormData.incomeType ||
      formData.source !== initialFormData.source ||
      formData.notes !== initialFormData.notes ||
      exchangeRate !== initialFormData.exchangeRateUsed;

    setIsDirty(isDirty);
  }, [formData, exchangeRate, initialFormData, setIsDirty]);

  const numberToPersianWord = formData.amountToman > 0 ? `${numberToWords(formData.amountToman)} تومان` : '';

  const handleTomanChange = (value: number) => {
    setFormData({
      ...formData,
      amountToman: value,
      amountUsd: tomanToUsd(value, exchangeRate),
    });
    setLastChanged('toman');
  };

  const handleUsdChange = (value: number) => {
    setFormData({
      ...formData,
      amountUsd: value,
      amountToman: usdToToman(value, exchangeRate),
    });
    setLastChanged('usd');
  };

  const handleRateChange = (value: number) => {
    setUserRate(value);
    setFormData((prev) => ({
      ...prev,
      exchangeRateUsed: value,
      ...(lastChanged === 'toman'
        ? { amountUsd: tomanToUsd(prev.amountToman, value) }
        : { amountToman: usdToToman(prev.amountUsd, value) }),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    const dataToSubmit = {
      ...formData,
      exchangeRateUsed: exchangeRate,
    };

    try {
      if (editingIncome) {
        await updateIncome.mutateAsync({ id: editingIncome.id, data: dataToSubmit });
        showToast('Income updated successfully!', 'success');
      } else {
        await createIncome.mutateAsync(dataToSubmit);
        showToast('Income added successfully!', 'success');
      }

      setFormData({ ...defaultFormData, exchangeRateUsed: exchangeRate });
      setUserRate(null);
      onIncomeAdded();
      if (editingIncome && onCancelEdit) {
        onCancelEdit();
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save income';
      showToast(errorMessage, 'error');
      setMessage({ type: 'error', text: errorMessage });
    }
  };

  const handleCancel = () => {
    setFormData({ ...defaultFormData, exchangeRateUsed: exchangeRate });
    if (onCancelEdit) {
      onCancelEdit();
    }
  };

  // Generate year options (current year - 5 to current year + 1)
  const yearOptions = [];
  for (let y = currentDate.getFullYear() + 1; y >= currentDate.getFullYear() - 5; y--) {
    yearOptions.push(y);
  }

  return (
    <>
      {/* Message */}
      {message && (
        <div
          className={twMerge(
            'mb-4 rounded-lg border p-3 text-sm',
            message.type === 'success'
              ? 'border-success bg-success-light text-success'
              : 'border-danger bg-danger-light text-danger'
          )}
        >
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Row 1: Income Type, Month, Year */}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {/* Income Type */}
          <div className="space-y-1">
            <label className="text-text-secondary flex items-center gap-2 text-sm font-medium">
              <Briefcase className="text-text-muted h-4 w-4" />
              Type
            </label>
            <Select
              value={formData.incomeType}
              onChange={(val) => setFormData({ ...formData, incomeType: val as CreateIncomeInput['incomeType'] })}
              options={INCOME_TYPES.map((type) => ({ value: type.value, label: type.label }))}
              required
            />
          </div>

          {/* Month */}
          <div className="space-y-1">
            <label className="text-text-secondary flex items-center gap-2 text-sm font-medium">
              <Calendar className="text-text-muted h-4 w-4" />
              Month
            </label>
            <Select
              value={String(formData.month)}
              onChange={(val) => setFormData({ ...formData, month: parseInt(val, 10) })}
              options={MONTHS.map((month) => ({
                value: String(month.value),
                label: `${month.label} / ${getJalaliMonthName(month.value, formData.year)}`,
              }))}
              required
            />
          </div>

          {/* Year */}
          <div className="space-y-1">
            <label className="text-text-secondary flex items-center gap-2 text-sm font-medium">
              <Calendar className="text-text-muted h-4 w-4" />
              Year
            </label>
            <Select
              value={String(formData.year)}
              onChange={(val) => setFormData({ ...formData, year: parseInt(val, 10) })}
              options={yearOptions.map((year) => ({
                value: String(year),
                label: String(year),
              }))}
              required
            />
          </div>
        </div>

        {/* Source */}
        <div className="space-y-1">
          <label className="text-text-secondary flex items-center gap-2 text-sm font-medium">
            <Briefcase className="text-text-muted h-4 w-4" />
            Source (Optional)
          </label>
          <input
            type="text"
            placeholder="e.g., Company Name, Client..."
            value={formData.source}
            onChange={(e) => setFormData({ ...formData, source: e.target.value })}
            className="border-border-subtle bg-background text-text-primary placeholder:text-text-muted focus:border-blue w-full rounded-lg border px-3 py-2 text-sm transition-all focus:outline-none"
          />
        </div>

        {/* Notes */}
        <div className="space-y-1">
          <label className="text-text-secondary flex items-center gap-2 text-sm font-medium">
            <FileText className="text-text-muted h-4 w-4" />
            Notes (Optional)
          </label>
          <textarea
            placeholder="Any additional notes..."
            rows={2}
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            className="border-border-subtle bg-background text-text-primary placeholder:text-text-muted focus:border-blue w-full resize-none rounded-lg border px-3 py-2 text-sm transition-all focus:outline-none"
          />
        </div>

        {/* Amounts */}
        <div className="grid grid-cols-1 gap-3">
          {/* Toman */}
          <div className="space-y-1">
            <label className="text-text-secondary flex items-center gap-2 text-sm font-medium">
              <span className="text-success font-bold">T</span>
              Amount (Toman)
            </label>
            <Tooltip content={numberToPersianWord} position="top">
              <input
                type="number"
                placeholder="390000000"
                required
                min="0"
                step="1"
                value={formData.amountToman || ''}
                onChange={(e) => handleTomanChange(parseFloat(e.target.value) || 0)}
                className="border-border-subtle bg-background text-text-primary placeholder:text-text-muted focus:border-success w-full rounded-lg border px-3 py-2 text-sm transition-all focus:outline-none"
              />
            </Tooltip>
          </div>

          {/* USD */}
          <div className="space-y-1">
            <label className="text-text-secondary flex items-center gap-2 text-sm font-medium">
              <DollarSign className="text-blue h-4 w-4" />
              Amount (USD)
            </label>
            <input
              type="number"
              placeholder="3000"
              required
              min="0"
              step="0.01"
              value={formData.amountUsd || ''}
              onChange={(e) => handleUsdChange(parseFloat(e.target.value) || 0)}
              className="border-border-subtle bg-background text-text-primary placeholder:text-text-muted focus:border-blue w-full rounded-lg border px-3 py-2 text-sm transition-all focus:outline-none"
            />
          </div>
        </div>

        {/* Exchange Rate */}
        <div className="space-y-1">
          <label className="text-text-secondary flex items-center gap-2 text-sm font-medium">
            <span className="text-text-muted">↔</span>
            Exchange Rate
            {isFetchingRate && <Loader2 className="text-text-muted h-3 w-3 animate-spin" />}
          </label>
          <input
            type="number"
            placeholder="130000"
            required
            min="1"
            step="1"
            value={exchangeRate || ''}
            onChange={(e) => handleRateChange(parseFloat(e.target.value) || exchangeRate)}
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
                  {editingIncome ? <Save className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                  {editingIncome ? 'Update' : 'Add'}
                </>
              );
            })()}
          </Button>
          {editingIncome && (
            <Button type="button" onClick={handleCancel} variant="outline">
              Cancel
            </Button>
          )}
        </div>
      </form>
    </>
  );
};

export default IncomeForm;
