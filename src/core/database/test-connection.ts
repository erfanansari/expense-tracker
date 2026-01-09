/* eslint-disable no-console, @typescript-eslint/no-non-null-assertion */
import { createClient } from '@libsql/client';
import { config } from 'dotenv';

// Load environment variables from .env.local
config({ path: '.env.local' });

async function testConnection() {
  const client = createClient({
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN!,
  });

  try {
    console.log('Testing database connection...');
    console.log('URL:', process.env.TURSO_DATABASE_URL);

    // Check if table exists
    const result = await client.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='expenses'");

    if (result.rows.length > 0) {
      console.log('✓ Table "expenses" exists');

      // Get table schema
      const schema = await client.execute('PRAGMA table_info(expenses)');
      console.log('\nTable schema:');
      console.log(schema.rows);

      // Get count
      const count = await client.execute('SELECT COUNT(*) as count FROM expenses');
      console.log(`\nTotal expenses: ${count.rows[0].count}`);
    } else {
      console.log('✗ Table "expenses" does NOT exist');
      console.log('Running migration...');

      // Create the table
      await client.execute(`
        CREATE TABLE IF NOT EXISTS expenses (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          date TEXT NOT NULL,
          category TEXT NOT NULL,
          description TEXT NOT NULL,
          price_toman REAL NOT NULL,
          price_usd REAL NOT NULL,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
      `);

      await client.execute(`CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date)`);

      console.log('✓ Migration completed!');
    }
  } catch (error) {
    console.error('Connection test failed:', error);
    throw error;
  } finally {
    client.close();
  }
}

testConnection();
