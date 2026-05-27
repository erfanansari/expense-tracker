import type { Expense } from '@/@types/expense';

function escapeCsvCell(value: string | number | null | undefined): string {
  const str = value == null ? '' : String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export const EXPENSE_CSV_HEADERS = [
  'ID',
  'Date',
  'Category',
  'Description',
  'Price (Toman)',
  'Price (USD)',
  'Tags',
  'Created At',
];

export function expensesToCsvString(expenses: Expense[]): string {
  const rows = [EXPENSE_CSV_HEADERS.map(escapeCsvCell).join(',')];
  for (const e of expenses) {
    const tags = (e.tags ?? []).map((t) => t.name).join(';');
    rows.push(
      [e.id, e.date, e.category.name, e.description, e.price_toman, e.price_usd, tags, e.created_at]
        .map(escapeCsvCell)
        .join(',')
    );
  }
  return rows.join('\n');
}

export function expensesToSheetRows(expenses: Expense[]): (string | number)[][] {
  const rows: (string | number)[][] = [EXPENSE_CSV_HEADERS];
  for (const e of expenses) {
    const tags = (e.tags ?? []).map((t) => t.name).join(';');
    rows.push([e.id, e.date, e.category.name, e.description, e.price_toman, e.price_usd, tags, e.created_at]);
  }
  return rows;
}

export function downloadFile(content: string | Blob, filename: string, mimeType: string): void {
  const blob = typeof content === 'string' ? new Blob([content], { type: mimeType }) : content;
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function buildExportFilename(prefix: string, suffix: string, ext: string): string {
  const date = new Date().toISOString().slice(0, 10);
  return `${prefix}-${suffix}-${date}.${ext}`;
}
