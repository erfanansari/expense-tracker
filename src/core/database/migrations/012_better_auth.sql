-- Better Auth migration: session/account/verification tables, users columns,
-- credential backfill. Schema adapted from `npx @better-auth/cli generate`
-- (integer ids via advanced.database.generateId: 'serial').

ALTER TABLE users ADD COLUMN emailVerified INTEGER NOT NULL DEFAULT 0;
ALTER TABLE users ADD COLUMN image TEXT;

-- Grandfather all pre-migration users as verified
UPDATE users SET emailVerified = 1;

CREATE TABLE session (
  id INTEGER NOT NULL PRIMARY KEY,
  expiresAt DATE NOT NULL,
  token TEXT NOT NULL UNIQUE,
  createdAt DATE NOT NULL,
  updatedAt DATE NOT NULL,
  ipAddress TEXT,
  userAgent TEXT,
  userId INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE account (
  id INTEGER NOT NULL PRIMARY KEY,
  accountId TEXT NOT NULL,
  providerId TEXT NOT NULL,
  userId INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  accessToken TEXT,
  refreshToken TEXT,
  idToken TEXT,
  accessTokenExpiresAt DATE,
  refreshTokenExpiresAt DATE,
  scope TEXT,
  password TEXT,
  createdAt DATE NOT NULL,
  updatedAt DATE NOT NULL
);

CREATE TABLE verification (
  id INTEGER NOT NULL PRIMARY KEY,
  identifier TEXT NOT NULL,
  value TEXT NOT NULL,
  expiresAt DATE NOT NULL,
  createdAt DATE NOT NULL,
  updatedAt DATE NOT NULL
);

CREATE INDEX session_userId_idx ON session (userId);
CREATE INDEX account_userId_idx ON account (userId);
CREATE INDEX verification_identifier_idx ON verification (identifier);

-- Move credential passwords into Better Auth's account table.
-- users.password_hash is intentionally kept for now as a rollback safety net;
-- a later migration drops it.
INSERT INTO account (accountId, providerId, userId, password, createdAt, updatedAt)
SELECT CAST(id AS TEXT), 'credential', id, password_hash, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM users
WHERE password_hash IS NOT NULL AND password_hash != '';

-- Legacy reset tokens are replaced by the verification table
DROP TABLE IF EXISTS password_reset_tokens;
