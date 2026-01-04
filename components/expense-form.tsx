'use client';

import { useState, useEffect } from 'react';
import { Plus, X, Save, Loader2, DollarSign, Calendar, FileText, Layers } from 'lucide-react';
import { type CreateExpenseInput, type Tag } from '@/lib/types/expense';
import { categories } from '@/lib/utils';
import { tomanToUsd, usdToToman } from '@/lib/constants';
import { TagInput } from './tag-input';

interface ExpenseFormProps {
  onExpenseAdded: () => void;
  editingExpense?: { id: number; tags?: Tag[] } & CreateExpenseInput;
  onCancelEdit?: () => void;
}

export function ExpenseForm({ onExpenseAdded, editingExpense, onCancelEdit }: ExpenseFormProps) {
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
    <div className="relative bg-[var(--background-card)] rounded-2xl border border-[var(--border-subtle)] p-6 overflow-hidden">
      {/* Card Glow Effect */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-500/50 to-transparent" />

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-emerald-500/20 to-green-500/20 rounded-xl border border-emerald-500/20">
            {editingExpense ? (
              <Save className="h-5 w-5 text-emerald-400" />
            ) : (
              <Plus className="h-5 w-5 text-emerald-400" />
            )}
          </div>
          <div>
            <h2 className="text-lg font-semibold text-[var(--foreground)]">
              {editingExpense ? 'Edit Expense' : 'Add New Expense'}
            </h2>
            <p className="text-sm text-[var(--foreground-muted)]" dir="rtl">
              {editingExpense ? 'ویرایش هزینه' : 'افزودن هزینه جدید'}
            </p>
          </div>
        </div>
        {editingExpense && (
          <button
            onClick={handleCancel}
            className="p-2 rounded-lg text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--background-hover)] transition-all"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Message */}
      {message && (
        <div className={`mb-6 p-4 rounded-xl border ${
          message.type === 'success'
            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
            : 'bg-red-500/10 border-red-500/20 text-red-400'
        }`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Row 1: Category and Date */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Category */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-[var(--foreground-secondary)]">
              <Layers className="h-4 w-4 text-violet-400" />
              Category / دسته‌بندی
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              required
              className="w-full px-4 py-3 bg-[var(--background-elevated)] border border-[var(--border-subtle)] rounded-xl text-[var(--foreground)] focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 transition-all appearance-none cursor-pointer"
            >
              <option value="" className="bg-[var(--background-card)]">Select category...</option>
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value} className="bg-[var(--background-card)]">
                  {cat.label} / {cat.labelFa}
                </option>
              ))}
            </select>
          </div>

          {/* Date */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-[var(--foreground-secondary)]">
              <Calendar className="h-4 w-4 text-violet-400" />
              Date / تاریخ
            </label>
            <input
              type="date"
              required
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-4 py-3 bg-[var(--background-elevated)] border border-[var(--border-subtle)] rounded-xl text-[var(--foreground)] focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 transition-all"
            />
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-[var(--foreground-secondary)]">
            <FileText className="h-4 w-4 text-violet-400" />
            Description / توضیحات
          </label>
          <textarea
            placeholder="Enter expense details..."
            required
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-4 py-3 bg-[var(--background-elevated)] border border-[var(--border-subtle)] rounded-xl text-[var(--foreground)] placeholder:text-[var(--foreground-muted)] focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 transition-all resize-none"
          />
        </div>

        {/* Tags */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-[var(--foreground-secondary)]">
            <span className="text-violet-400">#</span>
            Tags / برچسب‌ها
          </label>
          <TagInput selectedTags={selectedTags} onTagsChange={setSelectedTags} />
        </div>

        {/* Prices and Rate */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Toman */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-[var(--foreground-secondary)]">
              <span className="text-emerald-400 font-bold">T</span>
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
              className="w-full px-4 py-3 bg-[var(--background-elevated)] border border-[var(--border-subtle)] rounded-xl text-[var(--foreground)] placeholder:text-[var(--foreground-muted)] focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all"
            />
          </div>

          {/* USD */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-[var(--foreground-secondary)]">
              <DollarSign className="h-4 w-4 text-blue-400" />
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
              className="w-full px-4 py-3 bg-[var(--background-elevated)] border border-[var(--border-subtle)] rounded-xl text-[var(--foreground)] placeholder:text-[var(--foreground-muted)] focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
          </div>

          {/* Exchange Rate */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-[var(--foreground-secondary)]">
              <span className="text-amber-400">↔</span>
              Rate (Toman/USD) / نرخ
              {isFetchingRate && (
                <Loader2 className="h-3 w-3 animate-spin text-[var(--foreground-muted)]" />
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
              className="w-full px-4 py-3 bg-[var(--background-elevated)] border border-[var(--border-subtle)] rounded-xl text-[var(--foreground)] placeholder:text-[var(--foreground-muted)] focus:outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 transition-all disabled:opacity-50 disabled:cursor-wait"
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={isSubmitting || isFetchingRate || !exchangeRate}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 disabled:from-violet-600/50 disabled:to-purple-600/50 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 disabled:shadow-none disabled:cursor-not-allowed"
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
          </button>
          {editingExpense && (
            <button
              type="button"
              onClick={handleCancel}
              className="px-6 py-3 border border-[var(--border-default)] text-[var(--foreground-secondary)] hover:text-[var(--foreground)] hover:bg-[var(--background-hover)] font-medium rounded-xl transition-all"
            >
              Cancel / لغو
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
