'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { type CreateExpenseInput } from '@/lib/types/expense';
import { categories } from '@/lib/utils';

interface ExpenseFormProps {
  onExpenseAdded: () => void;
}

export function ExpenseForm({ onExpenseAdded }: ExpenseFormProps) {
  const [formData, setFormData] = useState<CreateExpenseInput>({
    date: new Date().toISOString().split('T')[0],
    category: '',
    description: '',
    price_toman: 0,
    price_usd: 0,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    // Auto-calculate USD price from Toman
    const usdPrice = Math.round((formData.price_toman / 60000) * 100) / 100;

    try {
      const response = await fetch('/api/expenses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          price_usd: usdPrice,
        }),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Expense added successfully!' });
        setFormData({
          date: new Date().toISOString().split('T')[0],
          category: '',
          description: '',
          price_toman: 0,
          price_usd: 0,
        });
        onExpenseAdded();
      } else {
        const error = await response.json();
        setMessage({ type: 'error', text: error.error || 'Failed to add expense' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Failed to add expense' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-md border border-zinc-200 dark:border-zinc-800 p-6">
      <div className="flex items-center gap-2 mb-6">
        <Plus className="h-5 w-5 text-green-600 dark:text-green-400" />
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          Add New Expense / افزودن هزینه جدید
        </h2>
      </div>

      {message && (
        <div className={`mb-4 p-3 rounded ${message.type === 'success' ? 'bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-400' : 'bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-400'}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <input
          type="text"
          placeholder="Description / توضیحات"
          required
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-500 dark:placeholder:text-zinc-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />

        <input
          type="number"
          placeholder="Amount (Toman) / مبلغ (تومان)"
          required
          min="0"
          step="0.01"
          value={formData.price_toman || ''}
          onChange={(e) => setFormData({ ...formData, price_toman: parseFloat(e.target.value) })}
          className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-500 dark:placeholder:text-zinc-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />

        <select
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          required
          className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Category / دسته‌بندی</option>
          {categories.map((cat) => (
            <option key={cat.value} value={cat.value}>
              {cat.label} / {cat.labelFa}
            </option>
          ))}
        </select>

        <input
          type="date"
          required
          value={formData.date}
          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />

        <button
          type="submit"
          disabled={isSubmitting}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-md transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <Plus className="h-4 w-4" />
          {isSubmitting ? 'Adding...' : 'Add / افزودن'}
        </button>
      </form>

      <div className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
        <p>Note: USD price will be auto-calculated based on a 1:60,000 exchange rate</p>
      </div>
    </div>
  );
}
