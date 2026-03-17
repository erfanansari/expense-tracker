import { z } from 'zod';

export const createExpenseSchema = z.object({
  date: z.string().min(1, 'Date is required'),
  category: z.string().min(1, 'Category is required'),
  description: z.string().min(1, 'Description is required'),
  price_toman: z.number().min(0, 'Price must be non-negative'),
  price_usd: z.number().min(0, 'Price must be non-negative'),
  tagIds: z.array(z.number().int()).optional(),
});

export type CreateExpenseSchema = z.infer<typeof createExpenseSchema>;
