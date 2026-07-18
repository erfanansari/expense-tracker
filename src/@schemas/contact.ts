import { z } from 'zod';

import type { Translator } from './fallback-translator';

export function createContactSchema(t: Translator) {
  return z.object({
    name: z.string().trim().min(1, t('zod.contact.nameRequired')).max(100, t('zod.contact.nameTooLong')),
    email: z.string().email(t('zod.contact.emailInvalid')),
    subject: z.string().trim().max(150, t('zod.contact.subjectTooLong')).optional(),
    message: z.string().trim().min(1, t('zod.contact.messageRequired')).max(2000, t('zod.contact.messageTooLong')),
    // Honeypot — visually hidden in the form; humans never fill it.
    website: z.string().max(200).optional(),
  });
}

export type ContactSchema = z.infer<ReturnType<typeof createContactSchema>>;
