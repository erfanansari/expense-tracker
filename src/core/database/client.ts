import { createClient } from '@libsql/client';

import { databaseConfig } from '@/configs/database.config';

if (!databaseConfig.url || !databaseConfig.authToken) {
  throw new Error('Missing Turso environment variables');
}

export const db = createClient({
  url: databaseConfig.url,
  authToken: databaseConfig.authToken,
});
