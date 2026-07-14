'use client';

import { useEffect, useMemo, useState } from 'react';

import { useTranslations } from 'next-intl';

import { createExpenseKeyGenerator } from '@api/createExpenseMutation';
import { EXPENSES_SCOPE } from '@api/getExpenseListQuery';
import { SUMMARY_SCOPE } from '@api/getSummaryQuery';
import { updateExpenseKeyGenerator } from '@api/updateExpenseMutation';
import type { UpdateExpenseRequestData } from '@api/updateExpenseMutation';
import { PIVOT_CURRENCY } from '@constants/currencies';
import { zodResolver } from '@hookform/resolvers/zod';
import { numberToWords } from '@persian-tools/persian-tools';
import type { QueryClient } from '@tanstack/react-query';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Calendar, Coins, FileText, Layers, Loader2, Plus } from 'lucide-react';
import { Controller, useForm } from 'react-hook-form';

import { type Tag } from '@types';

import { createExpenseSchema } from '@schemas';
import type { CreateExpenseSchema } from '@schemas';

import Button from '@components/Button';
import Form from '@components/Form';
import FormDatePicker from '@components/Form/components/FormDatePicker';
import FormMoneyInput from '@components/Form/components/FormMoneyInput';
import Tooltip from '@components/Tooltip';

import { useCurrency } from '@hooks/use-currency';

import { useToast } from '@stores/toast';

import { ensureError } from '@utils';

import CategorySelect from '../CategorySelect';
import TagInput from '../TagInput';

import type { ExpenseFormProps } from './@types';

const invalidateExpenseData = (queryClient: QueryClient) =>
  Promise.all([
    queryClient.invalidateQueries({ queryKey: EXPENSES_SCOPE }),
    queryClient.invalidateQueries({ queryKey: SUMMARY_SCOPE }),
  ]);

const ExpenseForm = ({ onExpenseAdded, editingExpense, onCancelEdit, setIsDirty }: ExpenseFormProps) => {
  // Customs
  const t = useTranslations('forms');
  const tCommon = useTranslations('common');
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const { primaryCurrency } = useCurrency();

  // States — TagInput works with Tag objects; tagIds are derived on submit.
  const [selectedTags, setSelectedTags] = useState<Tag[]>(editingExpense?.tags || []);

  // Variables
  const defaultFormData: CreateExpenseSchema = useMemo(
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

  const editingFormData: CreateExpenseSchema | null = useMemo(
    () =>
      editingExpense
        ? {
            date: editingExpense.date,
            categoryId: editingExpense.category.id,
            description: editingExpense.description,
            amount: editingExpense.amount,
            currency: editingExpense.currency,
            tagIds: editingExpense.tags?.map((t) => t.id) || [],
          }
        : null,
    [editingExpense]
  );

  // Forms
  const tZod = useTranslations();
  const methods = useForm<CreateExpenseSchema>({
    resolver: zodResolver(createExpenseSchema(tZod)),
    defaultValues: editingFormData ?? defaultFormData,
    mode: 'all',
  });

  const { formState, reset, setValue, watch } = methods;
  const amount = watch('amount');
  const currency = watch('currency');

  // Mutations
  const createMutation = useMutation<unknown, Error, CreateExpenseSchema>({
    mutationKey: createExpenseKeyGenerator(),
  });
  const updateMutation = useMutation<unknown, Error, UpdateExpenseRequestData>({
    mutationKey: updateExpenseKeyGenerator(),
  });

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  // Effects — resync when the drawer switches to a different expense.
  useEffect(() => {
    if (editingFormData) {
      reset(editingFormData);
      setSelectedTags(editingExpense?.tags || []);
    }
  }, [editingFormData, editingExpense, reset]);

  useEffect(() => {
    setIsDirty?.(formState.isDirty);
  }, [formState.isDirty, setIsDirty]);

  // Persian words helper only applies when the entry currency is Toman.
  const numberToPersianWord = useMemo(() => {
    if (currency !== PIVOT_CURRENCY || amount <= 0) return '';
    const rounded = Math.round(amount);
    return Number.isSafeInteger(rounded) ? `${numberToWords(rounded)} تومان` : '';
  }, [amount, currency]);

  const handleSubmit = async (data: CreateExpenseSchema) => {
    const dataToSubmit = { ...data, tagIds: selectedTags.map((t) => t.id) };

    try {
      if (editingExpense) {
        await updateMutation.mutateAsync({ id: editingExpense.id, ...dataToSubmit });
        await invalidateExpenseData(queryClient);
        showToast(t('expense.updated'), 'success');
      } else {
        await createMutation.mutateAsync(dataToSubmit);
        await invalidateExpenseData(queryClient);
        showToast(t('expense.added'), 'success');
      }

      reset(defaultFormData);
      setSelectedTags([]);
      onExpenseAdded();
      if (editingExpense && onCancelEdit) onCancelEdit();
    } catch (err) {
      showToast(ensureError(err).message, 'error');
    }
  };

  const handleCancel = () => {
    reset(defaultFormData);
    if (onCancelEdit) onCancelEdit();
  };

  return (
    <Form methods={methods} onSubmit={handleSubmit} className="space-y-3">
      {/* Row 1: Category and Date */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4">
        <div className="space-y-1">
          <label className="text-text-secondary flex items-center gap-2 text-sm font-medium">
            <Layers className="text-text-muted h-4 w-4" />
            {t('shared.category')}
          </label>
          <Controller
            name="categoryId"
            control={methods.control}
            render={({ field, fieldState }) => (
              <>
                <CategorySelect value={field.value || null} onChange={(id) => field.onChange(id ?? 0)} />
                {fieldState.error?.message && <p className="text-danger mt-1 text-xs">{fieldState.error.message}</p>}
              </>
            )}
          />
        </div>

        <div className="space-y-1">
          <label className="text-text-secondary flex items-center gap-2 text-sm font-medium">
            <Calendar className="text-text-muted h-4 w-4" />
            {t('shared.date')}
          </label>
          <FormDatePicker name="date" />
        </div>
      </div>

      {/* Description */}
      <div className="space-y-1">
        <label className="text-text-secondary flex items-center gap-2 text-sm font-medium">
          <FileText className="text-text-muted h-4 w-4" />
          {t('shared.description')}
        </label>
        <textarea
          placeholder={t('expense.descriptionPlaceholder')}
          rows={2}
          {...methods.register('description')}
          className="border-border-subtle bg-background text-text-primary placeholder:text-text-muted focus:border-blue w-full resize-none rounded-lg border px-3 py-2 text-sm transition-all focus:outline-none"
        />
        {formState.errors.description?.message && (
          <p className="text-danger mt-1 text-xs">{formState.errors.description.message}</p>
        )}
      </div>

      {/* Tags */}
      <TagInput
        selectedTags={selectedTags}
        onTagsChange={(tags) => {
          setSelectedTags(tags);
          setValue(
            'tagIds',
            tags.map((t) => t.id),
            { shouldDirty: true }
          );
        }}
      />

      {/* Amount + Currency */}
      <div className="space-y-1">
        <label className="text-text-secondary flex items-center gap-2 text-sm font-medium">
          <Coins className="text-text-muted h-4 w-4" />
          {t('shared.amount')}
        </label>
        <Tooltip content={numberToPersianWord} position="top">
          <FormMoneyInput amountName="amount" currencyName="currency" placeholder={t('expense.amountPlaceholder')} />
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
              {!editingExpense && <Plus className="h-4 w-4 shrink-0" />}
              <span>{editingExpense ? t('shared.update') : t('shared.add')}</span>
            </>
          )}
        </Button>
        {editingExpense && (
          <Button type="button" onClick={handleCancel} variant="outline">
            {tCommon('cancel')}
          </Button>
        )}
      </div>
    </Form>
  );
};

export default ExpenseForm;
