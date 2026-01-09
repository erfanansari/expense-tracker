import { createClient } from '@libsql/client';
import { config } from 'dotenv';
import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';

// Load environment variables from .env.local
config({ path: '.env.local' });

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

    // Run each migration that hasn't been run yet
    for (const file of migrationFiles) {
      // Check if migration has already been run
      const result = await client.execute({
        sql: 'SELECT name FROM _migrations WHERE name = ?',
        args: [file],
      });

      if (result.rows.length === 0) {
        console.log(`Running migration: ${file}`);
        const migrationPath = join(migrationsDir, file);
        const migrationSql = readFileSync(migrationPath, 'utf-8');

        await client.executeMultiple(migrationSql);

        // Record migration as executed
        await client.execute({
          sql: 'INSERT INTO _migrations (name) VALUES (?)',
          args: [file],
        });
      } else {
        console.log(`Skipping already-executed migration: ${file}`);
      }
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
