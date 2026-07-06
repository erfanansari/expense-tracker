import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { seedDemo } from '@core/database/seed-demo';

// Seeding does thousands of batched inserts; give it headroom.
export const maxDuration = 60;

// Monthly cron: re-seed the demo account so its data always ends at the current
// month (the seed uses a rolling date window). Keeps charts/dashboards "recent"
// instead of freezing at whenever the demo was last seeded.
export async function POST(request: NextRequest) {
  if (request.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const summary = await seedDemo();
  return NextResponse.json({ ok: true, ...summary });
}

// Vercel Cron invokes routes via GET.
export const GET = POST;
