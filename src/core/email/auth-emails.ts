import React from 'react';

import { render } from '@react-email/render';

import PasswordChangedEmail from '@/emails/PasswordChangedEmail';
import ResetPasswordEmail from '@/emails/ResetPasswordEmail';
import VerifyEmail from '@/emails/VerifyEmail';

import { APP_URL, FROM_ADDRESS, REPLY_TO, resend } from './client';

interface AuthEmailUser {
  email: string;
  name: string | null;
}

export async function sendVerificationEmail(user: AuthEmailUser, url: string): Promise<void> {
  const html = await render(React.createElement(VerifyEmail, { userName: user.name, verifyUrl: url }));

  const result = await resend.emails.send({
    from: FROM_ADDRESS,
    to: user.email,
    replyTo: REPLY_TO,
    subject: 'Verify your email for Kharji',
    html,
  });

  if (result.error) {
    throw new Error(result.error.message ?? 'Resend error sending verification email');
  }
}

export async function sendResetPasswordEmail(user: AuthEmailUser, url: string): Promise<void> {
  const html = await render(React.createElement(ResetPasswordEmail, { userName: user.name, resetUrl: url }));

  const result = await resend.emails.send({
    from: FROM_ADDRESS,
    to: user.email,
    replyTo: REPLY_TO,
    subject: 'Reset your Kharji password',
    html,
  });

  if (result.error) {
    throw new Error(result.error.message ?? 'Resend error sending reset password email');
  }
}

export async function sendPasswordChangedEmail(user: AuthEmailUser): Promise<void> {
  const html = await render(
    React.createElement(PasswordChangedEmail, { userName: user.name, resetUrl: `${APP_URL}/forgot-password` })
  );

  const result = await resend.emails.send({
    from: FROM_ADDRESS,
    to: user.email,
    replyTo: REPLY_TO,
    subject: 'Your Kharji password was changed',
    html,
  });

  if (result.error) {
    throw new Error(result.error.message ?? 'Resend error sending password changed email');
  }
}
