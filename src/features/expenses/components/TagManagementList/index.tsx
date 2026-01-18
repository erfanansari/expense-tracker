'use client';

import { useEffect, useState } from 'react';

import { Check, Edit2, Loader2, Plus, Search, Tag as TagIcon, Trash2, X } from 'lucide-react';

import type { TagWithUsage } from '@/@types/expense';
import DeleteTagModal from '@/components/DeleteTagModal';

const TagManagementList = () => {
  const [tags, setTags] = useState<TagWithUsage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingTagId, setEditingTagId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState('');
  const [editError, setEditError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [deletingTag, setDeletingTag] = useState<TagWithUsage | null>(null);
  const [isDeletingInProgress, setIsDeletingInProgress] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState('');

  // Fetch tags with usage counts
  const fetchTags = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/tags?includeUsage=true');
      if (response.ok) {
        const fetchedTags = await response.json();
        setTags(fetchedTags);
      }
    } catch (error) {
      console.error('Failed to fetch tags:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTags();
  }, []);

  // Filter tags based on search
  const filteredTags = tags.filter((tag) => tag.name.toLowerCase().includes(searchQuery.toLowerCase()));

  // Start editing a tag
  const startEdit = (tag: TagWithUsage) => {
    setEditingTagId(tag.id);
    setEditingName(tag.name);
    setEditError('');
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditingTagId(null);
    setEditingName('');
    setEditError('');
  };

  // Save tag rename
  const saveEdit = async (tagId: number) => {
    if (!editingName.trim()) {
      setEditError('Tag name is required');
      return;
    }

    // Check for duplicate locally first
    const isDuplicate = tags.some(
      (tag) => tag.id !== tagId && tag.name.toLowerCase() === editingName.trim().toLowerCase()
    );

    if (isDuplicate) {
      setEditError(`Tag "${editingName.trim()}" already exists`);
      return;
    }

    setIsSaving(true);
    setEditError('');

    try {
      const response = await fetch(`/api/tags/${tagId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editingName.trim() }),
      });

      if (response.ok) {
        const updatedTag = await response.json();
        setTags((prev) => prev.map((tag) => (tag.id === tagId ? { ...tag, name: updatedTag.name } : tag)));
        setEditingTagId(null);
        setEditingName('');
      } else {
        const error = await response.json();
        setEditError(error.error || 'Failed to update tag');
      }
    } catch (error) {
      console.error('Failed to update tag:', error);
      setEditError('Failed to update tag');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle keyboard events for editing
  const handleEditKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, tagId: number) => {
    if (e.key === 'Enter') {
      saveEdit(tagId);
    } else if (e.key === 'Escape') {
      cancelEdit();
    }
  };

  // Open delete confirmation modal
  const openDeleteModal = (tag: TagWithUsage) => {
    setDeletingTag(tag);
  };

  // Cancel delete
  const cancelDelete = () => {
    setDeletingTag(null);
  };

  // Confirm delete
  const confirmDelete = async () => {
    if (!deletingTag) return;

    setIsDeletingInProgress(true);

    try {
      const response = await fetch(`/api/tags/${deletingTag.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setTags((prev) => prev.filter((tag) => tag.id !== deletingTag.id));
        setDeletingTag(null);
      } else {
        console.error('Failed to delete tag');
      }
    } catch (error) {
      console.error('Failed to delete tag:', error);
    } finally {
      setIsDeletingInProgress(false);
    }
  };

  // Create new tag
  const createTag = async () => {
    if (!newTagName.trim()) {
      setCreateError('Tag name is required');
      return;
    }

    // Check for duplicate locally first
    const isDuplicate = tags.some((tag) => tag.name.toLowerCase() === newTagName.trim().toLowerCase());

    if (isDuplicate) {
      setCreateError(`Tag "${newTagName.trim()}" already exists`);
      return;
    }

    setIsCreating(true);
    setCreateError('');

    try {
      const response = await fetch('/api/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newTagName.trim() }),
      });

      if (response.ok) {
        const newTag = await response.json();
        // Add new tag with 0 usage count
        setTags((prev) => [...prev, { ...newTag, usage_count: 0 }]);
        setNewTagName('');
        setCreateError('');
      } else {
        const error = await response.json();
        setCreateError(error.error || 'Failed to create tag');
      }
    } catch (error) {
      console.error('Failed to create tag:', error);
      setCreateError('Failed to create tag');
    } finally {
      setIsCreating(false);
    }
  };

  // Handle keyboard events for creating tag
  const handleCreateKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      createTag();
    } else if (e.key === 'Escape') {
      setNewTagName('');
      setCreateError('');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="text-text-muted h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (tags.length === 0) {
    return (
      <div className="py-12 text-center">
        <div className="bg-background-elevated mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full">
          <TagIcon className="text-text-muted h-6 w-6" />
        </div>
        <p className="text-text-muted text-sm">No tags yet. Create tags while adding expenses.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Create New Tag */}
      <div className="space-y-2">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <TagIcon className="text-text-muted absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Create new tag..."
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              onKeyDown={handleCreateKeyDown}
              disabled={isCreating}
              className="border-border-subtle bg-background text-text-primary placeholder:text-text-muted focus:border-blue w-full rounded-lg border py-2.5 pr-4 pl-10 text-sm transition-all outline-none disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          <button
            onClick={createTag}
            disabled={isCreating || !newTagName.trim()}
            className="bg-primary hover:bg-button-primary-bg-hover flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-white transition-all disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isCreating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            {isCreating ? 'Creating...' : 'Create'}
          </button>
        </div>
        {createError && <p className="text-danger text-xs">{createError}</p>}
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="text-text-muted absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
        <input
          type="search"
          placeholder="Search tags..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="border-border-subtle bg-background text-text-primary placeholder:text-text-muted focus:border-blue w-full rounded-lg border py-2.5 pr-4 pl-10 text-sm transition-all outline-none"
        />
      </div>

      {/* Tags List */}
      <div className="space-y-2">
        {filteredTags.length === 0 ? (
          <p className="text-text-muted py-8 text-center text-sm">No tags found matching &ldquo;{searchQuery}&rdquo;</p>
        ) : (
          filteredTags.map((tag) => (
            <div
              key={tag.id}
              className="border-border-subtle bg-background hover:border-border-default flex items-center gap-3 rounded-lg border p-3 transition-all sm:p-4"
            >
              {/* Tag Icon */}
              <div className="border-border-subtle bg-background-elevated flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border">
                <TagIcon className="text-text-secondary h-4 w-4" />
              </div>

              {/* Tag Info */}
              <div className="min-w-0 flex-1">
                {editingTagId === tag.id ? (
                  <div className="space-y-1">
                    <input
                      type="text"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      onKeyDown={(e) => handleEditKeyDown(e, tag.id)}
                      autoFocus
                      className="border-blue bg-background text-text-primary w-full rounded border px-2 py-1 text-sm font-medium outline-none"
                    />
                    {editError && <p className="text-danger text-xs">{editError}</p>}
                  </div>
                ) : (
                  <>
                    <p className="text-text-primary truncate text-sm font-medium">{tag.name}</p>
                    <p className="text-text-muted text-xs">
                      Used in {tag.usage_count} {tag.usage_count === 1 ? 'expense' : 'expenses'}
                    </p>
                  </>
                )}
              </div>

              {/* Actions */}
              <div className="flex shrink-0 items-center gap-2">
                {editingTagId === tag.id ? (
                  <>
                    <button
                      onClick={() => saveEdit(tag.id)}
                      disabled={isSaving}
                      className="text-text-muted hover:bg-success/10 hover:text-success rounded-lg p-2 transition-all duration-200 disabled:opacity-50"
                      aria-label="Save changes"
                      title="Save"
                    >
                      {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                    </button>
                    <button
                      onClick={cancelEdit}
                      disabled={isSaving}
                      className="text-text-muted hover:bg-background-elevated hover:text-text-secondary rounded-lg p-2 transition-all duration-200 disabled:opacity-50"
                      aria-label="Cancel editing"
                      title="Cancel"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => startEdit(tag)}
                      className="text-text-muted hover:bg-blue/10 hover:text-blue rounded-lg p-2 transition-all duration-200"
                      aria-label={`Rename tag ${tag.name}`}
                      title="Edit"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => openDeleteModal(tag)}
                      className="text-text-muted hover:bg-danger/10 hover:text-danger rounded-lg p-2 transition-all duration-200"
                      aria-label={`Delete tag ${tag.name}`}
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteTagModal
        isOpen={!!deletingTag}
        tag={deletingTag}
        usageCount={deletingTag?.usage_count || 0}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        isDeleting={isDeletingInProgress}
      />
    </div>
  );
};

export default TagManagementList;
