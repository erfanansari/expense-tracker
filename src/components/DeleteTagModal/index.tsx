'use client';

import { useTranslations } from 'next-intl';

import { AlertTriangle, Loader2 } from 'lucide-react';

import Button from '@components/Button';
import Modal from '@components/Modal';

import type { Tag } from '@/@types/expense';

interface DeleteTagModalProps {
  isOpen: boolean;
  tag: Tag | null;
  usageCount: number;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting?: boolean;
}

const DeleteTagModal = ({ isOpen, tag, usageCount, onConfirm, onCancel, isDeleting = false }: DeleteTagModalProps) => {
  const t = useTranslations('settings.tags.deleteConfirm');
  const tCommon = useTranslations('common');
  if (!tag) return null;

  return (
    <Modal isOpen={isOpen} onClose={isDeleting ? () => {} : onCancel} showCloseButton={false}>
      <div className="text-center">
        {/* Warning Icon */}
        <div className="bg-danger/10 mx-auto flex h-12 w-12 items-center justify-center rounded-full">
          <AlertTriangle className="text-danger h-6 w-6" aria-hidden="true" />
        </div>

        {/* Title */}
        <div className="mt-4">
          <h3 className="text-text-primary text-lg font-semibold">{t('title', { name: tag.name })}</h3>
        </div>

        {/* Message */}
        <div className="mt-3 space-y-2">
          {usageCount > 0 ? (
            <>
              <p className="text-text-secondary text-sm">
                {t.rich('usedInN', {
                  count: usageCount,
                  b: (chunks) => <span className="font-semibold">{chunks}</span>,
                })}
              </p>
              <p className="text-text-secondary text-sm">{t('willBeRemoved')}</p>
            </>
          ) : (
            <p className="text-text-secondary text-sm">{t('notUsed')}</p>
          )}
          <p className="text-text-secondary text-sm font-medium">{tCommon('actionUndone')}</p>
        </div>

        {/* Actions — no rtl override: Cancel is coded first, so a plain flex row
            under RTL already puts Cancel on the right and Confirm/primary on
            the left. */}
        <div className="mt-6 flex gap-3">
          <Button variant="outline" onClick={onCancel} disabled={isDeleting} className="flex-1">
            {tCommon('cancel')}
          </Button>
          <Button
            variant="primary"
            onClick={onConfirm}
            disabled={isDeleting}
            className="bg-danger hover:bg-danger-hover flex-1"
          >
            {isDeleting ? (
              <>
                <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
                <span>{tCommon('deleting')}</span>
              </>
            ) : (
              t('deleteAction')
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default DeleteTagModal;
