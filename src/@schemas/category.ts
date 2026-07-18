import { z } from 'zod';

import type { Translator } from './fallback-translator';

export function createCategorySchema(t: Translator) {
  return z.object({
    name: z.string().trim().min(1, t('zod.category.nameRequired')).max(50, t('zod.category.nameTooLong')),
    icon: z.string().trim().max(50).optional(),
    color: z.string().trim().max(30).optional(),
  });
}

// PUT accepts any subset of fields; at least one must be present.
export function updateCategorySchema(t: Translator) {
  return z
    .object({
      name: z.string().trim().min(1, t('zod.category.nameRequired')).max(50, t('zod.category.nameTooLong')).optional(),
      icon: z.string().trim().max(50).optional(),
      color: z.string().trim().max(30).optional(),
      sort_order: z.number().finite().optional(),
    })
    .refine((data) => Object.values(data).some((v) => v !== undefined), {
      message: t('zod.category.nothingToUpdate'),
    });
}

export type CategorySchema = z.infer<ReturnType<typeof createCategorySchema>>;
export type UpdateCategorySchema = z.infer<ReturnType<typeof updateCategorySchema>>;
