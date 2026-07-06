'use client';

import { useState } from 'react';

import { AlertTriangle, Loader2 } from 'lucide-react';

import Button from '@components/Button';
import Modal from '@components/Modal';

interface DeleteAccountModalProps {
  isOpen: boolean;
  userEmail: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting?: boolean;
}

const ERASED_ITEMS = [
  'Your account and login',
  'All expenses and tags',
  'All income entries',
  'All assets and valuation history',
  'Custom categories and preferences',
];

const DeleteAccountModal = ({
  isOpen,
  userEmail,
  onConfirm,
  onCancel,
  isDeleting = false,
}: DeleteAccountModalProps) => {
  const [confirmation, setConfirmation] = useState('');

  // Clear the typed confirmation whenever the modal is reopened. Render-phase
  // comparison to avoid the `setState in useEffect` cascade flagged by React 19.
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  if (prevIsOpen !== isOpen) {
    setPrevIsOpen(isOpen);
    setConfirmation('');
  }

  const canConfirm = confirmation.trim().toLowerCase() === userEmail.trim().toLowerCase();

  return (
    <Modal isOpen={isOpen} onClose={isDeleting ? () => {} : onCancel} showCloseButton={false}>
      <div className="text-center">
        <div className="bg-danger/10 mx-auto flex h-12 w-12 items-center justify-center rounded-full">
          <AlertTriangle className="text-danger h-6 w-6" aria-hidden="true" />
        </div>

        <div className="mt-4">
          <h3 className="text-text-primary text-lg font-semibold">Delete account?</h3>
        </div>

        <div className="mt-3 space-y-3">
          <p className="text-text-secondary text-sm">This will permanently erase:</p>
          <ul className="border-border-subtle bg-background-secondary rounded-lg border p-3 text-left">
            {ERASED_ITEMS.map((item) => (
              <li key={item} className="text-text-secondary flex items-center gap-2 py-0.5 text-sm">
                <span className="bg-danger h-1 w-1 shrink-0 rounded-full" aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
          <p className="text-text-secondary text-sm font-medium">This action cannot be undone.</p>
          <p className="text-text-muted text-xs">Tip: export your data first from Data Management.</p>
        </div>

        <div className="mt-5 text-left">
          <label htmlFor="delete-account-confirm" className="text-text-secondary text-sm font-medium">
            Type <span className="text-text-primary font-semibold">{userEmail}</span> to confirm
          </label>
          <input
            id="delete-account-confirm"
            type="email"
            value={confirmation}
            onChange={(e) => setConfirmation(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && canConfirm && !isDeleting) onConfirm();
            }}
            disabled={isDeleting}
            autoComplete="off"
            spellCheck={false}
            placeholder={userEmail}
            className="border-border-subtle bg-background text-text-primary focus:border-danger mt-2 w-full rounded-lg border px-4 py-2.5 text-sm transition-[opacity,border-color] duration-200 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
          />
        </div>

        <div className="mt-6 flex gap-3">
          <Button variant="outline" onClick={onCancel} disabled={isDeleting} className="flex-1">
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={onConfirm}
            disabled={isDeleting || !canConfirm}
            className="bg-danger hover:bg-danger-hover flex-1"
          >
            {isDeleting ? (
              <>
                <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
                <span>Deleting...</span>
              </>
            ) : (
              'Delete Account'
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default DeleteAccountModal;
