/* eslint-disable no-console, @typescript-eslint/no-non-null-assertion */
import { createClient } from '@libsql/client';
import { config } from 'dotenv';

import { hashPassword } from '@core/auth/password';

// Load environment variables from .env.local
config({ path: '.env.local' });

const DEFAULT_USER_EMAIL = 'dev.erfanansari@gmail.com';
const DEFAULT_PASSWORD = 'ChangeMe123!'; // User should change this after first login

// Mirrors DEFAULT_CATEGORY_SEED_FA in src/core/database/categories.ts (the app
// is Farsi-first, so the default locale's set is what gets seeded) — kept
// inline here so the script does not pull in the shared `db` client at import
// time (env vars are loaded after imports).
const DEFAULT_CATEGORIES: ReadonlyArray<{ name: string; icon: string; color: string }> = [
  { name: 'اجاره', icon: 'Home', color: 'blue' },
  { name: 'قبوض', icon: 'Zap', color: 'amber' },
  { name: 'خواربار', icon: 'ShoppingCart', color: 'green' },
  { name: 'قهوه', icon: 'Coffee', color: 'orange' },
  { name: 'حمل و نقل', icon: 'Car', color: 'sky' },
  { name: 'سلامت و درمان', icon: 'Heart', color: 'rose' },
  { name: 'پوشاک', icon: 'Shirt', color: 'violet' },
  { name: 'سرگرمی', icon: 'Film', color: 'pink' },
  { name: 'سفر', icon: 'Plane', color: 'cyan' },
  { name: 'سرمایه‌گذاری', icon: 'TrendingUp', color: 'emerald' },
  { name: 'کار', icon: 'Briefcase', color: 'slate' },
  { name: 'سایر', icon: 'Folder', color: 'gray' },
];

async function seedUser() {
  const client = createClient({
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN!,
  });

  try {
    console.log('Seeding default user...');

    // Check if user already exists
    const existingUser = await client.execute({
      sql: 'SELECT id FROM users WHERE email = ?',
      args: [DEFAULT_USER_EMAIL],
    });

    let userId: number;

    if (existingUser.rows.length > 0) {
      userId = existingUser.rows[0].id as number;
      console.log(`User ${DEFAULT_USER_EMAIL} already exists with id ${userId}`);
    } else {
      // Create the user; credential password lives in the account table
      const passwordHash = await hashPassword(DEFAULT_PASSWORD);
      const result = await client.execute({
        sql: 'INSERT INTO users (email, emailVerified, onboarded_at, checklist_dismissed_at) VALUES (?, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)',
        args: [DEFAULT_USER_EMAIL],
      });
      userId = Number(result.lastInsertRowid);
      await client.execute({
        sql: `INSERT INTO account (accountId, providerId, userId, password, createdAt, updatedAt)
              VALUES (?, 'credential', ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
        args: [String(userId), userId, passwordHash],
      });
      console.log(`Created user ${DEFAULT_USER_EMAIL} with id ${userId}`);
      console.log(`Default password: ${DEFAULT_PASSWORD} (please change after first login)`);
    }

    // Associate all existing expenses (with null user_id) to this user
    const updateResult = await client.execute({
      sql: 'UPDATE expenses SET user_id = ? WHERE user_id IS NULL',
      args: [userId],
    });
    console.log(`Associated ${updateResult.rowsAffected} expenses with user ${DEFAULT_USER_EMAIL}`);

    // Associate all existing tags (with null user_id) to this user
    const tagsResult = await client.execute({
      sql: 'UPDATE tags SET user_id = ? WHERE user_id IS NULL',
      args: [userId],
    });
    console.log(`Associated ${tagsResult.rowsAffected} tags with user ${DEFAULT_USER_EMAIL}`);

    // Seed default categories (idempotent — INSERT OR IGNORE)
    for (let i = 0; i < DEFAULT_CATEGORIES.length; i++) {
      const { name, icon, color } = DEFAULT_CATEGORIES[i];
      await client.execute({
        sql: 'INSERT OR IGNORE INTO categories (user_id, name, icon, color, sort_order) VALUES (?, ?, ?, ?, ?)',
        args: [userId, name, icon, color, i],
      });
    }
    console.log(`Ensured ${DEFAULT_CATEGORIES.length} default categories exist for user`);

    console.log('Seeding completed successfully!');
  } catch (error) {
    console.error('Seeding failed:', error);
    throw error;
  } finally {
    client.close();
  }
}

seedUser();
