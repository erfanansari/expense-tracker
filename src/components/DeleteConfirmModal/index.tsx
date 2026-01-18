'use client';

import { AlertTriangle, Loader2 } from 'lucide-react';

import Button from '@/components/Button';
import Modal from '@/components/Modal';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  itemName?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting?: boolean;
}

const DeleteConfirmModal = ({
  isOpen,
  title,
  message,
  itemName,
  onConfirm,
  onCancel,
  isDeleting = false,
}: DeleteConfirmModalProps) => {
  return (
    <Modal isOpen={isOpen} onClose={isDeleting ? () => {} : onCancel} showCloseButton={false}>
      <div className="text-center">
        {/* Warning Icon */}
        <div className="bg-danger/10 mx-auto flex h-12 w-12 items-center justify-center rounded-full">
          <AlertTriangle className="text-danger h-6 w-6" aria-hidden="true" />
        </div>

        {/* Title */}
        <div className="mt-4">
          <h3 className="text-text-primary text-lg font-semibold">
            {itemName ? `${title} "${itemName}"?` : `${title}?`}
          </h3>
        </div>

        {/* Message */}
        <div className="mt-3 space-y-2">
          <p className="text-text-secondary text-sm">{message}</p>
          <p className="text-text-secondary text-sm font-medium">This action cannot be undone.</p>
        </div>

        {/* Actions */}
        <div className="mt-6 flex gap-3">
          <Button variant="outline" onClick={onCancel} disabled={isDeleting} className="flex-1">
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={onConfirm}
            disabled={isDeleting}
            className="bg-button-danger-bg hover:bg-button-danger-bg-hover flex-1"
          >
            {isDeleting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              'Delete'
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default DeleteConfirmModal;
