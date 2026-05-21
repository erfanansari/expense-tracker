'use client';

import { useEffect, useRef } from 'react';

import { EXPENSE_CATEGORIES } from '@constants/categories';
import { X } from 'lucide-react';
import type { MultiValue } from 'react-select';
import Select2 from 'react-select';

import { useTags } from '@hooks/use-tags';

import type { Tag } from '@/@types/expense';

interface ReportsFilterPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTags: Tag[];
  selectedCategories: string[];
  onTagsChange: (tags: Tag[]) => void;
  onCategoriesChange: (categories: string[]) => void;
  onReset: () => void;
}

interface TagOption {
  value: number;
  label: string;
}
interface CategoryOption {
  value: string;
  label: string;
}

// Shared styles for both multi-selects inside the popover.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const multiSelectStyles: any = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  menuPortal: (base: any) => ({ ...base, zIndex: 9999, pointerEvents: 'auto' }),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  menu: (base: any) => ({ ...base, width: 'max-content', minWidth: '100%' }),
  input: () => ({ color: 'inherit', fontSize: 'inherit', margin: 0, padding: 0 }),
  control: () => ({ minHeight: 'unset' }),
  valueContainer: () => ({ display: 'flex', alignItems: 'center', flex: 1, flexWrap: 'wrap', padding: 0 }),
};

const sharedClassNames = {
  control: ({ isFocused }: { isFocused: boolean }) =>
    `border rounded-lg px-3 py-2 text-sm transition-all cursor-pointer flex items-center bg-background ${
      isFocused ? 'border-blue ring-2 ring-blue/15' : 'border-border-subtle hover:border-border-default'
    }`,
  valueContainer: () => 'gap-1',
  placeholder: () => 'text-text-muted text-sm whitespace-nowrap',
  input: () => 'text-text-primary text-sm shrink-0 min-w-0',
  menu: () =>
    'border-border-subtle bg-background mt-1.5 rounded-xl border p-1 shadow-[0_10px_30px_-12px_rgba(0,0,0,0.18),0_4px_8px_-4px_rgba(0,0,0,0.08)] animate-dropdown-pop overflow-hidden min-w-[200px]',
  menuList: () => 'flex flex-col gap-0.5 max-h-80 overflow-y-auto',
  option: ({ isFocused, isSelected }: { isFocused: boolean; isSelected: boolean }) =>
    `flex items-center gap-2 rounded-md px-2.5 py-1.5 text-[13px] whitespace-nowrap text-text-secondary cursor-pointer transition-colors duration-100 ${
      isFocused ? 'bg-background-elevated text-text-primary' : ''
    } ${isSelected ? 'text-text-primary font-medium' : ''}`,
  multiValue: () =>
    'border-border-subtle bg-background-elevated text-text-secondary flex shrink-0 items-center gap-1 rounded-md border px-1.5 py-0.5 text-xs font-medium',
  multiValueLabel: () => 'flex items-center gap-1',
  multiValueRemove: () =>
    'text-text-muted hover:text-text-primary ml-0.5 rounded p-0.5 transition-colors cursor-pointer',
  noOptionsMessage: () => 'text-text-muted px-3 py-3 text-[13px]',
};

const ReportsFilterPopover = ({
  isOpen,
  onClose,
  selectedTags,
  selectedCategories,
  onTagsChange,
  onCategoriesChange,
  onReset,
}: ReportsFilterPopoverProps) => {
  const { data: allTags = [] } = useTags();
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (!popoverRef.current?.contains(target)) {
        // Don't close if the click landed on a react-select menu portal (rendered on document.body).
        const portalledMenu = (target as HTMLElement)?.closest?.('[class*="menu"]');
        if (portalledMenu) return;
        onClose();
      }
    };

    document.addEventListener('keydown', handleKey);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const tagOptions: TagOption[] = allTags.map((t) => ({ value: t.id, label: t.name }));
  const selectedTagOptions: TagOption[] = selectedTags.map((t) => ({ value: t.id, label: t.name }));
  const categoryOptions: CategoryOption[] = EXPENSE_CATEGORIES.map((c) => ({ value: c.value, label: c.label }));
  const selectedCategoryOptions: CategoryOption[] = categoryOptions.filter((c) => selectedCategories.includes(c.value));

  const handleTagsChange = (next: MultiValue<TagOption>) => {
    const tags = next.map((o) => allTags.find((t) => t.id === o.value)).filter(Boolean) as Tag[];
    onTagsChange(tags);
  };

  const handleCategoriesChange = (next: MultiValue<CategoryOption>) => {
    onCategoriesChange(next.map((o) => o.value));
  };

  const activeCount = selectedTags.length + selectedCategories.length;

  return (
    <div
      ref={popoverRef}
      role="dialog"
      aria-label="Filter reports"
      className="border-border-subtle bg-background animate-dropdown-pop absolute top-full right-0 z-50 mt-2 w-[min(360px,calc(100vw-2rem))] rounded-xl border p-4 shadow-[0_10px_30px_-12px_rgba(0,0,0,0.18),0_4px_8px_-4px_rgba(0,0,0,0.08)]"
    >
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-baseline gap-2">
          <h3 className="text-text-primary text-sm font-semibold">Filters</h3>
          {activeCount > 0 && <span className="text-text-muted text-xs">{activeCount} active</span>}
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close filters"
          className="text-text-muted hover:bg-background-elevated hover:text-text-primary rounded-md p-1 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="space-y-3">
        <div className="space-y-1.5">
          <label className="text-text-secondary text-xs font-medium">Tags</label>
          <Select2<TagOption, true>
            isMulti
            classNamePrefix="rfp-tag"
            value={selectedTagOptions}
            onChange={handleTagsChange}
            options={tagOptions}
            placeholder="Any tag"
            isSearchable
            closeMenuOnSelect={false}
            menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
            menuPosition="fixed"
            unstyled
            styles={multiSelectStyles}
            components={{ DropdownIndicator: () => null, IndicatorSeparator: () => null, ClearIndicator: () => null }}
            classNames={sharedClassNames}
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-text-secondary text-xs font-medium">Categories</label>
          <Select2<CategoryOption, true>
            isMulti
            classNamePrefix="rfp-cat"
            value={selectedCategoryOptions}
            onChange={handleCategoriesChange}
            options={categoryOptions}
            placeholder="Any category"
            isSearchable
            closeMenuOnSelect={false}
            menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
            menuPosition="fixed"
            unstyled
            styles={multiSelectStyles}
            components={{ DropdownIndicator: () => null, IndicatorSeparator: () => null, ClearIndicator: () => null }}
            classNames={sharedClassNames}
          />
        </div>
      </div>

      {activeCount > 0 && (
        <div className="border-border-subtle mt-4 flex items-center justify-end border-t pt-3">
          <button
            type="button"
            onClick={onReset}
            className="text-text-muted hover:text-text-primary text-xs font-medium transition-colors"
          >
            Reset all
          </button>
        </div>
      )}
    </div>
  );
};

export default ReportsFilterPopover;
