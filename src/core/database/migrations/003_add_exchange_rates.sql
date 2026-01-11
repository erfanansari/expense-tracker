-- Migration: Add exchange rates and API usage tracking tables

-- Exchange rates table (app-wide, not user-specific)
CREATE TABLE IF NOT EXISTS exchange_rates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  rate_value INTEGER NOT NULL,
  change_value INTEGER DEFAULT 0,
  navasan_timestamp INTEGER,
  navasan_date TEXT,
  fetched_at TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_exchange_rates_fetched ON exchange_rates(fetched_at DESC);

-- API usage tracking table (app-wide)
CREATE TABLE IF NOT EXISTS api_usage (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  api_name TEXT NOT NULL,
  monthly_usage INTEGER DEFAULT 0,
  daily_usage INTEGER DEFAULT 0,
  monthly_limit INTEGER DEFAULT 120,
  checked_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_api_usage_name ON api_usage(api_name);
