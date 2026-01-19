'use client';

import { useEffect, useState } from 'react';

import { numberToWords } from '@persian-tools/persian-tools';
import { ChevronDown, DollarSign, FileText, Loader2, Package, Plus, Save } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

import { usdToToman } from '@features/ExchangeRate/utils/currency-conversion';

import Button from '@components/Button';
import { useToast } from '@components/Toast/ToastProvider';
import Tooltip from '@components/Tooltip';

import type { Asset, AssetCategory, CreateAssetInput } from '@/@types/asset';
import { ASSET_CATEGORIES } from '@/constants/assets';

interface AssetFormProps {
  onAssetAdded: () => void;
  editingAsset?: Asset;
  onCancelEdit?: () => void;
  setIsDirty?: (dirty: boolean) => void;
}

const AssetForm = ({ onAssetAdded, editingAsset, onCancelEdit, setIsDirty }: AssetFormProps) => {
  const { showToast } = useToast();
  const [formData, setFormData] = useState<CreateAssetInput>({
    category: 'cash',
    name: '',
    quantity: 1,
    unit: '',
    unitValueUsd: 0,
    totalValueUsd: 0,
    totalValueToman: 0,
    exchangeRateUsed: 0,
    notes: '',
  });
  const [exchangeRate, setExchangeRate] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isFetchingRate, setIsFetchingRate] = useState(true);
  const [initialFormData, setInitialFormData] = useState<CreateAssetInput | null>(null);

  // Fetch exchange rate
  useEffect(() => {
    const fetchExchangeRate = async () => {
      try {
        const response = await fetch('/api/exchange-rate');
        if (response.ok) {
          const data = await response.json();
          const rate = parseInt(data.usd.value, 10);
          setExchangeRate(rate);
          setFormData((prev) => ({ ...prev, exchangeRateUsed: rate }));
        }
      } catch (error) {
        console.warn('Failed to fetch exchange rate:', error);
      } finally {
        setIsFetchingRate(false);
      }
    };

    fetchExchangeRate();
  }, []);

  // Load editing asset data
  useEffect(() => {
    if (editingAsset) {
      const initialData = {
        category: editingAsset.category,
        name: editingAsset.name,
        quantity: editingAsset.quantity,
        unit: editingAsset.unit || '',
        unitValueUsd: editingAsset.unitValueUsd || 0,
        totalValueUsd: editingAsset.totalValueUsd,
        totalValueToman: editingAsset.totalValueToman,
        exchangeRateUsed: editingAsset.exchangeRateUsed,
        notes: editingAsset.notes || '',
      };
      setFormData(initialData);
      setInitialFormData(initialData);
      setExchangeRate(editingAsset.exchangeRateUsed);
    }
  }, [editingAsset]);

  // Set initial form data when exchange rate is loaded (for new assets)
  useEffect(() => {
    if (!editingAsset && exchangeRate > 0 && !initialFormData) {
      setInitialFormData({
        category: 'cash',
        name: '',
        quantity: 1,
        unit: '',
        unitValueUsd: 0,
        totalValueUsd: 0,
        totalValueToman: 0,
        exchangeRateUsed: exchangeRate,
        notes: '',
      });
    }
  }, [editingAsset, exchangeRate, initialFormData]);

  // Track form changes and update dirty state
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
    setExchangeRate(value);
    setFormData((prev) => ({
      ...prev,
      exchangeRateUsed: value,
      totalValueToman: Math.round(usdToToman(prev.totalValueUsd, value)),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      const url = editingAsset ? `/api/assets/${editingAsset.id}` : '/api/assets';
      const method = editingAsset ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          exchangeRateUsed: exchangeRate,
          lastValuedAt: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        const successMessage = editingAsset ? 'Asset updated successfully!' : 'Asset added successfully!';
        showToast(successMessage, 'success');
        setMessage({
          type: 'success',
          text: successMessage,
        });
        setFormData({
          category: 'cash',
          name: '',
          quantity: 1,
          unit: '',
          unitValueUsd: 0,
          totalValueUsd: 0,
          totalValueToman: 0,
          exchangeRateUsed: exchangeRate,
          notes: '',
        });
        onAssetAdded();
        if (editingAsset && onCancelEdit) {
          onCancelEdit();
        }
      } else {
        const error = await response.json();
        const errorMessage = error.error || 'Failed to save asset';
        showToast(errorMessage, 'error');
        setMessage({ type: 'error', text: errorMessage });
      }
    } catch {
      const errorMessage = 'Failed to save asset';
      showToast(errorMessage, 'error');
      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      category: 'cash',
      name: '',
      quantity: 1,
      unit: '',
      unitValueUsd: 0,
      totalValueUsd: 0,
      totalValueToman: 0,
      exchangeRateUsed: exchangeRate,
      notes: '',
    });
    if (onCancelEdit) {
      onCancelEdit();
    }
  };

  return (
    <>
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
        {/* Row 1: Category and Name */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-8">
          {/* Category */}
          <div className="space-y-2">
            <label className="text-text-secondary flex items-center gap-2 text-sm font-medium">
              <Package className="text-text-muted h-4 w-4" />
              Category / دسته‌بندی
            </label>
            <div className="relative">
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as AssetCategory })}
                required
                className="border-border-subtle bg-background text-text-primary focus:border-blue w-full cursor-pointer appearance-none rounded-lg border px-4 py-3 pr-10 text-sm transition-all focus:outline-none"
              >
                {ASSET_CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label} / {cat.labelFa}
                  </option>
                ))}
              </select>
              <ChevronDown className="text-text-muted pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2" />
            </div>
          </div>

          {/* Name */}
          <div className="space-y-2">
            <label className="text-text-secondary flex items-center gap-2 text-sm font-medium">
              <FileText className="text-text-muted h-4 w-4" />
              Name / نام
            </label>
            <input
              type="text"
              placeholder="e.g., BTC, Gold 18K, Bank Melli..."
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="border-border-subtle bg-background text-text-primary placeholder:text-text-muted focus:border-blue w-full rounded-lg border px-4 py-3 transition-all focus:outline-none"
            />
          </div>
        </div>

        {/* Row 2: Quantity and Unit - 2 columns */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-8">
          <div className="space-y-2">
            <label className="text-text-secondary flex items-center gap-2 text-sm font-medium">
              <Package className="text-text-muted h-4 w-4" />
              Quantity / مقدار
            </label>
            <input
              type="number"
              placeholder="1"
              required
              min="0"
              step="any"
              value={formData.quantity || ''}
              onChange={(e) => handleQuantityChange(parseFloat(e.target.value) || 0)}
              className="border-border-subtle bg-background text-text-primary placeholder:text-text-muted focus:border-blue w-full rounded-lg border px-4 py-3 text-sm transition-all focus:outline-none"
            />
          </div>
          <div className="space-y-2">
            <label className="text-text-secondary flex items-center gap-2 text-sm font-medium">
              <span className="text-text-muted">U</span>
              Unit / واحد (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g., BTC, gram, unit..."
              value={formData.unit || ''}
              onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
              className="border-border-subtle bg-background text-text-primary placeholder:text-text-muted focus:border-blue w-full rounded-lg border px-4 py-3 text-sm transition-all focus:outline-none"
            />
          </div>
        </div>

        {/* Unit Value (USD) - full width */}
        <div className="space-y-2">
          <label className="text-text-secondary flex items-center gap-2 text-sm font-medium">
            <DollarSign className="text-blue h-4 w-4" />
            Unit Value (USD) / ارزش واحد (دلار)
          </label>
          <input
            type="number"
            placeholder="100"
            min="0"
            step="0.01"
            value={formData.unitValueUsd || ''}
            onChange={(e) => handleUnitValueChange(parseFloat(e.target.value) || 0)}
            className="border-border-subtle bg-background text-text-primary placeholder:text-text-muted focus:border-blue w-full rounded-lg border px-4 py-3 transition-all focus:outline-none"
          />
        </div>

        {/* Total Values - 2 columns */}
        <div className="grid grid-cols-1 gap-4">
          {/* Total Toman (on left) */}
          <div className="space-y-2">
            <label className="text-text-secondary flex items-center gap-2 text-sm font-medium">
              <span className="text-success font-bold">T</span>
              Total (Toman) / ارزش کل (تومان)
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
                className="border-border-subtle bg-background-secondary text-text-secondary w-full rounded-lg border px-4 py-3 transition-all"
              />
            </Tooltip>
          </div>

          {/* Total Value USD (on right) */}
          <div className="space-y-2">
            <label className="text-text-secondary flex items-center gap-2 text-sm font-medium">
              <DollarSign className="text-blue h-4 w-4" />
              Total Value (USD) / ارزش کل (دلار)
            </label>
            <input
              type="number"
              placeholder="1000"
              required
              min="0"
              step="0.01"
              value={formData.totalValueUsd || ''}
              onChange={(e) => handleTotalValueChange(parseFloat(e.target.value) || 0)}
              className="border-border-subtle bg-background text-text-primary placeholder:text-text-muted focus:border-blue w-full rounded-lg border px-4 py-3 transition-all focus:outline-none"
            />
          </div>
        </div>

        {/* Exchange Rate - separate row */}
        <div className="space-y-2">
          <label className="text-text-secondary flex items-center gap-2 text-sm font-medium">
            <span className="text-text-muted">↔</span>
            Exchange Rate / نرخ تبدیل
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
            className="border-border-subtle bg-background text-text-primary placeholder:text-text-muted focus:border-blue w-full rounded-lg border px-4 py-3 transition-all focus:outline-none disabled:cursor-wait disabled:opacity-50"
          />
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <label className="text-text-secondary flex items-center gap-2 text-sm font-medium">
            <FileText className="text-text-muted h-4 w-4" />
            Notes / یادداشت (Optional)
          </label>
          <textarea
            placeholder="Any additional notes..."
            rows={2}
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            className="border-border-subtle bg-background text-text-primary placeholder:text-text-muted focus:border-blue w-full resize-none rounded-lg border px-4 py-3 transition-all focus:outline-none"
          />
        </div>

        {/* Buttons */}
        <div className="flex gap-3 pt-2">
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
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading...
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
                  {editingAsset ? <Save className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                  {editingAsset ? 'Update / بروزرسانی' : 'Add / افزودن'}
                </>
              );
            })()}
          </Button>
          {editingAsset && (
            <Button type="button" onClick={handleCancel} variant="outline">
              Cancel / لغو
            </Button>
          )}
        </div>
      </form>
    </>
  );
};

export default AssetForm;
