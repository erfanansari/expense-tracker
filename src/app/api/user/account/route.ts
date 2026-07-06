import { NextResponse } from 'next/server';

import { DEMO_EMAIL } from '@constants';

import { withAuth } from '@core/api/utils';
import { db } from '@core/database/client';
import { deleteSession } from '@core/session/session';

export const DELETE = withAuth(async (user) => {
  if (user.email === DEMO_EMAIL) {
    return NextResponse.json({ error: "Demo account can't be deleted" }, { status: 403 });
  }

  const userId = user.userId;

  // Older tables use user_id, newer ones userId. assetValuations and
  // expense_tags only reference the user indirectly, so they must be
  // deleted before their parent rows.
  await db.batch(
    [
      {
        sql: 'DELETE FROM expense_tags WHERE expense_id IN (SELECT id FROM expenses WHERE user_id = ?)',
        args: [userId],
      },
      { sql: 'DELETE FROM expenses WHERE user_id = ?', args: [userId] },
      { sql: 'DELETE FROM tags WHERE user_id = ?', args: [userId] },
      { sql: 'DELETE FROM categories WHERE user_id = ?', args: [userId] },
      {
        sql: 'DELETE FROM assetValuations WHERE assetId IN (SELECT id FROM assets WHERE userId = ?)',
        args: [userId],
      },
      { sql: 'DELETE FROM assets WHERE userId = ?', args: [userId] },
      { sql: 'DELETE FROM assetTypes WHERE userId = ?', args: [userId] },
      { sql: 'DELETE FROM incomes WHERE userId = ?', args: [userId] },
      { sql: 'DELETE FROM password_reset_tokens WHERE user_id = ?', args: [userId] },
      { sql: 'DELETE FROM userNotificationPreferences WHERE userId = ?', args: [userId] },
      { sql: 'DELETE FROM sentEmailReports WHERE userId = ?', args: [userId] },
      { sql: 'DELETE FROM userCurrencyPreferences WHERE userId = ?', args: [userId] },
      { sql: 'DELETE FROM users WHERE id = ?', args: [userId] },
    ],
    'write'
  );

  await deleteSession();

  return NextResponse.json({ success: true });
}, 'DeleteAccount');
