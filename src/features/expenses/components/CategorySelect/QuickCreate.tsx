'use client';

import { useState } from 'react';

import { useTranslations } from 'next-intl';

import { createCategoryKeyGenerator } from '@api/createCategoryMutation';
import type { CreateCategoryRequestData } from '@api/createCategoryMutation';
import { CATEGORIES_SCOPE, getCategoryListKeyGenerator } from '@api/getCategoryListQuery';
import { CATEGORY_COLORS, DEFAULT_CATEGORY_COLOR, DEFAULT_CATEGORY_ICON } from '@constants/categories';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2, Plus } from 'lucide-react';

import type { Category } from '@types';

import Button from '@components/Button';
import CategoryBadge from '@components/CategoryBadge';
import ColorPicker from '@components/ColorPicker';
import IconPicker from '@components/IconPicker';
import Modal from '@components/Modal';

import { useToast } from '@stores/toast';

import { ensureError } from '@utils';

interface CategoryQuickCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (category: Category) => void;
}

const CategoryQuickCreateModal = ({ isOpen, onClose, onCreated }: CategoryQuickCreateModalProps) => {
  const t = useTranslations('settings.categories');
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const createCategory = useMutation<Category, Error, CreateCategoryRequestData>({
    mutationKey: createCategoryKeyGenerator(),
  });
  const { data: categories = [] } = useQuery<Category[]>({ queryKey: getCategoryListKeyGenerator() });

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
      setError(t('nameRequired'));
      return;
    }
    const duplicate = categories.some((c) => c.name.toLowerCase() === trimmed.toLowerCase());
    if (duplicate) {
      setError(t('duplicateName', { name: trimmed }));
      return;
    }
    setError('');
    try {
      const created = await createCategory.mutateAsync({ name: trimmed, icon, color });
      await queryClient.invalidateQueries({ queryKey: CATEGORIES_SCOPE });
      showToast(t('created', { name: created.name }), 'success');
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
    <Modal isOpen={isOpen} onClose={createCategory.isPending ? () => {} : onClose} title={t('newCategory')}>
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="text-text-muted text-xs">{t('preview')}</span>
          <CategoryBadge category={{ name: name.trim() || t('newCategory'), icon, color }} size="md" />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="qc-name" className="text-text-secondary text-xs font-medium">
            {t('name')}
          </label>
          <input
            id="qc-name"
            type="text"
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t('namePlaceholder')}
            className="border-border-subtle bg-background text-text-primary placeholder:text-text-muted focus:border-blue w-full rounded-lg border px-3 py-2 text-sm transition-all outline-none"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-text-secondary text-xs font-medium">{t('color')}</label>
          <ColorPicker value={color} onChange={setColor} />
        </div>

        <div className="space-y-1.5">
          <label className="text-text-secondary text-xs font-medium">{t('icon')}</label>
          <IconPicker value={icon} onChange={setIcon} highlightColor={color} />
        </div>

        {error && <p className="text-danger text-xs">{error}</p>}

        {/* Cancel sits on the physical right, Create/primary on the left, under
            RTL. rtl:justify-start (not rtl:flex-row-reverse) keeps Cancel —
            coded first — as the rightmost element while still anchoring the
            pair to the row's own right edge (its LTR resting side). */}
        <div className="flex justify-end gap-2 pt-1 rtl:justify-start">
          <Button variant="outline" onClick={onClose} disabled={createCategory.isPending}>
            {t('cancel')}
          </Button>
          <Button variant="primary" onClick={handleSubmit} disabled={createCategory.isPending || !name.trim()}>
            {createCategory.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>{t('creating')}</span>
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                <span>{t('createAction')}</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default CategoryQuickCreateModal;
