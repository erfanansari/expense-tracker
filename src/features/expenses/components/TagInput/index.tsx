'use client';

import { createContext, useContext, useState } from 'react';

import { Check, Edit2, Loader2, Plus, Tag as TagIcon, X } from 'lucide-react';
import type { CSSObjectWithLabel, MultiValue, MultiValueGenericProps, OptionProps, StylesConfig } from 'react-select';
import CreatableSelect from 'react-select/creatable';
import { twMerge } from 'tailwind-merge';

import { useCreateTag, useTags, useUpdateTag } from '@hooks/use-tags';

import { ensureError } from '@utils';

import { type Tag } from '@/@types/expense';

// ─── Types ──────────────────────────────────────────────────────────────────

interface TagOption {
  value: string;
  label: string;
  tag?: Tag;
}

interface TagEditState {
  editingTagId: number | null;
  editingName: string;
  editError: string;
  isSaving: boolean;
  onStartEdit: (tag: Tag) => void;
  onCancelEdit: () => void;
  onSaveEdit: (tagId: number) => Promise<void>;
  onEditNameChange: (name: string) => void;
}

// ─── Context ─────────────────────────────────────────────────────────────────
// React context is preserved through React.createPortal, which react-select uses
// for menuPortalTarget, so TagOptionComponent can access TagEditContext.

const TagEditContext = createContext<TagEditState | null>(null);

// ─── Styles ──────────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const selectStyles: StylesConfig<any, any, any> = {
  menuPortal: (base: CSSObjectWithLabel) => ({ ...base, zIndex: 9999, pointerEvents: 'auto' }),
  // Remove react-select's default 2px margin/padding on the Input container
  // so the control height matches other inputs in the form.
  input: () => ({ color: 'inherit', fontSize: 'inherit', margin: 0, padding: 0 }),
};

const controlClass = (isFocused: boolean) =>
  twMerge(
    'border-border-subtle bg-background flex w-full items-center rounded-lg border px-3 py-2 text-sm transition-all cursor-text gap-1.5',
    isFocused && 'border-blue'
  );

// ─── Custom Option ───────────────────────────────────────────────────────────

const TagOptionComponent = ({ data, isFocused, innerProps, innerRef }: OptionProps<TagOption, true>) => {
  const edit = useContext(TagEditContext);
  const isNew = (data as TagOption & { __isNew__?: boolean }).__isNew__;
  const isEditing = edit?.editingTagId != null && edit.editingTagId === data.tag?.id;

  if (isNew) {
    return (
      <div
        {...innerProps}
        ref={innerRef}
        className={twMerge(
          'text-blue border-border-subtle flex cursor-pointer items-center gap-2 border-t px-3 py-2 text-xs transition-colors',
          isFocused && 'bg-blue/10'
        )}
      >
        <Plus className="h-3.5 w-3.5 shrink-0" />
        <span>Create &ldquo;{data.label}&rdquo;</span>
      </div>
    );
  }

  if (isEditing && data.tag && edit) {
    const tagId = data.tag.id;
    return (
      <div
        ref={innerRef}
        className="flex items-center gap-2 px-3 py-2"
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        <TagIcon className="text-text-muted h-3.5 w-3.5 shrink-0" />
        <div className="min-w-0 flex-1">
          <input
            type="text"
            value={edit.editingName}
            onChange={(e) => edit.onEditNameChange(e.target.value)}
            onKeyDown={(e) => {
              e.stopPropagation();
              if (e.key === 'Enter') {
                e.preventDefault();
                edit.onSaveEdit(tagId);
              }
              if (e.key === 'Escape') {
                e.preventDefault();
                edit.onCancelEdit();
              }
            }}
            className="border-blue bg-background text-text-primary w-full rounded border px-2 py-0.5 text-xs outline-none"
          />
          {edit.editError && <p className="text-danger mt-0.5 text-xs">{edit.editError}</p>}
        </div>
        <div className="flex shrink-0 gap-1">
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={(e) => {
              e.stopPropagation();
              edit.onSaveEdit(tagId);
            }}
            disabled={edit.isSaving}
            className="border-border-subtle bg-background text-success flex h-6 w-6 items-center justify-center rounded border transition-colors disabled:opacity-50"
            aria-label="Save"
          >
            {edit.isSaving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
          </button>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={(e) => {
              e.stopPropagation();
              edit.onCancelEdit();
            }}
            disabled={edit.isSaving}
            className="border-border-subtle bg-background text-text-secondary flex h-6 w-6 items-center justify-center rounded border transition-colors disabled:opacity-50"
            aria-label="Cancel"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      {...innerProps}
      ref={innerRef}
      className={twMerge(
        'text-text-primary flex cursor-pointer items-center gap-2 px-3 py-1.5 text-xs transition-colors',
        isFocused && 'bg-background-elevated'
      )}
    >
      <TagIcon className="text-text-muted h-3.5 w-3.5 shrink-0" />
      <span className="min-w-0 flex-1 truncate">{data.label}</span>
      {/* Always rendered to prevent layout shift on hover; hidden when not focused */}
      {data.tag && edit && (
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onClick={(e) => {
            e.stopPropagation();
            edit.onStartEdit(data.tag!);
          }}
          className={twMerge(
            'text-text-muted hover:text-text-secondary shrink-0 rounded p-1 transition-colors',
            !isFocused && 'invisible'
          )}
          aria-label={`Rename ${data.label}`}
          tabIndex={-1}
        >
          <Edit2 className="h-3 w-3" />
        </button>
      )}
    </div>
  );
};

// ─── Tag pill label ──────────────────────────────────────────────────────────

const TagMultiValueLabel = ({ data }: MultiValueGenericProps<TagOption, true>) => (
  <span className="flex items-center gap-1">
    <TagIcon className="h-3 w-3 shrink-0" />
    <span>{data.label}</span>
  </span>
);

// ─── Main component ──────────────────────────────────────────────────────────

interface TagInputProps {
  selectedTags: Tag[];
  onTagsChange: (tags: Tag[]) => void;
}

const tagToOption = (tag: Tag): TagOption => ({ value: String(tag.id), label: tag.name, tag });

const TagInput = ({ selectedTags, onTagsChange }: TagInputProps) => {
  const { data: allTags = [] } = useTags();
  const createTag = useCreateTag();
  const updateTag = useUpdateTag();

  const [editingTagId, setEditingTagId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState('');
  const [editError, setEditError] = useState('');

  const handleChange = (newValue: MultiValue<TagOption>) => {
    onTagsChange(newValue.flatMap((o) => (o.tag ? [o.tag] : [])));
  };

  const handleCreate = async (inputValue: string) => {
    try {
      const newTag = await createTag.mutateAsync(inputValue.trim());
      onTagsChange([...selectedTags, newTag]);
    } catch (error) {
      console.error('Failed to create tag:', error);
    }
  };

  const startEdit = (tag: Tag) => {
    setEditingTagId(tag.id);
    setEditingName(tag.name);
    setEditError('');
  };

  const cancelEdit = () => {
    setEditingTagId(null);
    setEditingName('');
    setEditError('');
  };

  const saveEdit = async (tagId: number) => {
    if (!editingName.trim()) {
      setEditError('Tag name is required');
      return;
    }
    const isDuplicate = allTags.some(
      (t) => t.id !== tagId && t.name.toLowerCase() === editingName.trim().toLowerCase()
    );
    if (isDuplicate) {
      setEditError(`"${editingName.trim()}" already exists`);
      return;
    }
    setEditError('');
    try {
      await updateTag.mutateAsync({ id: tagId, name: editingName.trim() });
      setEditingTagId(null);
      setEditingName('');
    } catch (error) {
      setEditError(ensureError(error).message);
    }
  };

  const editState: TagEditState = {
    editingTagId,
    editingName,
    editError,
    isSaving: updateTag.isPending,
    onStartEdit: startEdit,
    onCancelEdit: cancelEdit,
    onSaveEdit: saveEdit,
    onEditNameChange: setEditingName,
  };

  const options = allTags.filter((tag) => !selectedTags.some((s) => s.id === tag.id)).map(tagToOption);

  return (
    <TagEditContext.Provider value={editState}>
      <CreatableSelect<TagOption, true>
        isMulti
        value={selectedTags.map(tagToOption)}
        onChange={handleChange}
        options={options}
        onCreateOption={handleCreate}
        isLoading={createTag.isPending}
        placeholder="Add tags..."
        isSearchable
        closeMenuOnSelect={false}
        createOptionPosition="last"
        menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
        menuPosition="fixed"
        onMenuClose={cancelEdit}
        unstyled
        styles={selectStyles}
        components={{
          Option: TagOptionComponent,
          MultiValueLabel: TagMultiValueLabel,
          DropdownIndicator: () => null,
          IndicatorSeparator: () => null,
        }}
        classNames={{
          control: ({ isFocused }) => controlClass(isFocused),
          valueContainer: () => 'flex items-center gap-1.5 flex-1 overflow-x-hidden',
          menu: () => 'border-border-subtle bg-background mt-1 rounded-lg border py-1 shadow-lg',
          placeholder: () => 'text-text-muted text-sm',
          input: () => 'text-text-primary text-sm flex-1 min-w-[80px]',
          multiValue: () =>
            'group border-border-subtle bg-background-elevated text-text-secondary hover:border-border-default flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium transition-all',
          multiValueLabel: () => 'flex items-center gap-1',
          multiValueRemove: () =>
            'text-text-muted hover:text-text-primary hover:bg-background-elevated ml-0.5 rounded p-0.5 transition-colors cursor-pointer',
          noOptionsMessage: () => 'text-text-muted px-4 py-3 text-xs',
          loadingMessage: () => 'text-text-muted px-4 py-3 text-xs',
        }}
      />
    </TagEditContext.Provider>
  );
};

export default TagInput;
