'use client';

import { useState } from 'react';

import { Database, Download, Loader2, Trash2, Upload } from 'lucide-react';

import Button from '@components/Button';

import { useToast } from '@/components/Toast/ToastProvider';
import { downloadFile } from '@/utils/export';

import ImportModal from './ImportModal';

const DataManagement = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const { showToast } = useToast();

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const res = await fetch('/api/export');
      if (!res.ok) throw new Error('Export failed');
      const blob = await res.blob();
      const date = new Date().toISOString().slice(0, 10);
      downloadFile(
        blob,
        `kharji-export-${date}.xlsx`,
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
      showToast('Data exported successfully', 'success');
    } catch {
      showToast('Export failed. Please try again.', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <>
      <div className="border-border-subtle bg-background rounded-xl border shadow-sm">
        <div className="border-border-subtle border-b p-6">
          <div className="flex items-center gap-3">
            <div className="border-border-subtle bg-background-secondary rounded-lg border p-2">
              <Database className="text-text-secondary h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-text-primary text-lg font-semibold">Data Management</h2>
              <p className="text-text-muted text-sm">Export or import your financial data</p>
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="flex max-w-2xl flex-col gap-3 sm:flex-row">
            <Button variant="outline" onClick={handleExport} disabled={isExporting}>
              {isExporting ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <Download className="h-4 w-4" aria-hidden="true" />
              )}
              {isExporting ? 'Exporting…' : 'Export Data'}
            </Button>
            <Button variant="outline" onClick={() => setIsImportOpen(true)}>
              <Upload className="h-4 w-4" aria-hidden="true" />
              Import Expenses
            </Button>
            <Button variant="danger" disabled className="cursor-not-allowed opacity-50">
              <Trash2 className="h-4 w-4" aria-hidden="true" />
              Delete All Data
            </Button>
          </div>
          <p className="text-text-muted mt-3 text-xs">
            Export downloads an Excel file with all your expenses, income, and assets.
          </p>
        </div>
      </div>

      <ImportModal isOpen={isImportOpen} onClose={() => setIsImportOpen(false)} />
    </>
  );
};

export default DataManagement;
