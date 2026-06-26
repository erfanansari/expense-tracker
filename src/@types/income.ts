export type IncomeType = 'salary' | 'freelance' | 'investment' | 'gift' | 'other';

export interface Income {
  id: number;
  userId: number;
  /** Amount in the entry currency. */
  amount: number;
  /** Entry currency code (see src/constants/currencies.ts). */
  currency: string;
  /** Rate to the pivot at entry time (frozen snapshot). */
  entryRate: number;
  month: number;
  year: number;
  incomeType: IncomeType;
  source: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateIncomeInput {
  amount: number;
  currency: string;
  month: number;
  year: number;
  incomeType: IncomeType;
  source?: string;
  notes?: string;
}

export type UpdateIncomeInput = Partial<CreateIncomeInput>;
