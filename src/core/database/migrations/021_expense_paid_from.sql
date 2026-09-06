-- Migration 021: paying an expense out of an account
--
-- An "account" is not a new table. A bank balance is already an asset, and the
-- established split everywhere (YNAB budget-vs-tracking, Actual on-vs-off
-- budget, Firefly III asset accounts) is spendable-vs-tracked, not a parallel
-- entity. Here that split is the asset's category: cash and bank are spendable,
-- the other five are tracked. SPENDABLE_ASSET_CATEGORIES in
-- src/constants/assets.ts is the source of truth; this comment is not.
--
-- `assets.amount` stays the denormalized current balance — the summary SQL, the
-- assets page and the revalue endpoint all read it, so deriving it from history
-- would mean rewriting all three. The rule migration 020 exists to defend
-- therefore binds every write added here:
--
--     any mutation of assets.amount MUST append an assetValuations row and move
--     assets.lastValuedAt to that same timestamp.
--
-- Reversing a deduction (editing or deleting the expense) must add back the
-- exact number that was subtracted. Recomputing it would use whatever rate is
-- current at reversal time and leave the balance permanently off by the drift,
-- which compounds across edits. Hence the three columns below: which account,
-- how much actually left it, and in which currency.

-- Which account paid. SET NULL rather than CASCADE: deleting an account must
-- not delete expenses, because that is money genuinely spent.
--
-- NOTE: nothing issues `PRAGMA foreign_keys = ON` (it defaults OFF per
-- connection in SQLite), so this clause may not be enforced at all — exactly as
-- for expenses.recurringId in migration 019. DELETE /api/assets/[id] nulls
-- these columns explicitly and does not rely on it.
ALTER TABLE expenses ADD COLUMN paidFromAssetId INTEGER REFERENCES assets(id) ON DELETE SET NULL;

-- What was actually subtracted from assets.amount, in the ACCOUNT's currency.
-- NULL while an account is chosen but the deduction has not been applied — a
-- deliberate, legible intermediate state, see the two-phase write in
-- src/core/database/expense-funding.ts. Never the reverse.
ALTER TABLE expenses ADD COLUMN paidFromDelta REAL;

-- The account's currency at apply time. An asset's currency is editable via
-- PUT /api/assets/[id], so a bare delta is ambiguous: without this, reversal
-- could credit a dollar figure back into a toman balance. On a mismatch,
-- reversal refuses rather than guessing.
ALTER TABLE expenses ADD COLUMN paidFromCurrency TEXT;

-- Partial: the overwhelming majority of expenses have no account, and the only
-- lookup is "which expenses point at this account" during account deletion.
CREATE INDEX IF NOT EXISTS idxExpensesPaidFrom ON expenses(paidFromAssetId) WHERE paidFromAssetId IS NOT NULL;

-- A rule is a template for the expenses it posts, so it carries the account
-- too. Rent and subscriptions are precisely the expenses worth automating;
-- without this they would be the only ones that never move the balance.
ALTER TABLE recurringExpenses ADD COLUMN paidFromAssetId INTEGER REFERENCES assets(id) ON DELETE SET NULL;

-- Snapshots stop being exclusively "the user restated a value" as of this
-- migration — a cash account's valuation history becomes a transaction ledger.
-- Labelling that is free now and impossible later, because the history needing
-- the label will already have been written without it.
--   NULL    - written before 021, provenance unknown
--   manual  - POST /api/assets, PUT /api/assets/[id]
--   revalue - POST /api/assets/revalue
--   expense - an expense was deducted from, or reversed out of, this account
ALTER TABLE assetValuations ADD COLUMN source TEXT;
