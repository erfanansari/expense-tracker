'use client';

import { useState } from 'react';

import { Download, FileSpreadsheet, FileText, Loader2 } from 'lucide-react';

import type { DateRange } from '@features/expenses/components/DateRangeSelector';

import Button from '@components/Button';
import Modal from '@components/Modal';

import type { Expense } from '@/@types/expense';
import { buildExportFilename, downloadFile, expensesToCsvString, expensesToSheetRows } from '@/utils/export';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  expenses: Expense[];
  dateRange: DateRange;
}

type Format = 'csv' | 'xlsx';

const ExportModal = ({ isOpen, onClose, expenses, dateRange }: ExportModalProps) => {
  const [format, setFormat] = useState<Format>('csv');
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      if (format === 'csv') {
        const csv = expensesToCsvString(expenses);
        downloadFile(csv, buildExportFilename('kharji-expenses', dateRange, 'csv'), 'text/csv;charset=utf-8;');
      } else {
        const xlsx = await import('xlsx');
        const rows = expensesToSheetRows(expenses);
        const ws = xlsx.utils.aoa_to_sheet(rows);
        const wb = xlsx.utils.book_new();
        xlsx.utils.book_append_sheet(wb, ws, 'Expenses');
        const buffer: ArrayBuffer = xlsx.write(wb, { bookType: 'xlsx', type: 'array' });
        downloadFile(
          new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }),
          buildExportFilename('kharji-expenses', dateRange, 'xlsx'),
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        );
      }
      onClose();
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Export Expenses">
      <div className="space-y-4">
        <p className="text-text-secondary text-sm">
          Export <span className="text-text-primary font-semibold">{expenses.length}</span> expenses as:
        </p>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setFormat('csv')}
            className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all duration-200 ${
              format === 'csv'
                ? 'border-text-primary bg-background-secondary'
                : 'border-border-subtle bg-background hover:border-border-default hover:bg-background-secondary'
            }`}
          >
            <FileText
              className={`h-8 w-8 ${format === 'csv' ? 'text-text-primary' : 'text-text-muted'}`}
              aria-hidden="true"
            />
            <div className="text-center">
              <div
                className={`text-sm font-semibold ${format === 'csv' ? 'text-text-primary' : 'text-text-secondary'}`}
              >
                CSV
              </div>
              <div className="text-text-muted mt-0.5 text-xs">Universal format</div>
            </div>
          </button>

          <button
            onClick={() => setFormat('xlsx')}
            className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all duration-200 ${
              format === 'xlsx'
                ? 'border-text-primary bg-background-secondary'
                : 'border-border-subtle bg-background hover:border-border-default hover:bg-background-secondary'
            }`}
          >
            <FileSpreadsheet
              className={`h-8 w-8 ${format === 'xlsx' ? 'text-text-primary' : 'text-text-muted'}`}
              aria-hidden="true"
            />
            <div className="text-center">
              <div
                className={`text-sm font-semibold ${format === 'xlsx' ? 'text-text-primary' : 'text-text-secondary'}`}
              >
                Excel
              </div>
              <div className="text-text-muted mt-0.5 text-xs">Spreadsheet (.xlsx)</div>
            </div>
          </button>
        </div>

        <div className="flex gap-3 pt-2">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleDownload}
            disabled={isDownloading || expenses.length === 0}
            className="flex-1"
          >
            {isDownloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            {isDownloading ? 'Preparing…' : 'Download'}
          </Button>
        </div>

        {expenses.length === 0 && (
          <p className="text-text-muted text-center text-xs">No expenses to export for the selected date range.</p>
        )}
      </div>
    </Modal>
  );
};

export default ExportModal;
