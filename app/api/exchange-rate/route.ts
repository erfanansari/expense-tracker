import { NextResponse } from 'next/server';

// Global cache (persists across requests in same serverless instance)
let cachedResponse: { usd: { value: string; change: number; timestamp: number; date: string } } | null = null;
let cachedTimestamp = 0;
const CACHE_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

export async function GET() {
  try {
    const now = Date.now();
    const cacheAge = cachedTimestamp > 0 ? now - cachedTimestamp : 0;
    const isCacheValid = cachedResponse && cacheAge > 0 && cacheAge < CACHE_DURATION_MS;

    // Return cached response if still valid (24 hours)
    if (isCacheValid) {
      const cacheAgeHours = Math.floor(cacheAge / (1000 * 60 * 60));
      const cacheAgeMinutes = Math.floor((cacheAge % (1000 * 60 * 60)) / (1000 * 60));

      console.log(`[Exchange Rate] Returning CACHED data (age: ${cacheAgeHours}h ${cacheAgeMinutes}m)`);

      return NextResponse.json({
        ...cachedResponse,
        _meta: {
          cached: true,
          cachedAt: new Date(cachedTimestamp).toISOString(),
          cacheAgeMs: cacheAge,
          cacheAgeHours: parseFloat((cacheAge / (1000 * 60 * 60)).toFixed(2)),
        }
      });
    }

    // Fetch from Navasan API
    const apiKey = process.env.NAVASAN_API_KEY || 'free';
    console.log(`[Exchange Rate] Fetching FRESH data from Navasan API...`);

    const response = await fetch(`https://api.navasan.tech/latest/?item=usd&api_key=${apiKey}`);

    if (response.ok) {
      cachedResponse = await response.json();
      cachedTimestamp = Date.now();
      console.log(`[Exchange Rate] Fresh data cached at ${new Date(cachedTimestamp).toISOString()}`);

      return NextResponse.json({
        ...cachedResponse,
        _meta: {
          cached: false,
          fetchedAt: new Date(cachedTimestamp).toISOString(),
        }
      });
    }

    // API failed - return cached data if available (even if expired)
    if (cachedResponse) {
      console.warn('[Exchange Rate] API failed, returning expired cache');
      return NextResponse.json({
        ...cachedResponse,
        _meta: {
          cached: true,
          expired: true,
          cachedAt: new Date(cachedTimestamp).toISOString(),
        }
      });
    }

    return NextResponse.json({ error: 'Failed to fetch from Navasan API' }, { status: 500 });

  } catch (error) {
    console.error('[Exchange Rate] Error:', error);

    // Return cached data if available (even if expired)
    if (cachedResponse) {
      console.warn('[Exchange Rate] Error occurred, returning cached data');
      return NextResponse.json({
        ...cachedResponse,
        _meta: {
          cached: true,
          error: true,
          cachedAt: new Date(cachedTimestamp).toISOString(),
        }
      });
    }

    return NextResponse.json({ error: 'Failed to fetch exchange rate' }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
