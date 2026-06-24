import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { backupConfig } from '@configs/backup.config';
import { gzipSync } from 'zlib';

import { pruneOldBackups, uploadBackup } from '@core/database/backup-storage';
import { db } from '@core/database/client';
import { generateSqlDump } from '@core/database/dump';

export async function POST(request: NextRequest) {
  if (request.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const dump = await generateSqlDump(db);
  const gzipped = gzipSync(Buffer.from(dump, 'utf-8'));

  const key = `kharji-${new Date().toISOString().slice(0, 10)}.sql.gz`;
  await uploadBackup(key, gzipped);

  const deleted = await pruneOldBackups(backupConfig.retentionDays);

  return NextResponse.json({ uploaded: key, bytes: gzipped.length, deleted });
}
