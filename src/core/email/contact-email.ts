import { FROM_ADDRESS, REPLY_TO, resend } from './client';

interface ContactMessage {
  name: string;
  email: string;
  subject?: string;
  message: string;
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Internal notification to the owner — English-only, no template needed.
export async function sendContactEmail({ name, email, subject, message }: ContactMessage): Promise<void> {
  const result = await resend.emails.send({
    from: FROM_ADDRESS,
    to: REPLY_TO,
    // Replying to the notification goes straight back to the submitter.
    replyTo: email,
    subject: `[Contact] ${subject?.trim() || 'New message'} — ${name}`,
    html: [
      `<p><strong>From:</strong> ${escapeHtml(name)} &lt;${escapeHtml(email)}&gt;</p>`,
      subject ? `<p><strong>Subject:</strong> ${escapeHtml(subject)}</p>` : '',
      `<p style="white-space:pre-wrap">${escapeHtml(message)}</p>`,
    ].join('\n'),
  });

  if (result.error) {
    throw new Error(result.error.message ?? 'Resend error sending contact email');
  }
}
