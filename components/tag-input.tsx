'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Tag as TagIcon, Plus, Loader2 } from 'lucide-react';
import { type Tag } from '@/lib/types/expense';

interface TagInputProps {
  selectedTags: Tag[];
  onTagsChange: (tags: Tag[]) => void;
}

export function TagInput({ selectedTags, onTagsChange }: TagInputProps) {
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [filteredTags, setFilteredTags] = useState<Tag[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

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
        tag =>
          tag.name.toLowerCase().includes(search) &&
          !selectedTags.some(selected => selected.id === tag.id)
      );
      setFilteredTags(filtered);
      setShowSuggestions(true);
    } else {
      setFilteredTags([]);
      setShowSuggestions(false);
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
        body: JSON.stringify({ name: name.trim() })
      });

      if (response.ok) {
        const newTag = await response.json();
        setAllTags(prev => [...prev, newTag]);
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

  const removeTag = (tagId: number) => {
    onTagsChange(selectedTags.filter(tag => tag.id !== tagId));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();

      // If there's an exact match, select it
      const exactMatch = filteredTags.find(
        tag => tag.name.toLowerCase() === inputValue.toLowerCase()
      );

      if (exactMatch) {
        selectTag(exactMatch);
      } else {
        // Create new tag
        createTag(inputValue);
      }
    } else if (e.key === 'Backspace' && !inputValue && selectedTags.length > 0) {
      // Remove last tag when backspace is pressed on empty input
      removeTag(selectedTags[selectedTags.length - 1].id);
    }
  };

  const hasExactMatch = filteredTags.some(
    tag => tag.name.toLowerCase() === inputValue.toLowerCase()
  );

  return (
    <div className="relative">
      {/* Selected Tags + Input */}
      <div className="flex flex-wrap items-center gap-2 px-4 py-3 bg-white border border-[#e5e5e5] rounded-lg focus-within:border-[#0070f3] transition-all min-h-[48px]">
        {selectedTags.map(tag => (
          <div
            key={tag.id}
            className="group flex items-center gap-1.5 px-2.5 py-1 bg-[#f5f5f5] text-[#525252] rounded-md text-sm font-medium border border-[#e5e5e5] hover:border-[#d4d4d4] transition-all"
          >
            <TagIcon className="h-3.5 w-3.5" />
            <span>{tag.name}</span>
            <button
              type="button"
              onClick={() => removeTag(tag.id)}
              className="ml-0.5 p-0.5 rounded hover:bg-[#e5e5e5] transition-colors"
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
          onFocus={() => inputValue && setShowSuggestions(true)}
          placeholder={selectedTags.length === 0 ? "Add tags..." : ""}
          className="flex-1 min-w-[120px] outline-none bg-transparent text-[#171717] placeholder:text-[#a3a3a3] "
        />
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && (inputValue.trim() || filteredTags.length > 0) && (
        <div
          ref={suggestionsRef}
          className="absolute top-full left-0 right-0 mt-2 bg-white border border-[#e5e5e5] rounded-lg shadow-lg z-20 max-h-48 overflow-y-auto"
        >
          {filteredTags.map(tag => (
            <button
              key={tag.id}
              type="button"
              onClick={() => selectTag(tag)}
              className="w-full px-4 py-2.5 text-left hover:bg-[#f5f5f5] text-sm text-[#171717] flex items-center gap-2.5 transition-colors first:rounded-t-lg"
            >
              <TagIcon className="h-4 w-4 text-[#a3a3a3]" />
              {tag.name}
            </button>
          ))}

          {/* Create new tag option */}
          {inputValue.trim() && !hasExactMatch && (
            <button
              type="button"
              onClick={() => createTag(inputValue)}
              disabled={isCreating}
              className="w-full px-4 py-2.5 text-left hover:bg-[#0070f3]/10 text-sm text-[#0070f3] flex items-center gap-2.5 border-t border-[#e5e5e5] disabled:opacity-50 last:rounded-b-lg transition-colors"
            >
              {isCreating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              {isCreating ? 'Creating...' : `Create "${inputValue}"`}
            </button>
          )}

          {filteredTags.length === 0 && !inputValue.trim() && (
            <div className="px-4 py-3 text-sm text-[#a3a3a3]">
              Start typing to search or create tags...
            </div>
          )}
        </div>
      )}
    </div>
  );
}
