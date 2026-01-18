'use client';

import { useEffect, useRef, useState } from 'react';

import { Check, Edit2, Loader2, Plus, Tag as TagIcon, X } from 'lucide-react';

import { type Tag } from '@/@types/expense';

interface TagInputProps {
  selectedTags: Tag[];
  onTagsChange: (tags: Tag[]) => void;
}

const TagInput = ({ selectedTags, onTagsChange }: TagInputProps) => {
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [filteredTags, setFilteredTags] = useState<Tag[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [editingTagId, setEditingTagId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState('');
  const [editError, setEditError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const editInputRef = useRef<HTMLInputElement>(null);

  // Fetch all tags on mount
  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await fetch('/api/tags');
        if (response.ok) {
          const tags = await response.json();
          setAllTags(tags);
        }
      } catch (error) {
        console.error('Failed to fetch tags:', error);
      }
    };

    fetchTags();
  }, []);

  // Filter tags based on input
  useEffect(() => {
    if (inputValue.trim()) {
      const search = inputValue.toLowerCase();
      const filtered = allTags.filter(
        (tag) => tag.name.toLowerCase().includes(search) && !selectedTags.some((selected) => selected.id === tag.id)
      );
      setFilteredTags(filtered);
    } else {
      // Show all unselected tags when input is empty
      const unselectedTags = allTags.filter((tag) => !selectedTags.some((selected) => selected.id === tag.id));
      setFilteredTags(unselectedTags);
    }
  }, [inputValue, allTags, selectedTags]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const createTag = async (name: string) => {
    if (!name.trim()) return;

    setIsCreating(true);
    try {
      const response = await fetch('/api/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() }),
      });

      if (response.ok) {
        const newTag = await response.json();
        setAllTags((prev) => [...prev, newTag]);
        onTagsChange([...selectedTags, newTag]);
        setInputValue('');
        setShowSuggestions(false);
      }
    } catch (error) {
      console.error('Failed to create tag:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const selectTag = (tag: Tag) => {
    onTagsChange([...selectedTags, tag]);
    setInputValue('');
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  // Unselect tag from current expense (doesn't delete globally)
  const unselectTag = (tagId: number) => {
    onTagsChange(selectedTags.filter((tag) => tag.id !== tagId));
  };

  // Start editing a tag from dropdown
  const startEditInDropdown = (tag: Tag, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingTagId(tag.id);
    setEditingName(tag.name);
    setEditError('');
  };

  // Cancel editing
  const cancelEditInDropdown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingTagId(null);
    setEditingName('');
    setEditError('');
  };

  // Save tag rename from dropdown
  const saveEditInDropdown = async (tagId: number, e: React.MouseEvent) => {
    e.stopPropagation();

    if (!editingName.trim()) {
      setEditError('Tag name is required');
      return;
    }

    // Check for duplicate locally first
    const isDuplicate = allTags.some(
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
        setAllTags((prev) => prev.map((tag) => (tag.id === tagId ? updatedTag : tag)));
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

  // Handle keyboard events for editing in dropdown
  const handleEditKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, tagId: number) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      saveEditInDropdown(tagId, e as unknown as React.MouseEvent);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      cancelEditInDropdown(e as unknown as React.MouseEvent);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();

      // If there's an exact match, select it
      const exactMatch = filteredTags.find((tag) => tag.name.toLowerCase() === inputValue.toLowerCase());

      if (exactMatch) {
        selectTag(exactMatch);
      } else {
        // Create new tag
        createTag(inputValue);
      }
    } else if (e.key === 'Backspace' && !inputValue && selectedTags.length > 0) {
      // Remove last tag when backspace is pressed on empty input
      unselectTag(selectedTags[selectedTags.length - 1].id);
    }
  };

  const hasExactMatch = filteredTags.some((tag) => tag.name.toLowerCase() === inputValue.toLowerCase());

  return (
    <div className="relative">
      {/* Selected Tags + Input */}
      <div className="border-border-subtle bg-background focus-within:border-blue flex min-h-[48px] flex-wrap items-center gap-2 rounded-lg border px-4 py-3 transition-all">
        {selectedTags.map((tag) => (
          <div
            key={tag.id}
            className="group border-border-subtle bg-background-elevated text-text-secondary hover:border-border-default flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-sm font-medium transition-all"
          >
            <TagIcon className="h-3.5 w-3.5" />
            <span>{tag.name}</span>
            <button
              type="button"
              onClick={() => unselectTag(tag.id)}
              className="hover:bg-border-subtle ml-0.5 rounded p-0.5 transition-colors"
              aria-label={`Remove ${tag.name} tag`}
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}

        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowSuggestions(true)}
          placeholder={selectedTags.length === 0 ? 'Add tags...' : ''}
          className="text-text-primary placeholder:text-text-muted min-w-[120px] flex-1 bg-transparent outline-none"
        />
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && (
        <div
          ref={suggestionsRef}
          className="border-border-subtle bg-background absolute top-full right-0 left-0 z-20 mt-2 max-h-48 overflow-y-auto rounded-lg border shadow-lg"
        >
          {filteredTags.map((tag) => (
            <div
              key={tag.id}
              className="group border-border-subtle hover:bg-background-elevated flex items-center gap-2.5 border-b px-4 py-2.5 transition-colors first:rounded-t-lg last:border-0"
            >
              {editingTagId === tag.id ? (
                <>
                  <TagIcon className="text-text-muted h-4 w-4 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <input
                      ref={editInputRef}
                      type="text"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      onKeyDown={(e) => handleEditKeyDown(e, tag.id)}
                      onClick={(e) => e.stopPropagation()}
                      autoFocus
                      className="border-blue bg-background text-text-primary w-full rounded border px-2 py-1 text-sm outline-none"
                    />
                    {editError && <p className="text-danger mt-1 text-xs">{editError}</p>}
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <button
                      onClick={(e) => saveEditInDropdown(tag.id, e)}
                      disabled={isSaving}
                      className="border-border-subtle bg-background text-success hover:bg-success-light flex h-7 w-7 items-center justify-center rounded border transition-colors disabled:opacity-50"
                      aria-label="Save changes"
                    >
                      {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                    </button>
                    <button
                      onClick={cancelEditInDropdown}
                      disabled={isSaving}
                      className="border-border-subtle bg-background text-text-secondary hover:bg-background-elevated flex h-7 w-7 items-center justify-center rounded border transition-colors disabled:opacity-50"
                      aria-label="Cancel editing"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => selectTag(tag)}
                    className="flex min-w-0 flex-1 items-center gap-2.5 text-left"
                  >
                    <TagIcon className="text-text-muted h-4 w-4 shrink-0" />
                    <span className="text-text-primary truncate text-sm">{tag.name}</span>
                  </button>
                  <button
                    onClick={(e) => startEditInDropdown(tag, e)}
                    className="text-text-muted hover:bg-background hover:text-text-primary shrink-0 rounded p-1.5 opacity-0 transition-all group-hover:opacity-100"
                    aria-label={`Rename tag ${tag.name}`}
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                </>
              )}
            </div>
          ))}

          {/* Create new tag option */}
          {inputValue.trim() && !hasExactMatch && (
            <button
              type="button"
              onClick={() => createTag(inputValue)}
              disabled={isCreating}
              className="border-border-subtle text-blue hover:bg-blue/10 flex w-full items-center gap-2.5 border-t px-4 py-2.5 text-left text-sm transition-colors last:rounded-b-lg disabled:opacity-50"
            >
              {isCreating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              {isCreating ? 'Creating...' : `Create "${inputValue}"`}
            </button>
          )}

          {filteredTags.length === 0 && !inputValue.trim() && (
            <div className="text-text-muted px-4 py-3 text-sm">No tags yet. Start typing to create one...</div>
          )}
        </div>
      )}
    </div>
  );
};

export default TagInput;
