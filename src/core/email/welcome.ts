import React from 'react';

import { render } from '@react-email/render';

import WelcomeEmail from '@/emails/WelcomeEmail';

import { APP_URL, FROM_ADDRESS, LOGO_URL, REPLY_TO, resend } from './client';

export async function sendWelcomeEmail(user: { userId: number; email: string; name: string | null }): Promise<void> {
  const html = await render(
    React.createElement(WelcomeEmail, {
      userName: user.name,
      dashboardUrl: `${APP_URL}/overview`,
      logoUrl: LOGO_URL,
    })
  );

  const result = await resend.emails.send(
    {
      from: FROM_ADDRESS,
      to: user.email,
      replyTo: REPLY_TO,
      subject: 'Welcome to Kharji',
      html,
    },
    { idempotencyKey: `welcome-${user.userId}` }
  );

  if (result.error) {
    throw new Error(result.error.message ?? 'Resend error sending welcome email');
  }
}
