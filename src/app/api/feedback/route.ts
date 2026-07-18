import { getTranslations } from 'next-intl/server';
import { NextResponse } from 'next/server';

import { createFeedbackSchema } from '@schemas';

import { validateBody, withAuth } from '@core/api/utils';
import { db } from '@core/database/client';
import { sendFeedbackNotification } from '@core/email/feedback-email';

// POST /api/feedback - Store a feedback entry and notify the owner
export const POST = withAuth(async (user, request) => {
  const raw = await request.json();
  const t = await getTranslations();
  const result = validateBody(createFeedbackSchema(t), raw);
  if (result instanceof NextResponse) return result;

  const { type, message } = result.data;

  await db.execute({
    sql: 'INSERT INTO feedback (userId, type, message) VALUES (?, ?, ?)',
    args: [user.userId, type, message],
  });

  // Notification email is best-effort — the stored row is the source of truth.
  try {
    const nameRow = await db.execute({ sql: 'SELECT name FROM users WHERE id = ?', args: [user.userId] });
    const userName = (nameRow.rows[0]?.name as string | null) ?? null;
    await sendFeedbackNotification({ userEmail: user.email, userName, type, message });
  } catch (error) {
    console.error('[feedback] Failed to send notification email:', error);
  }

  return NextResponse.json({ status: true }, { status: 201 });
}, 'Feedback');
