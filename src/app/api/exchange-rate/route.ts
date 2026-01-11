/* eslint-disable no-console */
import { NextResponse } from 'next/server';

import { db } from '@/core/database/client';

// Configuration
const NAVASAN_API_BASE = 'https://api.navasan.tech';
const MONTHLY_LIMIT = 120;
const FRESH_THRESHOLD_HOURS = 1;
const STALE_THRESHOLD_HOURS = 24;
const CONSERVATION_THRESHOLD = 5;
const CONSERVATION_INTERVAL_HOURS = 12;

// Types
interface NavasanRateResponse {
  usd?: {
    value: string;
    change: number;
    timestamp: number;
    date: string;
  };
}

interface NavasanUsageResponse {
  monthly_usage: string;
  daily_usage: string;
  hourly_usage: string;
}

interface CachedRate {
  id: number;
  rate_value: number;
  change_value: number;
  navasan_timestamp: number | null;
  navasan_date: string | null;
  fetched_at: string;
}

interface CachedUsage {
  monthly_usage: number;
  daily_usage: number;
  monthly_limit: number;
  checked_at: string;
}

interface ExchangeRateResponse {
  usd: {
    value: string;
    change: number;
    timestamp: number;
    date: string;
  };
  _meta: {
    fetchedAt: string;
    freshness: 'fresh' | 'cached' | 'stale';
    source: 'navasan' | 'cached' | 'fallback';
    usage?: {
      monthly: number;
      remaining: number;
      limit: number;
    };
  };
}

function hoursSince(isoTimestamp: string): number {
  return (Date.now() - new Date(isoTimestamp).getTime()) / (1000 * 60 * 60);
}

function calculateFreshness(fetchedAt: string): 'fresh' | 'cached' | 'stale' {
  const hours = hoursSince(fetchedAt);
  if (hours < FRESH_THRESHOLD_HOURS) return 'fresh';
  if (hours < STALE_THRESHOLD_HOURS) return 'cached';
  return 'stale';
}

async function getCachedRate(): Promise<CachedRate | null> {
  try {
    const result = await db.execute({
      sql: `SELECT * FROM exchange_rates ORDER BY fetched_at DESC LIMIT 1`,
      args: [],
    });

    if (result.rows.length === 0) return null;

    const row = result.rows[0];
    return {
      id: row.id as number,
      rate_value: row.rate_value as number,
      change_value: row.change_value as number,
      navasan_timestamp: row.navasan_timestamp as number | null,
      navasan_date: row.navasan_date as string | null,
      fetched_at: row.fetched_at as string,
    };
  } catch (error) {
    console.error('[ExchangeRate] Failed to get cached rate:', error);
    return null;
  }
}

async function getCachedUsage(): Promise<CachedUsage | null> {
  try {
    const result = await db.execute({
      sql: `SELECT * FROM api_usage WHERE api_name = 'navasan' ORDER BY checked_at DESC LIMIT 1`,
      args: [],
    });

    if (result.rows.length === 0) return null;

    const row = result.rows[0];
    return {
      monthly_usage: row.monthly_usage as number,
      daily_usage: row.daily_usage as number,
      monthly_limit: row.monthly_limit as number,
      checked_at: row.checked_at as string,
    };
  } catch (error) {
    console.error('[ExchangeRate] Failed to get cached usage:', error);
    return null;
  }
}

async function saveRate(rate: Omit<CachedRate, 'id'>): Promise<void> {
  try {
    await db.execute({
      sql: `INSERT INTO exchange_rates (rate_value, change_value, navasan_timestamp, navasan_date, fetched_at)
            VALUES (?, ?, ?, ?, ?)`,
      args: [rate.rate_value, rate.change_value, rate.navasan_timestamp, rate.navasan_date, rate.fetched_at],
    });
  } catch (error) {
    console.error('[ExchangeRate] Failed to save rate:', error);
  }
}

async function saveUsage(usage: NavasanUsageResponse): Promise<void> {
  try {
    await db.execute({
      sql: `INSERT INTO api_usage (api_name, monthly_usage, daily_usage, monthly_limit, checked_at)
            VALUES ('navasan', ?, ?, ?, ?)`,
      args: [
        parseInt(usage.monthly_usage, 10),
        parseInt(usage.daily_usage, 10),
        MONTHLY_LIMIT,
        new Date().toISOString(),
      ],
    });
  } catch (error) {
    console.error('[ExchangeRate] Failed to save usage:', error);
  }
}

async function fetchFromNavasan(apiKey: string): Promise<NavasanRateResponse | null> {
  try {
    const response = await fetch(`${NAVASAN_API_BASE}/latest/?item=usd&api_key=${apiKey}`);

    if (!response.ok) {
      console.error('[ExchangeRate] Navasan API returned:', response.status);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('[ExchangeRate] Failed to fetch from Navasan:', error);
    return null;
  }
}

async function fetchUsage(apiKey: string): Promise<NavasanUsageResponse | null> {
  try {
    const response = await fetch(`${NAVASAN_API_BASE}/usage/?api_key=${apiKey}`);
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.warn('[ExchangeRate] Failed to fetch usage:', error);
    return null;
  }
}

function shouldRefresh(cachedRate: CachedRate | null, cachedUsage: CachedUsage | null): boolean {
  if (!cachedRate) return true;

  const hours = hoursSince(cachedRate.fetched_at);

  if (hours < FRESH_THRESHOLD_HOURS) return false;
  if (hours > STALE_THRESHOLD_HOURS) return true;

  if (cachedUsage) {
    const remaining = MONTHLY_LIMIT - cachedUsage.monthly_usage;
    if (remaining < CONSERVATION_THRESHOLD) {
      return hours >= CONSERVATION_INTERVAL_HOURS;
    }
  }

  return true;
}

function formatResponse(
  rate: CachedRate,
  source: 'navasan' | 'cached' | 'fallback',
  freshness: 'fresh' | 'cached' | 'stale',
  usage?: CachedUsage | null
): ExchangeRateResponse {
  return {
    usd: {
      value: rate.rate_value.toString(),
      change: rate.change_value,
      timestamp: rate.navasan_timestamp || Date.now(),
      date: rate.navasan_date || new Date().toISOString().split('T')[0],
    },
    _meta: {
      fetchedAt: rate.fetched_at,
      freshness,
      source,
      usage: usage
        ? {
            monthly: usage.monthly_usage,
            remaining: MONTHLY_LIMIT - usage.monthly_usage,
            limit: MONTHLY_LIMIT,
          }
        : undefined,
    },
  };
}

async function getExchangeRate(apiKey: string | undefined): Promise<ExchangeRateResponse | null> {
  const cachedRate = await getCachedRate();
  const cachedUsage = await getCachedUsage();
  const needsRefresh = shouldRefresh(cachedRate, cachedUsage);

  if (needsRefresh && apiKey) {
    const remaining = cachedUsage ? MONTHLY_LIMIT - cachedUsage.monthly_usage : MONTHLY_LIMIT;

    if (remaining > 0) {
      console.log(`[ExchangeRate] Fetching fresh data from Navasan (${remaining} calls remaining)`);

      const navasan = await fetchFromNavasan(apiKey);

      if (navasan?.usd) {
        const now = new Date().toISOString();

        const newRate: Omit<CachedRate, 'id'> = {
          rate_value: parseInt(navasan.usd.value, 10),
          change_value: navasan.usd.change,
          navasan_timestamp: navasan.usd.timestamp,
          navasan_date: navasan.usd.date,
          fetched_at: now,
        };

        await saveRate(newRate);

        fetchUsage(apiKey).then((usage) => {
          if (usage) {
            saveUsage(usage);
            console.log(`[ExchangeRate] Usage: ${usage.monthly_usage}/${MONTHLY_LIMIT} monthly`);
          }
        });

        const updatedUsage = await getCachedUsage();

        return formatResponse({ ...newRate, id: 0 }, 'navasan', 'fresh', updatedUsage || cachedUsage);
      }
    } else {
      console.warn('[ExchangeRate] Monthly API limit reached, using cached data');
    }
  }

  if (cachedRate) {
    const freshness = calculateFreshness(cachedRate.fetched_at);
    console.log(`[ExchangeRate] Returning ${freshness} cached data from ${cachedRate.fetched_at}`);
    return formatResponse(cachedRate, 'cached', freshness, cachedUsage);
  }

  console.error('[ExchangeRate] No exchange rate data available');
  return null;
}

export async function GET() {
  try {
    const apiKey = process.env.NAVASAN_API_KEY;

    if (!apiKey) {
      console.error('[ExchangeRate] No API key configured');
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
    }

    const result = await getExchangeRate(apiKey);

    if (!result) {
      return NextResponse.json({ error: 'No exchange rate data available' }, { status: 503 });
    }

    const cacheSeconds = result._meta.freshness === 'fresh' ? 3600 : 300;

    return NextResponse.json(result, {
      headers: {
        'Cache-Control': `public, s-maxage=${cacheSeconds}, stale-while-revalidate=${cacheSeconds * 2}`,
      },
    });
  } catch (error) {
    console.error('[ExchangeRate] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch exchange rate' }, { status: 500 });
  }
}
