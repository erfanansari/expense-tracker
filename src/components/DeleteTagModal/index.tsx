'use client';

import { AlertTriangle, Loader2 } from 'lucide-react';

import type { Tag } from '@/@types/expense';
import Button from '@/components/Button';
import Modal from '@/components/Modal';

interface DeleteTagModalProps {
  isOpen: boolean;
  tag: Tag | null;
  usageCount: number;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting?: boolean;
}

const DeleteTagModal = ({ isOpen, tag, usageCount, onConfirm, onCancel, isDeleting = false }: DeleteTagModalProps) => {
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
          <h3 className="text-text-primary text-lg font-semibold">Delete tag &ldquo;{tag.name}&rdquo;?</h3>
        </div>

        {/* Message */}
        <div className="mt-3 space-y-2">
          {usageCount > 0 ? (
            <>
              <p className="text-text-secondary text-sm">
                This tag is used in <span className="font-semibold">{usageCount}</span>{' '}
                {usageCount === 1 ? 'expense' : 'expenses'}.
              </p>
              <p className="text-text-secondary text-sm">It will be removed from all of them.</p>
            </>
          ) : (
            <p className="text-text-secondary text-sm">This tag is not currently used in any expenses.</p>
          )}
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
            className="bg-danger hover:bg-danger-hover flex-1"
          >
            {isDeleting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              'Delete Tag'
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default DeleteTagModal;
