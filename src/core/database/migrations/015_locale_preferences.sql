-- Migration 015: per-user locale & calendar preferences
-- locale                = UI language: 'en' | 'fa'
-- calendar              = 'auto' (en -> gregorian, fa -> jalali) | 'gregorian' | 'jalali'
-- secondaryDateCaptions = 1 to show the other calendar as a muted caption under dates
--                         (default 1 preserves the existing Jalali sub-captions)
CREATE TABLE IF NOT EXISTS userLocalePreferences (
  userId INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  locale TEXT NOT NULL DEFAULT 'en',
  calendar TEXT NOT NULL DEFAULT 'auto',
  secondaryDateCaptions INTEGER NOT NULL DEFAULT 1,
  createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
  updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
);
