-- Repair assets whose `lastValuedAt` drifted ahead of their newest valuation.
--
-- Until this migration, PUT /api/assets/[id] treated a change to `lastValuedAt`
-- as a non-valuation edit: it updated the asset row but wrote no snapshot. So
-- an asset could claim it was valued on the 13th while its newest
-- assetValuations row still said the 6th.
--
-- The pivot-currency total stayed correct either way (amount * entryRate needs
-- no rate lookup), which is why this hid for so long. Any *converted* figure
-- diverged though: the assets page converts each asset at `lastValuedAt` and
-- the net-worth chart converts each valuation at `valuedAt`, so the two read
-- the exchange rate from different days and reported different secondary
-- totals for the same portfolio.
--
-- The repair is additive on purpose. The user's stated date is the thing they
-- actually asserted, so rather than rewriting `lastValuedAt` backwards to match
-- history, we record the snapshot that should have been written at that date,
-- carrying the asset's current values. History stays append-only and the
-- denormalised column becomes true again.
--
-- entryRate is copied from the asset row rather than looked up per date: it is
-- the frozen rate that row already uses for its own pivot value, so copying it
-- keeps the new snapshot's pivot value identical to the asset's. Looking up a
-- different rate here would move the totals this migration exists to reconcile.

INSERT INTO assetValuations (assetId, quantity, unitValue, amount, currency, entryRate, valuedAt)
SELECT
  a.id,
  a.quantity,
  a.unitValue,
  a.amount,
  a.currency,
  a.entryRate,
  a.lastValuedAt
FROM assets a
WHERE
  -- Only where the newest snapshot is genuinely older than the asset's own
  -- date. Assets already consistent, and assets with no valuations at all
  -- (impossible via the API, but cheap to exclude), are left untouched.
  EXISTS (SELECT 1 FROM assetValuations v WHERE v.assetId = a.id)
  AND date(a.lastValuedAt) > (
    SELECT date(MAX(v.valuedAt)) FROM assetValuations v WHERE v.assetId = a.id
  );
