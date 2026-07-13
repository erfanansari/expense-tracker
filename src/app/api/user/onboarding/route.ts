import { NextResponse } from 'next/server';

import { z } from 'zod';

import { withAuth } from '@core/api/utils';
import { db } from '@core/database/client';

const bodySchema = z
  .object({
    completeOnboarding: z.boolean().optional(),
    dismissChecklist: z.boolean().optional(),
  })
  .refine((data) => data.completeOnboarding || data.dismissChecklist, {
    message: 'Nothing to update',
  });

// Timestamps are set server-side and are first-write-wins (COALESCE), so the
// endpoint is idempotent and clients only send intent booleans.
export const PATCH = withAuth(async (user, request) => {
  const raw = await request.json().catch(() => ({}));
  const parsed = bodySchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const sets: string[] = [];
  if (parsed.data.completeOnboarding) sets.push('onboarded_at = COALESCE(onboarded_at, CURRENT_TIMESTAMP)');
  if (parsed.data.dismissChecklist) {
    sets.push('checklist_dismissed_at = COALESCE(checklist_dismissed_at, CURRENT_TIMESTAMP)');
  }

  await db.execute({
    sql: `UPDATE users SET ${sets.join(', ')} WHERE id = ?`,
    args: [user.userId],
  });

  const result = await db.execute({
    sql: 'SELECT onboarded_at, checklist_dismissed_at FROM users WHERE id = ?',
    args: [user.userId],
  });
  const row = result.rows[0];

  return NextResponse.json({
    onboardedAt: (row?.onboarded_at as string | null) ?? null,
    checklistDismissedAt: (row?.checklist_dismissed_at as string | null) ?? null,
  });
}, 'UserOnboarding');
