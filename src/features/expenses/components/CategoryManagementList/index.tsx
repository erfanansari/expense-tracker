'use client';

import { useState } from 'react';

import {
  CATEGORY_COLORS,
  DEFAULT_CATEGORY_COLOR,
  DEFAULT_CATEGORY_ICON,
  getCategoryColor,
  getCategoryIcon,
} from '@constants/categories';
import { Check, Edit2, Folder, Loader2, Plus, Search, Trash2, X } from 'lucide-react';

import CategoryBadge from '@components/CategoryBadge';
import ColorPicker from '@components/ColorPicker';
import DeleteCategoryModal from '@components/DeleteCategoryModal';
import IconPicker from '@components/IconPicker';
import { useToast } from '@components/Toast/ToastProvider';

import { useCategoriesWithUsage, useCreateCategory, useDeleteCategory, useUpdateCategory } from '@hooks/use-categories';

import { ensureError } from '@utils';

import type { CategoryWithUsage } from '@/@types/expense';

const CategoryManagementList = () => {
  const { data: categories = [], isLoading } = useCategoriesWithUsage();

  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  const { showToast } = useToast();

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
      setCreateError('Category name is required');
      return;
    }
    const duplicate = categories.some((c) => c.name.toLowerCase() === trimmed.toLowerCase());
    if (duplicate) {
      setCreateError(`Category "${trimmed}" already exists`);
      return;
    }
    setCreateError('');
    try {
      const created = await createCategory.mutateAsync({ name: trimmed, icon: newIcon, color: newColor });
      showToast(`Category "${created.name}" created.`, 'success');
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
      setEditError('Category name is required');
      return;
    }
    const duplicate = categories.some((c) => c.id !== id && c.name.toLowerCase() === trimmed.toLowerCase());
    if (duplicate) {
      setEditError(`Category "${trimmed}" already exists`);
      return;
    }
    setEditError('');
    try {
      await updateCategory.mutateAsync({
        id,
        input: { name: trimmed, icon: editIcon, color: editColor },
      });
      showToast('Category updated.', 'info');
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
      setDeletingCategory(null);
      showToast(`Category "${name}" deleted.`, 'info');
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
          Add a new category
        </button>
      ) : (
        <div className="border-border-subtle bg-background-secondary space-y-3 rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-text-primary text-sm font-semibold">New category</h3>
            <button
              type="button"
              onClick={resetCreateForm}
              className="text-text-muted hover:text-text-primary rounded p-1 transition-colors"
              aria-label="Cancel"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Live preview */}
          <div className="flex items-center gap-2">
            <span className="text-text-muted text-xs">Preview:</span>
            <CategoryBadge
              category={{ name: newName.trim() || 'New category', icon: newIcon, color: newColor }}
              size="md"
            />
          </div>

          {/* Name */}
          <div className="space-y-1.5">
            <label htmlFor="new-cat-name" className="text-text-secondary text-xs font-medium">
              Name
            </label>
            <input
              id="new-cat-name"
              type="text"
              autoFocus
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={handleCreateKeyDown}
              placeholder="e.g. Subscriptions"
              className="border-border-subtle bg-background text-text-primary placeholder:text-text-muted focus:border-blue w-full rounded-lg border px-3 py-2 text-sm transition-all outline-none"
            />
          </div>

          {/* Color */}
          <div className="space-y-1.5">
            <label className="text-text-secondary text-xs font-medium">Color</label>
            <ColorPicker value={newColor} onChange={setNewColor} />
          </div>

          {/* Icon */}
          <div className="space-y-1.5">
            <label className="text-text-secondary text-xs font-medium">Icon</label>
            <IconPicker value={newIcon} onChange={setNewIcon} highlightColor={newColor} />
          </div>

          {createError && <p className="text-danger text-xs">{createError}</p>}

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={resetCreateForm}
              disabled={createCategory.isPending}
              className="text-text-secondary hover:text-text-primary rounded-lg px-3 py-2 text-sm font-medium transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleCreate}
              disabled={createCategory.isPending || !newName.trim()}
              className="bg-primary hover:bg-button-primary-bg-hover flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white transition-all disabled:cursor-not-allowed disabled:opacity-50"
            >
              {createCategory.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              {createCategory.isPending ? 'Creating...' : 'Create category'}
            </button>
          </div>
        </div>
      )}

      {/* Search */}
      {categories.length > 0 && (
        <div className="relative">
          <Search className="text-text-muted absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <input
            type="search"
            placeholder="Search categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border-border-subtle bg-background text-text-primary placeholder:text-text-muted focus:border-blue w-full rounded-lg border py-2.5 pr-4 pl-10 text-sm transition-all outline-none"
          />
        </div>
      )}

      {/* List */}
      {categories.length === 0 ? (
        <div className="py-12 text-center">
          <div className="bg-background-elevated mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full">
            <Folder className="text-text-muted h-6 w-6" />
          </div>
          <p className="text-text-muted text-sm">No categories yet. Add one to start tracking expenses.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredCategories.length === 0 ? (
            <p className="text-text-muted py-8 text-center text-sm">
              No categories found matching &ldquo;{searchQuery}&rdquo;
            </p>
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
                      <span className="text-text-muted text-xs">Preview:</span>
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
                      <label className="text-text-secondary text-xs font-medium">Name</label>
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
                      <label className="text-text-secondary text-xs font-medium">Color</label>
                      <ColorPicker value={editColor} onChange={setEditColor} />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-text-secondary text-xs font-medium">Icon</label>
                      <IconPicker value={editIcon} onChange={setEditIcon} highlightColor={editColor} />
                    </div>

                    {editError && <p className="text-danger text-xs">{editError}</p>}

                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={cancelEdit}
                        disabled={updateCategory.isPending}
                        className="text-text-secondary hover:text-text-primary rounded-lg px-3 py-2 text-sm font-medium transition-colors disabled:opacity-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => saveEdit(category.id)}
                        disabled={updateCategory.isPending}
                        className="bg-primary hover:bg-button-primary-bg-hover flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white transition-all disabled:opacity-50"
                      >
                        {updateCategory.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Check className="h-4 w-4" />
                        )}
                        Save changes
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
                    <p className="text-text-muted text-xs">
                      Used in {category.usage_count} {category.usage_count === 1 ? 'expense' : 'expenses'}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    <button
                      type="button"
                      onClick={() => startEdit(category)}
                      className="text-action-default hover:bg-action-edit-bg-hover hover:text-action-edit-text-hover rounded-lg p-2 transition-all duration-200"
                      aria-label={`Edit category ${category.name}`}
                      title="Edit"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeletingCategory(category)}
                      className="text-action-default hover:bg-action-delete-bg-hover hover:text-action-delete-text-hover rounded-lg p-2 transition-all duration-200"
                      aria-label={`Delete category ${category.name}`}
                      title="Delete"
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
