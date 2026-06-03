import { NextResponse } from 'next/server';

import { z } from 'zod';

import { validateBody, withAuth } from '@core/api/utils';
import { getNotificationPreferences, updateNotificationPreferences } from '@core/database/notification-preferences';

const updateSchema = z
  .object({
    emailEnabled: z.boolean().optional(),
    monthlyReportEnabled: z.boolean().optional(),
    yearlyReportEnabled: z.boolean().optional(),
  })
  .refine((v) => Object.values(v).some((x) => typeof x === 'boolean'), {
    message: 'Provide at least one field to update.',
  });

export const GET = withAuth(async (user) => {
  const prefs = await getNotificationPreferences(user.userId);
  return NextResponse.json({
    emailEnabled: prefs.emailEnabled,
    monthlyReportEnabled: prefs.monthlyReportEnabled,
    yearlyReportEnabled: prefs.yearlyReportEnabled,
  });
}, 'NotificationsGET');

export const PUT = withAuth(async (user, request) => {
  const body = await request.json();
  const parsed = validateBody(updateSchema, body);
  if (parsed instanceof NextResponse) return parsed;

  const prefs = await updateNotificationPreferences(user.userId, parsed.data);
  return NextResponse.json({
    emailEnabled: prefs.emailEnabled,
    monthlyReportEnabled: prefs.monthlyReportEnabled,
    yearlyReportEnabled: prefs.yearlyReportEnabled,
  });
}, 'NotificationsPUT');
