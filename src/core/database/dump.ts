import type { Client, Value } from '@libsql/client';

function escapeIdentifier(name: string): string {
  return `"${name.replace(/"/g, '""')}"`;
}

function escapeValue(value: Value): string {
  if (value === null) return 'NULL';
  if (typeof value === 'number' || typeof value === 'bigint') return value.toString();
  if (value instanceof ArrayBuffer) return `X'${Buffer.from(value).toString('hex')}'`;
  return `'${String(value).replace(/'/g, "''")}'`;
}

interface TableInfo {
  name: string;
  createSql: string;
}

async function getTables(client: Client): Promise<TableInfo[]> {
  const result = await client.execute(
    `SELECT name, sql FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' ORDER BY rowid`
  );
  return result.rows.map((row) => ({
    name: row.name as string,
    createSql: row.sql as string,
  }));
}

async function dumpTableRows(client: Client, table: TableInfo): Promise<string[]> {
  const result = await client.execute(`SELECT * FROM ${escapeIdentifier(table.name)}`);
  const columns = result.columns.map(escapeIdentifier).join(', ');
  return result.rows.map((row) => {
    const values = result.columns.map((col) => escapeValue(row[col]));
    return `INSERT INTO ${escapeIdentifier(table.name)} (${columns}) VALUES (${values.join(', ')});`;
  });
}

/**
 * Produces a plain-text SQL dump (schema + data) of every user table,
 * replayable with `sqlite3`/libSQL to fully restore the database.
 */
export async function generateSqlDump(client: Client): Promise<string> {
  const tables = await getTables(client);
  const lines: string[] = ['PRAGMA foreign_keys=OFF;', 'BEGIN TRANSACTION;'];

  for (const table of tables) {
    lines.push(`DROP TABLE IF EXISTS ${escapeIdentifier(table.name)};`, `${table.createSql};`);
    lines.push(...(await dumpTableRows(client, table)));
  }

  lines.push('COMMIT;');
  return lines.join('\n');
}
