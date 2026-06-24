import type { Client } from '@libsql/client';
import { readFileSync } from 'fs';
import { gunzipSync } from 'zlib';

export function loadDumpFile(path: string): string {
  const raw = readFileSync(path);
  const isGzip = raw[0] === 0x1f && raw[1] === 0x8b;
  return (isGzip ? gunzipSync(raw) : raw).toString('utf-8');
}

/** Replays a SQL dump (as produced by `generateSqlDump`) against the target client. */
export async function restoreFromDump(client: Client, dumpSql: string): Promise<void> {
  await client.executeMultiple(dumpSql);
}
