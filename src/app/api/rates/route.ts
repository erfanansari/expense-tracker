import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { ensureFreshRates, getLatestRates, getRatesSeries } from '@core/rates';

// GET /api/rates              → { latest: { USD: 600000, ... } }
// GET /api/rates?history=1    → { latest, series: { USD: [{ rateDate, rate }], ... } }
//   optional &from=YYYY-MM-DD &to=YYYY-MM-DD bounds the series.
export async function GET(request: NextRequest) {
  try {
    const params = request.nextUrl.searchParams;
    const wantsHistory = params.get('history') === '1' || params.get('history') === 'true';

    // Populate all currencies on-demand if today's data is missing (budget-guarded);
    // this is the fallback for when the daily cron hasn't run yet.
    await ensureFreshRates(process.env.NAVASAN_API_KEY);

    const latest = await getLatestRates();
    if (!wantsHistory) {
      return NextResponse.json(
        { latest },
        { headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' } }
      );
    }

    const series = await getRatesSeries(params.get('from') ?? undefined, params.get('to') ?? undefined);
    return NextResponse.json(
      { latest, series },
      { headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' } }
    );
  } catch (error) {
    console.error('[rates] GET failed:', error);
    return NextResponse.json({ error: 'Failed to load rates' }, { status: 500 });
  }
}
