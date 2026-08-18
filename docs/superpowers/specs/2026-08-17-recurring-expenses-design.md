# Recurring Expenses — Design

**Date:** 2026-08-17
**Status:** Implemented, with the UI revised on 2026-08-18 — see "UI" below.

> **Revision.** The original design put rules on a **Recurring tab** of the Expenses page with a
> rules table, pause/resume and `/api/recurring` routes. That was built, then removed: the tab spent
> a full horizontal band on a two-way switch and split one mental model — "my expenses" — across two
> modes. The UI now follows Todoist, where repetition is a property of the item's date rather than a
> separate entity. **Everything below about the scheduling model, schema and materialization is
> unchanged and still accurate**; only the UI and API surface differ.

## Goal

Let users define rules that automatically post expenses on a schedule — rent, subscriptions,
utilities — without re-entering them every month. Rules must recur correctly on **both** the
Gregorian and Jalali calendars, because "the 1st of the month" means two different things to
Kharji's two audiences.

## Scope

**In:** recurring expenses.
**Out (this pass):** recurring income, recurring/scheduled asset revaluation, an Overview
"upcoming" card, a variable-amount review queue, notifications when a rule posts.

Income is deliberately excluded: `incomes` stores `month`/`year` with no day, so a recurring
income is "ensure a row exists for this month" — a different mechanic that would muddy this build.

## Decisions

| Decision        | Choice                                                | Why                                                                                                                                                                                 |
| --------------- | ----------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Posting         | Auto-post on the due date                             | The ledger stays true without the user logging in. Dashboard, reports and net worth are all wrong under a confirm-first queue.                                                      |
| Calendar        | Per-rule, defaulted from the user's resolved calendar | Rent on 1 Farvardin genuinely recurs on Jalali months; a USD subscription recurs on Gregorian. Users have both. A global setting would silently reschedule every rule when flipped. |
| Placement       | Tab on the Expenses page                              | Keeps top nav at 6 items and puts rules next to the ledger they feed.                                                                                                               |
| Deleting a rule | Keeps already-posted expenses                         | They are money actually spent. `ON DELETE SET NULL`.                                                                                                                                |

## Scheduling model

The naive model — store `nextRunDate`, add one month each time — drifts permanently. Rent
anchored Jan 31 becomes Feb 28, then Mar 28, then Apr 28. The month-end clamp is destructive.

Instead, rules store an **anchor plus a count**, and every due date is recomputed from scratch:

```
occurrenceAt(rule, n)          // n = 0 is the anchor itself
nextDueDate = occurrenceAt(rule, postedCount)
```

Jan 31 → Feb 28 → **Mar 31**. The clamp applies per-occurrence and never mutates the anchor.

`nextDueDate` is stored as a denormalized column so "is anything due?" is one indexed query,
but it is always derived from `anchorDate + postedCount` — never incremented in place.

## Schema — migration `019_recurring_expenses.sql`

New tables use camelCase, matching every table since 005. `expenses` keeps its snake_case
columns and gains one camelCase column, following the precedent `entryRate` set in 009.

```sql
CREATE TABLE recurringExpenses (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  userId         INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  categoryId     INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  description    TEXT    NOT NULL,
  amount         REAL    NOT NULL,
  currency       TEXT    NOT NULL,
  frequency      TEXT    NOT NULL,             -- daily|weekly|monthly|yearly
  intervalCount  INTEGER NOT NULL DEFAULT 1,   -- "every 2 months"
  calendar       TEXT    NOT NULL DEFAULT 'gregorian',
  anchorDate     TEXT    NOT NULL,             -- yyyy-MM-dd, occurrence #0
  endDate        TEXT,                         -- NULL = runs forever
  postedCount    INTEGER NOT NULL DEFAULT 0,
  nextDueDate    TEXT    NOT NULL,             -- derived; indexed
  lastPostedDate TEXT,
  paused         INTEGER NOT NULL DEFAULT 0,
  createdAt      TEXT DEFAULT CURRENT_TIMESTAMP,
  updatedAt      TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idxRecurringDue ON recurringExpenses(userId, paused, nextDueDate);

CREATE TABLE recurringExpenseTags (
  recurringId INTEGER NOT NULL REFERENCES recurringExpenses(id) ON DELETE CASCADE,
  tagId       INTEGER NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (recurringId, tagId)
);

ALTER TABLE expenses ADD COLUMN recurringId INTEGER
  REFERENCES recurringExpenses(id) ON DELETE SET NULL;

-- Idempotency net: a rule fires at most once per date, even if the cron double-runs
-- or a lazy catch-up races it. Partial, so ordinary expenses are unaffected.
CREATE UNIQUE INDEX idxExpenseRecurringOnce
  ON expenses(recurringId, date) WHERE recurringId IS NOT NULL;
```

## Occurrence engine — `src/core/recurring/schedule.ts`

Pure and dependency-free, so it can run identically on the server (materializer) and in the
browser (the form's live "next occurrence" preview).

- **daily / weekly** — calendar-agnostic; a week is seven days in both systems. `calendar` is
  ignored and the form hides the toggle for these frequencies.
- **monthly / yearly, gregorian** — `(y, m + n·interval)`, day clamped to the target month length.
- **monthly / yearly, jalali** — convert with `gregorianToJalali`, walk Jalali months
  (31×6, 30×5, then 29-or-30), clamp with `jalaaliMonthLength`, convert back.

Reuses the Jalali helpers already in `src/utils/date/jalali-calendar.ts`.

Tested edge cases: the 31st in a 30-day month, Feb 29 in a leap year, **30 Esfand in a non-leap
Jalali year**, `intervalCount > 1`, end dates, and anchor preservation across a clamp.

## Materialization — `src/core/recurring/materialize.ts`

```
for each rule where !paused and nextDueDate <= today:
    while nextDueDate <= today and (endDate is null or nextDueDate <= endDate):
        entryRate = getEntryRate(rule.currency)
        if entryRate is null: break          # no rate yet → retry tomorrow, don't advance
        INSERT expense (…, recurringId, date = nextDueDate)
        copy tags; postedCount++; recompute nextDueDate
    # cap 500 iterations per rule per run as a runaway backstop
```

- **`today` is computed in Asia/Tehran**, not UTC. The cron fires at 09:00 UTC = 12:30 Tehran;
  using UTC would post 1st-of-month rent on the wrong local day for the primary audience.
- Posting on the true due date means `getEntryRate()` snapshots that day's rate — historically
  correct with no backfill logic.
- A missing rate breaks the loop **without** advancing `postedCount`, so the occurrence is
  retried on the next run rather than silently skipped.

Two triggers:

1. **Cron** — a third step inside the existing `/api/cron/reports` daily job, alongside backup
   and email reports. No new Vercel cron entry, no new secret.
2. **Lazy catch-up on read** — `GET /api/expenses` runs it for the
   current user first. One indexed query when nothing is due. A user opening the app at 8am
   Tehran on the 1st sees their rent immediately instead of waiting for 12:30. Mirrors the
   `ensureFreshRates` pattern already used on a hot path; the partial unique index makes the
   race with cron harmless.

## API

No dedicated routes. A repeat travels as an optional `repeat` object on the existing expense
endpoints — `POST /api/expenses` and `PUT /api/expenses/[id]` — and reads return the live `repeat`
alongside `recurringId`. `repeat: null` means "doesn't repeat", and is how a repeat is removed.

`syncExpenseRepeat` (`src/core/database/expense-repeat.ts`) reconciles the hidden
`recurringExpenses` row purely as a side-effect of saving the expense: create, update, or delete.

**Anchor.** The owning expense's `date` is the rule's `anchorDate` — that identity is what makes
repetition feel like a property of the date. A new rule starts at `postedCount = 1`, because the
expense being saved _is_ occurrence #0; starting at 0 would post a duplicate on the same date.

**Edit semantics.** Changing amount, description, category, tags or currency updates what future
occurrences will say but leaves the schedule untouched. Changing `frequency`, `intervalCount`,
`calendar` or the expense's `date` re-baselines `postedCount` to the number of occurrences falling
strictly before today under the _new_ schedule, so rescheduling never retro-posts history.

## UI

Repetition is a property of the expense's date, following Todoist: no separate list, no tab, no
pause, no manager screen.

- **`RepeatField`** sits directly under the date in the expense form — one dropdown reading
  _doesn't repeat / every day / every week / every month / every year / custom…_. The common case
  is a single click.
- **Custom** reveals interval, calendar and end date. Nothing else is ever shown.
- **Calendar choice** appears only for monthly/yearly (a week is seven days in both systems),
  defaulted from `resolveCalendar(prefs.calendar, locale)`.
- **Live preview** of the next two dates, computed by the same pure engine the server uses, so the
  Jalali-vs-Gregorian choice is legible rather than abstract.
- **Stopping a repeat** means choosing "doesn't repeat" and saving. Already-posted expenses are kept.
- **Generated expenses** get a `Repeat` icon in `ExpensesTable`, and `ExpenseDetailsDrawer` names
  the schedule behind the row.
- Full `en` + `fa` strings, Farsi in the casual Blu-style tone.

Existing primitives and tokens throughout: `Select`, `DatePicker`, no `dark:` variants, no hex
literals.

## Testing

Jest is already configured. The engine carries the bulk of the coverage: occurrence math on both
calendars, clamping, leap years, intervals, end dates, catch-up sequences, the re-baseline rule,
and the runaway cap.
