'use client';

import { useEffect, useState } from 'react';

import { ASSET_CATEGORIES } from '@constants/assets';
import { numberToWords } from '@persian-tools/persian-tools';
import { DollarSign, FileText, Loader2, Package, Plus } from 'lucide-react';

import { createAssetSchema } from '@schemas';

import { usdToToman } from '@features/ExchangeRate/utils/currency-conversion';

import AmountInput from '@components/AmountInput';
import Button from '@components/Button';
import Select from '@components/Select';
import { useToast } from '@components/Toast/ToastProvider';
import Tooltip from '@components/Tooltip';

import { useCreateAsset, useUpdateAsset } from '@hooks/use-assets';
import { useExchangeRateForm } from '@hooks/use-exchange-rate-form';

import { ensureError } from '@utils';

import type { Asset, AssetCategory, CreateAssetInput } from '@/@types/asset';

interface AssetFormProps {
  onAssetAdded: () => void;
  editingAsset?: Asset;
  onCancelEdit?: () => void;
  setIsDirty?: (dirty: boolean) => void;
}

const AssetForm = ({ onAssetAdded, editingAsset, onCancelEdit, setIsDirty }: AssetFormProps) => {
  // Customs
  const { showToast } = useToast();

  // Mutations
  const createAsset = useCreateAsset();
  const updateAsset = useUpdateAsset();

  const { exchangeRate, isFetchingRate, setUserRate, resetUserRate } = useExchangeRateForm({
    editingRate: editingAsset?.exchangeRateUsed,
  });

  // Variables
  const defaultFormData: CreateAssetInput = {
    category: 'cash',
    name: '',
    quantity: 1,
    unit: '',
    unitValueUsd: 0,
    totalValueUsd: 0,
    totalValueToman: 0,
    exchangeRateUsed: 0,
    notes: '',
  };

  const buildFormData = (asset: Asset): CreateAssetInput => ({
    category: asset.category,
    name: asset.name,
    quantity: asset.quantity,
    unit: asset.unit || '',
    unitValueUsd: asset.unitValueUsd || 0,
    totalValueUsd: asset.totalValueUsd,
    totalValueToman: asset.totalValueToman,
    exchangeRateUsed: asset.exchangeRateUsed,
    notes: asset.notes || '',
  });

  // States
  const [formData, setFormData] = useState<CreateAssetInput>(
    editingAsset ? buildFormData(editingAsset) : defaultFormData
  );
  const [initialFormData, setInitialFormData] = useState<CreateAssetInput | null>(
    editingAsset ? buildFormData(editingAsset) : null
  );
  const [initialDataCaptured, setInitialDataCaptured] = useState(!!editingAsset);

  const isSubmitting = createAsset.isPending || updateAsset.isPending;

  // Render-time: sync form data when editingAsset prop changes
  const [prevEditingAsset, setPrevEditingAsset] = useState(editingAsset);
  if (prevEditingAsset !== editingAsset) {
    setPrevEditingAsset(editingAsset);
    if (editingAsset) {
      const initialData = buildFormData(editingAsset);
      setFormData(initialData);
      setInitialFormData(initialData);
    }
    resetUserRate();
  }

  // Render-time: capture initialFormData once when rate is ready (for new assets)
  if (!editingAsset && exchangeRate > 0 && !initialDataCaptured) {
    setInitialDataCaptured(true);
    setInitialFormData({ ...defaultFormData, exchangeRateUsed: exchangeRate });
  }

  // Effects
  useEffect(() => {
    if (!initialFormData || !setIsDirty) return;

    const isDirty =
      formData.category !== initialFormData.category ||
      formData.name !== initialFormData.name ||
      formData.quantity !== initialFormData.quantity ||
      formData.unit !== initialFormData.unit ||
      formData.unitValueUsd !== initialFormData.unitValueUsd ||
      formData.totalValueUsd !== initialFormData.totalValueUsd ||
      formData.totalValueToman !== initialFormData.totalValueToman ||
      formData.notes !== initialFormData.notes ||
      exchangeRate !== initialFormData.exchangeRateUsed;

    setIsDirty(isDirty);
  }, [formData, exchangeRate, initialFormData, setIsDirty]);

  const numberToPersianWord = formData.totalValueToman > 0 ? `${numberToWords(formData.totalValueToman)} تومان` : '';

  const handleQuantityChange = (value: number) => {
    const totalUsd = formData.unitValueUsd
      ? Math.round(value * formData.unitValueUsd * 100) / 100
      : formData.totalValueUsd;
    setFormData({
      ...formData,
      quantity: value,
      totalValueUsd: totalUsd,
      totalValueToman: Math.round(usdToToman(totalUsd, exchangeRate)),
    });
  };

  const handleUnitValueChange = (value: number) => {
    const totalUsd = Math.round(formData.quantity * value * 100) / 100;
    setFormData({
      ...formData,
      unitValueUsd: value,
      totalValueUsd: totalUsd,
      totalValueToman: Math.round(usdToToman(totalUsd, exchangeRate)),
    });
  };

  const handleTotalValueChange = (value: number) => {
    setFormData({
      ...formData,
      totalValueUsd: value,
      totalValueToman: Math.round(usdToToman(value, exchangeRate)),
      unitValueUsd: formData.quantity > 0 ? Math.round((value / formData.quantity) * 100) / 100 : 0,
    });
  };

  const handleRateChange = (value: number) => {
    setUserRate(value);
    setFormData((prev) => ({
      ...prev,
      exchangeRateUsed: value,
      totalValueToman: Math.round(usdToToman(prev.totalValueUsd, value)),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const dataToSubmit = {
      ...formData,
      exchangeRateUsed: exchangeRate,
      lastValuedAt: new Date().toISOString(),
    };

    const validated = createAssetSchema.safeParse(dataToSubmit);
    if (!validated.success) {
      showToast(validated.error.issues[0].message, 'error');
      return;
    }

    try {
      if (editingAsset) {
        await updateAsset.mutateAsync({ id: editingAsset.id, data: dataToSubmit });
        showToast('Asset updated successfully!', 'success');
      } else {
        await createAsset.mutateAsync(dataToSubmit);
        showToast('Asset added successfully!', 'success');
      }

      setFormData({ ...defaultFormData, exchangeRateUsed: exchangeRate });
      resetUserRate();
      onAssetAdded();
      if (editingAsset && onCancelEdit) {
        onCancelEdit();
      }
    } catch (err) {
      showToast(ensureError(err).message, 'error');
    }
  };

  const handleCancel = () => {
    setFormData({ ...defaultFormData, exchangeRateUsed: exchangeRate });
    if (onCancelEdit) {
      onCancelEdit();
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Row 1: Category and Name */}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4">
          {/* Category */}
          <div className="space-y-1">
            <label className="text-text-secondary flex items-center gap-2 text-sm font-medium">
              <Package className="text-text-muted h-4 w-4" />
              Category
            </label>
            <Select
              value={formData.category}
              onChange={(val) => setFormData({ ...formData, category: val as AssetCategory })}
              options={ASSET_CATEGORIES.map((cat) => ({ value: cat.value, label: cat.label }))}
              required
            />
          </div>

          {/* Name */}
          <div className="space-y-1">
            <label className="text-text-secondary flex items-center gap-2 text-sm font-medium">
              <FileText className="text-text-muted h-4 w-4" />
              Name
            </label>
            <input
              type="text"
              placeholder="e.g., BTC, Gold 18K, Bank Melli..."
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="border-border-subtle bg-background text-text-primary placeholder:text-text-muted focus:border-blue w-full rounded-lg border px-3 py-2 text-sm transition-all focus:outline-none"
            />
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
              value={formData.quantity}
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
              value={formData.unit || ''}
              onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
              className="border-border-subtle bg-background text-text-primary placeholder:text-text-muted focus:border-blue w-full rounded-lg border px-3 py-2 text-sm transition-all focus:outline-none"
            />
          </div>
        </div>

        {/* Unit Value (USD) */}
        <div className="space-y-1">
          <label className="text-text-secondary flex items-center gap-2 text-sm font-medium">
            <DollarSign className="text-blue h-4 w-4" />
            Unit Value (USD)
          </label>
          <AmountInput
            placeholder="e.g. 93k, 100"
            value={formData.unitValueUsd ?? 0}
            onChange={handleUnitValueChange}
            className="border-border-subtle bg-background text-text-primary placeholder:text-text-muted focus:border-blue w-full rounded-lg border px-3 py-2 text-sm transition-all focus:outline-none"
          />
        </div>

        {/* Total Values */}
        <div className="grid grid-cols-1 gap-3">
          {/* Total Toman */}
          <div className="space-y-1">
            <label className="text-text-secondary flex items-center gap-2 text-sm font-medium">
              <span className="text-success font-bold">T</span>
              Total (Toman)
            </label>
            <Tooltip content={numberToPersianWord} position="top">
              <input
                type="number"
                placeholder="130000000"
                required
                min="0"
                step="1"
                value={formData.totalValueToman || ''}
                readOnly
                className="border-border-subtle bg-background-secondary text-text-secondary w-full rounded-lg border px-3 py-2 text-sm transition-all"
              />
            </Tooltip>
          </div>

          {/* Total Value USD */}
          <div className="space-y-1">
            <label className="text-text-secondary flex items-center gap-2 text-sm font-medium">
              <DollarSign className="text-blue h-4 w-4" />
              Total Value (USD)
            </label>
            <AmountInput
              placeholder="e.g. 1k, 50m"
              required
              value={formData.totalValueUsd}
              onChange={handleTotalValueChange}
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
          <AmountInput
            placeholder="e.g. 130k"
            required
            value={exchangeRate}
            onChange={(v) => handleRateChange(v || exchangeRate)}
            disabled={isFetchingRate}
            className="border-border-subtle bg-background text-text-primary placeholder:text-text-muted focus:border-blue w-full rounded-lg border px-3 py-2 text-sm transition-all focus:outline-none disabled:cursor-wait disabled:opacity-50"
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

        {/* Buttons */}
        <div className="flex gap-3 pt-1">
          <Button
            type="submit"
            disabled={isSubmitting || isFetchingRate || !exchangeRate || !formData.name}
            variant="primary"
            className="flex-1"
          >
            {(() => {
              if (isFetchingRate) {
                return (
                  <>
                    <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
                    <span>Loading...</span>
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
                  {!editingAsset && <Plus className="h-4 w-4 shrink-0" />}
                  <span>{editingAsset ? 'Update' : 'Add'}</span>
                </>
              );
            })()}
          </Button>
          {editingAsset && (
            <Button type="button" onClick={handleCancel} variant="outline">
              Cancel
            </Button>
          )}
        </div>
      </form>
    </>
  );
};

export default AssetForm;
