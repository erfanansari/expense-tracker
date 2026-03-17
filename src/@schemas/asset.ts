import { z } from 'zod';

const assetCategoryEnum = z.enum(['cash', 'crypto', 'commodity', 'vehicle', 'property', 'bank', 'investment']);

export const createAssetSchema = z.object({
  category: assetCategoryEnum,
  name: z.string().min(1, 'Name is required'),
  quantity: z.number().min(0, 'Quantity must be non-negative'),
  unit: z.string().optional(),
  unitValueUsd: z.number().min(0).optional(),
  totalValueUsd: z.number().min(0, 'Total value must be non-negative'),
  totalValueToman: z.number().min(0, 'Total value must be non-negative'),
  exchangeRateUsed: z.number().min(1, 'Exchange rate must be positive'),
  notes: z.string().optional(),
  lastValuedAt: z.string().optional(),
});

export type CreateAssetSchema = z.infer<typeof createAssetSchema>;
