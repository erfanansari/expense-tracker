'use client';

import { useState, useEffect } from 'react';
import { Plus, X, Save, Loader2, DollarSign, Calendar, FileText, Layers, ChevronDown } from 'lucide-react';
import { type CreateExpenseInput, type Tag } from '@/@types/expense';
import { EXPENSE_CATEGORIES } from '@/constants';
import { tomanToUsd, usdToToman } from '@features/ExchangeRate/utils/currency-conversion';
import TagInput from '../TagInput';
import Button from '@components/Button';

interface ExpenseFormProps {
  onExpenseAdded: () => void;
  editingExpense?: { id: number; tags?: Tag[] } & CreateExpenseInput;
  onCancelEdit?: () => void;
}

const ExpenseForm = ({ onExpenseAdded, editingExpense, onCancelEdit }: ExpenseFormProps) => {
  const [formData, setFormData] = useState<CreateExpenseInput>({
    date: new Date().toISOString().split('T')[0],
    category: '',
    description: '',
    price_toman: 0,
    price_usd: 0,
    tagIds: []
  });
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const [exchangeRate, setExchangeRate] = useState(0);
  const [lastChanged, setLastChanged] = useState<'toman' | 'usd'>('toman');
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

          // Log fetch status
          if (data._meta?.fetchedAt) {
            console.log(`Exchange rate: ${rate.toLocaleString()} Toman/USD (fetched: ${data._meta.fetchedAt}, cached until: ${data._meta.cachedUntil})`);
          } else {
            console.log(`Exchange rate: ${rate.toLocaleString()} Toman/USD (${data.usd.date})`);
          }
        } else {
          console.warn('Exchange rate API unavailable, user must enter rate manually');
        }
      } catch (error) {
        console.warn('Failed to fetch exchange rate, user must enter rate manually:', error);
      } finally {
        setIsFetchingRate(false);
      }
    };

    fetchExchangeRate();
  }, []);

  // Load editing expense data
  useEffect(() => {
    if (editingExpense) {
      setFormData({
        date: editingExpense.date,
        category: editingExpense.category,
        description: editingExpense.description,
        price_toman: editingExpense.price_toman,
        price_usd: editingExpense.price_usd,
        tagIds: editingExpense.tags?.map(t => t.id) || []
      });
      setSelectedTags(editingExpense.tags || []);
      // Calculate rate from existing data (full Toman value)
      if (editingExpense.price_toman && editingExpense.price_usd) {
        setExchangeRate(Math.round(editingExpense.price_toman / editingExpense.price_usd));
      }
    }
  }, [editingExpense]);

  const handleTomanChange = (value: number) => {
    setFormData({
      ...formData,
      price_toman: value,
      price_usd: tomanToUsd(value, exchangeRate),
    });
    setLastChanged('toman');
  };

  const handleUsdChange = (value: number) => {
    setFormData({
      ...formData,
      price_usd: value,
      price_toman: usdToToman(value, exchangeRate),
    });
    setLastChanged('usd');
  };

  const handleRateChange = (value: number) => {
    setExchangeRate(value);
    // Recalculate based on last changed field
    if (lastChanged === 'toman') {
      setFormData({
        ...formData,
        price_usd: tomanToUsd(formData.price_toman, value),
      });
    } else {
      setFormData({
        ...formData,
        price_toman: usdToToman(formData.price_usd, value),
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      const url = editingExpense ? `/api/expenses/${editingExpense.id}` : '/api/expenses';
      const method = editingExpense ? 'PUT' : 'POST';

      // Sync tagIds with selectedTags
      const dataToSubmit = {
        ...formData,
        tagIds: selectedTags.map(t => t.id)
      };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSubmit),
      });

      if (response.ok) {
        setMessage({
          type: 'success',
          text: editingExpense ? 'Expense updated successfully!' : 'Expense added successfully!'
        });
        setFormData({
          date: new Date().toISOString().split('T')[0],
          category: '',
          description: '',
          price_toman: 0,
          price_usd: 0,
          tagIds: []
        });
        setSelectedTags([]);
        // Keep the fetched exchange rate (don't reset it)
        onExpenseAdded();
        if (editingExpense && onCancelEdit) {
          onCancelEdit();
        }
      } else {
        const error = await response.json();
        setMessage({ type: 'error', text: error.error || 'Failed to save expense' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Failed to save expense' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      date: new Date().toISOString().split('T')[0],
      category: '',
      description: '',
      price_toman: 0,
      price_usd: 0,
    });
    // Keep the fetched exchange rate (don't reset it)
    if (onCancelEdit) {
      onCancelEdit();
    }
  };

  return (
    <div className="relative bg-white rounded-xl border border-[#e5e5e5] p-6 shadow-sm">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#fafafa] rounded-lg border border-[#e5e5e5]">
            {editingExpense ? (
              <Save className="h-5 w-5 text-[#525252]" />
            ) : (
              <Plus className="h-5 w-5 text-[#525252]" />
            )}
          </div>
          <div>
            <h2 className="text-lg font-semibold text-[#171717]">
              {editingExpense ? 'Edit Expense' : 'Add New Expense'}
            </h2>
            <p className="text-sm text-[#a3a3a3]" dir="rtl">
              {editingExpense ? 'ویرایش هزینه' : 'افزودن هزینه جدید'}
            </p>
          </div>
        </div>
        {editingExpense && (
          <button
            onClick={handleCancel}
            className="p-2 rounded-lg text-[#a3a3a3] hover:text-[#171717] hover:bg-[#f5f5f5] transition-all"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Message */}
      {message && (
        <div className={`mb-6 p-4 rounded-lg border ${
          message.type === 'success'
            ? 'bg-[#ecfdf5] border-[#10b981] text-[#10b981]'
            : 'bg-[#fef2f2] border-[#ef4444] text-[#ef4444]'
        }`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Row 1: Category and Date */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Category */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-[#525252]">
              <Layers className="h-4 w-4 text-[#a3a3a3]" />
              Category / دسته‌بندی
            </label>
            <div className="relative">
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                required
                className="w-full px-4 py-3 pr-10 bg-white border border-[#e5e5e5] rounded-lg text-[#171717] focus:outline-none focus:border-[#0070f3] transition-all appearance-none cursor-pointer"
              >
                <option value="" className="bg-white">Select category...</option>
                {EXPENSE_CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value} className="bg-white">
                    {cat.label} / {cat.labelFa}
                  </option>
                ))}
              </select>
              <ChevronDown className="h-4 w-4 text-[#a3a3a3] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Date */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-[#525252]">
              <Calendar className="h-4 w-4 text-[#a3a3a3]" />
              Date / تاریخ
            </label>
            <input
              type="date"
              required
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-4 py-3 bg-white border border-[#e5e5e5] rounded-lg text-[#171717] focus:outline-none focus:border-[#0070f3] transition-all"
            />
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-[#525252]">
            <FileText className="h-4 w-4 text-[#a3a3a3]" />
            Description / توضیحات
          </label>
          <textarea
            placeholder="Enter expense details..."
            required
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-4 py-3 bg-white border border-[#e5e5e5] rounded-lg text-[#171717] placeholder:text-[#a3a3a3] focus:outline-none focus:border-[#0070f3] transition-all resize-none"
          />
        </div>

        {/* Tags */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-[#525252]">
            <span className="text-[#a3a3a3]">#</span>
            Tags / برچسب‌ها
          </label>
          <TagInput selectedTags={selectedTags} onTagsChange={setSelectedTags} />
        </div>

        {/* Prices and Rate */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Toman */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-[#525252]">
              <span className="text-[#10b981] font-bold">T</span>
              Price (Toman) / مبلغ (تومان)
            </label>
            <input
              type="number"
              placeholder="60000"
              required
              min="0"
              step="1"
              value={formData.price_toman || ''}
              onChange={(e) => handleTomanChange(parseFloat(e.target.value) || 0)}
              className="w-full px-4 py-3 bg-white border border-[#e5e5e5] rounded-lg text-[#171717] placeholder:text-[#a3a3a3] focus:outline-none focus:border-[#10b981] transition-all"
            />
          </div>

          {/* USD */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-[#525252]">
              <DollarSign className="h-4 w-4 text-[#0070f3]" />
              Price (USD) / مبلغ (دلار)
            </label>
            <input
              type="number"
              placeholder="0.00"
              required
              min="0"
              step="0.01"
              value={formData.price_usd || ''}
              onChange={(e) => handleUsdChange(parseFloat(e.target.value) || 0)}
              className="w-full px-4 py-3 bg-white border border-[#e5e5e5] rounded-lg text-[#171717] placeholder:text-[#a3a3a3] focus:outline-none focus:border-[#0070f3] transition-all"
            />
          </div>

          {/* Exchange Rate */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-[#525252]">
              <span className="text-[#a3a3a3]">↔</span>
              Rate (Toman/USD) / نرخ
              {isFetchingRate && (
                <Loader2 className="h-3 w-3 animate-spin text-[#a3a3a3]" />
              )}
            </label>
            <input
              type="number"
              placeholder="130100"
              required
              min="1"
              step="1"
              value={exchangeRate || ''}
              onChange={(e) => handleRateChange(parseFloat(e.target.value) || exchangeRate)}
              disabled={isFetchingRate}
              className="w-full px-4 py-3 bg-white border border-[#e5e5e5] rounded-lg text-[#171717] placeholder:text-[#a3a3a3] focus:outline-none focus:border-[#0070f3] transition-all disabled:opacity-50 disabled:cursor-wait"
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
            {isFetchingRate ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading rate...
              </>
            ) : isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                {editingExpense ? <Save className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                {editingExpense ? 'Update / بروزرسانی' : 'Add / افزودن'}
              </>
            )}
          </Button>
          {editingExpense && (
            <Button
              type="button"
              onClick={handleCancel}
              variant="outline"
            >
              Cancel / لغو
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}

export default ExpenseForm;