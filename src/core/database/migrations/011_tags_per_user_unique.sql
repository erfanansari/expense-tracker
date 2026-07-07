-- Migration: make tag names unique per user instead of globally.
--
-- 002 added user_id to tags but could not drop the original global
-- UNIQUE(name) constraint (SQLite has no DROP CONSTRAINT), so the first
-- user to create a tag name blocked every other user from using it
-- (POST /api/tags returned 500 with "UNIQUE constraint failed: tags.name").
-- Rebuild the table with the intended UNIQUE(user_id, name), preserving ids
-- so expense_tags references stay valid. NOCASE matches the app's
-- case-insensitive duplicate checks and the categories table (007).

PRAGMA foreign_keys=OFF;

CREATE TABLE tags_new (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, name COLLATE NOCASE)
);

-- Ownerless rows (pre-002 leftovers, if any) are dead data; drop them.
INSERT INTO tags_new (id, user_id, name, created_at)
SELECT id, user_id, name, created_at FROM tags WHERE user_id IS NOT NULL;

DROP TABLE tags;
ALTER TABLE tags_new RENAME TO tags;

CREATE INDEX IF NOT EXISTS idx_tags_user ON tags(user_id);

-- Clean junction rows that pointed at dropped ownerless tags.
DELETE FROM expense_tags WHERE tag_id NOT IN (SELECT id FROM tags);

PRAGMA foreign_keys=ON;
