'use client';

import { useCallback, useRef, useState } from 'react';

import { useLocale, useTranslations } from 'next-intl';

import { CATEGORIES_SCOPE } from '@api/getCategoryListQuery';
import { EXPENSES_SCOPE } from '@api/getExpenseListQuery';
import { TAGS_SCOPE } from '@api/getTagListQuery';
import { useQueryClient } from '@tanstack/react-query';
import { AlertTriangle, CheckCircle, Upload } from 'lucide-react';
import Papa from 'papaparse';

import Button from '@components/Button';
import Modal from '@components/Modal';

import { useToast } from '@stores/toast';

import { formatNumber } from '@utils';

import { isSupportedCurrency, PIVOT_CURRENCY, SUPPORTED_CURRENCY_CODES } from '@/constants/currencies';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Step = 'upload' | 'preview' | 'importing';

type ParsedRow = Record<string, string>;

type ValidatedRow =
  | {
      valid: true;
      date: string;
      category: string;
      description: string;
      amount: number;
      currency: string;
      tags: string[];
    }
  | { valid: false; error: string; raw: ParsedRow };

// `currency` and `tags` (semicolon-separated) are optional;
// currency defaults to the pivot currency when omitted.
const REQUIRED_COLUMNS = ['date', 'category', 'description', 'amount'];

function normalizeHeaders(row: ParsedRow): ParsedRow {
  const normalized: ParsedRow = {};
  for (const [key, val] of Object.entries(row)) {
    normalized[key.toLowerCase().trim()] = val;
  }
  return normalized;
}

function validateRow(raw: ParsedRow, t: ReturnType<typeof useTranslations<'settings.import'>>): ValidatedRow {
  const row = normalizeHeaders(raw);

  if (!row.date || !/^\d{4}-\d{2}-\d{2}$/.test(row.date.trim())) {
    return { valid: false, error: t('invalidDate'), raw };
  }
  if (!row.category?.trim()) {
    return { valid: false, error: t('categoryRequired'), raw };
  }
  if (!row.description?.trim()) {
    return { valid: false, error: t('descriptionRequired'), raw };
  }
  const amount = parseFloat(row.amount);
  if (isNaN(amount) || amount < 0) {
    return { valid: false, error: t('amountInvalid'), raw };
  }
  const currency = (row.currency?.trim() || PIVOT_CURRENCY).toUpperCase();
  if (!isSupportedCurrency(currency)) {
    return { valid: false, error: t('currencyInvalid', { codes: SUPPORTED_CURRENCY_CODES.join(', ') }), raw };
  }

  const seenTags = new Set<string>();
  const tags = (row.tags ?? '')
    .split(';')
    .map((t) => t.trim())
    .filter((t) => {
      if (!t || seenTags.has(t.toLowerCase())) return false;
      seenTags.add(t.toLowerCase());
      return true;
    });

  return {
    valid: true,
    date: row.date.trim(),
    category: row.category.trim(),
    description: row.description.trim(),
    amount,
    currency,
    tags,
  };
}

/** Case-insensitive name → id resolver backed by a create-or-get endpoint. */
async function makeNameResolver(listUrl: string, createUrl: string): Promise<(name: string) => Promise<number>> {
  const idByName = new Map<string, number>();
  const listRes = await fetch(listUrl);
  if (listRes.ok) {
    const items: { id: number; name: string }[] = await listRes.json();
    for (const item of items) idByName.set(item.name.toLowerCase(), item.id);
  }

  const create = async (name: string) => {
    const res = await fetch(createUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
    if (!res.ok) throw new Error(`Failed to create "${name}"`);
    const created: { id: number } = await res.json();
    return created.id;
  };

  return async (name: string) => {
    const key = name.toLowerCase();
    const cached = idByName.get(key);
    if (cached !== undefined) return cached;

    let id: number;
    try {
      id = await create(name);
    } catch {
      // The endpoint is create-or-get, so a retry after a transient
      // failure (e.g. a write conflict) resolves to the existing row.
      id = await create(name);
    }
    idByName.set(key, id);
    return id;
  };
}

const ImportModal = ({ isOpen, onClose }: ImportModalProps) => {
  const t = useTranslations('settings.import');
  const tTables = useTranslations('tables');
  const locale = useLocale() as 'en' | 'fa';
  const [step, setStep] = useState<Step>('upload');
  const [isDragging, setIsDragging] = useState(false);
  const [parseError, setParseError] = useState('');
  const [rows, setRows] = useState<ValidatedRow[]>([]);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  const validRows = rows.filter((r): r is Extract<ValidatedRow, { valid: true }> => r.valid);
  const invalidRows = rows.filter((r): r is Extract<ValidatedRow, { valid: false }> => !r.valid);

  const handleClose = () => {
    if (step === 'importing') return;
    setStep('upload');
    setRows([]);
    setParseError('');
    setProgress(0);
    onClose();
  };

  const processFile = (file: File) => {
    setParseError('');
    Papa.parse<ParsedRow>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        const headers = (result.meta.fields ?? []).map((h) => h.toLowerCase().trim());
        const missing = REQUIRED_COLUMNS.filter((col) => !headers.includes(col));
        if (missing.length > 0) {
          setParseError(t('missingColumns', { columns: missing.join(', ') }));
          return;
        }
        setRows(result.data.map((row) => validateRow(row, t)));
        setStep('preview');
      },
      error: (err) => {
        setParseError(t('parseFailed', { message: err.message }));
      },
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    e.target.value = '';
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file?.name.endsWith('.csv')) {
        processFile(file);
      } else {
        setParseError(t('dropCsvOnly'));
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t]
  );

  const handleImport = async () => {
    setStep('importing');
    setProgress(0);
    let successCount = 0;

    try {
      const [resolveCategory, resolveTag] = await Promise.all([
        makeNameResolver('/api/categories', '/api/categories'),
        makeNameResolver('/api/tags', '/api/tags'),
      ]);

      for (let i = 0; i < validRows.length; i++) {
        const row = validRows[i];
        try {
          const categoryId = await resolveCategory(row.category);
          const tagIds: number[] = [];
          for (const tag of row.tags) {
            tagIds.push(await resolveTag(tag));
          }

          const res = await fetch('/api/expenses', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              date: row.date,
              categoryId,
              description: row.description,
              amount: row.amount,
              currency: row.currency,
              tagIds,
            }),
          });
          if (res.ok) successCount++;
        } catch {
          // continue on individual row failure
        }
        setProgress(i + 1);
      }
    } finally {
      await queryClient.invalidateQueries({ queryKey: EXPENSES_SCOPE });
      await queryClient.invalidateQueries({ queryKey: CATEGORIES_SCOPE });
      await queryClient.invalidateQueries({ queryKey: TAGS_SCOPE });
    }

    const failedCount = validRows.length - successCount;
    if (failedCount === 0) {
      showToast(t('importedSuccess', { count: successCount }), 'success');
    } else if (successCount > 0) {
      showToast(t('importedPartial', { count: successCount, total: validRows.length, failed: failedCount }), 'warning');
    } else {
      showToast(t('importFailed'), 'error');
    }
    handleClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={t('title')}>
      {step === 'upload' && (
        <div className="space-y-4">
          <p className="text-text-secondary text-sm">
            {t.rich('instructions', {
              c0: (chunks) => <code className="bg-background-secondary rounded px-1 text-xs">{chunks}</code>,
              c1: (chunks) => <code className="bg-background-secondary rounded px-1 text-xs">{chunks}</code>,
              c2: (chunks) => <code className="bg-background-secondary rounded px-1 text-xs">{chunks}</code>,
              c3: (chunks) => <code className="bg-background-secondary rounded px-1 text-xs">{chunks}</code>,
              c4: (chunks) => <code className="bg-background-secondary rounded px-1 text-xs">{chunks}</code>,
              c5: (chunks) => <code className="bg-background-secondary rounded px-1 text-xs">{chunks}</code>,
            })}
          </p>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`w-full rounded-xl border-2 border-dashed p-8 text-center transition-all duration-200 ${
              isDragging
                ? 'border-text-primary bg-background-secondary'
                : 'border-border-subtle bg-background hover:border-border-default hover:bg-background-secondary'
            }`}
          >
            <Upload className="text-text-muted mx-auto mb-3 h-8 w-8" aria-hidden="true" />
            <div className="text-text-secondary text-sm font-medium">
              {t.rich('dropzone', {
                browse: (chunks) => (
                  <span className="text-text-primary font-semibold underline underline-offset-2">{chunks}</span>
                ),
              })}
            </div>
            <div className="text-text-muted mt-1 text-xs">{t('csvOnly')}</div>
          </button>

          <input ref={fileInputRef} type="file" accept=".csv" className="hidden" onChange={handleFileChange} />

          {parseError && (
            <div className="bg-danger/10 text-danger flex items-start gap-2 rounded-lg p-3 text-sm">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              {parseError}
            </div>
          )}

          <p className="text-text-muted text-xs">{t('tip')}</p>
        </div>
      )}

      {step === 'preview' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="text-success h-4 w-4 shrink-0" aria-hidden="true" />
            <span className="text-text-secondary text-sm">
              {t.rich('rowsReady', {
                count: validRows.length,
                b: (chunks) => <span className="text-text-primary font-semibold">{chunks}</span>,
              })}
              {invalidRows.length > 0 && (
                <span className="text-warning ms-1">{t('rowsWithErrors', { count: invalidRows.length })}</span>
              )}
            </span>
          </div>

          <div className="border-border-subtle max-h-64 overflow-y-auto rounded-xl border">
            <table className="w-full table-fixed border-collapse text-sm">
              <thead className="bg-background-secondary sticky top-0">
                <tr>
                  <th className="text-text-muted w-[22%] px-3 py-2 text-start text-xs font-medium">
                    {tTables('expenses.date')}
                  </th>
                  <th className="text-text-muted w-[20%] px-3 py-2 text-start text-xs font-medium">
                    {tTables('expenses.category')}
                  </th>
                  <th className="text-text-muted w-[32%] px-3 py-2 text-start text-xs font-medium">
                    {tTables('expenses.description')}
                  </th>
                  <th className="text-text-muted w-[26%] px-3 py-2 text-end text-xs font-medium">
                    {tTables('expenses.amount')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) =>
                  row.valid ? (
                    <tr key={i} className="border-border-subtle border-t">
                      <td className="text-text-secondary truncate px-3 py-2 text-xs">{row.date}</td>
                      <td className="text-text-secondary truncate px-3 py-2 text-xs">{row.category}</td>
                      <td className="text-text-secondary truncate px-3 py-2 text-xs">{row.description}</td>
                      <td className="text-text-secondary px-3 py-2 text-end text-xs">
                        {formatNumber(row.amount, locale)} {row.currency}
                      </td>
                    </tr>
                  ) : (
                    <tr key={i} className="border-border-subtle bg-danger/5 border-t">
                      <td colSpan={4} className="text-danger px-3 py-2 text-xs">
                        <AlertTriangle className="me-1 inline h-3 w-3" aria-hidden="true" />
                        {t('rowError', { row: i + 1, error: row.error })}
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>

          {/* No rtl override: Back is coded first, so a plain flex row under RTL
              already puts Back on the right and Import/primary on the left. */}
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setStep('upload')} className="flex-1">
              {t('back')}
            </Button>
            <Button variant="primary" onClick={handleImport} disabled={validRows.length === 0} className="flex-1">
              {t('importRows', { count: validRows.length })}
            </Button>
          </div>
        </div>
      )}

      {step === 'importing' && (
        <div className="space-y-4 py-4 text-center">
          <div className="text-text-secondary text-sm">
            {t.rich('importingProgress', {
              progress,
              total: validRows.length,
              p: (chunks) => <span className="text-text-primary font-semibold">{chunks}</span>,
              tot: (chunks) => <span className="text-text-primary font-semibold">{chunks}</span>,
            })}
          </div>
          <div className="bg-background-elevated h-2 w-full overflow-hidden rounded-full">
            <div
              className="bg-primary h-full rounded-full transition-all duration-300"
              style={{ width: `${(progress / validRows.length) * 100}%` }}
            />
          </div>
        </div>
      )}
    </Modal>
  );
};

export default ImportModal;
