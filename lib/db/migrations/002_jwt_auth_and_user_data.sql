-- Migration: Switch to JWT auth and add user ownership to data

-- Drop sessions table (not needed for JWT-based auth)
DROP TABLE IF EXISTS sessions;
DROP INDEX IF EXISTS idx_sessions_user;

-- Add user_id to expenses table
ALTER TABLE expenses ADD COLUMN user_id INTEGER REFERENCES users(id) ON DELETE CASCADE;

-- Add user_id to tags table
ALTER TABLE tags ADD COLUMN user_id INTEGER REFERENCES users(id) ON DELETE CASCADE;

-- Create index for faster user-based queries
CREATE INDEX IF NOT EXISTS idx_expenses_user ON expenses(user_id);
CREATE INDEX IF NOT EXISTS idx_tags_user ON tags(user_id);

-- Update tags unique constraint to be per-user (drop old, create new)
-- Note: SQLite doesn't support DROP CONSTRAINT, so we need to handle uniqueness at app level
-- or recreate the table. For now, we'll enforce uniqueness per user at the application level.
