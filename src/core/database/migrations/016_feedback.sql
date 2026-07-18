-- Migration 016: in-app feedback submissions
-- type = 'bug' | 'idea' | 'other'
CREATE TABLE IF NOT EXISTS feedback (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  userId INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT 'other',
  message TEXT NOT NULL,
  createdAt TEXT DEFAULT CURRENT_TIMESTAMP
);
