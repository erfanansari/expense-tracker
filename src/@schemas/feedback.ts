import { z } from 'zod';

import type { Translator } from './fallback-translator';

export const FEEDBACK_TYPES = ['bug', 'idea', 'other'] as const;

export function createFeedbackSchema(t: Translator) {
  return z.object({
    type: z.enum(FEEDBACK_TYPES),
    message: z.string().trim().min(1, t('zod.feedback.messageRequired')).max(2000, t('zod.feedback.messageTooLong')),
  });
}

export type FeedbackSchema = z.infer<ReturnType<typeof createFeedbackSchema>>;
export type FeedbackType = (typeof FEEDBACK_TYPES)[number];
