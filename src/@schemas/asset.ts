import { z } from 'zod';

import { currencyCodeSchema } from './expense';

const assetCategoryEnum = z.enum(['cash', 'crypto', 'commodity', 'vehicle', 'property', 'bank', 'investment']);

export const createAssetSchema = z.object({
  category: assetCategoryEnum,
  name: z.string().min(1, 'Name is required'),
  quantity: z.number().min(0, 'Quantity must be non-negative'),
  unit: z.string().optional(),
  unitValue: z.number().min(0).optional(),
  amount: z.number().min(0, 'Total value must be non-negative'),
  currency: currencyCodeSchema,
  notes: z.string().optional(),
  lastValuedAt: z.string().optional(),
});

export type CreateAssetSchema = z.infer<typeof createAssetSchema>;
