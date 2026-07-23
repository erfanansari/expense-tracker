import { z } from 'zod';

import { isTrackedItemCode } from '@/constants/tracked-items';

import { currencyCodeSchema } from './expense';
import type { Translator } from './fallback-translator';

const assetCategoryEnum = z.enum(['cash', 'crypto', 'commodity', 'vehicle', 'property', 'bank', 'investment']);

// '' (form "manual" option) and null both mean "not linked"; the API stores null.
const linkedItemSchema = z
  .string()
  .nullable()
  .optional()
  .refine((v) => v == null || v === '' || isTrackedItemCode(v), { message: 'Unknown tracked item' });

export function createAssetSchema(t: Translator) {
  return z.object({
    category: assetCategoryEnum,
    name: z.string().min(1, t('zod.asset.nameRequired')),
    quantity: z.number().min(0, t('zod.asset.quantityNonNegative')),
    unit: z.string().optional(),
    unitValue: z.number().min(0).optional(),
    amount: z.number().min(0, t('zod.asset.totalValueNonNegative')),
    currency: currencyCodeSchema,
    linkedItem: linkedItemSchema,
    notes: z.string().optional(),
    lastValuedAt: z.string().optional(),
  });
}

export type CreateAssetSchema = z.infer<ReturnType<typeof createAssetSchema>>;
