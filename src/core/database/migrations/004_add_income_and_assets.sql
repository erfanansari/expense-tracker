-- Migration: Add income tracking and asset management tables

-- ============================================
-- Income tracking table
-- ============================================
CREATE TABLE IF NOT EXISTS incomes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  amount_usd REAL NOT NULL,
  amount_toman REAL NOT NULL,
  exchange_rate_used REAL NOT NULL,
  month INTEGER NOT NULL,
  year INTEGER NOT NULL,
  income_type TEXT NOT NULL,
  source TEXT,
  notes TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_incomes_user ON incomes(user_id);
CREATE INDEX IF NOT EXISTS idx_incomes_date ON incomes(year, month);
CREATE INDEX IF NOT EXISTS idx_incomes_type ON incomes(income_type);

-- ============================================
-- Asset type definitions (system + custom)
-- ============================================
CREATE TABLE IF NOT EXISTS asset_types (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  name_fa TEXT,
  category TEXT NOT NULL,
  unit TEXT NOT NULL,
  is_quantity_based INTEGER DEFAULT 1,
  icon TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_asset_types_user ON asset_types(user_id);
CREATE INDEX IF NOT EXISTS idx_asset_types_category ON asset_types(category);

-- Insert default asset types (user_id = NULL means system default)
INSERT INTO asset_types (user_id, code, name, name_fa, category, unit, is_quantity_based, icon) VALUES
  (NULL, 'cash_usd', 'Cash (USD)', 'نقدی (دلار)', 'cash', 'USD', 1, 'dollar-sign'),
  (NULL, 'cash_toman', 'Cash (Toman)', 'نقدی (تومان)', 'cash', 'IRR', 1, 'banknote'),
  (NULL, 'btc', 'Bitcoin', 'بیت‌کوین', 'crypto', 'BTC', 1, 'bitcoin'),
  (NULL, 'eth', 'Ethereum', 'اتریوم', 'crypto', 'ETH', 1, 'circle'),
  (NULL, 'dai', 'DAI Stablecoin', 'دای', 'crypto', 'DAI', 1, 'circle-dollar-sign'),
  (NULL, 'paxg', 'PAX Gold', 'طلای دیجیتال', 'crypto', 'PAXG', 1, 'coins'),
  (NULL, 'usdt', 'Tether', 'تتر', 'crypto', 'USDT', 1, 'circle-dollar-sign'),
  (NULL, 'gold_gram', 'Gold (Grams)', 'طلا (گرم)', 'commodity', 'gram', 1, 'gem'),
  (NULL, 'gold_coin', 'Gold Coin', 'سکه طلا', 'commodity', 'coin', 1, 'circle'),
  (NULL, 'vehicle', 'Vehicle', 'خودرو', 'vehicle', 'unit', 0, 'car'),
  (NULL, 'property', 'Real Estate', 'ملک', 'property', 'unit', 0, 'building'),
  (NULL, 'bank_iran', 'Iranian Bank Account', 'حساب بانکی ایرانی', 'bank', 'IRR', 1, 'landmark'),
  (NULL, 'bank_intl', 'International Bank', 'حساب بانکی خارجی', 'bank', 'USD', 1, 'landmark'),
  (NULL, 'stock', 'Stocks/Shares', 'سهام', 'investment', 'unit', 1, 'trending-up');

-- ============================================
-- Current asset holdings
-- ============================================
CREATE TABLE IF NOT EXISTS assets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  asset_type_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  quantity REAL NOT NULL DEFAULT 1,
  unit_value_usd REAL,
  total_value_usd REAL NOT NULL,
  total_value_toman REAL NOT NULL,
  exchange_rate_used REAL NOT NULL,
  notes TEXT,
  last_valued_at TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (asset_type_id) REFERENCES asset_types(id) ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_assets_user ON assets(user_id);
CREATE INDEX IF NOT EXISTS idx_assets_type ON assets(asset_type_id);

-- ============================================
-- Historical asset valuations
-- ============================================
CREATE TABLE IF NOT EXISTS asset_valuations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  asset_id INTEGER NOT NULL,
  quantity REAL NOT NULL,
  unit_value_usd REAL,
  total_value_usd REAL NOT NULL,
  total_value_toman REAL NOT NULL,
  exchange_rate_used REAL NOT NULL,
  valued_at TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_asset_valuations_asset ON asset_valuations(asset_id);
CREATE INDEX IF NOT EXISTS idx_asset_valuations_date ON asset_valuations(valued_at DESC);
