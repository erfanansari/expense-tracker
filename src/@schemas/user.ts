import { z } from 'zod';

import type { Translator } from './fallback-translator';

export function updateProfileSchema(t: Translator) {
  return z.object({
    name: z.string().trim().min(1, t('zod.user.nameRequired')).max(100, t('zod.user.nameTooLong')),
  });
}

export type UpdateProfileSchema = z.infer<ReturnType<typeof updateProfileSchema>>;
