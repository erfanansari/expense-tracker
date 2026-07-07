'use client';

import { useEffect, useMemo } from 'react';

import { createIncomeKeyGenerator } from '@api/createIncomeMutation';
import { INCOMES_SCOPE } from '@api/getIncomeListQuery';
import { SUMMARY_SCOPE } from '@api/getSummaryQuery';
import { updateIncomeKeyGenerator } from '@api/updateIncomeMutation';
import type { UpdateIncomeRequestData } from '@api/updateIncomeMutation';
import { PIVOT_CURRENCY } from '@constants/currencies';
import { INCOME_TYPES, MONTHS } from '@constants/income';
import { zodResolver } from '@hookform/resolvers/zod';
import { numberToWords } from '@persian-tools/persian-tools';
import type { QueryClient } from '@tanstack/react-query';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Briefcase, Calendar, Coins, FileText, Loader2, Plus } from 'lucide-react';
import { useForm } from 'react-hook-form';

import type { Income } from '@types';

import { createIncomeSchema } from '@schemas';
import type { CreateIncomeSchema } from '@schemas';

import Button from '@components/Button';
import Form from '@components/Form';
import FormMoneyInput from '@components/Form/components/FormMoneyInput';
import FormSelect from '@components/Form/components/FormSelect';
import Tooltip from '@components/Tooltip';

import { useCurrency } from '@hooks/use-currency';

import { useToast } from '@stores/toast';

import { ensureError, getJalaliMonthName } from '@utils';

import type { IncomeFormProps } from './@types';

const invalidateIncomeData = (queryClient: QueryClient) =>
  Promise.all([
    queryClient.invalidateQueries({ queryKey: INCOMES_SCOPE }),
    queryClient.invalidateQueries({ queryKey: SUMMARY_SCOPE }),
  ]);

const buildFormData = (income: Income): CreateIncomeSchema => ({
  amount: income.amount,
  currency: income.currency,
  month: income.month,
  year: income.year,
  incomeType: income.incomeType,
  source: income.source || '',
  notes: income.notes || '',
});

const IncomeForm = ({ onIncomeAdded, editingIncome, onCancelEdit, setIsDirty }: IncomeFormProps) => {
  // Customs
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const { primaryCurrency } = useCurrency();

  const currentDate = new Date();

  // Variables
  const defaultFormData: CreateIncomeSchema = useMemo(
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

  // Forms
  const methods = useForm<CreateIncomeSchema>({
    resolver: zodResolver(createIncomeSchema),
    defaultValues: editingIncome ? buildFormData(editingIncome) : defaultFormData,
    mode: 'all',
  });

  const { formState, reset, watch } = methods;
  const amount = watch('amount');
  const currency = watch('currency');
  const year = watch('year');

  // Mutations
  const createMutation = useMutation<unknown, Error, CreateIncomeSchema>({
    mutationKey: createIncomeKeyGenerator(),
  });
  const updateMutation = useMutation<unknown, Error, UpdateIncomeRequestData>({
    mutationKey: updateIncomeKeyGenerator(),
  });

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  // Effects — resync when the drawer switches to a different income entry.
  useEffect(() => {
    if (editingIncome) reset(buildFormData(editingIncome));
  }, [editingIncome, reset]);

  useEffect(() => {
    setIsDirty?.(formState.isDirty);
  }, [formState.isDirty, setIsDirty]);

  const numberToPersianWord = useMemo(() => {
    if (currency !== PIVOT_CURRENCY || amount <= 0) return '';
    const rounded = Math.round(amount);
    return Number.isSafeInteger(rounded) ? `${numberToWords(rounded)} تومان` : '';
  }, [amount, currency]);

  const handleSubmit = async (data: CreateIncomeSchema) => {
    try {
      if (editingIncome) {
        await updateMutation.mutateAsync({ id: editingIncome.id, ...data });
        await invalidateIncomeData(queryClient);
        showToast('Income updated successfully!', 'success');
      } else {
        await createMutation.mutateAsync(data);
        await invalidateIncomeData(queryClient);
        showToast('Income added successfully!', 'success');
      }

      reset(defaultFormData);
      onIncomeAdded();
      if (editingIncome && onCancelEdit) onCancelEdit();
    } catch (err) {
      showToast(ensureError(err).message, 'error');
    }
  };

  const handleCancel = () => {
    reset(defaultFormData);
    if (onCancelEdit) onCancelEdit();
  };

  // Generate year options (current year - 5 to current year + 1)
  const yearOptions = [];
  for (let y = currentDate.getFullYear() + 1; y >= currentDate.getFullYear() - 5; y--) {
    yearOptions.push(y);
  }

  return (
    <Form methods={methods} onSubmit={handleSubmit} className="space-y-3">
      {/* Row 1: Income Type, Month, Year */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <div className="space-y-1">
          <label className="text-text-secondary flex items-center gap-2 text-sm font-medium">
            <Briefcase className="text-text-muted h-4 w-4" />
            Type
          </label>
          <FormSelect
            name="incomeType"
            options={INCOME_TYPES.map((type) => ({ value: type.value, label: type.label }))}
          />
        </div>

        <div className="space-y-1">
          <label className="text-text-secondary flex items-center gap-2 text-sm font-medium">
            <Calendar className="text-text-muted h-4 w-4" />
            Month
          </label>
          <FormSelect
            name="month"
            valueAsNumber
            options={MONTHS.map((month) => ({
              value: String(month.value),
              label: `${month.label} / ${getJalaliMonthName(month.value, year)}`,
            }))}
          />
        </div>

        <div className="space-y-1">
          <label className="text-text-secondary flex items-center gap-2 text-sm font-medium">
            <Calendar className="text-text-muted h-4 w-4" />
            Year
          </label>
          <FormSelect
            name="year"
            valueAsNumber
            options={yearOptions.map((yearOption) => ({ value: String(yearOption), label: String(yearOption) }))}
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
          {...methods.register('source')}
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
          {...methods.register('notes')}
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
          <FormMoneyInput amountName="amount" currencyName="currency" placeholder="e.g. 390m, 4.5b" />
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
    </Form>
  );
};

export default IncomeForm;
