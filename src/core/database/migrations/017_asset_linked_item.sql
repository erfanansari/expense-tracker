-- Optional link from an asset to a tracked Navasan price item (see
-- src/constants/tracked-items.ts, e.g. GOLD_SEKKEH). NULL = manually valued.
-- Linked assets can be revalued in bulk at current prices via
-- POST /api/assets/revalue.
ALTER TABLE assets ADD COLUMN linkedItem TEXT;
