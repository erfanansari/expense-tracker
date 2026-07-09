-- Better Auth stores credential passwords in account.password (backfilled in
-- 012). users.password_hash is NOT NULL, which breaks Better Auth's user
-- inserts, so it can't stay; the hashes remain in account.password and in the
-- pre-migration B2 snapshot.
ALTER TABLE users DROP COLUMN password_hash;
