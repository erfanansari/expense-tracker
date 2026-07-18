import { FROM_ADDRESS, REPLY_TO, resend } from './client';
import { escapeHtml } from './contact-email';

interface FeedbackNotification {
  userEmail: string;
  userName: string | null;
  type: string;
  message: string;
}

// Internal notification to the owner — English-only, no template needed.
export async function sendFeedbackNotification({
  userEmail,
  userName,
  type,
  message,
}: FeedbackNotification): Promise<void> {
  const result = await resend.emails.send({
    from: FROM_ADDRESS,
    to: REPLY_TO,
    // Replying to the notification goes straight back to the submitter.
    replyTo: userEmail,
    subject: `[Feedback:${type}] from ${userName || userEmail}`,
    html: [
      `<p><strong>From:</strong> ${escapeHtml(userName ?? '')} &lt;${escapeHtml(userEmail)}&gt;</p>`,
      `<p><strong>Type:</strong> ${escapeHtml(type)}</p>`,
      `<p style="white-space:pre-wrap">${escapeHtml(message)}</p>`,
    ].join('\n'),
  });

  if (result.error) {
    throw new Error(result.error.message ?? 'Resend error sending feedback notification');
  }
}
