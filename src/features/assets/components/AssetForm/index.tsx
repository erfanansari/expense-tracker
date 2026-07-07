'use client';

import { useEffect, useMemo } from 'react';

import { createAssetKeyGenerator } from '@api/createAssetMutation';
import { ASSETS_SCOPE } from '@api/getAssetListQuery';
import { SUMMARY_SCOPE } from '@api/getSummaryQuery';
import { updateAssetKeyGenerator } from '@api/updateAssetMutation';
import type { UpdateAssetRequestData } from '@api/updateAssetMutation';
import { ASSET_CATEGORIES } from '@constants/assets';
import { PIVOT_CURRENCY } from '@constants/currencies';
import { zodResolver } from '@hookform/resolvers/zod';
import { numberToWords } from '@persian-tools/persian-tools';
import type { QueryClient } from '@tanstack/react-query';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Coins, FileText, Loader2, Package, Plus } from 'lucide-react';
import { useForm } from 'react-hook-form';

import type { Asset } from '@types';

import { createAssetSchema } from '@schemas';
import type { CreateAssetSchema } from '@schemas';

import AmountInput from '@components/AmountInput';
import Button from '@components/Button';
import Form from '@components/Form';
import FormMoneyInput from '@components/Form/components/FormMoneyInput';
import FormSelect from '@components/Form/components/FormSelect';
import Tooltip from '@components/Tooltip';

import { useCurrency } from '@hooks/use-currency';

import { useToast } from '@stores/toast';

import { ensureError } from '@utils';

import type { AssetFormProps } from './@types';

const invalidateAssetData = (queryClient: QueryClient) =>
  Promise.all([
    queryClient.invalidateQueries({ queryKey: ASSETS_SCOPE }),
    queryClient.invalidateQueries({ queryKey: SUMMARY_SCOPE }),
  ]);

const buildFormData = (asset: Asset): CreateAssetSchema => ({
  category: asset.category,
  name: asset.name,
  quantity: asset.quantity,
  unit: asset.unit || '',
  unitValue: asset.unitValue || 0,
  amount: asset.amount,
  currency: asset.currency,
  notes: asset.notes || '',
});

const AssetForm = ({ onAssetAdded, editingAsset, onCancelEdit, setIsDirty }: AssetFormProps) => {
  // Customs
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const { primaryCurrency } = useCurrency();

  // Variables
  const defaultFormData: CreateAssetSchema = useMemo(
    () => ({
      category: 'cash',
      name: '',
      quantity: 1,
      unit: '',
      unitValue: 0,
      amount: 0,
      currency: primaryCurrency || PIVOT_CURRENCY,
      notes: '',
    }),
    [primaryCurrency]
  );

  // Forms
  const methods = useForm<CreateAssetSchema>({
    resolver: zodResolver(createAssetSchema),
    defaultValues: editingAsset ? buildFormData(editingAsset) : defaultFormData,
    mode: 'all',
  });

  const { formState, reset, setValue, watch } = methods;
  const quantity = watch('quantity');
  const unitValue = watch('unitValue');
  const amount = watch('amount');
  const currency = watch('currency');
  const name = watch('name');

  // Mutations
  const createMutation = useMutation<unknown, Error, CreateAssetSchema>({
    mutationKey: createAssetKeyGenerator(),
  });
  const updateMutation = useMutation<unknown, Error, UpdateAssetRequestData>({
    mutationKey: updateAssetKeyGenerator(),
  });

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  // Effects — resync when the drawer switches to a different asset.
  useEffect(() => {
    if (editingAsset) reset(buildFormData(editingAsset));
  }, [editingAsset, reset]);

  useEffect(() => {
    setIsDirty?.(formState.isDirty);
  }, [formState.isDirty, setIsDirty]);

  const numberToPersianWord = useMemo(() => {
    if (currency !== PIVOT_CURRENCY || (amount ?? 0) <= 0) return '';
    const rounded = Math.round(amount);
    return Number.isSafeInteger(rounded) ? `${numberToWords(rounded)} تومان` : '';
  }, [amount, currency]);

  // Quantity × unitValue = total amount (in the entry currency).
  const handleQuantityChange = (value: number) => {
    setValue('quantity', value, { shouldDirty: true, shouldValidate: true });
    if (unitValue) {
      setValue('amount', Math.round(value * unitValue * 100) / 100, { shouldDirty: true, shouldValidate: true });
    }
  };

  const handleUnitValueChange = (value: number) => {
    setValue('unitValue', value, { shouldDirty: true, shouldValidate: true });
    setValue('amount', Math.round(quantity * value * 100) / 100, { shouldDirty: true, shouldValidate: true });
  };

  const handleTotalValueChange = (value: number) => {
    setValue('amount', value, { shouldDirty: true, shouldValidate: true });
    setValue('unitValue', quantity > 0 ? Math.round((value / quantity) * 100) / 100 : 0, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  const handleSubmit = async (data: CreateAssetSchema) => {
    const dataToSubmit = { ...data, lastValuedAt: new Date().toISOString() };

    try {
      if (editingAsset) {
        await updateMutation.mutateAsync({ id: editingAsset.id, ...dataToSubmit });
        await invalidateAssetData(queryClient);
        showToast('Asset updated successfully!', 'success');
      } else {
        await createMutation.mutateAsync(dataToSubmit);
        await invalidateAssetData(queryClient);
        showToast('Asset added successfully!', 'success');
      }

      reset(defaultFormData);
      onAssetAdded();
      if (editingAsset && onCancelEdit) onCancelEdit();
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
      {/* Row 1: Category and Name */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4">
        <div className="space-y-1">
          <label className="text-text-secondary flex items-center gap-2 text-sm font-medium">
            <Package className="text-text-muted h-4 w-4" />
            Category
          </label>
          <FormSelect
            name="category"
            options={ASSET_CATEGORIES.map((cat) => ({ value: cat.value, label: cat.label }))}
          />
        </div>

        <div className="space-y-1">
          <label className="text-text-secondary flex items-center gap-2 text-sm font-medium">
            <FileText className="text-text-muted h-4 w-4" />
            Name
          </label>
          <input
            type="text"
            placeholder="e.g., BTC, Gold 18K, Bank Melli..."
            {...methods.register('name')}
            className="border-border-subtle bg-background text-text-primary placeholder:text-text-muted focus:border-blue w-full rounded-lg border px-3 py-2 text-sm transition-all focus:outline-none"
          />
          {formState.errors.name?.message && (
            <p className="text-danger mt-1 text-xs">{formState.errors.name.message}</p>
          )}
        </div>
      </div>

      {/* Row 2: Quantity and Unit */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
        <div className="space-y-1">
          <label className="text-text-secondary flex items-center gap-2 text-sm font-medium">
            <Package className="text-text-muted h-4 w-4" />
            Quantity
          </label>
          <AmountInput
            placeholder="e.g. 1, 2.5k"
            required
            value={quantity}
            onChange={handleQuantityChange}
            className="border-border-subtle bg-background text-text-primary placeholder:text-text-muted focus:border-blue w-full rounded-lg border px-3 py-2 text-sm transition-all focus:outline-none"
          />
        </div>
        <div className="space-y-1">
          <label className="text-text-secondary flex items-center gap-2 text-sm font-medium">
            <span className="text-text-muted">U</span>
            Unit (Optional)
          </label>
          <input
            type="text"
            placeholder="e.g., BTC, gram, unit..."
            {...methods.register('unit')}
            className="border-border-subtle bg-background text-text-primary placeholder:text-text-muted focus:border-blue w-full rounded-lg border px-3 py-2 text-sm transition-all focus:outline-none"
          />
        </div>
      </div>

      {/* Unit Value (entry currency) */}
      <div className="space-y-1">
        <label className="text-text-secondary flex items-center gap-2 text-sm font-medium">
          <Coins className="text-text-muted h-4 w-4" />
          Unit Value ({currency})
        </label>
        <AmountInput
          placeholder="e.g. 93k, 100"
          value={unitValue ?? 0}
          onChange={handleUnitValueChange}
          className="border-border-subtle bg-background text-text-primary placeholder:text-text-muted focus:border-blue w-full rounded-lg border px-3 py-2 text-sm transition-all focus:outline-none"
        />
      </div>

      {/* Total Value + Currency */}
      <div className="space-y-1">
        <label className="text-text-secondary flex items-center gap-2 text-sm font-medium">
          <Coins className="text-text-muted h-4 w-4" />
          Total Value
        </label>
        <Tooltip content={numberToPersianWord} position="top">
          <FormMoneyInput
            amountName="amount"
            currencyName="currency"
            placeholder="e.g. 1k, 50m"
            onAmountChange={handleTotalValueChange}
          />
        </Tooltip>
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

      {/* Buttons */}
      <div className="flex gap-3 pt-1">
        <Button type="submit" disabled={isSubmitting || !name} variant="primary" className="flex-1">
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
              <span>Saving...</span>
            </>
          ) : (
            <>
              {!editingAsset && <Plus className="h-4 w-4 shrink-0" />}
              <span>{editingAsset ? 'Update' : 'Add'}</span>
            </>
          )}
        </Button>
        {editingAsset && (
          <Button type="button" onClick={handleCancel} variant="outline">
            Cancel
          </Button>
        )}
      </div>
    </Form>
  );
};

export default AssetForm;
