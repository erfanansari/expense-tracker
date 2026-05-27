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
  price_toman: number;
  price_usd: number;
  created_at: string;
  tags?: Tag[];
}

export interface CreateExpenseInput {
  date: string;
  categoryId: number;
  description: string;
  price_toman: number;
  price_usd: number;
  tagIds?: number[];
}
