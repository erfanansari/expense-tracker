/* eslint-disable no-console, @typescript-eslint/no-non-null-assertion */
import { createClient } from '@libsql/client';
import { config } from 'dotenv';
import { gzipSync } from 'zlib';

config({ path: '.env.local' });

async function main() {
  const { backupConfig } = await import('@configs/backup.config');
  const { pruneOldBackups, uploadBackup } = await import('./backup-storage');
  const { generateSqlDump } = await import('./dump');

  const client = createClient({
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN!,
  });

  try {
    console.log('Generating SQL dump...');
    const dump = await generateSqlDump(client);
    const gzipped = gzipSync(Buffer.from(dump, 'utf-8'));
    console.log(`Dump: ${dump.length} bytes raw, ${gzipped.length} bytes gzipped`);

    const key = `kharji-${new Date().toISOString().slice(0, 10)}.sql.gz`;
    console.log(`Uploading to b2://${backupConfig.bucket}/backups/${key} ...`);
    await uploadBackup(key, gzipped);
    console.log('Upload complete.');

    const deleted = await pruneOldBackups(backupConfig.retentionDays);
    console.log(`Pruned ${deleted.length} backup(s) older than ${backupConfig.retentionDays} days:`, deleted);
  } finally {
    client.close();
  }
}

main().catch((error) => {
  console.error('Backup failed:', error);
  process.exit(1);
});
