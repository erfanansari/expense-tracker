-- Migration 019: recurring expenses
--
-- Rules that auto-post an expense on a schedule (rent, subscriptions, utilities).
--
-- A rule stores an ANCHOR plus a COUNT, never a mutable "next run" pointer. Every
-- due date is recomputed as occurrenceAt(anchorDate, postedCount), so the
-- month-end clamp is non-destructive: an anchor on Jan 31 yields Feb 28 and then
-- Mar 31, not Mar 28. `nextDueDate` is a denormalized copy of that computation,
-- kept only so "is anything due?" is a single indexed query.
--
-- `calendar` is per-rule, not a global preference: rent on 1 Farvardin genuinely
-- recurs on Jalali months while a USD subscription recurs on Gregorian, and users
-- have both. It is meaningful only for monthly/yearly — a week is seven days in
-- either system.

CREATE TABLE IF NOT EXISTS recurringExpenses (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  userId         INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Template — mirrors the columns of an expense row.
  categoryId     INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  description    TEXT    NOT NULL,
  amount         REAL    NOT NULL,
  currency       TEXT    NOT NULL,

  -- Recurrence.
  frequency      TEXT    NOT NULL,               -- daily | weekly | monthly | yearly
  intervalCount  INTEGER NOT NULL DEFAULT 1,     -- "every 2 months"
  calendar       TEXT    NOT NULL DEFAULT 'gregorian',  -- gregorian | jalali
  anchorDate     TEXT    NOT NULL,               -- yyyy-MM-dd, occurrence #0
  endDate        TEXT,                           -- NULL = runs forever

  -- State.
  postedCount    INTEGER NOT NULL DEFAULT 0,
  nextDueDate    TEXT    NOT NULL,               -- derived from anchorDate + postedCount
  lastPostedDate TEXT,
  paused         INTEGER NOT NULL DEFAULT 0,

  createdAt      TEXT DEFAULT CURRENT_TIMESTAMP,
  updatedAt      TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idxRecurringDue ON recurringExpenses(userId, paused, nextDueDate);

CREATE TABLE IF NOT EXISTS recurringExpenseTags (
  recurringId INTEGER NOT NULL REFERENCES recurringExpenses(id) ON DELETE CASCADE,
  tagId       INTEGER NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (recurringId, tagId)
);

-- Link a generated expense back to its rule. SET NULL rather than CASCADE:
-- deleting a rule must not delete money that was actually spent — the expenses
-- stay, they just stop being marked as generated.
ALTER TABLE expenses ADD COLUMN recurringId INTEGER
  REFERENCES recurringExpenses(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idxExpensesRecurring ON expenses(recurringId);

-- Idempotency net: a rule can fire at most once per date, even if the cron
-- double-runs or the lazy read-path catch-up races it. Partial, so ordinary
-- (non-generated) expenses are entirely unaffected.
CREATE UNIQUE INDEX IF NOT EXISTS idxExpenseRecurringOnce
  ON expenses(recurringId, date) WHERE recurringId IS NOT NULL;
