'use client';

import { useEffect, useMemo, useState } from 'react';

import { ASSET_CATEGORIES } from '@constants/assets';
import { numberToWords } from '@persian-tools/persian-tools';
import { Coins, FileText, Loader2, Package, Plus } from 'lucide-react';

import { createAssetSchema } from '@schemas';

import { useCurrency } from '@features/ExchangeRate/CurrencyProvider';

import AmountInput from '@components/AmountInput';
import Button from '@components/Button';
import MoneyInput from '@components/MoneyInput';
import Select from '@components/Select';
import { useToast } from '@components/Toast/ToastProvider';
import Tooltip from '@components/Tooltip';

import { useCreateAsset, useUpdateAsset } from '@hooks/use-assets';

import { ensureError } from '@utils';

import type { Asset, AssetCategory, CreateAssetInput } from '@/@types/asset';
import { PIVOT_CURRENCY } from '@/constants/currencies';

interface AssetFormProps {
  onAssetAdded: () => void;
  editingAsset?: Asset;
  onCancelEdit?: () => void;
  setIsDirty?: (dirty: boolean) => void;
}

const AssetForm = ({ onAssetAdded, editingAsset, onCancelEdit, setIsDirty }: AssetFormProps) => {
  const { showToast } = useToast();
  const { primaryCurrency } = useCurrency();

  const createAsset = useCreateAsset();
  const updateAsset = useUpdateAsset();

  const defaultFormData: CreateAssetInput = useMemo(
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

  const buildFormData = (asset: Asset): CreateAssetInput => ({
    category: asset.category,
    name: asset.name,
    quantity: asset.quantity,
    unit: asset.unit || '',
    unitValue: asset.unitValue || 0,
    amount: asset.amount,
    currency: asset.currency,
    notes: asset.notes || '',
  });

  const [formData, setFormData] = useState<CreateAssetInput>(
    editingAsset ? buildFormData(editingAsset) : defaultFormData
  );
  const [initialFormData, setInitialFormData] = useState<CreateAssetInput | null>(
    editingAsset ? buildFormData(editingAsset) : null
  );

  const isSubmitting = createAsset.isPending || updateAsset.isPending;

  // Sync form data when editingAsset prop changes
  const [prevEditingAsset, setPrevEditingAsset] = useState(editingAsset);
  if (prevEditingAsset !== editingAsset) {
    setPrevEditingAsset(editingAsset);
    if (editingAsset) {
      const initialData = buildFormData(editingAsset);
      setFormData(initialData);
      setInitialFormData(initialData);
    }
  }

  useEffect(() => {
    if (!initialFormData || !setIsDirty) return;

    const isDirty =
      formData.category !== initialFormData.category ||
      formData.name !== initialFormData.name ||
      formData.quantity !== initialFormData.quantity ||
      formData.unit !== initialFormData.unit ||
      formData.unitValue !== initialFormData.unitValue ||
      formData.amount !== initialFormData.amount ||
      formData.currency !== initialFormData.currency ||
      formData.notes !== initialFormData.notes;

    setIsDirty(isDirty);
  }, [formData, initialFormData, setIsDirty]);

  const numberToPersianWord = useMemo(() => {
    if (formData.currency !== PIVOT_CURRENCY || (formData.amount ?? 0) <= 0) return '';
    const rounded = Math.round(formData.amount);
    return Number.isSafeInteger(rounded) ? `${numberToWords(rounded)} تومان` : '';
  }, [formData.amount, formData.currency]);

  // Quantity × unitValue = total amount (in the entry currency).
  const handleQuantityChange = (value: number) => {
    const unitValue = formData.unitValue ?? 0;
    setFormData({
      ...formData,
      quantity: value,
      amount: unitValue ? Math.round(value * unitValue * 100) / 100 : formData.amount,
    });
  };

  const handleUnitValueChange = (value: number) => {
    setFormData({
      ...formData,
      unitValue: value,
      amount: Math.round(formData.quantity * value * 100) / 100,
    });
  };

  const handleTotalValueChange = (value: number) => {
    setFormData({
      ...formData,
      amount: value,
      unitValue: formData.quantity > 0 ? Math.round((value / formData.quantity) * 100) / 100 : 0,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const dataToSubmit = { ...formData, lastValuedAt: new Date().toISOString() };

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

      setFormData(defaultFormData);
      onAssetAdded();
      if (editingAsset && onCancelEdit) onCancelEdit();
    } catch (err) {
      showToast(ensureError(err).message, 'error');
    }
  };

  const handleCancel = () => {
    setFormData(defaultFormData);
    if (onCancelEdit) onCancelEdit();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {/* Row 1: Category and Name */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4">
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

      {/* Unit Value (entry currency) */}
      <div className="space-y-1">
        <label className="text-text-secondary flex items-center gap-2 text-sm font-medium">
          <Coins className="text-text-muted h-4 w-4" />
          Unit Value ({formData.currency})
        </label>
        <AmountInput
          placeholder="e.g. 93k, 100"
          value={formData.unitValue ?? 0}
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
          <MoneyInput
            amount={formData.amount}
            currency={formData.currency}
            onAmountChange={handleTotalValueChange}
            onCurrencyChange={(currency) => setFormData({ ...formData, currency })}
            placeholder="e.g. 1k, 50m"
            required
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
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          className="border-border-subtle bg-background text-text-primary placeholder:text-text-muted focus:border-blue w-full resize-none rounded-lg border px-3 py-2 text-sm transition-all focus:outline-none"
        />
      </div>

      {/* Buttons */}
      <div className="flex gap-3 pt-1">
        <Button type="submit" disabled={isSubmitting || !formData.name} variant="primary" className="flex-1">
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
    </form>
  );
};

export default AssetForm;
