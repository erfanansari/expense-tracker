'use client';

import { useState } from 'react';
import { ExpenseForm } from '@/components/expense-form';
import { ExpenseList } from '@/components/expense-list';

export default function Home() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleExpenseAdded = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 font-sans py-8">
      <main className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-center mb-8 text-zinc-900 dark:text-zinc-50">
          Expense Tracker
        </h1>

        <div className="space-y-8">
          <ExpenseForm onExpenseAdded={handleExpenseAdded} />
          <ExpenseList refreshTrigger={refreshTrigger} />
        </div>
      </main>
    </div>
  );
}
