'use client';

import { useState } from 'react';

import { CATEGORY_COLORS, DEFAULT_CATEGORY_COLOR, DEFAULT_CATEGORY_ICON } from '@constants/categories';
import { Loader2, Plus } from 'lucide-react';

import Button from '@components/Button';
import CategoryBadge from '@components/CategoryBadge';
import ColorPicker from '@components/ColorPicker';
import IconPicker from '@components/IconPicker';
import Modal from '@components/Modal';
import { useToast } from '@components/Toast/ToastProvider';

import { useCategories, useCreateCategory } from '@hooks/use-categories';

import { ensureError } from '@utils';

import type { Category } from '@/@types/expense';

interface CategoryQuickCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (category: Category) => void;
}

const CategoryQuickCreateModal = ({ isOpen, onClose, onCreated }: CategoryQuickCreateModalProps) => {
  const createCategory = useCreateCategory();
  const { data: categories = [] } = useCategories();
  const { showToast } = useToast();

  const [name, setName] = useState('');
  const [icon, setIcon] = useState<string>(DEFAULT_CATEGORY_ICON);
  const [color, setColor] = useState<string>(CATEGORY_COLORS[0]?.value ?? DEFAULT_CATEGORY_COLOR);
  const [error, setError] = useState('');

  // Reset whenever the modal opens (render-phase pattern to avoid the
  // `setState inside useEffect` cascade flagged by React 19).
  const [prevOpen, setPrevOpen] = useState(isOpen);
  if (prevOpen !== isOpen) {
    setPrevOpen(isOpen);
    if (isOpen) {
      setName('');
      setIcon(DEFAULT_CATEGORY_ICON);
      setColor(CATEGORY_COLORS[0]?.value ?? DEFAULT_CATEGORY_COLOR);
      setError('');
    }
  }

  const handleSubmit = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Category name is required');
      return;
    }
    const duplicate = categories.some((c) => c.name.toLowerCase() === trimmed.toLowerCase());
    if (duplicate) {
      setError(`Category "${trimmed}" already exists`);
      return;
    }
    setError('');
    try {
      const created = await createCategory.mutateAsync({ name: trimmed, icon, color });
      showToast(`Category "${created.name}" created.`, 'success');
      onCreated(created);
    } catch (err) {
      setError(ensureError(err).message);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={createCategory.isPending ? () => {} : onClose} title="New category">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="text-text-muted text-xs">Preview:</span>
          <CategoryBadge category={{ name: name.trim() || 'New category', icon, color }} size="md" />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="qc-name" className="text-text-secondary text-xs font-medium">
            Name
          </label>
          <input
            id="qc-name"
            type="text"
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="e.g. Subscriptions"
            className="border-border-subtle bg-background text-text-primary placeholder:text-text-muted focus:border-blue w-full rounded-lg border px-3 py-2 text-sm transition-all outline-none"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-text-secondary text-xs font-medium">Color</label>
          <ColorPicker value={color} onChange={setColor} />
        </div>

        <div className="space-y-1.5">
          <label className="text-text-secondary text-xs font-medium">Icon</label>
          <IconPicker value={icon} onChange={setIcon} highlightColor={color} />
        </div>

        {error && <p className="text-danger text-xs">{error}</p>}

        <div className="flex justify-end gap-2 pt-1">
          <Button variant="outline" onClick={onClose} disabled={createCategory.isPending}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit} disabled={createCategory.isPending || !name.trim()}>
            {createCategory.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Creating…</span>
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                <span>Create category</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default CategoryQuickCreateModal;
