export type IncomeType = 'salary' | 'freelance' | 'investment' | 'gift' | 'other';

export interface Income {
  id: number;
  userId: number;
  amountUsd: number;
  amountToman: number;
  exchangeRateUsed: number;
  month: number;
  year: number;
  incomeType: IncomeType;
  source: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateIncomeInput {
  amountUsd: number;
  amountToman: number;
  exchangeRateUsed: number;
  month: number;
  year: number;
  incomeType: IncomeType;
  source?: string;
  notes?: string;
}

export type UpdateIncomeInput = Partial<CreateIncomeInput>;
