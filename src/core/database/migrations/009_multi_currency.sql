-- Migration 009: Multi-currency system
--
-- Replaces the hardcoded dual USD/Toman storage with a configurable
-- primary/secondary currency model. Each monetary record now stores the
-- currency it was entered in plus a frozen `entryRate` snapshot (rate to the
-- pivot at entry), so historical values stay meaningful. Rates are stored as a
-- daily time series against a single pivot (IRT) — see src/constants/currencies.ts.
-- The pivot is named only via `baseCurrency`; no other column hardcodes a currency.
--
-- Clean break: old dual columns are backfilled into the new model and dropped.
-- Existing USD↔Toman ratios are harvested into currencyRates for free, seeding
-- real historical USD rates.

-- 1. Per-user currency preferences (mirrors userNotificationPreferences) ------------
CREATE TABLE IF NOT EXISTS userCurrencyPreferences (
  userId            INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  primaryCurrency   TEXT NOT NULL DEFAULT 'IRT',
  secondaryCurrency TEXT DEFAULT 'USD',          -- NULL = secondary disabled
  createdAt         TEXT DEFAULT CURRENT_TIMESTAMP,
  updatedAt         TEXT DEFAULT CURRENT_TIMESTAMP
);

INSERT OR IGNORE INTO userCurrencyPreferences (userId)
SELECT id FROM users;

-- 2. Historical rate time series ----------------------------------------------------
CREATE TABLE IF NOT EXISTS currencyRates (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  currency         TEXT NOT NULL,                 -- 'USD','EUR','GBP','AED','TRY'
  baseCurrency     TEXT NOT NULL DEFAULT 'IRT',   -- the pivot
  rate             REAL NOT NULL,                 -- base units per 1 unit of `currency`
  rateDate         TEXT NOT NULL,                 -- YYYY-MM-DD
  changeValue      REAL DEFAULT 0,
  navasanTimestamp INTEGER,
  fetchedAt        TEXT NOT NULL,
  UNIQUE(currency, baseCurrency, rateDate)
);
CREATE INDEX IF NOT EXISTS idxCurrencyRatesLookup ON currencyRates(currency, rateDate DESC);

-- Seed USD history from the cached exchange_rates time series (one row per day).
INSERT OR IGNORE INTO currencyRates (currency, baseCurrency, rate, rateDate, changeValue, navasanTimestamp, fetchedAt)
SELECT 'USD', 'IRT', rate_value, date(fetched_at), MAX(change_value), MAX(navasan_timestamp), MAX(fetched_at)
FROM exchange_rates
WHERE rate_value > 0
GROUP BY date(fetched_at);

-- 3. Expenses (snake_case columns) --------------------------------------------------
INSERT OR IGNORE INTO currencyRates (currency, baseCurrency, rate, rateDate, fetchedAt)
SELECT 'USD', 'IRT', price_toman / price_usd, date(date), CURRENT_TIMESTAMP
FROM expenses
WHERE price_usd > 0
GROUP BY date(date);

ALTER TABLE expenses ADD COLUMN amount REAL;
ALTER TABLE expenses ADD COLUMN currency TEXT;
ALTER TABLE expenses ADD COLUMN entryRate REAL;
UPDATE expenses SET amount = price_toman, currency = 'IRT', entryRate = 1;
ALTER TABLE expenses DROP COLUMN price_usd;
ALTER TABLE expenses DROP COLUMN price_toman;

-- 4. Incomes (camelCase; exchangeRateUsed is the USD→Toman rate; month/year date) ---
INSERT OR IGNORE INTO currencyRates (currency, baseCurrency, rate, rateDate, fetchedAt)
SELECT 'USD', 'IRT', exchangeRateUsed, printf('%04d-%02d-01', year, month), CURRENT_TIMESTAMP
FROM incomes
WHERE exchangeRateUsed > 0
GROUP BY year, month;

ALTER TABLE incomes ADD COLUMN amount REAL;
ALTER TABLE incomes ADD COLUMN currency TEXT;
ALTER TABLE incomes ADD COLUMN entryRate REAL;
UPDATE incomes SET amount = amountToman, currency = 'IRT', entryRate = 1;
ALTER TABLE incomes DROP COLUMN amountUsd;
ALTER TABLE incomes DROP COLUMN amountToman;
ALTER TABLE incomes DROP COLUMN exchangeRateUsed;

-- 5. Assets (camelCase; preserve per-unit value in entry currency) ------------------
INSERT OR IGNORE INTO currencyRates (currency, baseCurrency, rate, rateDate, fetchedAt)
SELECT 'USD', 'IRT', exchangeRateUsed, date(lastValuedAt), CURRENT_TIMESTAMP
FROM assets
WHERE exchangeRateUsed > 0
GROUP BY date(lastValuedAt);

ALTER TABLE assets ADD COLUMN amount REAL;
ALTER TABLE assets ADD COLUMN unitValue REAL;   -- per-unit value in entry currency (nullable)
ALTER TABLE assets ADD COLUMN currency TEXT;
ALTER TABLE assets ADD COLUMN entryRate REAL;
UPDATE assets SET
  amount    = totalValueToman,
  currency  = 'IRT',
  entryRate = 1,
  unitValue = CASE WHEN unitValueUsd IS NOT NULL THEN unitValueUsd * exchangeRateUsed ELSE NULL END;
ALTER TABLE assets DROP COLUMN unitValueUsd;
ALTER TABLE assets DROP COLUMN totalValueUsd;
ALTER TABLE assets DROP COLUMN totalValueToman;
ALTER TABLE assets DROP COLUMN exchangeRateUsed;

-- 6. Asset valuations ---------------------------------------------------------------
INSERT OR IGNORE INTO currencyRates (currency, baseCurrency, rate, rateDate, fetchedAt)
SELECT 'USD', 'IRT', exchangeRateUsed, date(valuedAt), CURRENT_TIMESTAMP
FROM assetValuations
WHERE exchangeRateUsed > 0
GROUP BY date(valuedAt);

ALTER TABLE assetValuations ADD COLUMN amount REAL;
ALTER TABLE assetValuations ADD COLUMN unitValue REAL;
ALTER TABLE assetValuations ADD COLUMN currency TEXT;
ALTER TABLE assetValuations ADD COLUMN entryRate REAL;
UPDATE assetValuations SET
  amount    = totalValueToman,
  currency  = 'IRT',
  entryRate = 1,
  unitValue = CASE WHEN unitValueUsd IS NOT NULL THEN unitValueUsd * exchangeRateUsed ELSE NULL END;
ALTER TABLE assetValuations DROP COLUMN unitValueUsd;
ALTER TABLE assetValuations DROP COLUMN totalValueUsd;
ALTER TABLE assetValuations DROP COLUMN totalValueToman;
ALTER TABLE assetValuations DROP COLUMN exchangeRateUsed;
