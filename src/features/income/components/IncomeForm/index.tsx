'use client';

import { useEffect, useState } from 'react';

import { numberToWords } from '@persian-tools/persian-tools';
import { Briefcase, Calendar, ChevronDown, DollarSign, FileText, Loader2, Plus, Save, X } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

import { tomanToUsd, usdToToman } from '@features/ExchangeRate/utils/currency-conversion';

import Button from '@components/Button';
import Tooltip from '@components/Tooltip';

import type { CreateIncomeInput, Income } from '@/@types/income';
import { INCOME_TYPES, MONTHS } from '@/constants/income';

interface IncomeFormProps {
  onIncomeAdded: () => void;
  editingIncome?: Income;
  onCancelEdit?: () => void;
}

const IncomeForm = ({ onIncomeAdded, editingIncome, onCancelEdit }: IncomeFormProps) => {
  const currentDate = new Date();
  const [formData, setFormData] = useState<CreateIncomeInput>({
    amountUsd: 0,
    amountToman: 0,
    exchangeRateUsed: 0,
    month: currentDate.getMonth() + 1,
    year: currentDate.getFullYear(),
    incomeType: 'salary',
    source: '',
    notes: '',
  });
  const [exchangeRate, setExchangeRate] = useState(0);
  const [lastChanged, setLastChanged] = useState<'toman' | 'usd'>('usd');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isFetchingRate, setIsFetchingRate] = useState(true);

  // Fetch latest exchange rate on mount
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

  // Load editing income data
  useEffect(() => {
    if (editingIncome) {
      setFormData({
        amountUsd: editingIncome.amountUsd,
        amountToman: editingIncome.amountToman,
        exchangeRateUsed: editingIncome.exchangeRateUsed,
        month: editingIncome.month,
        year: editingIncome.year,
        incomeType: editingIncome.incomeType,
        source: editingIncome.source || '',
        notes: editingIncome.notes || '',
      });
      setExchangeRate(editingIncome.exchangeRateUsed);
    }
  }, [editingIncome]);

  const numberToPersianWord = formData.amountToman > 0 ? `${numberToWords(formData.amountToman)} تومان` : '';

  const handleTomanChange = (value: number) => {
    setFormData({
      ...formData,
      amountToman: value,
      amountUsd: tomanToUsd(value, exchangeRate),
    });
    setLastChanged('toman');
  };

  const handleUsdChange = (value: number) => {
    setFormData({
      ...formData,
      amountUsd: value,
      amountToman: usdToToman(value, exchangeRate),
    });
    setLastChanged('usd');
  };

  const handleRateChange = (value: number) => {
    setExchangeRate(value);
    setFormData((prev) => ({
      ...prev,
      exchangeRateUsed: value,
      ...(lastChanged === 'toman'
        ? { amountUsd: tomanToUsd(prev.amountToman, value) }
        : { amountToman: usdToToman(prev.amountUsd, value) }),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      const url = editingIncome ? `/api/incomes/${editingIncome.id}` : '/api/incomes';
      const method = editingIncome ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          exchangeRateUsed: exchangeRate,
        }),
      });

      if (response.ok) {
        setMessage({
          type: 'success',
          text: editingIncome ? 'Income updated successfully!' : 'Income added successfully!',
        });
        setFormData({
          amountUsd: 0,
          amountToman: 0,
          exchangeRateUsed: exchangeRate,
          month: currentDate.getMonth() + 1,
          year: currentDate.getFullYear(),
          incomeType: 'salary',
          source: '',
          notes: '',
        });
        onIncomeAdded();
        if (editingIncome && onCancelEdit) {
          onCancelEdit();
        }
      } else {
        const error = await response.json();
        setMessage({ type: 'error', text: error.error || 'Failed to save income' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Failed to save income' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      amountUsd: 0,
      amountToman: 0,
      exchangeRateUsed: exchangeRate,
      month: currentDate.getMonth() + 1,
      year: currentDate.getFullYear(),
      incomeType: 'salary',
      source: '',
      notes: '',
    });
    if (onCancelEdit) {
      onCancelEdit();
    }
  };

  // Generate year options (current year - 5 to current year + 1)
  const yearOptions = [];
  for (let y = currentDate.getFullYear() + 1; y >= currentDate.getFullYear() - 5; y--) {
    yearOptions.push(y);
  }

  return (
    <div className="relative rounded-xl border border-[#e5e5e5] bg-white p-6 shadow-sm">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-lg border border-[#e5e5e5] bg-[#fafafa] p-2.5">
            {editingIncome ? <Save className="h-5 w-5 text-[#525252]" /> : <Plus className="h-5 w-5 text-[#525252]" />}
          </div>
          <div>
            <h2 className="text-lg font-semibold text-[#171717]">{editingIncome ? 'Edit Income' : 'Add New Income'}</h2>
            <p className="text-sm text-[#a3a3a3]" dir="rtl">
              {editingIncome ? 'ویرایش درآمد' : 'افزودن درآمد جدید'}
            </p>
          </div>
        </div>
        {editingIncome && (
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
        {/* Row 1: Income Type, Month, Year */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {/* Income Type */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-[#525252]">
              <Briefcase className="h-4 w-4 text-[#a3a3a3]" />
              Type / نوع
            </label>
            <div className="relative">
              <select
                value={formData.incomeType}
                onChange={(e) =>
                  setFormData({ ...formData, incomeType: e.target.value as CreateIncomeInput['incomeType'] })
                }
                required
                className="w-full cursor-pointer appearance-none rounded-lg border border-[#e5e5e5] bg-white px-4 py-3 pr-10 text-[#171717] transition-all focus:border-[#0070f3] focus:outline-none"
              >
                {INCOME_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label} / {type.labelFa}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-[#a3a3a3]" />
            </div>
          </div>

          {/* Month */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-[#525252]">
              <Calendar className="h-4 w-4 text-[#a3a3a3]" />
              Month / ماه
            </label>
            <div className="relative">
              <select
                value={formData.month}
                onChange={(e) => setFormData({ ...formData, month: parseInt(e.target.value, 10) })}
                required
                className="w-full cursor-pointer appearance-none rounded-lg border border-[#e5e5e5] bg-white px-4 py-3 pr-10 text-[#171717] transition-all focus:border-[#0070f3] focus:outline-none"
              >
                {MONTHS.map((month) => (
                  <option key={month.value} value={month.value}>
                    {month.label} / {month.labelFa}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-[#a3a3a3]" />
            </div>
          </div>

          {/* Year */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-[#525252]">
              <Calendar className="h-4 w-4 text-[#a3a3a3]" />
              Year / سال
            </label>
            <div className="relative">
              <select
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value, 10) })}
                required
                className="w-full cursor-pointer appearance-none rounded-lg border border-[#e5e5e5] bg-white px-4 py-3 pr-10 text-[#171717] transition-all focus:border-[#0070f3] focus:outline-none"
              >
                {yearOptions.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-[#a3a3a3]" />
            </div>
          </div>
        </div>

        {/* Source */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-[#525252]">
            <Briefcase className="h-4 w-4 text-[#a3a3a3]" />
            Source / منبع (Optional)
          </label>
          <input
            type="text"
            placeholder="e.g., Company Name, Client..."
            value={formData.source}
            onChange={(e) => setFormData({ ...formData, source: e.target.value })}
            className="w-full rounded-lg border border-[#e5e5e5] bg-white px-4 py-3 text-[#171717] transition-all placeholder:text-[#a3a3a3] focus:border-[#0070f3] focus:outline-none"
          />
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

        {/* Amounts and Rate */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {/* USD */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-[#525252]">
              <DollarSign className="h-4 w-4 text-[#0070f3]" />
              Amount (USD) / مبلغ (دلار)
            </label>
            <input
              type="number"
              placeholder="3000"
              required
              min="0"
              step="0.01"
              value={formData.amountUsd || ''}
              onChange={(e) => handleUsdChange(parseFloat(e.target.value) || 0)}
              className="w-full rounded-lg border border-[#e5e5e5] bg-white px-4 py-3 text-[#171717] transition-all placeholder:text-[#a3a3a3] focus:border-[#0070f3] focus:outline-none"
            />
          </div>

          {/* Toman */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-[#525252]">
              <span className="font-bold text-[#10b981]">T</span>
              Amount (Toman) / مبلغ (تومان)
            </label>
            <Tooltip content={numberToPersianWord} position="top">
              <input
                type="number"
                placeholder="390000000"
                required
                min="0"
                step="1"
                value={formData.amountToman || ''}
                onChange={(e) => handleTomanChange(parseFloat(e.target.value) || 0)}
                className="w-full rounded-lg border border-[#e5e5e5] bg-white px-4 py-3 text-[#171717] transition-all placeholder:text-[#a3a3a3] focus:border-[#10b981] focus:outline-none"
              />
            </Tooltip>
          </div>

          {/* Exchange Rate */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-[#525252]">
              <span className="text-[#a3a3a3]">↔</span>
              Rate (Toman/USD) / نرخ
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

        {/* Buttons */}
        <div className="flex gap-3 pt-2">
          <Button
            type="submit"
            disabled={isSubmitting || isFetchingRate || !exchangeRate}
            variant="primary"
            className="flex-1"
          >
            {(() => {
              if (isFetchingRate) {
                return (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading rate...
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
                  {editingIncome ? <Save className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                  {editingIncome ? 'Update / بروزرسانی' : 'Add / افزودن'}
                </>
              );
            })()}
          </Button>
          {editingIncome && (
            <Button type="button" onClick={handleCancel} variant="outline">
              Cancel / لغو
            </Button>
          )}
        </div>
      </form>
    </div>
  );
};

export default IncomeForm;
