-- Migration: Notification preferences + sent-email audit log
--
-- Adds a per-user preferences table that controls which emails Kharji sends
-- (master switch + monthly/yearly report toggles + a unique unsubscribe token
-- used in the email footer's one-click link).
--
-- Adds a sentEmailReports audit table that the cron uses to guarantee
-- idempotency (UNIQUE on userId/reportType/periodKey) and a future
-- rate-limit window.

CREATE TABLE IF NOT EXISTS userNotificationPreferences (
  userId               INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  emailEnabled         INTEGER NOT NULL DEFAULT 1,
  monthlyReportEnabled INTEGER NOT NULL DEFAULT 1,
  yearlyReportEnabled  INTEGER NOT NULL DEFAULT 1,
  unsubscribeToken     TEXT NOT NULL UNIQUE,
  createdAt            TEXT DEFAULT CURRENT_TIMESTAMP,
  updatedAt            TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_unp_eligibility
  ON userNotificationPreferences(emailEnabled, monthlyReportEnabled, yearlyReportEnabled);

-- Backfill any existing users with defaults so the cron can find them.
INSERT OR IGNORE INTO userNotificationPreferences (userId, unsubscribeToken)
SELECT id, lower(hex(randomblob(16))) FROM users;

CREATE TABLE IF NOT EXISTS sentEmailReports (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  userId      INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reportType  TEXT NOT NULL,           -- 'monthly' | 'yearly'
  periodKey   TEXT NOT NULL,           -- '2026-05' for monthly, '2025' for yearly, 'test-<ts>' for test sends
  resendId    TEXT,
  status      TEXT NOT NULL,           -- 'sent' | 'failed' | 'skipped'
  errorMsg    TEXT,
  sentAt      TEXT DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(userId, reportType, periodKey)
);

CREATE INDEX IF NOT EXISTS idx_ser_user ON sentEmailReports(userId, sentAt DESC);
