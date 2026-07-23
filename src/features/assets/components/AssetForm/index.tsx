'use client';

import { useEffect, useMemo, useRef } from 'react';

import { useLocale, useTranslations } from 'next-intl';

import { createAssetKeyGenerator } from '@api/createAssetMutation';
import { ASSETS_SCOPE } from '@api/getAssetListQuery';
import { SUMMARY_SCOPE } from '@api/getSummaryQuery';
import { updateAssetKeyGenerator } from '@api/updateAssetMutation';
import type { UpdateAssetRequestData } from '@api/updateAssetMutation';
import { ASSET_CATEGORIES } from '@constants/assets';
import { PIVOT_CURRENCY } from '@constants/currencies';
import { getTrackedItem, suggestTrackedItem, TRACKED_ITEMS } from '@constants/tracked-items';
import { zodResolver } from '@hookform/resolvers/zod';
import { numberToWords } from '@persian-tools/persian-tools';
import type { QueryClient } from '@tanstack/react-query';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Coins, FileText, Link2, Loader2, Package, Plus } from 'lucide-react';
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

import { useAuth } from '@hooks/use-auth';
import { useAssetCategoryLabel } from '@hooks/use-constant-labels';
import { useCurrency } from '@hooks/use-currency';
import { useRates } from '@hooks/use-rates';

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
  linkedItem: asset.linkedItem || '',
  notes: asset.notes || '',
});

const AssetForm = ({ onAssetAdded, editingAsset, onCancelEdit, setIsDirty }: AssetFormProps) => {
  // Customs
  const t = useTranslations('forms');
  const tCommon = useTranslations('common');
  const tZod = useTranslations();
  const locale = useLocale() as 'en' | 'fa';
  const categoryLabel = useAssetCategoryLabel();
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const { primaryCurrency } = useCurrency();
  const { user } = useAuth();
  const { data: ratesData } = useRates(!!user);

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
      linkedItem: '',
      notes: '',
    }),
    [primaryCurrency]
  );

  // Forms
  const methods = useForm<CreateAssetSchema>({
    resolver: zodResolver(createAssetSchema(tZod)),
    defaultValues: editingAsset ? buildFormData(editingAsset) : defaultFormData,
    mode: 'all',
  });

  const { formState, reset, setValue, watch } = methods;
  const quantity = watch('quantity');
  const unitValue = watch('unitValue');
  const amount = watch('amount');
  const currency = watch('currency');
  const name = watch('name');
  const linkedItem = watch('linkedItem');

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

  // Today's price of a tracked item in the current entry currency (null when
  // rates aren't loaded / no rate for the currency).
  const trackedItemPrice = (code: string): number | null => {
    const priceToman = ratesData?.latest?.[code];
    if (!priceToman) return null;
    if (currency === PIVOT_CURRENCY) return Math.round(priceToman);
    const rate = ratesData?.latest?.[currency];
    return rate ? Math.round((priceToman / rate) * 100) / 100 : null;
  };

  // The suggestion chip only sets the field — the effect below does the prefill.
  const applyLinkedItem = (code: string) => {
    setValue('linkedItem', code, { shouldDirty: true, shouldValidate: true });
  };

  // Prefill unit + today's price when the user picks a link (select or chip). The ref
  // guards against firing on mount/reset (editing an already-linked asset must
  // not overwrite its stored values with today's price).
  const prevLinkedItemRef = useRef(linkedItem);
  useEffect(() => {
    const prev = prevLinkedItemRef.current;
    prevLinkedItemRef.current = linkedItem;
    if (!linkedItem || linkedItem === prev) return;
    if (!formState.dirtyFields.linkedItem) return;
    const item = getTrackedItem(linkedItem);
    if (!item) return;
    if (!watch('unit')) {
      setValue('unit', locale === 'fa' ? item.defaultUnitFa : item.defaultUnit, { shouldDirty: true });
    }
    const price = trackedItemPrice(linkedItem);
    if (price != null) handleUnitValueChange(price);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [linkedItem]);

  // Name-based suggestion — a hint chip the user confirms, never silent linking.
  const suggestion = useMemo(() => {
    if (linkedItem || !name) return null;
    return suggestTrackedItem(name);
  }, [name, linkedItem]);

  const handleSubmit = async (data: CreateAssetSchema) => {
    const dataToSubmit = { ...data, lastValuedAt: new Date().toISOString() };

    try {
      if (editingAsset) {
        await updateMutation.mutateAsync({ id: editingAsset.id, ...dataToSubmit });
        await invalidateAssetData(queryClient);
        showToast(t('asset.updated'), 'success');
      } else {
        await createMutation.mutateAsync(dataToSubmit);
        await invalidateAssetData(queryClient);
        showToast(t('asset.added'), 'success');
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
          <label htmlFor="category" className="text-text-secondary flex items-center gap-2 text-sm font-medium">
            <Package className="text-text-muted h-4 w-4" />
            {t('shared.category')}
          </label>
          <FormSelect
            name="category"
            options={ASSET_CATEGORIES.map((cat) => ({ value: cat.value, label: categoryLabel(cat.value) }))}
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="name" className="text-text-secondary flex items-center gap-2 text-sm font-medium">
            <FileText className="text-text-muted h-4 w-4" />
            {t('asset.name')}
          </label>
          <input
            id="name"
            type="text"
            placeholder={t('asset.namePlaceholder')}
            {...methods.register('name')}
            className="border-border-subtle bg-background text-text-primary placeholder:text-text-muted focus:border-blue w-full rounded-lg border px-3 py-2 text-sm transition-all focus:outline-none"
          />
          {formState.errors.name?.message && (
            <p className="text-danger mt-1 text-xs">{formState.errors.name.message}</p>
          )}
          {suggestion && (
            <button
              type="button"
              onClick={() => applyLinkedItem(suggestion.code)}
              className="border-border-subtle bg-background-secondary text-text-secondary hover:border-blue hover:text-blue mt-1 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs transition-all"
            >
              <Link2 className="h-3 w-3" aria-hidden="true" />
              {t('asset.autoPriceSuggest', { item: locale === 'fa' ? suggestion.labelFa : suggestion.label })}
            </button>
          )}
        </div>
      </div>

      {/* Auto-price link (optional) — ties the asset to a live Navasan price */}
      <div className="space-y-1">
        <label htmlFor="linkedItem" className="text-text-secondary flex items-center gap-2 text-sm font-medium">
          <Link2 className="text-text-muted h-4 w-4" />
          {t('asset.autoPrice')}
        </label>
        <FormSelect
          name="linkedItem"
          options={[
            { value: '', label: t('asset.autoPriceManual') },
            ...TRACKED_ITEMS.map((item) => ({
              value: item.code,
              label: locale === 'fa' ? item.labelFa : item.label,
            })),
          ]}
        />
      </div>

      {/* Row 2: Quantity and Unit */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
        <div className="space-y-1">
          <label htmlFor="quantity" className="text-text-secondary flex items-center gap-2 text-sm font-medium">
            <Package className="text-text-muted h-4 w-4" />
            {t('asset.quantity')}
          </label>
          <AmountInput
            id="quantity"
            placeholder={t('asset.quantityPlaceholder')}
            required
            value={quantity}
            onChange={handleQuantityChange}
            className="border-border-subtle bg-background text-text-primary placeholder:text-text-muted focus:border-blue w-full rounded-lg border px-3 py-2 text-sm transition-all focus:outline-none"
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="unit" className="text-text-secondary flex items-center gap-2 text-sm font-medium">
            <span className="text-text-muted">U</span>
            {t('asset.unit')}
          </label>
          <input
            id="unit"
            type="text"
            placeholder={t('asset.unitPlaceholder')}
            {...methods.register('unit')}
            className="border-border-subtle bg-background text-text-primary placeholder:text-text-muted focus:border-blue w-full rounded-lg border px-3 py-2 text-sm transition-all focus:outline-none"
          />
        </div>
      </div>

      {/* Unit Value (entry currency) */}
      <div className="space-y-1">
        <label htmlFor="unitValue" className="text-text-secondary flex items-center gap-2 text-sm font-medium">
          <Coins className="text-text-muted h-4 w-4" />
          {t('asset.unitValue', { currency })}
        </label>
        <AmountInput
          id="unitValue"
          placeholder={t('asset.unitValuePlaceholder')}
          value={unitValue ?? 0}
          onChange={handleUnitValueChange}
          className="border-border-subtle bg-background text-text-primary placeholder:text-text-muted focus:border-blue w-full rounded-lg border px-3 py-2 text-sm transition-all focus:outline-none"
        />
      </div>

      {/* Total Value + Currency */}
      <div className="space-y-1">
        <label htmlFor="amount" className="text-text-secondary flex items-center gap-2 text-sm font-medium">
          <Coins className="text-text-muted h-4 w-4" />
          {t('asset.totalValue')}
        </label>
        <Tooltip content={numberToPersianWord} position="top">
          <FormMoneyInput
            amountName="amount"
            currencyName="currency"
            placeholder={t('asset.totalValuePlaceholder')}
            onAmountChange={handleTotalValueChange}
          />
        </Tooltip>
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

      {/* Buttons */}
      <div className="flex gap-3 pt-1 rtl:flex-row-reverse">
        <Button type="submit" disabled={isSubmitting || !name} variant="primary" className="flex-1">
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
              <span>{t('shared.saving')}</span>
            </>
          ) : (
            <>
              {!editingAsset && <Plus className="h-4 w-4 shrink-0" />}
              <span>{editingAsset ? t('shared.update') : t('shared.add')}</span>
            </>
          )}
        </Button>
        {editingAsset && (
          <Button type="button" onClick={handleCancel} variant="outline">
            {tCommon('cancel')}
          </Button>
        )}
      </div>
    </Form>
  );
};

export default AssetForm;
