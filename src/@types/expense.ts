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
  created_at: string;
  tags?: Tag[];
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
}
