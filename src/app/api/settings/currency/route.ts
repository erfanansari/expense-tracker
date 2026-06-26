import { NextResponse } from 'next/server';

import { z } from 'zod';

import { validateBody, withAuth } from '@core/api/utils';
import { getCurrencyPreferences, updateCurrencyPreferences } from '@core/database/currency-preferences';

import { SUPPORTED_CURRENCY_CODES } from '@/constants/currencies';

const currencyCode = z.enum(SUPPORTED_CURRENCY_CODES as [string, ...string[]]);

const updateSchema = z
  .object({
    primaryCurrency: currencyCode.optional(),
    // null = disable secondary display.
    secondaryCurrency: currencyCode.nullable().optional(),
  })
  .refine((v) => v.primaryCurrency !== undefined || v.secondaryCurrency !== undefined, {
    message: 'Provide at least one field to update.',
  });

export const GET = withAuth(async (user) => {
  const prefs = await getCurrencyPreferences(user.userId);
  return NextResponse.json(prefs);
}, 'CurrencyGET');

export const PUT = withAuth(async (user, request) => {
  const body = await request.json();
  const parsed = validateBody(updateSchema, body);
  if (parsed instanceof NextResponse) return parsed;

  // If primary ends up equal to secondary, drop the secondary (no point showing it twice).
  const current = await getCurrencyPreferences(user.userId);
  const nextPrimary = parsed.data.primaryCurrency ?? current.primaryCurrency;
  let nextSecondary =
    parsed.data.secondaryCurrency !== undefined ? parsed.data.secondaryCurrency : current.secondaryCurrency;
  if (nextSecondary === nextPrimary) nextSecondary = null;

  const prefs = await updateCurrencyPreferences(user.userId, {
    primaryCurrency: nextPrimary,
    secondaryCurrency: nextSecondary,
  });
  return NextResponse.json(prefs);
}, 'CurrencyPUT');
