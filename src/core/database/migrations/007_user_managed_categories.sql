-- Migration: User-managed expense categories
--
-- Replaces the previously hardcoded `expenses.category` TEXT column with a
-- proper `categories` table per user (name + icon + color + sort order) and
-- an `expenses.category_id` foreign key. Existing data is backfilled.

-- 1. Categories table -------------------------------------------------------
CREATE TABLE IF NOT EXISTS categories (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  icon        TEXT NOT NULL DEFAULT 'Folder',
  color       TEXT NOT NULL DEFAULT 'gray',
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  TEXT DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, name COLLATE NOCASE)
);

CREATE INDEX IF NOT EXISTS idx_categories_user ON categories(user_id);

-- 2. Seed 12 default categories for every existing user --------------------
INSERT OR IGNORE INTO categories (user_id, name, icon, color, sort_order)
SELECT id, 'Rent',          'Home',        'blue',    0  FROM users;
INSERT OR IGNORE INTO categories (user_id, name, icon, color, sort_order)
SELECT id, 'Utilities',     'Zap',         'amber',   1  FROM users;
INSERT OR IGNORE INTO categories (user_id, name, icon, color, sort_order)
SELECT id, 'Groceries',     'ShoppingCart','green',   2  FROM users;
INSERT OR IGNORE INTO categories (user_id, name, icon, color, sort_order)
SELECT id, 'Coffee',        'Coffee',      'orange',  3  FROM users;
INSERT OR IGNORE INTO categories (user_id, name, icon, color, sort_order)
SELECT id, 'Transport',     'Car',         'sky',     4  FROM users;
INSERT OR IGNORE INTO categories (user_id, name, icon, color, sort_order)
SELECT id, 'Healthcare',    'Heart',       'rose',    5  FROM users;
INSERT OR IGNORE INTO categories (user_id, name, icon, color, sort_order)
SELECT id, 'Clothing',      'Shirt',       'violet',  6  FROM users;
INSERT OR IGNORE INTO categories (user_id, name, icon, color, sort_order)
SELECT id, 'Entertainment', 'Film',        'pink',    7  FROM users;
INSERT OR IGNORE INTO categories (user_id, name, icon, color, sort_order)
SELECT id, 'Travel',        'Plane',       'cyan',    8  FROM users;
INSERT OR IGNORE INTO categories (user_id, name, icon, color, sort_order)
SELECT id, 'Investment',    'TrendingUp',  'emerald', 9  FROM users;
INSERT OR IGNORE INTO categories (user_id, name, icon, color, sort_order)
SELECT id, 'Work',          'Briefcase',   'slate',   10 FROM users;
INSERT OR IGNORE INTO categories (user_id, name, icon, color, sort_order)
SELECT id, 'Other',         'Folder',      'gray',    11 FROM users;

-- 3. For any custom category that the user already used in expenses (and
--    isn't in the default seed), create it with neutral icon/color. This
--    preserves any existing data — for example the seed-demo script's
--    "Dining Out", "Transportation" etc. — without losing rows.
INSERT OR IGNORE INTO categories (user_id, name, icon, color, sort_order)
SELECT DISTINCT e.user_id, e.category, 'Folder', 'gray', 100
FROM expenses e
WHERE e.user_id IS NOT NULL
  AND e.category IS NOT NULL
  AND TRIM(e.category) <> '';

-- 4. Add the foreign key column and backfill --------------------------------
ALTER TABLE expenses ADD COLUMN category_id INTEGER REFERENCES categories(id) ON DELETE RESTRICT;

UPDATE expenses
SET category_id = (
  SELECT c.id FROM categories c
  WHERE c.user_id = expenses.user_id
    AND LOWER(c.name) = LOWER(expenses.category)
  LIMIT 1
)
WHERE category_id IS NULL;

-- Any remaining unmatched rows (shouldn't happen after step 3, but defensive):
-- fall back to the user's "Other" category.
UPDATE expenses
SET category_id = (
  SELECT c.id FROM categories c
  WHERE c.user_id = expenses.user_id AND c.name = 'Other'
  LIMIT 1
)
WHERE category_id IS NULL;

CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category_id);

-- 5. Drop the old text column (libSQL/SQLite 3.35+) -------------------------
ALTER TABLE expenses DROP COLUMN category;
