import { getTranslations } from 'next-intl/server';
import { NextResponse } from 'next/server';

import { createContactSchema } from '@schemas';

import { validateBody } from '@core/api/utils';
import { sendContactEmail } from '@core/email/contact-email';

// Public endpoint — no auth; the honeypot field plus strict schema limits keep
// casual bots out without blocking signed-out visitors.
export async function POST(request: Request) {
  try {
    const raw = await request.json().catch(() => null);
    const t = await getTranslations();

    const result = validateBody(createContactSchema(t), raw);
    if (result instanceof NextResponse) return result;
    const { name, email, subject, message, website } = result.data;

    // Honeypot filled → almost certainly a bot; pretend success, send nothing.
    if (website) {
      return NextResponse.json({ status: true });
    }

    await sendContactEmail({ name, email, subject, message });
    return NextResponse.json({ status: true });
  } catch (error) {
    console.error('[contact] Route error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
