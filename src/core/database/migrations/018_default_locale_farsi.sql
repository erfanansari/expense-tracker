-- Migration 018: Kharji is Farsi-first — move every existing user to 'fa'.
-- The locale cookie was renamed (kharji-locale -> kharji-locale-v2) in the same
-- change, because getUserLocale reads the cookie before the DB and the old one
-- has a one-year max-age; without the rename this UPDATE would be invisible to
-- anyone still carrying kharji-locale=en.
--
-- The column's `DEFAULT 'en'` from migration 015 is intentionally left alone:
-- SQLite cannot ALTER a column default without a full table rebuild, and every
-- insert path passes `locale` explicitly (createDefaultLocalePreferences).
UPDATE userLocalePreferences SET locale = 'fa', updatedAt = CURRENT_TIMESTAMP;
