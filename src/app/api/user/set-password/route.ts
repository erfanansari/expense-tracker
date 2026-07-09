import { NextResponse } from 'next/server';

import { APIError } from 'better-auth';

import { DEMO_EMAIL } from '@constants';

import { withAuth } from '@core/api/utils';
import { auth } from '@core/auth/auth';
import { validatePassword } from '@core/auth/validation';
import { sendPasswordChangedEmail } from '@core/email/auth-emails';

// Lets OAuth-signed-up users (no credential account) add a password.
// auth.api.setPassword is server-only, hence this custom route.
export const POST = withAuth(async (user, request) => {
  if (user.email === DEMO_EMAIL) {
    return NextResponse.json({ error: "Demo account can't change security settings" }, { status: 403 });
  }

  const body = await request.json();
  const newPassword = typeof body?.newPassword === 'string' ? body.newPassword : '';

  const passwordValidation = validatePassword(newPassword);
  if (!passwordValidation.valid) {
    return NextResponse.json({ error: passwordValidation.errors.join(', ') }, { status: 400 });
  }

  try {
    await auth.api.setPassword({ body: { newPassword }, headers: request.headers });
  } catch (error) {
    // e.g. the user already has a credential password
    if (error instanceof APIError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    throw error;
  }

  // Security notification; fire-and-forget
  sendPasswordChangedEmail({ email: user.email, name: null }).catch((error) => {
    console.error('Password-changed email failed:', error);
  });

  return NextResponse.json({ success: true });
}, 'SetPassword');
