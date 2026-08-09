import React from 'react';

import { render } from '@react-email/render';

import { AUTH_EMAIL_STRINGS, type EmailLocale } from '@/emails/i18n';
import WelcomeEmail from '@/emails/WelcomeEmail';

import { APP_URL, FROM_ADDRESS, LOGO_URL, REPLY_TO, resend } from './client';

export async function sendWelcomeEmail(user: {
  userId: number;
  email: string;
  name: string | null;
  locale?: EmailLocale;
}): Promise<void> {
  const locale = user.locale ?? 'fa';
  const html = await render(
    React.createElement(WelcomeEmail, {
      userName: user.name,
      dashboardUrl: `${APP_URL}/overview`,
      logoUrl: LOGO_URL,
      locale,
    })
  );

  const result = await resend.emails.send(
    {
      from: FROM_ADDRESS,
      to: user.email,
      replyTo: REPLY_TO,
      subject: AUTH_EMAIL_STRINGS[locale].welcome.subject,
      html,
    },
    { idempotencyKey: `welcome-${user.userId}` }
  );

  if (result.error) {
    throw new Error(result.error.message ?? 'Resend error sending welcome email');
  }
}
