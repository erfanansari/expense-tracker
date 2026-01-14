'use client';

import { useEffect, useState } from 'react';

import { numberToWords } from '@persian-tools/persian-tools';
import { ChevronDown, DollarSign, FileText, Loader2, Package, Plus, Save, X } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

import { usdToToman } from '@features/ExchangeRate/utils/currency-conversion';

import Button from '@components/Button';
import Tooltip from '@components/Tooltip';

import type { Asset, AssetCategory, CreateAssetInput } from '@/@types/asset';
import { ASSET_CATEGORIES } from '@/constants/assets';

interface AssetFormProps {
  onAssetAdded: () => void;
  editingAsset?: Asset;
  onCancelEdit?: () => void;
}

const AssetForm = ({ onAssetAdded, editingAsset, onCancelEdit }: AssetFormProps) => {
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
      setFormData({
        category: editingAsset.category,
        name: editingAsset.name,
        quantity: editingAsset.quantity,
        unit: editingAsset.unit || '',
        unitValueUsd: editingAsset.unitValueUsd || 0,
        totalValueUsd: editingAsset.totalValueUsd,
        totalValueToman: editingAsset.totalValueToman,
        exchangeRateUsed: editingAsset.exchangeRateUsed,
        notes: editingAsset.notes || '',
      });
      setExchangeRate(editingAsset.exchangeRateUsed);
    }
  }, [editingAsset]);

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
        setMessage({
          type: 'success',
          text: editingAsset ? 'Asset updated successfully!' : 'Asset added successfully!',
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
        setMessage({ type: 'error', text: error.error || 'Failed to save asset' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Failed to save asset' });
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
    <div className="relative rounded-xl border border-[#e5e5e5] bg-white p-6 shadow-sm">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-lg border border-[#e5e5e5] bg-[#fafafa] p-2.5">
            {editingAsset ? <Save className="h-5 w-5 text-[#525252]" /> : <Plus className="h-5 w-5 text-[#525252]" />}
          </div>
          <div>
            <h2 className="text-lg font-semibold text-[#171717]">
              {editingAsset ? 'Update Asset Value' : 'Add New Asset'}
            </h2>
            <p className="text-sm text-[#a3a3a3]" dir="rtl">
              {editingAsset ? 'بروزرسانی ارزش دارایی' : 'افزودن دارایی جدید'}
            </p>
          </div>
        </div>
        {editingAsset && (
          <button
            onClick={handleCancel}
            className="rounded-lg p-2 text-[#a3a3a3] transition-all hover:bg-[#f5f5f5] hover:text-[#171717]"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Message */}
      {message && (
        <div
          className={twMerge(
            'mb-6 rounded-lg border p-4',
            message.type === 'success'
              ? 'border-[#10b981] bg-[#ecfdf5] text-[#10b981]'
              : 'border-[#ef4444] bg-[#fef2f2] text-[#ef4444]'
          )}
        >
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Row 1: Category and Name */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Category */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-[#525252]">
              <Package className="h-4 w-4 text-[#a3a3a3]" />
              Category / دسته‌بندی
            </label>
            <div className="relative">
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as AssetCategory })}
                required
                className="w-full cursor-pointer appearance-none rounded-lg border border-[#e5e5e5] bg-white px-4 py-3 pr-10 text-[#171717] transition-all focus:border-[#0070f3] focus:outline-none"
              >
                {ASSET_CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label} / {cat.labelFa}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-[#a3a3a3]" />
            </div>
          </div>

          {/* Name */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-[#525252]">
              <FileText className="h-4 w-4 text-[#a3a3a3]" />
              Name / نام
            </label>
            <input
              type="text"
              placeholder="e.g., BTC, Gold 18K, Bank Melli..."
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full rounded-lg border border-[#e5e5e5] bg-white px-4 py-3 text-[#171717] transition-all placeholder:text-[#a3a3a3] focus:border-[#0070f3] focus:outline-none"
            />
          </div>
        </div>

        {/* Row 2: Quantity and Unit */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-[#525252]">
              <Package className="h-4 w-4 text-[#a3a3a3]" />
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
              className="w-full rounded-lg border border-[#e5e5e5] bg-white px-4 py-3 text-[#171717] transition-all placeholder:text-[#a3a3a3] focus:border-[#0070f3] focus:outline-none"
            />
          </div>
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-[#525252]">
              <span className="text-[#a3a3a3]">U</span>
              Unit / واحد (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g., BTC, gram, unit..."
              value={formData.unit || ''}
              onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
              className="w-full rounded-lg border border-[#e5e5e5] bg-white px-4 py-3 text-[#171717] transition-all placeholder:text-[#a3a3a3] focus:border-[#0070f3] focus:outline-none"
            />
          </div>
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-[#525252]">
              <DollarSign className="h-4 w-4 text-[#0070f3]" />
              Unit Value (USD)
            </label>
            <input
              type="number"
              placeholder="100"
              min="0"
              step="0.01"
              value={formData.unitValueUsd || ''}
              onChange={(e) => handleUnitValueChange(parseFloat(e.target.value) || 0)}
              className="w-full rounded-lg border border-[#e5e5e5] bg-white px-4 py-3 text-[#171717] transition-all placeholder:text-[#a3a3a3] focus:border-[#0070f3] focus:outline-none"
            />
          </div>
        </div>

        {/* Total Value and Rate */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {/* Total USD */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-[#525252]">
              <DollarSign className="h-4 w-4 text-[#0070f3]" />
              Total Value (USD)
            </label>
            <input
              type="number"
              placeholder="1000"
              required
              min="0"
              step="0.01"
              value={formData.totalValueUsd || ''}
              onChange={(e) => handleTotalValueChange(parseFloat(e.target.value) || 0)}
              className="w-full rounded-lg border border-[#e5e5e5] bg-white px-4 py-3 text-[#171717] transition-all placeholder:text-[#a3a3a3] focus:border-[#0070f3] focus:outline-none"
            />
          </div>

          {/* Total Toman */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-[#525252]">
              <span className="font-bold text-[#10b981]">T</span>
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
                className="w-full rounded-lg border border-[#e5e5e5] bg-[#fafafa] px-4 py-3 text-[#525252] transition-all"
              />
            </Tooltip>
          </div>

          {/* Exchange Rate */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-[#525252]">
              <span className="text-[#a3a3a3]">↔</span>
              Rate / نرخ
              {isFetchingRate && <Loader2 className="h-3 w-3 animate-spin text-[#a3a3a3]" />}
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
              className="w-full rounded-lg border border-[#e5e5e5] bg-white px-4 py-3 text-[#171717] transition-all placeholder:text-[#a3a3a3] focus:border-[#0070f3] focus:outline-none disabled:cursor-wait disabled:opacity-50"
            />
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-[#525252]">
            <FileText className="h-4 w-4 text-[#a3a3a3]" />
            Notes / یادداشت (Optional)
          </label>
          <textarea
            placeholder="Any additional notes..."
            rows={2}
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            className="w-full resize-none rounded-lg border border-[#e5e5e5] bg-white px-4 py-3 text-[#171717] transition-all placeholder:text-[#a3a3a3] focus:border-[#0070f3] focus:outline-none"
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
    </div>
  );
};

export default AssetForm;
