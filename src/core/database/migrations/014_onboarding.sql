-- First-run experience flags. NULL onboarded_at = show the welcome screen;
-- NULL checklist_dismissed_at = the getting-started checklist may render.
ALTER TABLE users ADD COLUMN onboarded_at TEXT;
ALTER TABLE users ADD COLUMN checklist_dismissed_at TEXT;

-- Existing users (including demo) must never see the wizard or a half-checked
-- checklist — backfill both.
UPDATE users SET onboarded_at = CURRENT_TIMESTAMP, checklist_dismissed_at = CURRENT_TIMESTAMP;
