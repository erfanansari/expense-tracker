'use client';

import { Edit2, Loader2, Trash2 } from 'lucide-react';

interface ActionButtonsProps {
  onEdit: () => void;
  onDelete: () => void;
  isDeleting: boolean;
  editTitle?: string;
}

const ActionButtons = ({ onEdit, onDelete, isDeleting, editTitle = 'Edit' }: ActionButtonsProps) => {
  return (
    <div className="flex items-center justify-center gap-1">
      <button
        onClick={(e) => {
          e.stopPropagation();
          onEdit();
        }}
        className="text-text-muted hover:bg-blue/10 hover:text-blue rounded-lg p-2 transition-all duration-200"
        title={editTitle}
      >
        <Edit2 className="h-4 w-4" />
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        disabled={isDeleting}
        className="text-text-muted hover:bg-danger/10 hover:text-danger rounded-lg p-2 transition-all duration-200 disabled:opacity-50"
        title="Delete"
      >
        {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
      </button>
    </div>
  );
};

export default ActionButtons;
