'use client';

import { useState } from 'react';

import { Database, Download, Loader2, Trash2, Upload } from 'lucide-react';

import Button from '@components/Button';
import DeleteAccountModal from '@components/DeleteAccountModal';

import { useToast } from '@/components/Toast/ToastProvider';
import { useAuth } from '@/hooks/use-auth';
import { beginSignout } from '@/lib/api/auth-handler';
import { downloadFile } from '@/utils/export';

import ImportModal from './ImportModal';

const DataManagement = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { showToast } = useToast();
  const { user } = useAuth();

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

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch('/api/user/account', { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      // Own the signout so the 401 listener doesn't stack a second redirect.
      // Hard navigation wipes all in-memory state, including the query cache.
      beginSignout();
      window.location.href = '/login';
    } catch {
      showToast('Failed to delete account. Please try again.', 'error');
      setIsDeleting(false);
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
            <Button
              variant="danger"
              onClick={() => setIsDeleteOpen(true)}
              disabled={user?.isDemo}
              className={user?.isDemo ? 'cursor-not-allowed opacity-50' : undefined}
              title={user?.isDemo ? 'Not available on the demo account' : undefined}
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
              Delete Account
            </Button>
          </div>
          <p className="text-text-muted mt-3 text-xs">
            Export downloads an Excel file with all your expenses, income, and assets. Deleting your account permanently
            erases the account and all of its data.
          </p>
        </div>
      </div>

      <ImportModal isOpen={isImportOpen} onClose={() => setIsImportOpen(false)} />

      <DeleteAccountModal
        isOpen={isDeleteOpen}
        userEmail={user?.email ?? ''}
        onConfirm={handleDeleteAccount}
        onCancel={() => setIsDeleteOpen(false)}
        isDeleting={isDeleting}
      />
    </>
  );
};

export default DataManagement;
