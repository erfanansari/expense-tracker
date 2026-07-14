'use client';

import { useState } from 'react';

import { useTranslations } from 'next-intl';

import { deleteAccountKeyGenerator } from '@api/deleteAccountMutation';
import { useMutation } from '@tanstack/react-query';
import { Database, Download, Loader2, Trash2, Upload } from 'lucide-react';

import { beginSignout } from '@core/client/auth-handler';

import Button from '@components/Button';
import DeleteAccountModal from '@components/DeleteAccountModal';

import { useAuth } from '@hooks/use-auth';

import { useToast } from '@stores/toast';

import { downloadFullExport } from '@/utils/export';

import ImportModal from './ImportModal';

const DataManagement = () => {
  const t = useTranslations('settings.dataManagement');
  const [isExporting, setIsExporting] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { showToast } = useToast();
  const { user } = useAuth();

  const { mutateAsync: deleteAccountAsync } = useMutation<void, Error, void>({
    mutationKey: deleteAccountKeyGenerator(),
  });

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await downloadFullExport();
      showToast(t('exportSuccess'), 'success');
    } catch {
      showToast(t('exportFailed'), 'error');
    } finally {
      setIsExporting(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      await deleteAccountAsync();
      // Own the signout so the 401 listener doesn't stack a second redirect.
      // Hard navigation wipes all in-memory state, including the query cache.
      beginSignout();
      window.location.href = '/login';
    } catch {
      showToast(t('deleteFailed'), 'error');
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
              <h2 className="text-text-primary text-lg font-semibold">{t('title')}</h2>
              <p className="text-text-muted text-sm">{t('subtitle')}</p>
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
              {isExporting ? t('preparing') : t('downloadBackup')}
            </Button>
            <Button variant="outline" onClick={() => setIsImportOpen(true)}>
              <Upload className="h-4 w-4" aria-hidden="true" />
              {t('importExpenses')}
            </Button>
            <Button
              variant="danger"
              onClick={() => setIsDeleteOpen(true)}
              disabled={user?.isDemo}
              className={user?.isDemo ? 'cursor-not-allowed opacity-50' : undefined}
              title={user?.isDemo ? t('notAvailableDemo') : undefined}
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
              {t('deleteAccount')}
            </Button>
          </div>
          <p className="text-text-muted mt-3 text-xs">{t('hint')}</p>
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
