-- Migration: Simplify schema - camelCase fields and simplified asset types
-- This migration converts snake_case to camelCase and simplifies asset types

-- ============================================
-- Step 1: Cleanup any partial run state
-- ============================================
-- Drop indexes first (they don't get renamed with tables)
DROP INDEX IF EXISTS idx_incomes_user;
DROP INDEX IF EXISTS idx_incomes_date;
DROP INDEX IF EXISTS idx_incomes_type;
DROP INDEX IF EXISTS idx_assets_user;
DROP INDEX IF EXISTS idx_assets_type;
DROP INDEX IF EXISTS idx_assets_category;
DROP INDEX IF EXISTS idx_asset_valuations_asset;
DROP INDEX IF EXISTS idx_asset_valuations_date;

-- Drop new camelCase tables if they exist from partial run
DROP TABLE IF EXISTS assetValuations;
DROP TABLE IF EXISTS assets;
DROP TABLE IF EXISTS assetTypes;
DROP TABLE IF EXISTS incomes;

-- ============================================
-- Step 2: Create new tables with camelCase fields
-- ============================================

-- Income tracking table (camelCase)
CREATE TABLE incomes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  userId INTEGER NOT NULL,
  amountUsd REAL NOT NULL,
  amountToman REAL NOT NULL,
  exchangeRateUsed REAL NOT NULL,
  month INTEGER NOT NULL,
  year INTEGER NOT NULL,
  incomeType TEXT NOT NULL,
  source TEXT,
  notes TEXT,
  createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
  updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_incomes_user ON incomes(userId);
CREATE INDEX idx_incomes_date ON incomes(year, month);
CREATE INDEX idx_incomes_type ON incomes(incomeType);

-- Simplified asset types (just one per category)
CREATE TABLE assetTypes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  userId INTEGER,
  category TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  nameFa TEXT,
  defaultUnit TEXT NOT NULL,
  icon TEXT,
  createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

-- Insert simplified asset types (one per category)
INSERT INTO assetTypes (userId, category, name, nameFa, defaultUnit, icon) VALUES
  (NULL, 'cash', 'Cash', 'نقدی', 'USD', 'banknote'),
  (NULL, 'crypto', 'Cryptocurrency', 'ارز دیجیتال', 'unit', 'bitcoin'),
  (NULL, 'commodity', 'Commodity', 'کالا', 'unit', 'gem'),
  (NULL, 'vehicle', 'Vehicle', 'خودرو', 'unit', 'car'),
  (NULL, 'property', 'Property', 'ملک', 'unit', 'building'),
  (NULL, 'bank', 'Bank Account', 'حساب بانکی', 'USD', 'landmark'),
  (NULL, 'investment', 'Investment', 'سرمایه‌گذاری', 'unit', 'trending-up');

-- Assets table (camelCase)
CREATE TABLE assets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  userId INTEGER NOT NULL,
  category TEXT NOT NULL,
  name TEXT NOT NULL,
  quantity REAL NOT NULL DEFAULT 1,
  unit TEXT,
  unitValueUsd REAL,
  totalValueUsd REAL NOT NULL,
  totalValueToman REAL NOT NULL,
  exchangeRateUsed REAL NOT NULL,
  notes TEXT,
  lastValuedAt TEXT NOT NULL,
  createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
  updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_assets_user ON assets(userId);
CREATE INDEX idx_assets_category ON assets(category);

-- Asset valuations table (camelCase)
CREATE TABLE assetValuations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  assetId INTEGER NOT NULL,
  quantity REAL NOT NULL,
  unitValueUsd REAL,
  totalValueUsd REAL NOT NULL,
  totalValueToman REAL NOT NULL,
  exchangeRateUsed REAL NOT NULL,
  valuedAt TEXT NOT NULL,
  createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (assetId) REFERENCES assets(id) ON DELETE CASCADE
);

CREATE INDEX idx_asset_valuations_asset ON assetValuations(assetId);
CREATE INDEX idx_asset_valuations_date ON assetValuations(valuedAt DESC);

-- ============================================
-- Step 3: Migrate data from old tables
-- ============================================

-- Migrate incomes from _old table (created during partial run)
INSERT INTO incomes (id, userId, amountUsd, amountToman, exchangeRateUsed, month, year, incomeType, source, notes, createdAt, updatedAt)
SELECT id, user_id, amount_usd, amount_toman, exchange_rate_used, month, year, income_type, source, notes, created_at, updated_at
FROM incomes_old;

-- Migrate assets (map old asset_type_id to category)
INSERT INTO assets (id, userId, category, name, quantity, unit, unitValueUsd, totalValueUsd, totalValueToman, exchangeRateUsed, notes, lastValuedAt, createdAt, updatedAt)
SELECT
  a.id,
  a.user_id,
  at.category,
  a.name,
  a.quantity,
  at.unit,
  a.unit_value_usd,
  a.total_value_usd,
  a.total_value_toman,
  a.exchange_rate_used,
  a.notes,
  a.last_valued_at,
  a.created_at,
  a.updated_at
FROM assets_old a
JOIN asset_types_old at ON a.asset_type_id = at.id;

-- Migrate asset valuations
INSERT INTO assetValuations (id, assetId, quantity, unitValueUsd, totalValueUsd, totalValueToman, exchangeRateUsed, valuedAt, createdAt)
SELECT id, asset_id, quantity, unit_value_usd, total_value_usd, total_value_toman, exchange_rate_used, valued_at, created_at
FROM asset_valuations_old;

-- ============================================
-- Step 4: Drop old tables
-- ============================================
DROP TABLE IF EXISTS asset_valuations_old;
DROP TABLE IF EXISTS assets_old;
DROP TABLE IF EXISTS asset_types_old;
DROP TABLE IF EXISTS incomes_old;
