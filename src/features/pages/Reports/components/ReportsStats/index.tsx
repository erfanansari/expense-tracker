import type { Expense } from '@types';

import ExpenseStats from '@features/expenses/components/ExpenseStats';

interface ReportsStatsProps {
  expenses: Expense[];
}

const ReportsStats = ({ expenses }: ReportsStatsProps) => {
  return (
    <div className="mb-8">
      <ExpenseStats expenses={expenses} />
    </div>
  );
};

export default ReportsStats;
