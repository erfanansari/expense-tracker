import { config } from 'dotenv';
import { createClient } from '@libsql/client';
import { hashPassword } from '../auth';

// Load environment variables from .env.local
config({ path: '.env.local' });

const DEFAULT_USER_EMAIL = 'dev.erfanansari@gmail.com';
const DEFAULT_PASSWORD = 'ChangeMe123!'; // User should change this after first login

async function seedUser() {
  const client = createClient({
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN!
  });

  try {
    console.log('Seeding default user...');

    // Check if user already exists
    const existingUser = await client.execute({
      sql: 'SELECT id FROM users WHERE email = ?',
      args: [DEFAULT_USER_EMAIL]
    });

    let userId: number;

    if (existingUser.rows.length > 0) {
      userId = existingUser.rows[0].id as number;
      console.log(`User ${DEFAULT_USER_EMAIL} already exists with id ${userId}`);
    } else {
      // Create the user
      const passwordHash = await hashPassword(DEFAULT_PASSWORD);
      const result = await client.execute({
        sql: 'INSERT INTO users (email, password_hash) VALUES (?, ?)',
        args: [DEFAULT_USER_EMAIL, passwordHash]
      });
      userId = Number(result.lastInsertRowid);
      console.log(`Created user ${DEFAULT_USER_EMAIL} with id ${userId}`);
      console.log(`Default password: ${DEFAULT_PASSWORD} (please change after first login)`);
    }

    // Associate all existing expenses (with null user_id) to this user
    const updateResult = await client.execute({
      sql: 'UPDATE expenses SET user_id = ? WHERE user_id IS NULL',
      args: [userId]
    });
    console.log(`Associated ${updateResult.rowsAffected} expenses with user ${DEFAULT_USER_EMAIL}`);

    // Associate all existing tags (with null user_id) to this user
    const tagsResult = await client.execute({
      sql: 'UPDATE tags SET user_id = ? WHERE user_id IS NULL',
      args: [userId]
    });
    console.log(`Associated ${tagsResult.rowsAffected} tags with user ${DEFAULT_USER_EMAIL}`);

    console.log('Seeding completed successfully!');
  } catch (error) {
    console.error('Seeding failed:', error);
    throw error;
  } finally {
    client.close();
  }
}

seedUser();
