'use client';

import { useCallback, useRef, useState } from 'react';

import { useQueryClient } from '@tanstack/react-query';
import { AlertTriangle, CheckCircle, Upload } from 'lucide-react';
import Papa from 'papaparse';

import Button from '@components/Button';
import Modal from '@components/Modal';

import { useToast } from '@/components/Toast/ToastProvider';
import { queryKeys } from '@/lib/query-keys';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Step = 'upload' | 'preview' | 'importing';

type ParsedRow = Record<string, string>;

type ValidatedRow =
  | { valid: true; date: string; category: string; description: string; price_toman: number; price_usd: number }
  | { valid: false; error: string; raw: ParsedRow };

const REQUIRED_COLUMNS = ['date', 'category', 'description', 'price_toman', 'price_usd'];

function normalizeHeaders(row: ParsedRow): ParsedRow {
  const normalized: ParsedRow = {};
  for (const [key, val] of Object.entries(row)) {
    normalized[key.toLowerCase().trim()] = val;
  }
  return normalized;
}

function validateRow(raw: ParsedRow): ValidatedRow {
  const row = normalizeHeaders(raw);

  if (!row.date || !/^\d{4}-\d{2}-\d{2}$/.test(row.date.trim())) {
    return { valid: false, error: 'Invalid date (expected YYYY-MM-DD)', raw };
  }
  if (!row.category?.trim()) {
    return { valid: false, error: 'Category is required', raw };
  }
  if (!row.description?.trim()) {
    return { valid: false, error: 'Description is required', raw };
  }
  const toman = parseFloat(row.price_toman);
  if (isNaN(toman) || toman < 0) {
    return { valid: false, error: 'price_toman must be a non-negative number', raw };
  }
  const usd = parseFloat(row.price_usd);
  if (isNaN(usd) || usd < 0) {
    return { valid: false, error: 'price_usd must be a non-negative number', raw };
  }

  return {
    valid: true,
    date: row.date.trim(),
    category: row.category.trim(),
    description: row.description.trim(),
    price_toman: toman,
    price_usd: usd,
  };
}

const ImportModal = ({ isOpen, onClose }: ImportModalProps) => {
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
          setParseError(`Missing required columns: ${missing.join(', ')}`);
          return;
        }
        setRows(result.data.map(validateRow));
        setStep('preview');
      },
      error: (err) => {
        setParseError(`Failed to parse CSV: ${err.message}`);
      },
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    e.target.value = '';
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file?.name.endsWith('.csv')) {
      processFile(file);
    } else {
      setParseError('Please drop a .csv file');
    }
  }, []);

  const handleImport = async () => {
    setStep('importing');
    setProgress(0);
    let successCount = 0;

    for (let i = 0; i < validRows.length; i++) {
      const row = validRows[i];
      try {
        await fetch('/api/expenses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            date: row.date,
            category: row.category,
            description: row.description,
            price_toman: row.price_toman,
            price_usd: row.price_usd,
          }),
        });
        successCount++;
      } catch {
        // continue on individual row failure
      }
      setProgress(i + 1);
    }

    await queryClient.invalidateQueries({ queryKey: queryKeys.expenses.all() });
    showToast(`Imported ${successCount} expenses successfully`, 'success');
    handleClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Import Expenses" titleFa="وارد کردن هزینه‌ها">
      {step === 'upload' && (
        <div className="space-y-4">
          <p className="text-text-secondary text-sm">
            Upload a CSV file with columns: <code className="bg-background-secondary rounded px-1 text-xs">date</code>,{' '}
            <code className="bg-background-secondary rounded px-1 text-xs">category</code>,{' '}
            <code className="bg-background-secondary rounded px-1 text-xs">description</code>,{' '}
            <code className="bg-background-secondary rounded px-1 text-xs">price_toman</code>,{' '}
            <code className="bg-background-secondary rounded px-1 text-xs">price_usd</code>
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
              Drag & drop a CSV file here, or{' '}
              <span className="text-text-primary font-semibold underline underline-offset-2">browse</span>
            </div>
            <div className="text-text-muted mt-1 text-xs">Only .csv files are supported</div>
          </button>

          <input ref={fileInputRef} type="file" accept=".csv" className="hidden" onChange={handleFileChange} />

          {parseError && (
            <div className="bg-danger/10 text-danger flex items-start gap-2 rounded-lg p-3 text-sm">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              {parseError}
            </div>
          )}

          <p className="text-text-muted text-xs">
            Tip: Export your expenses first to get a valid CSV template. Tags are not imported.
          </p>
        </div>
      )}

      {step === 'preview' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="text-success h-4 w-4 shrink-0" aria-hidden="true" />
            <span className="text-text-secondary text-sm">
              <span className="text-text-primary font-semibold">{validRows.length}</span> rows ready to import
              {invalidRows.length > 0 && (
                <span className="text-warning ml-1">
                  ({invalidRows.length} row{invalidRows.length > 1 ? 's' : ''} with errors will be skipped)
                </span>
              )}
            </span>
          </div>

          {invalidRows.length > 0 && <p className="text-text-muted text-xs">Tags are not imported in this version.</p>}

          <div className="border-border-subtle max-h-64 overflow-y-auto rounded-xl border">
            <table className="w-full table-fixed border-collapse text-sm">
              <thead className="bg-background-secondary sticky top-0">
                <tr>
                  <th className="text-text-muted w-[22%] px-3 py-2 text-left text-xs font-medium">Date</th>
                  <th className="text-text-muted w-[20%] px-3 py-2 text-left text-xs font-medium">Category</th>
                  <th className="text-text-muted w-[32%] px-3 py-2 text-left text-xs font-medium">Description</th>
                  <th className="text-text-muted w-[26%] px-3 py-2 text-right text-xs font-medium">USD / Toman</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) =>
                  row.valid ? (
                    <tr key={i} className="border-border-subtle border-t">
                      <td className="text-text-secondary truncate px-3 py-2 text-xs">{row.date}</td>
                      <td className="text-text-secondary truncate px-3 py-2 text-xs">{row.category}</td>
                      <td className="text-text-secondary truncate px-3 py-2 text-xs">{row.description}</td>
                      <td className="text-text-secondary px-3 py-2 text-right text-xs">
                        ${row.price_usd} / {row.price_toman.toLocaleString()}
                      </td>
                    </tr>
                  ) : (
                    <tr key={i} className="border-border-subtle bg-danger/5 border-t">
                      <td colSpan={4} className="text-danger px-3 py-2 text-xs">
                        <AlertTriangle className="mr-1 inline h-3 w-3" aria-hidden="true" />
                        Row {i + 1}: {row.error}
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setStep('upload')} className="flex-1">
              Back
            </Button>
            <Button variant="primary" onClick={handleImport} disabled={validRows.length === 0} className="flex-1">
              Import {validRows.length} row{validRows.length !== 1 ? 's' : ''}
            </Button>
          </div>
        </div>
      )}

      {step === 'importing' && (
        <div className="space-y-4 py-4 text-center">
          <div className="text-text-secondary text-sm">
            Importing row <span className="text-text-primary font-semibold">{progress}</span> of{' '}
            <span className="text-text-primary font-semibold">{validRows.length}</span>…
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
