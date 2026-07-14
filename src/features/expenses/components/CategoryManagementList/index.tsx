'use client';

import { useState } from 'react';

import { useTranslations } from 'next-intl';

import { createCategoryKeyGenerator } from '@api/createCategoryMutation';
import type { CreateCategoryRequestData } from '@api/createCategoryMutation';
import { deleteCategoryKeyGenerator } from '@api/deleteCategoryMutation';
import type { DeleteCategoryRequestData, DeleteCategoryResponse } from '@api/deleteCategoryMutation';
import { CATEGORIES_SCOPE, getCategoryListWithUsageKeyGenerator } from '@api/getCategoryListQuery';
import { EXPENSES_SCOPE } from '@api/getExpenseListQuery';
import { SUMMARY_SCOPE } from '@api/getSummaryQuery';
import { updateCategoryKeyGenerator } from '@api/updateCategoryMutation';
import type { UpdateCategoryRequestData } from '@api/updateCategoryMutation';
import {
  CATEGORY_COLORS,
  DEFAULT_CATEGORY_COLOR,
  DEFAULT_CATEGORY_ICON,
  getCategoryColor,
  getCategoryIcon,
} from '@constants/categories';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Check, Edit2, Folder, Loader2, Plus, Search, Trash2, X } from 'lucide-react';

import type { Category, CategoryWithUsage } from '@types';

import CategoryBadge from '@components/CategoryBadge';
import ColorPicker from '@components/ColorPicker';
import DeleteCategoryModal from '@components/DeleteCategoryModal';
import IconPicker from '@components/IconPicker';

import { useToast } from '@stores/toast';

import { ensureError } from '@utils';

const CategoryManagementList = () => {
  const t = useTranslations('settings.categories');
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const { data: categories = [], isLoading } = useQuery<CategoryWithUsage[]>({
    queryKey: getCategoryListWithUsageKeyGenerator(),
  });

  const createCategory = useMutation<Category, Error, CreateCategoryRequestData>({
    mutationKey: createCategoryKeyGenerator(),
  });
  const updateCategory = useMutation<Category, Error, UpdateCategoryRequestData>({
    mutationKey: updateCategoryKeyGenerator(),
  });
  const deleteCategory = useMutation<DeleteCategoryResponse, Error, DeleteCategoryRequestData>({
    mutationKey: deleteCategoryKeyGenerator(),
  });

  const invalidateCategoryData = () => queryClient.invalidateQueries({ queryKey: CATEGORIES_SCOPE });

  // Create form state
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [newIcon, setNewIcon] = useState<string>(DEFAULT_CATEGORY_ICON);
  const [newColor, setNewColor] = useState<string>(CATEGORY_COLORS[0]?.value ?? DEFAULT_CATEGORY_COLOR);
  const [createError, setCreateError] = useState('');

  // Edit state
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [editIcon, setEditIcon] = useState<string>(DEFAULT_CATEGORY_ICON);
  const [editColor, setEditColor] = useState<string>(DEFAULT_CATEGORY_COLOR);
  const [editError, setEditError] = useState('');

  // Delete state
  const [deletingCategory, setDeletingCategory] = useState<CategoryWithUsage | null>(null);

  // Search
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCategories = categories.filter((c) => c.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const resetCreateForm = () => {
    setNewName('');
    setNewIcon(DEFAULT_CATEGORY_ICON);
    setNewColor(CATEGORY_COLORS[0]?.value ?? DEFAULT_CATEGORY_COLOR);
    setCreateError('');
    setIsCreating(false);
  };

  const handleCreate = async () => {
    const trimmed = newName.trim();
    if (!trimmed) {
      setCreateError(t('nameRequired'));
      return;
    }
    const duplicate = categories.some((c) => c.name.toLowerCase() === trimmed.toLowerCase());
    if (duplicate) {
      setCreateError(t('duplicateName', { name: trimmed }));
      return;
    }
    setCreateError('');
    try {
      const created = await createCategory.mutateAsync({ name: trimmed, icon: newIcon, color: newColor });
      await invalidateCategoryData();
      showToast(t('created', { name: created.name }), 'success');
      resetCreateForm();
    } catch (err) {
      setCreateError(ensureError(err).message);
    }
  };

  const startEdit = (c: CategoryWithUsage) => {
    setEditingId(c.id);
    setEditName(c.name);
    setEditIcon(c.icon);
    setEditColor(c.color);
    setEditError('');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName('');
    setEditError('');
  };

  const saveEdit = async (id: number) => {
    const trimmed = editName.trim();
    if (!trimmed) {
      setEditError(t('nameRequired'));
      return;
    }
    const duplicate = categories.some((c) => c.id !== id && c.name.toLowerCase() === trimmed.toLowerCase());
    if (duplicate) {
      setEditError(t('duplicateName', { name: trimmed }));
      return;
    }
    setEditError('');
    try {
      await updateCategory.mutateAsync({ id, name: trimmed, icon: editIcon, color: editColor });
      await invalidateCategoryData();
      showToast(t('updated'), 'info');
      cancelEdit();
    } catch (err) {
      setEditError(ensureError(err).message);
    }
  };

  const handleEditKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, id: number) => {
    if (e.key === 'Enter') saveEdit(id);
    else if (e.key === 'Escape') cancelEdit();
  };

  const handleCreateKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleCreate();
    else if (e.key === 'Escape') resetCreateForm();
  };

  const confirmDelete = async (reassignToId?: number) => {
    if (!deletingCategory) return;
    try {
      const name = deletingCategory.name;
      await deleteCategory.mutateAsync({ id: deletingCategory.id, reassignTo: reassignToId });
      await Promise.all([
        invalidateCategoryData(),
        // reassign / delete affects expense rows and category totals
        queryClient.invalidateQueries({ queryKey: EXPENSES_SCOPE }),
        queryClient.invalidateQueries({ queryKey: SUMMARY_SCOPE }),
      ]);
      setDeletingCategory(null);
      showToast(t('deleted', { name }), 'info');
    } catch (err) {
      showToast(ensureError(err).message, 'error');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="text-text-muted h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Create panel */}
      {!isCreating ? (
        <button
          type="button"
          onClick={() => setIsCreating(true)}
          className="border-border-subtle hover:bg-background-secondary text-text-secondary hover:text-text-primary flex w-full items-center justify-center gap-2 rounded-lg border border-dashed py-3 text-sm font-medium transition-all"
        >
          <Plus className="h-4 w-4" />
          {t('addNew')}
        </button>
      ) : (
        <div className="border-border-subtle bg-background-secondary space-y-3 rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-text-primary text-sm font-semibold">{t('newCategory')}</h3>
            <button
              type="button"
              onClick={resetCreateForm}
              className="text-text-muted hover:text-text-primary rounded p-1 transition-colors"
              aria-label={t('cancel')}
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Live preview */}
          <div className="flex items-center gap-2">
            <span className="text-text-muted text-xs">{t('preview')}</span>
            <CategoryBadge
              category={{ name: newName.trim() || t('newCategory'), icon: newIcon, color: newColor }}
              size="md"
            />
          </div>

          {/* Name */}
          <div className="space-y-1.5">
            <label htmlFor="new-cat-name" className="text-text-secondary text-xs font-medium">
              {t('name')}
            </label>
            <input
              id="new-cat-name"
              type="text"
              autoFocus
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={handleCreateKeyDown}
              placeholder={t('namePlaceholder')}
              className="border-border-subtle bg-background text-text-primary placeholder:text-text-muted focus:border-blue w-full rounded-lg border px-3 py-2 text-sm transition-all outline-none"
            />
          </div>

          {/* Color */}
          <div className="space-y-1.5">
            <label className="text-text-secondary text-xs font-medium">{t('color')}</label>
            <ColorPicker value={newColor} onChange={setNewColor} />
          </div>

          {/* Icon */}
          <div className="space-y-1.5">
            <label className="text-text-secondary text-xs font-medium">{t('icon')}</label>
            <IconPicker value={newIcon} onChange={setNewIcon} highlightColor={newColor} />
          </div>

          {createError && <p className="text-danger text-xs">{createError}</p>}

          {/* Cancel sits on the physical right, Create/primary on the left, under
              RTL. rtl:justify-start (not rtl:flex-row-reverse) keeps Cancel —
              coded first — as the rightmost element while still anchoring the
              pair to the row's own right edge (its LTR resting side). */}
          <div className="flex justify-end gap-2 pt-1 rtl:justify-start">
            <button
              type="button"
              onClick={resetCreateForm}
              disabled={createCategory.isPending}
              className="text-text-secondary hover:text-text-primary rounded-lg px-3 py-2 text-sm font-medium transition-colors disabled:opacity-50"
            >
              {t('cancel')}
            </button>
            <button
              type="button"
              onClick={handleCreate}
              disabled={createCategory.isPending || !newName.trim()}
              className="bg-primary hover:bg-button-primary-bg-hover text-primary-foreground flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all disabled:cursor-not-allowed disabled:opacity-50"
            >
              {createCategory.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              {createCategory.isPending ? t('creating') : t('createAction')}
            </button>
          </div>
        </div>
      )}

      {/* Search */}
      {categories.length > 0 && (
        <div className="relative">
          <Search className="text-text-muted absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2" />
          <input
            type="search"
            placeholder={t('searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border-border-subtle bg-background text-text-primary placeholder:text-text-muted focus:border-blue w-full rounded-lg border py-2.5 ps-10 pe-4 text-sm transition-all outline-none"
          />
        </div>
      )}

      {/* List */}
      {categories.length === 0 ? (
        <div className="py-12 text-center">
          <div className="bg-background-elevated mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full">
            <Folder className="text-text-muted h-6 w-6" />
          </div>
          <p className="text-text-muted text-sm">{t('empty')}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredCategories.length === 0 ? (
            <p className="text-text-muted py-8 text-center text-sm">{t('noMatch', { query: searchQuery })}</p>
          ) : (
            filteredCategories.map((category) => {
              const Icon = getCategoryIcon(category.icon);
              const color = getCategoryColor(category.color);
              const isEditing = editingId === category.id;

              if (isEditing) {
                return (
                  <div
                    key={category.id}
                    className="border-blue/30 bg-background-secondary space-y-3 rounded-lg border p-4"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-text-muted text-xs">{t('preview')}</span>
                      <CategoryBadge
                        category={{
                          name: editName.trim() || category.name,
                          icon: editIcon,
                          color: editColor,
                        }}
                        size="md"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-text-secondary text-xs font-medium">{t('name')}</label>
                      <input
                        type="text"
                        autoFocus
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onKeyDown={(e) => handleEditKeyDown(e, category.id)}
                        className="border-border-subtle bg-background text-text-primary focus:border-blue w-full rounded-lg border px-3 py-2 text-sm transition-all outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-text-secondary text-xs font-medium">{t('color')}</label>
                      <ColorPicker value={editColor} onChange={setEditColor} />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-text-secondary text-xs font-medium">{t('icon')}</label>
                      <IconPicker value={editIcon} onChange={setEditIcon} highlightColor={editColor} />
                    </div>

                    {editError && <p className="text-danger text-xs">{editError}</p>}

                    {/* Cancel sits on the physical right, Save/primary on the
                        left, under RTL — see the create-form row above for why
                        rtl:justify-start (not row-reverse) is correct here. */}
                    <div className="flex justify-end gap-2 pt-1 rtl:justify-start">
                      <button
                        type="button"
                        onClick={cancelEdit}
                        disabled={updateCategory.isPending}
                        className="text-text-secondary hover:text-text-primary rounded-lg px-3 py-2 text-sm font-medium transition-colors disabled:opacity-50"
                      >
                        {t('cancel')}
                      </button>
                      <button
                        type="button"
                        onClick={() => saveEdit(category.id)}
                        disabled={updateCategory.isPending}
                        className="bg-primary hover:bg-button-primary-bg-hover text-primary-foreground flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all disabled:opacity-50"
                      >
                        {updateCategory.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Check className="h-4 w-4" />
                        )}
                        {t('saveChanges')}
                      </button>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={category.id}
                  className="border-border-subtle bg-background hover:border-border-default flex items-center gap-3 rounded-lg border p-3 transition-all sm:p-4"
                >
                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border ${color.pill}`}>
                    <Icon className="h-4 w-4" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-text-primary truncate text-sm font-medium">{category.name}</p>
                    <p className="text-text-muted text-xs">{t('usedIn', { count: category.usage_count })}</p>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    <button
                      type="button"
                      onClick={() => startEdit(category)}
                      className="text-action-default hover:bg-action-edit-bg-hover hover:text-action-edit-text-hover rounded-lg p-2 transition-all duration-200"
                      aria-label={t('editAria', { name: category.name })}
                      title={t('editAction')}
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeletingCategory(category)}
                      className="text-action-default hover:bg-action-delete-bg-hover hover:text-action-delete-text-hover rounded-lg p-2 transition-all duration-200"
                      aria-label={t('deleteAria', { name: category.name })}
                      title={t('deleteAction')}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      <DeleteCategoryModal
        isOpen={!!deletingCategory}
        category={deletingCategory}
        allCategories={categories}
        onConfirm={confirmDelete}
        onCancel={() => setDeletingCategory(null)}
        isDeleting={deleteCategory.isPending}
      />
    </div>
  );
};

export default CategoryManagementList;
