'use client';

import { useEffect, useMemo } from 'react';

import { useLocale, useTranslations } from 'next-intl';

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
import Select from '@components/Select';
import Tooltip from '@components/Tooltip';

import { useIncomeTypeLabel, useMonthLabel } from '@hooks/use-constant-labels';
import { useCurrency } from '@hooks/use-currency';
import { useLocalePreferences } from '@hooks/use-locale-preferences';

import { useToast } from '@stores/toast';

import {
  ensureError,
  formatJalaliDigits,
  gregorianToJalali,
  JALALI_MONTH_NAMES,
  jalaliToGregorian,
  resolveCalendar,
} from '@utils';
import type { AppLocale } from '@utils';

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
  const t = useTranslations('forms');
  const tCommon = useTranslations('common');
  const tZod = useTranslations();
  const locale = useLocale() as AppLocale;
  const incomeTypeLabel = useIncomeTypeLabel();
  const monthLabel = useMonthLabel();
  const { prefs: localePrefs } = useLocalePreferences();
  const calendar = resolveCalendar(localePrefs.calendar, locale);
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
    resolver: zodResolver(createIncomeSchema(tZod)),
    defaultValues: editingIncome ? buildFormData(editingIncome) : defaultFormData,
    mode: 'all',
  });

  const { formState, reset, watch, setValue } = methods;
  const amount = watch('amount');
  const currency = watch('currency');
  const year = watch('year');
  const month = watch('month');

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
        showToast(t('income.updated'), 'success');
      } else {
        await createMutation.mutateAsync(data);
        await invalidateIncomeData(queryClient);
        showToast(t('income.added'), 'success');
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

  // Jalali month/year selection — only relevant when the resolved calendar is
  // Jalali. Income's month/year fields are always stored as Gregorian ints
  // (matches the DB schema); the day=15 anchor keeps the mapping consistent
  // with getJalaliMonthName/getDisplayYear used elsewhere for this same data.
  const jalaliSelection = useMemo(
    () => (calendar === 'jalali' ? gregorianToJalali(new Date(year, month - 1, 15)) : null),
    [calendar, year, month]
  );

  const handleJalaliMonthChange = (jalaliMonth: number) => {
    if (!jalaliSelection) return;
    const gregorian = jalaliToGregorian(jalaliSelection.year, jalaliMonth, 15);
    setValue('month', gregorian.getMonth() + 1, { shouldDirty: true, shouldValidate: true });
    setValue('year', gregorian.getFullYear(), { shouldDirty: true, shouldValidate: true });
  };

  const handleJalaliYearChange = (jalaliYear: number) => {
    if (!jalaliSelection) return;
    const gregorian = jalaliToGregorian(jalaliYear, jalaliSelection.month, 15);
    setValue('month', gregorian.getMonth() + 1, { shouldDirty: true, shouldValidate: true });
    setValue('year', gregorian.getFullYear(), { shouldDirty: true, shouldValidate: true });
  };

  // Generate year options (current year - 5 to current year + 1), in
  // whichever calendar the Year dropdown is currently showing.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const todayJalali = useMemo(() => gregorianToJalali(currentDate), []);
  const yearRangeCenter = calendar === 'jalali' ? todayJalali.year : currentDate.getFullYear();
  const yearOptions = [];
  for (let y = yearRangeCenter + 1; y >= yearRangeCenter - 5; y--) {
    yearOptions.push(y);
  }

  return (
    <Form methods={methods} onSubmit={handleSubmit} className="space-y-3">
      {/* Row 1: Income Type, Month, Year */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <div className="space-y-1">
          <label htmlFor="incomeType" className="text-text-secondary flex items-center gap-2 text-sm font-medium">
            <Briefcase className="text-text-muted h-4 w-4" />
            {t('income.type')}
          </label>
          <FormSelect
            name="incomeType"
            options={INCOME_TYPES.map((type) => ({ value: type.value, label: incomeTypeLabel(type.value) }))}
          />
        </div>

        <div className="space-y-1">
          <label
            htmlFor={jalaliSelection ? 'jalaliMonth' : 'month'}
            className="text-text-secondary flex items-center gap-2 text-sm font-medium"
          >
            <Calendar className="text-text-muted h-4 w-4" />
            {t('income.month')}
          </label>
          {jalaliSelection ? (
            <Select
              inputId="jalaliMonth"
              value={String(jalaliSelection.month)}
              onChange={(value) => handleJalaliMonthChange(Number(value))}
              options={JALALI_MONTH_NAMES.map((name, i) => ({ value: String(i + 1), label: name }))}
            />
          ) : (
            <FormSelect
              name="month"
              valueAsNumber
              options={MONTHS.map((m) => ({ value: String(m.value), label: monthLabel(m.value) }))}
            />
          )}
        </div>

        <div className="space-y-1">
          <label
            htmlFor={jalaliSelection ? 'jalaliYear' : 'year'}
            className="text-text-secondary flex items-center gap-2 text-sm font-medium"
          >
            <Calendar className="text-text-muted h-4 w-4" />
            {t('income.year')}
          </label>
          {jalaliSelection ? (
            <Select
              inputId="jalaliYear"
              value={String(jalaliSelection.year)}
              onChange={(value) => handleJalaliYearChange(Number(value))}
              options={yearOptions.map((y) => ({ value: String(y), label: formatJalaliDigits(y) }))}
            />
          ) : (
            <FormSelect
              name="year"
              valueAsNumber
              options={yearOptions.map((y) => ({ value: String(y), label: String(y) }))}
            />
          )}
        </div>
      </div>

      {/* Source */}
      <div className="space-y-1">
        <label htmlFor="source" className="text-text-secondary flex items-center gap-2 text-sm font-medium">
          <Briefcase className="text-text-muted h-4 w-4" />
          {t('income.source')}
        </label>
        <input
          id="source"
          type="text"
          placeholder={t('income.sourcePlaceholder')}
          {...methods.register('source')}
          className="border-border-subtle bg-background text-text-primary placeholder:text-text-muted focus:border-blue w-full rounded-lg border px-3 py-2 text-sm transition-all focus:outline-none"
        />
      </div>

      {/* Notes */}
      <div className="space-y-1">
        <label htmlFor="notes" className="text-text-secondary flex items-center gap-2 text-sm font-medium">
          <FileText className="text-text-muted h-4 w-4" />
          {t('shared.notes')}
        </label>
        <textarea
          id="notes"
          placeholder={t('shared.notesPlaceholder')}
          rows={2}
          {...methods.register('notes')}
          className="border-border-subtle bg-background text-text-primary placeholder:text-text-muted focus:border-blue w-full resize-none rounded-lg border px-3 py-2 text-sm transition-all focus:outline-none"
        />
      </div>

      {/* Amount + Currency */}
      <div className="space-y-1">
        <label htmlFor="amount" className="text-text-secondary flex items-center gap-2 text-sm font-medium">
          <Coins className="text-text-muted h-4 w-4" />
          {t('shared.amount')}
        </label>
        <Tooltip content={numberToPersianWord} position="top">
          <FormMoneyInput amountName="amount" currencyName="currency" placeholder={t('income.amountPlaceholder')} />
        </Tooltip>
      </div>

      {/* Buttons */}
      <div className="flex gap-3 pt-1 rtl:flex-row-reverse">
        <Button type="submit" disabled={isSubmitting} variant="primary" className="flex-1">
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
              <span>{t('shared.saving')}</span>
            </>
          ) : (
            <>
              {!editingIncome && <Plus className="h-4 w-4 shrink-0" />}
              <span>{editingIncome ? t('shared.update') : t('shared.add')}</span>
            </>
          )}
        </Button>
        {editingIncome && (
          <Button type="button" onClick={handleCancel} variant="outline">
            {tCommon('cancel')}
          </Button>
        )}
      </div>
    </Form>
  );
};

export default IncomeForm;
