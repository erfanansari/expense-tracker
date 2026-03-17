import { databaseConfig } from '@configs/database.config';
import { createClient } from '@libsql/client';

if (!databaseConfig.url || !databaseConfig.authToken) {
  throw new Error('Missing Turso environment variables');
}

export const db = createClient({
  url: databaseConfig.url,
  authToken: databaseConfig.authToken,
});
