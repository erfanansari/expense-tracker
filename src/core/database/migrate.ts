/* eslint-disable no-console, @typescript-eslint/no-non-null-assertion */
import { createClient } from '@libsql/client';
import type { Client } from '@libsql/client';
import { config } from 'dotenv';
import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';
import { gzipSync } from 'zlib';

// Load environment variables from .env.local BEFORE importing modules that read
// process.env at load time (backup-storage/backup.config) — hence the dynamic
// imports inside snapshotBeforeMigrating rather than static imports here.
config({ path: '.env.local' });

/**
 * Snapshot the whole DB to B2 BEFORE applying migrations, so a destructive
 * migration always has a fresh, clearly-named restore point (closes the gap the
 * once-daily backup leaves). Aborts the migration if the snapshot fails — set
 * SKIP_PREMIGRATION_BACKUP=1 to bypass intentionally (e.g. local throwaway DBs).
 */
async function snapshotBeforeMigrating(client: Client, pending: string[]): Promise<void> {
  if (process.env.SKIP_PREMIGRATION_BACKUP === '1') {
    console.warn('⚠️  SKIP_PREMIGRATION_BACKUP=1 — skipping pre-migration snapshot.');
    return;
  }

  console.log(`Taking pre-migration snapshot before applying: ${pending.join(', ')}`);
  try {
    // Dynamic import so .env.local is loaded before backup.config reads process.env.
    const { uploadBackup } = await import('./backup-storage');
    const { generateSqlDump } = await import('./dump');
    const dump = await generateSqlDump(client);
    const gzipped = gzipSync(Buffer.from(dump, 'utf-8'));
    const stamp = new Date().toISOString().replace(/[:.]/g, '-');
    const key = `kharji-premigration-${stamp}.sql.gz`;
    await uploadBackup(key, gzipped);
    console.log(`✓ Pre-migration snapshot uploaded: ${key} (${gzipped.length} bytes)`);
  } catch (error) {
    console.error('Pre-migration snapshot FAILED — aborting before any migration runs.');
    console.error('Fix the backup (B2 creds) or re-run with SKIP_PREMIGRATION_BACKUP=1 to bypass.');
    throw error;
  }
}

async function migrate() {
  const client = createClient({
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN!,
  });

  try {
    console.log('Running database migration...');

    // First, create migration tracking table if it doesn't exist
    await client.execute({
      sql: `CREATE TABLE IF NOT EXISTS _migrations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        executed_at TEXT DEFAULT CURRENT_TIMESTAMP
      )`,
    });

    // Get list of migration files
    const migrationsDir = join(__dirname, 'migrations');
    let migrationFiles: string[] = [];

    try {
      migrationFiles = readdirSync(migrationsDir)
        .filter((f) => f.endsWith('.sql'))
        .sort();
    } catch {
      // migrations directory might not exist yet
      console.log('No migrations directory found, skipping migrations');
    }

    // Work out which migrations are pending up front, so we can snapshot once.
    const executed = await client.execute({ sql: 'SELECT name FROM _migrations' });
    const executedNames = new Set(executed.rows.map((r) => r.name as string));
    const pending = migrationFiles.filter((f) => !executedNames.has(f));

    if (pending.length === 0) {
      console.log('No pending migrations — database is up to date.');
      return;
    }

    // Guaranteed restore point before any schema/data change.
    await snapshotBeforeMigrating(client, pending);

    for (const file of pending) {
      console.log(`Running migration: ${file}`);
      const migrationPath = join(migrationsDir, file);
      const migrationSql = readFileSync(migrationPath, 'utf-8');

      await client.executeMultiple(migrationSql);

      await client.execute({
        sql: 'INSERT INTO _migrations (name) VALUES (?)',
        args: [file],
      });
    }

    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  } finally {
    client.close();
  }
}

migrate();
