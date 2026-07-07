'use client';

import { createTagKeyGenerator } from '@api/createTagMutation';
import type { CreateTagRequestData } from '@api/createTagMutation';
import { getTagListKeyGenerator, TAGS_SCOPE } from '@api/getTagListQuery';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Check, Plus } from 'lucide-react';
import { components as rsComponents } from 'react-select';
import type { CSSObjectWithLabel, MenuListProps, MultiValue, OptionProps, StylesConfig } from 'react-select';
import CreatableSelect from 'react-select/creatable';
import { twMerge } from 'tailwind-merge';

import { type Tag } from '@types';

// ─── Types ──────────────────────────────────────────────────────────────────

interface TagOption {
  value: string;
  label: string;
  tag?: Tag;
}

// ─── Styles ──────────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const selectStyles: StylesConfig<any, any, any> = {
  menuPortal: (base: CSSObjectWithLabel) => ({ ...base, zIndex: 9999, pointerEvents: 'auto' }),
  // Allow the menu to grow wider than the control so long tags never wrap.
  menu: (base: CSSObjectWithLabel) => ({ ...base, width: 'max-content', minWidth: '100%' }),
  input: () => ({ color: 'inherit', fontSize: 'inherit', margin: 0, padding: 0 }),
  control: () => ({ minHeight: 'unset' }),
  // Explicitly remove valueContainer padding — react-select keeps residual padding even in unstyled mode
  valueContainer: () => ({ display: 'flex', alignItems: 'center', flex: 1, overflow: 'hidden', padding: 0 }),
};

const controlClass = (isFocused: boolean) =>
  twMerge(
    'border-border-subtle bg-background flex w-full items-center rounded-lg border px-3 py-2 text-sm transition-all cursor-text gap-1.5',
    isFocused && 'border-blue ring-2 ring-blue/15'
  );

// ─── Custom Option ───────────────────────────────────────────────────────────

const TagOptionComponent = ({ data, isFocused, isSelected, innerProps, innerRef }: OptionProps<TagOption, true>) => {
  const isNew = (data as TagOption & { __isNew__?: boolean }).__isNew__;

  if (isNew) {
    return (
      <div
        {...innerProps}
        ref={innerRef}
        className={twMerge(
          'text-blue mt-1 flex cursor-pointer items-center gap-2 rounded-md px-2.5 py-1.5 text-[13px] font-medium whitespace-nowrap transition-colors duration-100',
          isFocused && 'bg-blue/10'
        )}
      >
        <Plus className="h-3.5 w-3.5 shrink-0" />
        <span>Create &ldquo;{data.label}&rdquo;</span>
      </div>
    );
  }

  return (
    <div
      {...innerProps}
      ref={innerRef}
      className={twMerge(
        'text-text-secondary flex cursor-pointer items-center justify-between gap-6 rounded-md px-2.5 py-1.5 text-[13px] whitespace-nowrap transition-colors duration-100',
        isFocused && 'bg-background-elevated text-text-primary',
        isSelected && 'text-text-primary font-medium'
      )}
    >
      <span className="truncate">{data.label}</span>
      {isSelected && <Check className="text-blue h-3.5 w-3.5 shrink-0" aria-hidden="true" />}
    </div>
  );
};

// ─── Menu list (scroll fix for vaul drawer) ───────────────────────────────────

const TagMenuList = (props: MenuListProps<TagOption, true>) => (
  <rsComponents.MenuList
    {...props}
    innerProps={{
      ...props.innerProps,
      onWheel: (e) => e.stopPropagation(),
      onTouchMove: (e) => e.stopPropagation(),
    }}
  />
);

// ─── Main component ──────────────────────────────────────────────────────────

interface TagInputProps {
  selectedTags: Tag[];
  onTagsChange: (tags: Tag[]) => void;
}

const tagToOption = (tag: Tag): TagOption => ({ value: String(tag.id), label: tag.name, tag });

const TagInput = ({ selectedTags, onTagsChange }: TagInputProps) => {
  const queryClient = useQueryClient();
  const { data: allTags = [] } = useQuery<Tag[]>({ queryKey: getTagListKeyGenerator() });
  const createTag = useMutation<Tag, Error, CreateTagRequestData>({ mutationKey: createTagKeyGenerator() });

  const handleChange = (newValue: MultiValue<TagOption>) => {
    onTagsChange(newValue.flatMap((o) => (o.tag ? [o.tag] : [])));
  };

  const handleCreate = async (inputValue: string) => {
    try {
      const newTag = await createTag.mutateAsync({ name: inputValue.trim() });
      await queryClient.invalidateQueries({ queryKey: TAGS_SCOPE });
      onTagsChange([...selectedTags, newTag]);
    } catch (error) {
      console.error('Failed to create tag:', error);
    }
  };

  const options = allTags.filter((tag) => !selectedTags.some((s) => s.id === tag.id)).map(tagToOption);

  return (
    <CreatableSelect<TagOption, true>
      isMulti
      classNamePrefix="ti"
      value={selectedTags.map(tagToOption)}
      onChange={handleChange}
      options={options}
      onCreateOption={handleCreate}
      isLoading={createTag.isPending}
      placeholder="Tags"
      isSearchable
      closeMenuOnSelect={false}
      createOptionPosition="last"
      menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
      menuPosition="fixed"
      unstyled
      styles={selectStyles}
      components={{
        Option: TagOptionComponent,
        MenuList: TagMenuList,
        DropdownIndicator: () => null,
        IndicatorSeparator: () => null,
        ClearIndicator: () => null,
      }}
      classNames={{
        control: ({ isFocused }) => controlClass(isFocused),
        valueContainer: () => 'gap-1.5 flex-wrap',
        menu: () =>
          'border-border-subtle bg-background mt-1.5 rounded-xl border p-1 shadow-[0_10px_30px_-12px_rgba(0,0,0,0.18),0_4px_8px_-4px_rgba(0,0,0,0.08)] animate-dropdown-pop overflow-hidden',
        menuList: () => 'flex flex-col gap-0.5 max-h-80 overflow-y-auto',
        placeholder: () => 'text-text-muted text-sm',
        input: () => 'text-text-primary text-sm',
        multiValue: () =>
          'border-border-subtle bg-background-elevated text-text-secondary hover:border-border-default flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium transition-all',
        multiValueRemove: () =>
          'text-text-muted hover:text-text-primary hover:bg-background-elevated ml-0.5 rounded p-0.5 transition-colors cursor-pointer',
        noOptionsMessage: () => 'text-text-muted px-3 py-3 text-[13px]',
        loadingMessage: () => 'text-text-muted px-3 py-3 text-[13px]',
      }}
    />
  );
};

export default TagInput;
