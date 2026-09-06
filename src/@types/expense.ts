import type { ExpenseRepeat } from './recurring';

export interface Tag {
  id: number;
  name: string;
  created_at: string;
}

export interface TagWithUsage extends Tag {
  usage_count: number;
}

export interface UpdateTagInput {
  name: string;
}

export interface Category {
  id: number;
  name: string;
  icon: string;
  color: string;
  sort_order: number;
  created_at: string;
}

export interface CategoryWithUsage extends Category {
  usage_count: number;
}

export interface CreateCategoryInput {
  name: string;
  icon?: string;
  color?: string;
}

export interface UpdateCategoryInput {
  name?: string;
  icon?: string;
  color?: string;
  sort_order?: number;
}

export interface Expense {
  id: number;
  date: string;
  category: Category;
  description: string;
  /** Amount in the entry currency. */
  amount: number;
  /** Entry currency code (see src/constants/currencies.ts). */
  currency: string;
  /** Rate to the pivot at entry time (frozen snapshot). */
  entryRate: number;
  /** Set when this expense came from a repeat; null if entered by hand. Goes null
   * (not deleted) when the repeat is removed — see migration 019. */
  recurringId: number | null;
  /** The live schedule behind `recurringId`, so editing an expense can show and
   * change its repeat. Null once the repeat is removed or has finished. */
  repeat: ExpenseRepeat | null;
  /** The cash/bank asset this was paid out of; null when untracked. Goes null
   * (not deleted) when the account is deleted — the money was still spent. */
  paidFromAssetId: number | null;
  /** What was actually subtracted from that account's balance, in
   * `paidFromCurrency`. Null while chosen-but-not-yet-applied. Reversal adds
   * exactly this number back rather than re-converting at a later rate. */
  paidFromDelta: number | null;
  /** The account's currency when `paidFromDelta` was applied. */
  paidFromCurrency: string | null;
  /** The account itself, joined for display. Null when untracked or deleted. */
  paidFrom: ExpensePaidFrom | null;
  created_at: string;
  tags?: Tag[];
}

/** The account behind `paidFromAssetId`, joined for display. */
export interface ExpensePaidFrom {
  id: number;
  name: string;
  category: string;
  currency: string;
}

export interface CreateExpenseInput {
  date: string;
  categoryId: number;
  description: string;
  amount: number;
  currency: string;
  tagIds?: number[];
  /** null or omitted = doesn't repeat. */
  repeat?: ExpenseRepeat | null;
  /** null or omitted = don't touch any account balance. */
  paidFromAssetId?: number | null;
}
