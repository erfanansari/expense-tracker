-- Migration 010: per-user number format preference
-- auto    = compact on cards/charts, full precision in tables (default)
-- compact = abbreviated everywhere (10.69B, $61.33K)
-- full    = full digits with separators everywhere
ALTER TABLE userCurrencyPreferences ADD COLUMN numberFormat TEXT NOT NULL DEFAULT 'auto';
