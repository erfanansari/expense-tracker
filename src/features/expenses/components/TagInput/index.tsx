'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useTranslations } from 'next-intl';

import { createTagKeyGenerator } from '@api/createTagMutation';
import type { CreateTagRequestData } from '@api/createTagMutation';
import { getTagListKeyGenerator, TAGS_SCOPE } from '@api/getTagListQuery';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Check, Plus, Tag as TagIcon } from 'lucide-react';
import { components as rsComponents } from 'react-select';
import type {
  ClassNamesConfig,
  CSSObjectWithLabel,
  GroupBase,
  MenuListProps,
  MultiValue,
  OptionProps,
  SelectComponentsConfig,
  StylesConfig,
} from 'react-select';
import CreatableSelect from 'react-select/creatable';
import { twMerge } from 'tailwind-merge';

import { type Tag } from '@types';

import { useToast } from '@stores/toast';

import { ensureError } from '@utils';

// ─── Types ──────────────────────────────────────────────────────────────────

interface TagOption {
  value: string;
  label: string;
  tag?: Tag;
  /** react-select's flag for the synthetic "Create …" row. */
  __isNew__?: boolean;
  /** Set on an optimistic tag while its POST is still in flight. */
  pending?: boolean;
}

// ─── Styles ──────────────────────────────────────────────────────────────────
//
// Everything react-select receives as an object prop — styles, components,
// classNames — is declared at module scope. react-select memoises on prop
// identity, so an object literal in the render body hands it a brand-new
// `components` map on every keystroke and it tears down and rebuilds the whole
// menu each time. That was the source of the input feeling sticky once a few
// tags existed.

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

// ─── Custom Option ───────────────────────────────────────────────────────────

const TagOptionComponent = ({ data, isFocused, isSelected, innerProps, innerRef }: OptionProps<TagOption, true>) => {
  // The create row's full label is built by the parent and passed through on
  // the option, so this component stays free of hooks: an Option that calls
  // useTranslations re-subscribes every row of the menu on each render.
  if (data.__isNew__) {
    return (
      <div
        {...innerProps}
        ref={innerRef}
        className={twMerge(
          'text-blue mt-1 flex cursor-pointer items-center gap-2 rounded-md px-2.5 py-2 text-[13px] font-medium whitespace-nowrap transition-colors duration-100',
          isFocused && 'bg-blue/10'
        )}
      >
        <Plus className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        <span>{data.label}</span>
      </div>
    );
  }

  return (
    <div
      {...innerProps}
      ref={innerRef}
      className={twMerge(
        'text-text-secondary flex cursor-pointer items-center gap-2.5 rounded-md px-2.5 py-2 text-[13px] whitespace-nowrap transition-colors duration-100',
        isFocused && 'bg-background-elevated text-text-primary',
        isSelected && 'text-text-primary font-medium'
      )}
    >
      <TagIcon className="text-text-muted h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      <span className="flex-1 truncate">{data.label}</span>
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

const hidden = () => null;

const selectComponents: Partial<SelectComponentsConfig<TagOption, true, GroupBase<TagOption>>> = {
  Option: TagOptionComponent,
  MenuList: TagMenuList,
  DropdownIndicator: hidden,
  IndicatorSeparator: hidden,
  ClearIndicator: hidden,
};

const classNames: ClassNamesConfig<TagOption, true, GroupBase<TagOption>> = {
  control: ({ isFocused }) =>
    twMerge(
      'border-border-subtle bg-background flex w-full items-center rounded-lg border px-3 py-2 text-sm transition-all cursor-text gap-1.5 min-h-[42px]',
      isFocused && 'border-blue ring-2 ring-blue/15'
    ),
  valueContainer: () => 'gap-1.5 flex-wrap',
  menu: () =>
    'border-border-subtle bg-background mt-1.5 rounded-xl border p-1 shadow-[0_10px_30px_-12px_rgba(0,0,0,0.18),0_4px_8px_-4px_rgba(0,0,0,0.08)] animate-dropdown-pop overflow-hidden',
  menuList: () => 'flex flex-col gap-0.5 max-h-72 overflow-y-auto',
  placeholder: () => 'text-text-muted text-sm',
  input: () => 'text-text-primary text-sm',
  multiValue: (state) =>
    twMerge(
      'border-tag-border bg-tag-bg text-tag-text flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium transition-all',
      // An optimistic pill is already interactive; the dimming just says
      // "not saved yet" without blocking anything.
      (state.data as TagOption).pending && 'opacity-60'
    ),
  multiValueRemove: () =>
    'text-tag-text/70 hover:text-tag-text hover:bg-background-elevated ms-0.5 rounded-full p-0.5 transition-colors cursor-pointer',
  noOptionsMessage: () => 'text-text-muted px-3 py-3 text-[13px]',
  loadingMessage: () => 'text-text-muted px-3 py-3 text-[13px]',
};

// ─── Main component ──────────────────────────────────────────────────────────

interface TagInputProps {
  selectedTags: Tag[];
  onTagsChange: (tags: Tag[]) => void;
}

const tagToOption = (tag: Tag): TagOption => ({ value: String(tag.id), label: tag.name, tag });

/** Optimistic tags get a temporary negative id so they can't collide with real ones. */
let optimisticSeq = -1;

const TagInput = ({ selectedTags, onTagsChange }: TagInputProps) => {
  const t = useTranslations('forms.expense');
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const { data: allTags = [] } = useQuery<Tag[]>({ queryKey: getTagListKeyGenerator() });
  const createTag = useMutation<Tag, Error, CreateTagRequestData>({ mutationKey: createTagKeyGenerator() });

  // Tracks which pills are still saving, keyed by their temporary id.
  const [pendingIds, setPendingIds] = useState<number[]>([]);

  // The create flow resumes after an await, by which point the selection may
  // have moved on, so it reconciles against a ref rather than the value it
  // closed over. Synced in an effect — writing a ref during render is a
  // render-phase side effect the compiler rightly rejects.
  const selectedRef = useRef(selectedTags);
  useEffect(() => {
    selectedRef.current = selectedTags;
  }, [selectedTags]);

  const handleChange = useCallback(
    (newValue: MultiValue<TagOption>) => {
      onTagsChange(newValue.flatMap((o) => (o.tag ? [o.tag] : [])));
    },
    [onTagsChange]
  );

  // Creating a tag used to await the POST *and* a full refetch of the tag list
  // before the pill appeared — a visible stall on every new tag, and the reason
  // the field felt slow. The pill is now added immediately and reconciled when
  // the server answers; a failure removes it and says why.
  const handleCreate = useCallback(
    async (inputValue: string) => {
      const name = inputValue.trim();
      if (!name) return;

      const tempId = optimisticSeq--;
      const optimistic: Tag = { id: tempId, name, created_at: new Date().toISOString() };

      onTagsChange([...selectedRef.current, optimistic]);
      setPendingIds((ids) => [...ids, tempId]);

      try {
        const created = await createTag.mutateAsync({ name });
        // Swap the placeholder for the real row, wherever it sits now — the
        // user may have added or removed other tags while this was in flight.
        onTagsChange(selectedRef.current.map((tag) => (tag.id === tempId ? created : tag)));
        queryClient.invalidateQueries({ queryKey: TAGS_SCOPE });
      } catch (error) {
        onTagsChange(selectedRef.current.filter((tag) => tag.id !== tempId));
        showToast(ensureError(error).message, 'error');
      } finally {
        setPendingIds((ids) => ids.filter((id) => id !== tempId));
      }
    },
    [createTag, onTagsChange, queryClient, showToast]
  );

  const options = useMemo(
    () => allTags.filter((tag) => !selectedTags.some((s) => s.id === tag.id)).map(tagToOption),
    [allTags, selectedTags]
  );

  const value = useMemo(
    () => selectedTags.map((tag) => ({ ...tagToOption(tag), pending: pendingIds.includes(tag.id) })),
    [selectedTags, pendingIds]
  );

  const formatCreateLabel = useCallback((label: string) => t('createTagOption', { label }), [t]);

  return (
    <CreatableSelect<TagOption, true>
      inputId="tags"
      classNamePrefix="ti"
      isMulti
      value={value}
      onChange={handleChange}
      options={options}
      onCreateOption={handleCreate}
      formatCreateLabel={formatCreateLabel}
      placeholder={t('tagsPlaceholder')}
      isSearchable
      closeMenuOnSelect={false}
      createOptionPosition="last"
      menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
      menuPosition="fixed"
      menuPlacement="auto"
      unstyled
      styles={selectStyles}
      components={selectComponents}
      classNames={classNames}
    />
  );
};

export default TagInput;
