import { z } from 'zod';

import type { Translator } from './fallback-translator';

export function createTagSchema(t: Translator) {
  return z.object({
    name: z.string().trim().min(1, t('zod.tag.nameRequired')).max(50, t('zod.tag.nameTooLong')),
  });
}

export type TagSchema = z.infer<ReturnType<typeof createTagSchema>>;
