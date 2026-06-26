'use client';

import { useEffect, useMemo, useState } from 'react';

import { INCOME_TYPES, MONTHS } from '@constants/income';
import { numberToWords } from '@persian-tools/persian-tools';
import { Briefcase, Calendar, Coins, FileText, Loader2, Plus } from 'lucide-react';

import { createIncomeSchema } from '@schemas';

import { useCurrency } from '@features/ExchangeRate/CurrencyProvider';

import Button from '@components/Button';
import MoneyInput from '@components/MoneyInput';
import Select from '@components/Select';
import { useToast } from '@components/Toast/ToastProvider';
import Tooltip from '@components/Tooltip';

import { useCreateIncome, useUpdateIncome } from '@hooks/use-incomes';

import { ensureError, getJalaliMonthName } from '@utils';

import type { CreateIncomeInput, Income } from '@/@types/income';
import { PIVOT_CURRENCY } from '@/constants/currencies';

interface IncomeFormProps {
  onIncomeAdded: () => void;
  editingIncome?: Income;
  onCancelEdit?: () => void;
  setIsDirty?: (dirty: boolean) => void;
}

const IncomeForm = ({ onIncomeAdded, editingIncome, onCancelEdit, setIsDirty }: IncomeFormProps) => {
  const { showToast } = useToast();
  const { primaryCurrency } = useCurrency();

  const createIncome = useCreateIncome();
  const updateIncome = useUpdateIncome();

  const currentDate = new Date();

  const defaultFormData: CreateIncomeInput = useMemo(
    () => ({
      amount: 0,
      currency: primaryCurrency || PIVOT_CURRENCY,
      month: currentDate.getMonth() + 1,
      year: currentDate.getFullYear(),
      incomeType: 'salary',
      source: '',
      notes: '',
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [primaryCurrency]
  );

  const buildFormData = (income: Income): CreateIncomeInput => ({
    amount: income.amount,
    currency: income.currency,
    month: income.month,
    year: income.year,
    incomeType: income.incomeType,
    source: income.source || '',
    notes: income.notes || '',
  });

  const [formData, setFormData] = useState<CreateIncomeInput>(
    editingIncome ? buildFormData(editingIncome) : defaultFormData
  );
  const [initialFormData, setInitialFormData] = useState<CreateIncomeInput | null>(
    editingIncome ? buildFormData(editingIncome) : null
  );

  const isSubmitting = createIncome.isPending || updateIncome.isPending;

  // Sync form data when editingIncome prop changes
  const [prevEditingIncome, setPrevEditingIncome] = useState(editingIncome);
  if (prevEditingIncome !== editingIncome) {
    setPrevEditingIncome(editingIncome);
    if (editingIncome) {
      const initialData = buildFormData(editingIncome);
      setFormData(initialData);
      setInitialFormData(initialData);
    }
  }

  useEffect(() => {
    if (!initialFormData || !setIsDirty) return;

    const isDirty =
      formData.amount !== initialFormData.amount ||
      formData.currency !== initialFormData.currency ||
      formData.month !== initialFormData.month ||
      formData.year !== initialFormData.year ||
      formData.incomeType !== initialFormData.incomeType ||
      formData.source !== initialFormData.source ||
      formData.notes !== initialFormData.notes;

    setIsDirty(isDirty);
  }, [formData, initialFormData, setIsDirty]);

  const numberToPersianWord = useMemo(() => {
    if (formData.currency !== PIVOT_CURRENCY || formData.amount <= 0) return '';
    const rounded = Math.round(formData.amount);
    return Number.isSafeInteger(rounded) ? `${numberToWords(rounded)} تومان` : '';
  }, [formData.amount, formData.currency]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validated = createIncomeSchema.safeParse(formData);
    if (!validated.success) {
      showToast(validated.error.issues[0].message, 'error');
      return;
    }

    try {
      if (editingIncome) {
        await updateIncome.mutateAsync({ id: editingIncome.id, data: formData });
        showToast('Income updated successfully!', 'success');
      } else {
        await createIncome.mutateAsync(formData);
        showToast('Income added successfully!', 'success');
      }

      setFormData(defaultFormData);
      onIncomeAdded();
      if (editingIncome && onCancelEdit) onCancelEdit();
    } catch (err) {
      showToast(ensureError(err).message, 'error');
    }
  };

  const handleCancel = () => {
    setFormData(defaultFormData);
    if (onCancelEdit) onCancelEdit();
  };

  // Generate year options (current year - 5 to current year + 1)
  const yearOptions = [];
  for (let y = currentDate.getFullYear() + 1; y >= currentDate.getFullYear() - 5; y--) {
    yearOptions.push(y);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {/* Row 1: Income Type, Month, Year */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
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

        <div className="space-y-1">
          <label className="text-text-secondary flex items-center gap-2 text-sm font-medium">
            <Calendar className="text-text-muted h-4 w-4" />
            Year
          </label>
          <Select
            value={String(formData.year)}
            onChange={(val) => setFormData({ ...formData, year: parseInt(val, 10) })}
            options={yearOptions.map((year) => ({ value: String(year), label: String(year) }))}
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
            placeholder="e.g. 390m, 4.5b"
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
              {!editingIncome && <Plus className="h-4 w-4 shrink-0" />}
              <span>{editingIncome ? 'Update' : 'Add'}</span>
            </>
          )}
        </Button>
        {editingIncome && (
          <Button type="button" onClick={handleCancel} variant="outline">
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
};

export default IncomeForm;
